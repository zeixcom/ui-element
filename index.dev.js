// node_modules/@zeix/cause-effect/src/util.ts
var isFunction = (value) => typeof value === "function";
var isObjectOfType = (value, type) => Object.prototype.toString.call(value) === `[object ${type}]`;
var toError = (reason) => reason instanceof Error ? reason : Error(String(reason));

class CircularDependencyError extends Error {
  constructor(where) {
    super(`Circular dependency in ${where} detected`);
    return this;
  }
}
// node_modules/@zeix/cause-effect/src/scheduler.ts
var active;
var pending = new Set;
var batchDepth = 0;
var updateMap = new Map;
var requestId;
var updateDOM = () => {
  requestId = undefined;
  const updates = Array.from(updateMap.values());
  updateMap.clear();
  for (const update of updates) {
    update();
  }
};
var requestTick = () => {
  if (requestId)
    cancelAnimationFrame(requestId);
  requestId = requestAnimationFrame(updateDOM);
};
queueMicrotask(updateDOM);
var watch = (notice) => {
  const cleanups = new Set;
  const w = notice;
  w.off = (on) => {
    cleanups.add(on);
  };
  w.cleanup = () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
    cleanups.clear();
  };
  return w;
};
var subscribe = (watchers) => {
  if (active && !watchers.has(active)) {
    const watcher = active;
    watchers.add(watcher);
    active.off(() => {
      watchers.delete(watcher);
    });
  }
};
var notify = (watchers) => {
  for (const watcher of watchers) {
    if (batchDepth)
      pending.add(watcher);
    else
      watcher();
  }
};
var flush = () => {
  while (pending.size) {
    const watchers = Array.from(pending);
    pending.clear();
    for (const watcher of watchers) {
      watcher();
    }
  }
};
var batch = (fn) => {
  batchDepth++;
  try {
    fn();
  } finally {
    flush();
    batchDepth--;
  }
};
var observe = (run, watcher) => {
  const prev = active;
  active = watcher;
  try {
    run();
  } finally {
    active = prev;
  }
};
var enqueue = (fn, dedupe) => new Promise((resolve, reject) => {
  updateMap.set(dedupe || Symbol(), () => {
    try {
      resolve(fn());
    } catch (error) {
      reject(error);
    }
  });
  requestTick();
});

// node_modules/@zeix/cause-effect/src/state.ts
var TYPE_STATE = "State";
var state = (initialValue) => {
  const watchers = new Set;
  let value = initialValue;
  const s = {
    [Symbol.toStringTag]: TYPE_STATE,
    get: () => {
      subscribe(watchers);
      return value;
    },
    set: (v) => {
      if (Object.is(value, v))
        return;
      value = v;
      notify(watchers);
      if (UNSET === value)
        watchers.clear();
    },
    update: (fn) => {
      s.set(fn(value));
    }
  };
  return s;
};
var isState = (value) => isObjectOfType(value, TYPE_STATE);

// node_modules/@zeix/cause-effect/src/computed.ts
var TYPE_COMPUTED = "Computed";
var computed = (fn) => {
  const watchers = new Set;
  let value = UNSET;
  let error;
  let controller;
  let dirty = true;
  let changed = false;
  let computing = false;
  const ok = (v) => {
    if (!Object.is(v, value)) {
      value = v;
      changed = true;
    }
    error = undefined;
    dirty = false;
  };
  const nil = () => {
    changed = UNSET !== value;
    value = UNSET;
    error = undefined;
  };
  const err = (e) => {
    const newError = toError(e);
    changed = !error || newError.name !== error.name || newError.message !== error.message;
    value = UNSET;
    error = newError;
  };
  const settle = (settleFn) => (arg) => {
    computing = false;
    controller = undefined;
    settleFn(arg);
    if (changed)
      notify(watchers);
  };
  const mark = watch(() => {
    dirty = true;
    controller?.abort("Aborted because source signal changed");
    if (watchers.size)
      notify(watchers);
    else
      mark.cleanup();
  });
  const compute = () => observe(() => {
    if (computing)
      throw new CircularDependencyError("computed");
    changed = false;
    if (isFunction(fn) && fn.constructor.name === "AsyncFunction") {
      if (controller)
        return value;
      controller = new AbortController;
      controller.signal.addEventListener("abort", () => {
        computing = false;
        controller = undefined;
        compute();
      }, {
        once: true
      });
    }
    let result;
    computing = true;
    try {
      result = controller ? fn(controller.signal) : fn();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError")
        nil();
      else
        err(e);
      computing = false;
      return;
    }
    if (result instanceof Promise)
      result.then(settle(ok), settle(err));
    else if (result == null || UNSET === result)
      nil();
    else
      ok(result);
    computing = false;
  }, mark);
  const c = {
    [Symbol.toStringTag]: TYPE_COMPUTED,
    get: () => {
      subscribe(watchers);
      flush();
      if (dirty)
        compute();
      if (error)
        throw error;
      return value;
    }
  };
  return c;
};
var isComputed = (value) => isObjectOfType(value, TYPE_COMPUTED);
var isComputedCallback = (value) => isFunction(value) && value.length < 2;

// node_modules/@zeix/cause-effect/src/signal.ts
var UNSET = Symbol();
var isSignal = (value) => isState(value) || isComputed(value);
var toSignal = (value) => isSignal(value) ? value : isComputedCallback(value) ? computed(value) : state(value);
// node_modules/@zeix/cause-effect/src/effect.ts
function effect(matcher) {
  const {
    signals,
    ok,
    err = console.error,
    nil = () => {
    }
  } = isFunction(matcher) ? { signals: [], ok: matcher } : matcher;
  let running = false;
  const run = watch(() => observe(() => {
    if (running)
      throw new CircularDependencyError("effect");
    running = true;
    const errors = [];
    let pending2 = false;
    const values = signals.map((signal) => {
      try {
        const value = signal.get();
        if (value === UNSET)
          pending2 = true;
        return value;
      } catch (e) {
        errors.push(toError(e));
        return UNSET;
      }
    });
    let cleanup = undefined;
    try {
      cleanup = pending2 ? nil() : errors.length ? err(...errors) : ok(...values);
    } catch (e) {
      cleanup = err(toError(e));
    } finally {
      if (isFunction(cleanup))
        run.off(cleanup);
    }
    running = false;
  }, run));
  run();
  return () => run.cleanup();
}
// src/core/util.ts
var DEV_MODE = true;
var LOG_DEBUG = "debug";
var LOG_INFO = "info";
var LOG_WARN = "warn";
var LOG_ERROR = "error";
var idString = (id) => id ? `#${id}` : "";
var classString = (classList) => classList.length ? `.${Array.from(classList).join(".")}` : "";
var isDefinedObject = (value) => !!value && typeof value === "object";
var isString = (value) => typeof value === "string";
var isElement = (node) => node.nodeType === Node.ELEMENT_NODE;
var elementName = (el) => `<${el.localName}${idString(el.id)}${classString(el.classList)}>`;
var valueString = (value) => isString(value) ? `"${value}"` : isDefinedObject(value) ? JSON.stringify(value) : String(value);
var typeString = (value) => {
  if (value === null)
    return "null";
  if (typeof value !== "object")
    return typeof value;
  if (Array.isArray(value))
    return "Array";
  if (Symbol.toStringTag in Object(value)) {
    return value[Symbol.toStringTag];
  }
  return value.constructor?.name || "Object";
};
var log = (value, msg, level = LOG_DEBUG) => {
  if (DEV_MODE || [LOG_ERROR, LOG_WARN].includes(level))
    console[level](msg, value);
  return value;
};

// src/core/dom.ts
class CircularMutationError extends Error {
  constructor(message) {
    super(message);
    this.name = "CircularMutationError";
  }
}
var isComponent = (value) => value instanceof HTMLElement && value.localName.includes("-");
var extractAttributes = (selector) => {
  const attributes = new Set;
  if (selector.includes("."))
    attributes.add("class");
  if (selector.includes("#"))
    attributes.add("id");
  if (selector.includes("[")) {
    const parts = selector.split("[");
    for (let i = 1;i < parts.length; i++) {
      const part = parts[i];
      if (!part.includes("]"))
        continue;
      const attrName = part.split("=")[0].trim().replace(/[^a-zA-Z0-9_-]/g, "");
      if (attrName)
        attributes.add(attrName);
    }
  }
  return [...attributes];
};
var areElementArraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length)
    return false;
  const set1 = new Set(arr1);
  for (const el of arr2) {
    if (!set1.has(el))
      return false;
  }
  return true;
};
var observeSubtree = (parent, selectors, callback) => {
  const observer = new MutationObserver(callback);
  const observedAttributes = extractAttributes(selectors);
  const observerConfig = {
    childList: true,
    subtree: true
  };
  if (observedAttributes.length) {
    observerConfig.attributes = true;
    observerConfig.attributeFilter = observedAttributes;
  }
  observer.observe(parent, observerConfig);
  return observer;
};
var selection = (parent, selectors) => {
  const watchers = new Set;
  const select = () => Array.from(parent.querySelectorAll(selectors));
  let value = UNSET;
  let observer;
  let mutationDepth = 0;
  const MAX_MUTATION_DEPTH = 2;
  const observe2 = () => {
    value = select();
    observer = observeSubtree(parent, selectors, () => {
      if (!watchers.size) {
        observer?.disconnect();
        observer = undefined;
        return;
      }
      mutationDepth++;
      if (mutationDepth > MAX_MUTATION_DEPTH) {
        observer?.disconnect();
        observer = undefined;
        mutationDepth = 0;
        throw new CircularMutationError("Circular mutation in element selection detected");
      }
      try {
        const newElements = select();
        if (!areElementArraysEqual(value, newElements)) {
          value = newElements;
          notify(watchers);
        }
      } finally {
        mutationDepth--;
      }
    });
  };
  const s = {
    [Symbol.toStringTag]: TYPE_COMPUTED,
    get: () => {
      subscribe(watchers);
      if (!watchers.size)
        value = select();
      else if (!observer)
        observe2();
      return value;
    }
  };
  return s;
};
var fromSelector = (selectors) => (host) => selection(host, selectors);
var fromDescendants = (selectors, reducer, initialValue) => (host) => computed(() => selection(host, selectors).get().reduce(reducer, initialValue));
var on = (type, listener, options = false) => (host, target = host) => {
  if (!isFunction(listener))
    throw new TypeError(`Invalid event listener provided for "${type} event on element ${elementName(target)}`);
  target.addEventListener(type, listener, options);
  return () => target.removeEventListener(type, listener);
};
var sensor = (host, source, type, transform, initialValue, options = false) => {
  const watchers = new Set;
  let value = initialValue;
  let listener;
  let cleanup;
  const listen = () => {
    listener = (event) => {
      const newValue = transform(host, source, event, value);
      if (!Object.is(newValue, value)) {
        value = newValue;
        if (watchers.size > 0)
          notify(watchers);
        else if (cleanup)
          cleanup();
      }
    };
    source.addEventListener(type, listener, options);
    cleanup = () => {
      if (listener) {
        source.removeEventListener(type, listener);
        listener = undefined;
      }
      cleanup = undefined;
    };
  };
  const s = {
    [Symbol.toStringTag]: TYPE_COMPUTED,
    get: () => {
      subscribe(watchers);
      if (watchers.size && !listener)
        listen();
      return value;
    }
  };
  return s;
};
var fromEvent = (selector, type, transform, initializer) => (host) => {
  const source = host.querySelector(selector);
  if (!source) {
    throw new Error(`Element not found for selector "${selector}" in ${host.localName || "component"}`);
  }
  const initialValue = isFunction(initializer) ? initializer(host, source) : initializer;
  return sensor(host, source, type, transform, initialValue);
};
var emit = (type, detail) => (host, target = host) => {
  target.dispatchEvent(new CustomEvent(type, {
    detail: isFunction(detail) ? detail(target) : detail,
    bubbles: true
  }));
};
var pass = (signals) => (host, target) => {
  if (!isComponent(target))
    throw new TypeError(`Target element must be a custom element`);
  const sources = isFunction(signals) ? signals(target) : signals;
  if (!isDefinedObject(sources))
    throw new TypeError(`Passed signals must be an object or a provider function`);
  customElements.whenDefined(target.localName).then(() => {
    for (const [prop, source] of Object.entries(sources)) {
      const signal = isString(source) ? host.getSignal(prop) : toSignal(source);
      target.setSignal(prop, signal);
    }
  }).catch((error) => {
    throw new Error(`Failed to pass signals to ${elementName(target)}`, { cause: error });
  });
};
var read = (source, prop, fallback) => {
  if (!source)
    return () => fallback;
  if (!isComponent(source))
    throw new TypeError(`Target element must be a custom element`);
  const awaited = computed(async () => {
    await customElements.whenDefined(source.localName);
    return source.getSignal(prop);
  });
  return () => {
    const value = awaited.get();
    return value === UNSET ? fallback : value.get();
  };
};
var fromDescendant = (selector, prop, fallback) => (host) => {
  const element = host.querySelector(selector);
  return computed(read(element, prop, fallback));
};

// src/component.ts
var RESET = Symbol();
var RESERVED_WORDS = new Set([
  "constructor",
  "prototype"
]);
var HTML_ELEMENT_PROPS = new Set([
  "id",
  "class",
  "className",
  "title",
  "role",
  "style",
  "dataset",
  "lang",
  "dir",
  "hidden",
  "children",
  "innerHTML",
  "outerHTML",
  "textContent",
  "innerText"
]);
var isAttributeParser = (value) => isFunction(value) && value.length >= 2;
var validatePropertyName = (prop) => {
  if (RESERVED_WORDS.has(prop)) {
    return `Property name "${prop}" is a reserved word`;
  }
  if (HTML_ELEMENT_PROPS.has(prop)) {
    return `Property name "${prop}" conflicts with inherited HTMLElement property`;
  }
  return null;
};
var run = (fns, host, target = host) => {
  const cleanups = fns.filter(isFunction).map((fn) => fn(host, target));
  return () => {
    cleanups.filter(isFunction).forEach((cleanup) => cleanup());
    cleanups.length = 0;
  };
};
var select = () => ({
  first: (selector, ...fns) => (host) => {
    const el = (host.shadowRoot || host).querySelector(selector);
    if (el)
      run(fns, host, el);
  },
  all: (selector, ...fns) => (host) => {
    const cleanups = new Map;
    const root = host.shadowRoot || host;
    const attach = (target) => {
      if (!cleanups.has(target))
        cleanups.set(target, run(fns, host, target));
    };
    const detach = (target) => {
      const cleanup = cleanups.get(target);
      if (isFunction(cleanup))
        cleanup();
      cleanups.delete(target);
    };
    const applyToMatching = (fn) => (node) => {
      if (isElement(node)) {
        if (node.matches(selector))
          fn(node);
        node.querySelectorAll(selector).forEach(fn);
      }
    };
    const observer = observeSubtree(root, selector, (mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(applyToMatching(attach));
        mutation.removedNodes.forEach(applyToMatching(detach));
      }
    });
    root.querySelectorAll(selector).forEach(attach);
    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      cleanups.clear();
    };
  }
});
var component = (name, init = {}, setup) => {
  for (const prop of Object.keys(init)) {
    const error = validatePropertyName(prop);
    if (error) {
      throw new TypeError(`${error} in component "${name}".`);
    }
  }

  class CustomElement extends HTMLElement {
    debug;
    #signals = {};
    #cleanup;
    static observedAttributes = Object.entries(init)?.filter(([, ini]) => isAttributeParser(ini)).map(([prop]) => prop) ?? [];
    constructor() {
      super();
      for (const [prop, ini] of Object.entries(init)) {
        if (ini == null)
          continue;
        const result = isAttributeParser(ini) ? ini(this, null) : isFunction(ini) ? ini(this) : ini;
        if (result != null)
          this.setSignal(prop, toSignal(result));
      }
    }
    connectedCallback() {
      if (DEV_MODE) {
        this.debug = this.hasAttribute("debug");
        if (this.debug)
          log(this, "Connected");
      }
      const fns = setup(this, select());
      if (!Array.isArray(fns))
        throw new TypeError(`Expected array of functions as return value of setup function in ${elementName(this)}`);
      this.#cleanup = run(fns, this);
    }
    disconnectedCallback() {
      if (isFunction(this.#cleanup))
        this.#cleanup();
      if (DEV_MODE && this.debug)
        log(this, "Disconnected");
    }
    attributeChangedCallback(attr, old, value) {
      if (value === old || isComputed(this.#signals[attr]))
        return;
      const parse = init[attr];
      if (!isAttributeParser(parse))
        return;
      const parsed = parse(this, value, old);
      if (DEV_MODE && this.debug)
        log(value, `Attribute "${attr}" of ${elementName(this)} changed from ${valueString(old)} to ${valueString(value)}, parsed as <${typeString(parsed)}> ${valueString(parsed)}`);
      this[attr] = parsed;
    }
    getSignal(key) {
      const signal = this.#signals[key];
      if (DEV_MODE && this.debug)
        log(signal, `Get ${typeString(signal)} "${String(key)}" in ${elementName(this)}`);
      return signal;
    }
    setSignal(key, signal) {
      const error = validatePropertyName(String(key));
      if (error)
        throw new TypeError(`${error} on ${elementName(this)}.`);
      if (!isSignal(signal))
        throw new TypeError(`Expected signal as value for property "${String(key)}" on ${elementName(this)}.`);
      const prev = this.#signals[key];
      const writable = isState(signal);
      this.#signals[key] = signal;
      Object.defineProperty(this, key, {
        get: signal.get,
        set: writable ? signal.set : undefined,
        enumerable: true,
        configurable: writable
      });
      if (prev && isState(prev))
        prev.set(UNSET);
      if (DEV_MODE && this.debug)
        log(signal, `Set ${typeString(signal)} "${String(key)} in ${elementName(this)}`);
    }
  }
  customElements.define(name, CustomElement);
  return CustomElement;
};
// src/core/context.ts
var CONTEXT_REQUEST = "context-request";

class ContextRequestEvent extends Event {
  context;
  callback;
  subscribe2;
  constructor(context, callback, subscribe2 = false) {
    super(CONTEXT_REQUEST, {
      bubbles: true,
      composed: true
    });
    this.context = context;
    this.callback = callback;
    this.subscribe = subscribe2;
  }
}
var provide = (provided) => (host) => {
  const listener = (e) => {
    const { context, callback } = e;
    if (provided.includes(context) && isFunction(callback)) {
      e.stopPropagation();
      callback(host.getSignal(String(context)));
    }
  };
  host.addEventListener(CONTEXT_REQUEST, listener);
  return () => host.removeEventListener(CONTEXT_REQUEST, listener);
};
var fromContext = (context, fallback) => (host) => {
  let consumed = toSignal(fallback);
  host.dispatchEvent(new ContextRequestEvent(context, (value) => {
    consumed = value;
  }));
  return consumed;
};
// src/lib/parsers.ts
var parseNumber = (parseFn, value) => {
  if (value == null)
    return;
  const parsed = parseFn(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
var asBoolean = () => (_, value) => value !== "false" && value != null;
var asInteger = (fallback = 0) => (_, value) => {
  if (value == null)
    return fallback;
  const trimmed = value.trim();
  if (trimmed === "")
    return fallback;
  if (trimmed.toLowerCase().startsWith("0x")) {
    const parsed2 = parseInt(trimmed, 16);
    return Number.isFinite(parsed2) ? parsed2 : fallback;
  }
  const parsed = parseNumber(parseFloat, value);
  return parsed != null ? Math.trunc(parsed) : fallback;
};
var asNumber = (fallback = 0) => (_, value) => parseNumber(parseFloat, value) ?? fallback;
var asString = (fallback = "") => (_, value) => value ?? fallback;
var asEnum = (valid) => (_, value) => {
  if (value == null)
    return valid[0];
  const lowerValue = value.toLowerCase();
  const matchingValid = valid.find((v) => v.toLowerCase() === lowerValue);
  return matchingValid ? value : valid[0];
};
var asJSON = (fallback) => (_, value) => {
  if ((value ?? fallback) == null)
    throw new ReferenceError("Value and fallback are both null or undefined");
  if (value == null)
    return fallback;
  if (value === "")
    throw new SyntaxError("Empty string is not valid JSON");
  let result;
  try {
    result = JSON.parse(value);
  } catch (error) {
    throw new SyntaxError(`Failed to parse JSON: ${String(error)}`, {
      cause: error
    });
  }
  return result ?? fallback;
};
// src/lib/effects.ts
var resolveSignalLike = (s, host, target) => isString(s) ? host.getSignal(s).get() : isSignal(s) ? s.get() : isFunction(s) ? s(target) : RESET;
var isSafeURL = (value) => {
  if (/^(mailto|tel):/i.test(value))
    return true;
  if (value.includes("://")) {
    try {
      const url = new URL(value, window.location.origin);
      return ["http:", "https:", "ftp:"].includes(url.protocol);
    } catch (_error) {
      return false;
    }
  }
  return true;
};
var safeSetAttribute = (element, attr, value) => {
  if (/^on/i.test(attr))
    throw new Error(`Unsafe attribute: ${attr}`);
  value = String(value).trim();
  if (!isSafeURL(value))
    throw new Error(`Unsafe URL for ${attr}: ${value}`);
  element.setAttribute(attr, value);
};
var updateElement = (s, updater) => (host, target) => {
  const { op, name = "", read: read2, update } = updater;
  const fallback = read2(target);
  const ops = {
    a: "attribute ",
    c: "class ",
    h: "inner HTML",
    p: "property ",
    s: "style property ",
    t: "text content"
  };
  if (isString(s) && isString(fallback) && host[s] === RESET)
    host.attributeChangedCallback(s, null, fallback);
  const ok = (verb) => () => {
    if (DEV_MODE && host.debug)
      log(target, `${verb} ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`);
    updater.resolve?.(target);
  };
  const err = (verb) => (error) => {
    log(error, `Failed to ${verb} ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`, LOG_ERROR);
    updater.reject?.(error);
  };
  return effect(() => {
    const UPDATE_DEDUPE = Symbol(`${op}:${name}`);
    const DELETE_DEDUPE = Symbol(`${op}-${name}`);
    let value = RESET;
    try {
      value = resolveSignalLike(s, host, target);
    } catch (error) {
      log(error, `Failed to resolve value of ${valueString(s)} for ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`, LOG_ERROR);
      return;
    }
    if (value === RESET)
      value = fallback;
    else if (value === UNSET)
      value = updater.delete ? null : fallback;
    if (updater.delete && value === null) {
      enqueue(() => {
        updater.delete(target);
        return true;
      }, DELETE_DEDUPE).then(ok("Deleted")).catch(err("delete"));
    } else if (value != null) {
      const current = read2(target);
      if (Object.is(value, current))
        return;
      enqueue(() => {
        update(target, value);
        return true;
      }, UPDATE_DEDUPE).then(ok("Updated")).catch(err("update"));
    }
  });
};
var insertOrRemoveElement = (s, inserter) => (host, target) => {
  const ok = (verb) => () => {
    if (DEV_MODE && host.debug)
      log(target, `${verb} element in ${elementName(target)} in ${elementName(host)}`);
    if (isFunction(inserter?.resolve)) {
      inserter.resolve(target);
    } else {
      const signal = isSignal(s) ? s : isString(s) ? host.getSignal(s) : undefined;
      if (isState(signal))
        signal.set(0);
    }
  };
  const err = (verb) => (error) => {
    log(error, `Failed to ${verb} element in ${elementName(target)} in ${elementName(host)}`, LOG_ERROR);
    inserter?.reject?.(error);
  };
  return effect(() => {
    const INSERT_DEDUPE = Symbol("i");
    const REMOVE_DEDUPE = Symbol("d");
    let diff = 0;
    try {
      diff = resolveSignalLike(s, host, target);
    } catch (error) {
      log(error, `Failed to resolve value of ${valueString(s)} for insertion or deletion in ${elementName(target)} in ${elementName(host)}`, LOG_ERROR);
      return;
    }
    if (diff === RESET)
      diff = 0;
    if (diff > 0) {
      if (!inserter)
        throw new TypeError(`No inserter provided`);
      enqueue(() => {
        for (let i = 0;i < diff; i++) {
          const element = inserter.create(target);
          if (!element)
            continue;
          target.insertAdjacentElement(inserter.position ?? "beforeend", element);
        }
        return true;
      }, INSERT_DEDUPE).then(ok("Inserted")).catch(err("insert"));
    } else if (diff < 0) {
      enqueue(() => {
        if (inserter && (inserter.position === "afterbegin" || inserter.position === "beforeend")) {
          for (let i = 0;i > diff; i--) {
            if (inserter.position === "afterbegin")
              target.firstElementChild?.remove();
            else
              target.lastElementChild?.remove();
          }
        } else {
          target.remove();
        }
        return true;
      }, REMOVE_DEDUPE).then(ok("Removed")).catch(err("remove"));
    }
  });
};
var setText = (s) => updateElement(s, {
  op: "t",
  read: (el) => el.textContent,
  update: (el, value) => {
    Array.from(el.childNodes).filter((node) => node.nodeType !== Node.COMMENT_NODE).forEach((node) => node.remove());
    el.append(document.createTextNode(value));
  }
});
var setProperty = (key, s = key) => updateElement(s, {
  op: "p",
  name: String(key),
  read: (el) => (key in el) ? el[key] : UNSET,
  update: (el, value) => {
    el[key] = value;
  }
});
var show = (s) => updateElement(s, {
  op: "p",
  name: "hidden",
  read: (el) => !el.hidden,
  update: (el, value) => {
    el.hidden = !value;
  }
});
var setAttribute = (name, s = name) => updateElement(s, {
  op: "a",
  name,
  read: (el) => el.getAttribute(name),
  update: (el, value) => {
    safeSetAttribute(el, name, value);
  },
  delete: (el) => {
    el.removeAttribute(name);
  }
});
var toggleAttribute = (name, s = name) => updateElement(s, {
  op: "a",
  name,
  read: (el) => el.hasAttribute(name),
  update: (el, value) => {
    el.toggleAttribute(name, value);
  }
});
var toggleClass = (token, s = token) => updateElement(s, {
  op: "c",
  name: token,
  read: (el) => el.classList.contains(token),
  update: (el, value) => {
    el.classList.toggle(token, value);
  }
});
var setStyle = (prop, s = prop) => updateElement(s, {
  op: "s",
  name: prop,
  read: (el) => el.style.getPropertyValue(prop),
  update: (el, value) => {
    el.style.setProperty(prop, value);
  },
  delete: (el) => {
    el.style.removeProperty(prop);
  }
});
var dangerouslySetInnerHTML = (s, options = {}) => updateElement(s, {
  op: "h",
  read: (el) => (el.shadowRoot || !options.shadowRootMode ? el : null)?.innerHTML ?? "",
  update: (el, html) => {
    const { shadowRootMode, allowScripts } = options;
    if (!html) {
      if (el.shadowRoot)
        el.shadowRoot.innerHTML = "<slot></slot>";
      return "";
    }
    if (shadowRootMode && !el.shadowRoot)
      el.attachShadow({ mode: shadowRootMode });
    const target = el.shadowRoot || el;
    target.innerHTML = html;
    if (!allowScripts)
      return "";
    target.querySelectorAll("script").forEach((script) => {
      const newScript = document.createElement("script");
      newScript.appendChild(document.createTextNode(script.textContent ?? ""));
      target.appendChild(newScript);
      script.remove();
    });
    return " with scripts";
  }
});
export {
  updateElement,
  toggleClass,
  toggleAttribute,
  toSignal,
  state,
  show,
  setText,
  setStyle,
  setProperty,
  setAttribute,
  sensor,
  selection,
  read,
  provide,
  pass,
  on,
  log,
  isState,
  isSignal,
  isComputed,
  insertOrRemoveElement,
  fromSelector,
  fromEvent,
  fromDescendants,
  fromDescendant,
  fromContext,
  enqueue,
  emit,
  effect,
  dangerouslySetInnerHTML,
  computed,
  component,
  batch,
  asString,
  asNumber,
  asJSON,
  asInteger,
  asEnum,
  asBoolean,
  UNSET,
  RESET,
  LOG_WARN,
  LOG_INFO,
  LOG_ERROR,
  LOG_DEBUG
};

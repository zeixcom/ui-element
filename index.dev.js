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
var classString = (classList) => classList?.length ? `.${Array.from(classList).join(".")}` : "";
var isDefinedObject = (value) => !!value && typeof value === "object";
var isString = (value) => typeof value === "string";
var hasMethod = (obj, methodName) => isString(methodName) && (methodName in obj) && isFunction(obj[methodName]);
var isElement = (node) => node.nodeType === Node.ELEMENT_NODE;
var isCustomElement = (element) => element.localName.includes("-");
var isUpgradedComponent = (element) => {
  if (!isCustomElement(element))
    return true;
  const ctor = customElements.get(element.localName);
  return !!ctor && element instanceof ctor;
};
var elementName = (el) => el ? `<${el.localName}${idString(el.id)}${classString(el.classList)}>` : "<unknown>";
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
var fromEvents = (initialize, selector, events) => (host) => {
  const watchers = new Set;
  let value = isFunction(initialize) ? initialize(host) : initialize;
  const eventMap = new Map;
  let cleanup;
  const listen = () => {
    for (const [type, transform] of Object.entries(events)) {
      const listener = (e) => {
        const target = e.target;
        if (!target)
          return;
        const source = target.closest(selector);
        if (!source || !host.contains(source))
          return;
        e.stopPropagation();
        try {
          const newValue = transform({
            event: e,
            host,
            target: source,
            value
          });
          if (newValue == null)
            return;
          if (!Object.is(newValue, value)) {
            value = newValue;
            if (watchers.size > 0)
              notify(watchers);
            else if (cleanup)
              cleanup();
          }
        } catch (error) {
          e.stopImmediatePropagation();
          throw error;
        }
      };
      eventMap.set(type, listener);
      host.addEventListener(type, listener);
    }
    cleanup = () => {
      if (eventMap.size) {
        for (const [type, listener] of eventMap) {
          host.removeEventListener(type, listener);
        }
        eventMap.clear();
      }
      cleanup = undefined;
    };
  };
  return {
    [Symbol.toStringTag]: TYPE_COMPUTED,
    get() {
      subscribe(watchers);
      if (watchers.size && !eventMap.size)
        listen();
      return value;
    }
  };
};
var observeSubtree = (parent, selector, callback) => {
  const observer = new MutationObserver(callback);
  const observerConfig = {
    childList: true,
    subtree: true
  };
  const observedAttributes = extractAttributes(selector);
  if (observedAttributes.length) {
    observerConfig.attributes = true;
    observerConfig.attributeFilter = observedAttributes;
  }
  observer.observe(parent, observerConfig);
  return observer;
};
var fromSelector = (selector) => (host) => {
  const watchers = new Set;
  const select = () => Array.from(host.querySelectorAll(selector));
  let value = UNSET;
  let observer;
  let mutationDepth = 0;
  const MAX_MUTATION_DEPTH = 2;
  const observe2 = () => {
    value = select();
    observer = observeSubtree(host, selector, () => {
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
  return {
    [Symbol.toStringTag]: TYPE_COMPUTED,
    get() {
      subscribe(watchers);
      if (!watchers.size)
        value = select();
      else if (!observer)
        observe2();
      return value;
    }
  };
};
var reduced = (host, selector, reducer, initialValue) => computed(() => fromSelector(selector)(host).get().reduce(reducer, initialValue));
var read = (host, selector, map) => {
  const source = host.querySelector(selector);
  return map(source, source ? isUpgradedComponent(source) : false);
};
var requireDescendant = (host, selector) => {
  const target = host.querySelector(selector);
  if (!target) {
    throw new Error(`Component ${elementName(host)} does not contain required <${selector}> element`);
  }
  return target;
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
  customElements.define(name, class extends HTMLElement {
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
  });
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
var provideContexts = (contexts) => (host) => {
  const listener = (e) => {
    const { context, callback } = e;
    if (contexts.includes(context) && isFunction(callback)) {
      e.stopImmediatePropagation();
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
var asBoolean = () => (_, value) => value != null && value !== "false";
var asInteger = (fallback = 0) => (_, value) => {
  if (value == null)
    return fallback;
  const trimmed = value.trim();
  if (trimmed.toLowerCase().startsWith("0x"))
    return parseNumber((v) => parseInt(v, 16), trimmed) ?? fallback;
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
var RESOLVE_ERROR = Symbol("RESOLVE_ERROR");
var resolveReactive = (reactive, host, target, context) => {
  try {
    return isString(reactive) ? host.getSignal(reactive).get() : isSignal(reactive) ? reactive.get() : isFunction(reactive) ? reactive(target) : RESET;
  } catch (error) {
    if (context) {
      log(error, `Failed to resolve value of ${valueString(reactive)}${context ? ` for ${context}` : ""} in ${elementName(target)}${host !== target ? ` in ${elementName(host)}` : ""}`, LOG_ERROR);
    }
    return RESOLVE_ERROR;
  }
};
var getOperationDescription = (op, name = "") => {
  const ops = {
    a: "attribute ",
    c: "class ",
    d: "dataset ",
    h: "inner HTML",
    m: "method call ",
    p: "property ",
    s: "style property ",
    t: "text content"
  };
  return ops[op] + name;
};
var createOperationHandlers = (host, target, operationDesc, resolve, reject) => {
  const ok = (verb) => () => {
    if (DEV_MODE && host.debug) {
      log(target, `${verb} ${operationDesc} of ${elementName(target)} in ${elementName(host)}`);
    }
    resolve?.(target);
  };
  const err = (verb) => (error) => {
    log(error, `Failed to ${verb} ${operationDesc} of ${elementName(target)} in ${elementName(host)}`, LOG_ERROR);
    reject?.(error);
  };
  return { ok, err };
};
var createDedupeSymbol = (operation, identifier) => {
  return Symbol(identifier ? `${operation}:${identifier}` : operation);
};
var withReactiveValue = (reactive, host, target, context, handler) => {
  return effect(() => {
    const value = resolveReactive(reactive, host, target, context);
    if (value === RESOLVE_ERROR)
      return;
    handler(value);
  });
};
var isSafeURL = (value) => {
  if (/^(mailto|tel):/i.test(value))
    return true;
  if (value.includes("://")) {
    try {
      const url = new URL(value, window.location.origin);
      return ["http:", "https:", "ftp:"].includes(url.protocol);
    } catch {
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
var updateElement = (reactive, updater) => (host, target) => {
  const { op, name = "", read: read2, update } = updater;
  const fallback = read2(target);
  const operationDesc = getOperationDescription(op, name);
  if (isString(reactive) && isString(fallback) && host[reactive] === RESET) {
    host.attributeChangedCallback(reactive, null, fallback);
  }
  const { ok, err } = createOperationHandlers(host, target, operationDesc, updater.resolve, updater.reject);
  return effect(() => {
    const updateSymbol = createDedupeSymbol(op, name);
    const value = resolveReactive(reactive, host, target, operationDesc);
    if (value === RESOLVE_ERROR)
      return;
    const resolvedValue = value === RESET ? fallback : value === UNSET ? updater.delete ? null : fallback : value;
    if (updater.delete && resolvedValue === null) {
      enqueue(() => {
        updater.delete(target);
        return true;
      }, updateSymbol).then(ok("Deleted")).catch(err("delete"));
    } else if (resolvedValue != null) {
      const current = read2(target);
      if (Object.is(resolvedValue, current))
        return;
      enqueue(() => {
        update(target, resolvedValue);
        return true;
      }, updateSymbol).then(ok("Updated")).catch(err("update"));
    }
  });
};
var insertOrRemoveElement = (reactive, inserter) => (host, target) => {
  const insertRemoveOk = (verb) => () => {
    if (DEV_MODE && host.debug) {
      log(target, `${verb} element in ${elementName(target)} in ${elementName(host)}`);
    }
    if (isFunction(inserter?.resolve)) {
      inserter.resolve(target);
    } else {
      const signal = isSignal(reactive) ? reactive : isString(reactive) ? host.getSignal(reactive) : undefined;
      if (isState(signal))
        signal.set(0);
    }
  };
  const insertRemoveErr = (verb) => (error) => {
    log(error, `Failed to ${verb} element in ${elementName(target)} in ${elementName(host)}`, LOG_ERROR);
    inserter?.reject?.(error);
  };
  return effect(() => {
    const insertSymbol = createDedupeSymbol("i");
    const removeSymbol = createDedupeSymbol("r");
    const diff = resolveReactive(reactive, host, target, "insertion or deletion");
    if (diff === RESOLVE_ERROR)
      return;
    const resolvedDiff = diff === RESET ? 0 : diff;
    if (resolvedDiff > 0) {
      if (!inserter)
        throw new TypeError(`No inserter provided`);
      enqueue(() => {
        for (let i = 0;i < resolvedDiff; i++) {
          const element = inserter.create(target);
          if (!element)
            continue;
          target.insertAdjacentElement(inserter.position ?? "beforeend", element);
        }
        return true;
      }, insertSymbol).then(insertRemoveOk("Inserted")).catch(insertRemoveErr("insert"));
    } else if (resolvedDiff < 0) {
      enqueue(() => {
        if (inserter && (inserter.position === "afterbegin" || inserter.position === "beforeend")) {
          for (let i = 0;i > resolvedDiff; i--) {
            if (inserter.position === "afterbegin")
              target.firstElementChild?.remove();
            else
              target.lastElementChild?.remove();
          }
        } else {
          target.remove();
        }
        return true;
      }, removeSymbol).then(insertRemoveOk("Removed")).catch(insertRemoveErr("remove"));
    }
  });
};
var setText = (reactive) => updateElement(reactive, {
  op: "t",
  read: (el) => el.textContent,
  update: (el, value) => {
    Array.from(el.childNodes).filter((node) => node.nodeType !== Node.COMMENT_NODE).forEach((node) => node.remove());
    el.append(document.createTextNode(value));
  }
});
var setProperty = (key, reactive = key) => updateElement(reactive, {
  op: "p",
  name: String(key),
  read: (el) => (key in el) ? el[key] : UNSET,
  update: (el, value) => {
    el[key] = value;
  }
});
var show = (reactive) => updateElement(reactive, {
  op: "p",
  name: "hidden",
  read: (el) => !el.hidden,
  update: (el, value) => {
    el.hidden = !value;
  }
});
var callMethod = (methodName, reactive, args) => updateElement(reactive, {
  op: "m",
  name: String(methodName),
  read: () => null,
  update: (el, value) => {
    if (value && hasMethod(el, methodName)) {
      if (args)
        el[methodName](...args);
      else
        el[methodName]();
    }
  }
});
var focus = (reactive) => updateElement(reactive, {
  op: "m",
  name: "focus",
  read: (el) => el === document.activeElement,
  update: (el, value) => {
    if (value && hasMethod(el, "focus"))
      el.focus();
  }
});
var setAttribute = (name, reactive = name) => updateElement(reactive, {
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
var toggleAttribute = (name, reactive = name) => updateElement(reactive, {
  op: "a",
  name,
  read: (el) => el.hasAttribute(name),
  update: (el, value) => {
    el.toggleAttribute(name, value);
  }
});
var toggleClass = (token, reactive = token) => updateElement(reactive, {
  op: "c",
  name: token,
  read: (el) => el.classList.contains(token),
  update: (el, value) => {
    el.classList.toggle(token, value);
  }
});
var setStyle = (prop, reactive = prop) => updateElement(reactive, {
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
var dangerouslySetInnerHTML = (reactive, options = {}) => updateElement(reactive, {
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
var on = (type, listener, options = false) => (_, target) => {
  if (!isFunction(listener))
    throw new TypeError(`Invalid event listener provided for "${type} event on element ${elementName(target)}`);
  target.addEventListener(type, listener, options);
  return () => target.removeEventListener(type, listener);
};
var emitEvent = (type, reactive) => (host, target) => withReactiveValue(reactive, host, target, `custom event "${type}" detail`, (detail) => {
  if (detail === RESET || detail === UNSET)
    return;
  target.dispatchEvent(new CustomEvent(type, {
    detail,
    bubbles: true
  }));
});
var pass = (reactives) => (host, target) => {
  if (!isDefinedObject(reactives))
    throw new TypeError(`Reactives must be an object of passed signals`);
  if (!isCustomElement(target))
    throw new TypeError(`Target ${elementName(target)} is not a custom element`);
  customElements.whenDefined(target.localName).then(() => {
    if (!hasMethod(target, "setSignal"))
      throw new TypeError(`Target ${elementName(target)} is not a UIElement component`);
    for (const [prop, reactive] of Object.entries(reactives)) {
      target.setSignal(prop, isString(reactive) ? host.getSignal(reactive) : toSignal(reactive));
    }
  }).catch((error) => {
    throw new Error(`Failed to pass signals to ${elementName(target)}`, { cause: error });
  });
};
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
  requireDescendant,
  reduced,
  read,
  provideContexts,
  pass,
  on,
  log,
  isState,
  isSignal,
  isComputed,
  insertOrRemoveElement,
  fromSelector,
  fromEvents,
  fromContext,
  focus,
  enqueue,
  emitEvent,
  effect,
  dangerouslySetInnerHTML,
  computed,
  component,
  callMethod,
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

// node_modules/@zeix/cause-effect/src/util.ts
var isFunction = (value) => typeof value === "function";
var isAsyncFunction = (value) => isFunction(value) && value.constructor.name === "AsyncFunction";
var isObjectOfType = (value, type) => Object.prototype.toString.call(value) === `[object ${type}]`;
var isError = (value) => value instanceof Error;
var isAbortError = (value) => value instanceof DOMException && value.name === "AbortError";
var isPromise = (value) => value instanceof Promise;
var toError = (reason) => isError(reason) ? reason : Error(String(reason));

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
  for (const fn of updates) {
    fn();
  }
};
var requestTick = () => {
  if (requestId)
    cancelAnimationFrame(requestId);
  requestId = requestAnimationFrame(updateDOM);
};
queueMicrotask(updateDOM);
var subscribe = (watchers) => {
  if (active && !watchers.has(active)) {
    const watcher = active;
    watchers.add(watcher);
    active.cleanups.add(() => {
      watchers.delete(watcher);
    });
  }
};
var notify = (watchers) => {
  for (const mark of watchers) {
    if (batchDepth)
      pending.add(mark);
    else
      mark();
  }
};
var flush = () => {
  while (pending.size) {
    const watchers = Array.from(pending);
    pending.clear();
    for (const mark of watchers) {
      mark();
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
var watch = (run, mark) => {
  const prev = active;
  active = mark;
  try {
    run();
  } finally {
    active = prev;
  }
};
var enqueue = (fn, dedupe) => new Promise((resolve, reject) => {
  updateMap.set(dedupe, () => {
    try {
      resolve(fn());
    } catch (error) {
      reject(error);
    }
  });
  requestTick();
});

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
  const run = () => watch(() => {
    if (running)
      throw new CircularDependencyError("effect");
    running = true;
    let cleanup = undefined;
    try {
      cleanup = match({
        signals,
        ok,
        err,
        nil
      });
    } catch (e) {
      err(toError(e));
    }
    if (isFunction(cleanup))
      run.cleanups.add(cleanup);
    running = false;
  }, run);
  run.cleanups = new Set;
  run();
  return () => {
    run.cleanups.forEach((fn) => fn());
    run.cleanups.clear();
  };
}

// node_modules/@zeix/cause-effect/src/computed.ts
var TYPE_COMPUTED = "Computed";
var isEquivalentError = (error1, error2) => {
  if (!error2)
    return false;
  return error1.name === error2.name && error1.message === error2.message;
};
var computed = (matcher) => {
  const watchers = new Set;
  const m = isFunction(matcher) ? undefined : {
    nil: () => UNSET,
    err: (...errors) => {
      if (errors.length > 1)
        throw new AggregateError(errors);
      else
        throw errors[0];
    },
    ...matcher
  };
  const fn = m ? m.ok : matcher;
  let value = UNSET;
  let error;
  let dirty = true;
  let changed = false;
  let computing = false;
  let controller;
  const ok = (v) => {
    if (!Object.is(v, value)) {
      value = v;
      dirty = false;
      error = undefined;
      changed = true;
    }
  };
  const nil = () => {
    changed = UNSET !== value;
    value = UNSET;
    error = undefined;
  };
  const err = (e) => {
    const newError = toError(e);
    changed = !isEquivalentError(newError, error);
    value = UNSET;
    error = newError;
  };
  const resolve = (v) => {
    computing = false;
    controller = undefined;
    ok(v);
    if (changed)
      notify(watchers);
  };
  const reject = (e) => {
    computing = false;
    controller = undefined;
    err(e);
    if (changed)
      notify(watchers);
  };
  const abort = () => {
    computing = false;
    controller = undefined;
    compute();
  };
  const mark = () => {
    dirty = true;
    controller?.abort("Aborted because source signal changed");
    if (watchers.size) {
      notify(watchers);
    } else {
      mark.cleanups.forEach((fn2) => fn2());
      mark.cleanups.clear();
    }
  };
  mark.cleanups = new Set;
  const compute = () => watch(() => {
    if (computing)
      throw new CircularDependencyError("computed");
    changed = false;
    if (isAsyncFunction(fn)) {
      if (controller)
        return value;
      controller = new AbortController;
      if (m)
        m.abort = m.abort instanceof AbortSignal ? AbortSignal.any([m.abort, controller.signal]) : controller.signal;
      controller.signal.addEventListener("abort", abort, {
        once: true
      });
    }
    let result;
    computing = true;
    try {
      result = m && m.signals.length ? match(m) : fn(controller?.signal);
    } catch (e) {
      if (isAbortError(e))
        nil();
      else
        err(e);
      computing = false;
      return;
    }
    if (isPromise(result))
      result.then(resolve, reject);
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
    },
    map: (fn2) => computed({
      signals: [c],
      ok: fn2
    }),
    tap: (matcher2) => effect({
      signals: [c],
      ...isFunction(matcher2) ? { ok: matcher2 } : matcher2
    })
  };
  return c;
};
var isComputed = (value) => isObjectOfType(value, TYPE_COMPUTED);

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
    },
    map: (fn) => computed({
      signals: [s],
      ok: fn
    }),
    tap: (matcher) => effect({
      signals: [s],
      ...isFunction(matcher) ? { ok: matcher } : matcher
    })
  };
  return s;
};
var isState = (value) => isObjectOfType(value, TYPE_STATE);

// node_modules/@zeix/cause-effect/src/signal.ts
var UNSET = Symbol();
var isSignal = (value) => isState(value) || isComputed(value);
var isComputedCallback = (value) => isFunction(value) && value.length < 2;
var toSignal = (value) => isSignal(value) ? value : isComputedCallback(value) ? computed(value) : state(value);
var match = (matcher) => {
  const { signals, abort, ok, err, nil } = matcher;
  const errors = [];
  let suspense = false;
  const values = signals.map((signal) => {
    try {
      const value = signal.get();
      if (value === UNSET)
        suspense = true;
      return value;
    } catch (e) {
      if (isAbortError(e))
        throw e;
      errors.push(toError(e));
    }
  });
  try {
    return suspense ? nil(abort) : errors.length ? err(...errors) : ok(...values);
  } catch (e) {
    if (isAbortError(e))
      throw e;
    const error = toError(e);
    return err(error);
  }
};
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

// src/core/ui.ts
class CircularMutationError extends Error {
  constructor(message) {
    super(message);
    this.name = "CircularMutationError";
  }
}
var isElement = (node) => node.nodeType === Node.ELEMENT_NODE;
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
var run = (fns, host, target) => {
  const cleanups = fns.filter(isFunction).map((fn) => fn(host, target));
  return () => {
    cleanups.filter(isFunction).forEach((cleanup) => cleanup());
    cleanups.length = 0;
  };
};
var first = (selector, ...fns) => (host) => {
  const el = (host.shadowRoot || host).querySelector(selector);
  if (el)
    run(fns, host, el);
};
var all = (selector, ...fns) => (host) => {
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
};
var selection = (parent, selectors) => {
  const watchers = new Set;
  const select = () => Array.from(parent.querySelectorAll(selectors));
  let value = UNSET;
  let observer;
  let mutationDepth = 0;
  const MAX_MUTATION_DEPTH = 2;
  const observe = () => {
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
    [Symbol.toStringTag]: "Computed",
    get: () => {
      subscribe(watchers);
      if (!watchers.size)
        value = select();
      else if (!observer)
        observe();
      return value;
    },
    map: (fn) => computed(() => fn(s.get())),
    tap: (matcher) => effect({
      signals: [s],
      ...isFunction(matcher) ? { ok: matcher } : matcher
    })
  };
  return s;
};
var on = (type, listener) => (host, target = host) => {
  if (!isFunction(listener))
    throw new TypeError(`Invalid event listener provided for "${type} event on element ${elementName(target)}`);
  target.addEventListener(type, listener);
  return () => target.removeEventListener(type, listener);
};
var emit = (type, detail) => (host, target = host) => {
  target.dispatchEvent(new CustomEvent(type, {
    detail: isFunction(detail) ? detail(target) : detail,
    bubbles: true
  }));
};
var pass = (signals) => (host, target) => {
  const targetName = target.localName;
  if (!isComponent(target))
    throw new TypeError(`Target element must be a custom element`);
  const sources = isFunction(signals) ? signals(target) : signals;
  if (!isDefinedObject(sources))
    throw new TypeError(`Passed signals must be an object or a provider function`);
  customElements.whenDefined(targetName).then(() => {
    for (const [prop, source] of Object.entries(sources)) {
      const signal = isString(source) ? host.getSignal(prop) : toSignal(source);
      target.setSignal(prop, signal);
    }
  }).catch((error) => {
    throw new Error(`Failed to pass signals to ${elementName(target)}}`, { cause: error });
  });
};

// src/component.ts
var RESET = Symbol();
var HTML_ELEMENT_PROPS = new Set(Object.getOwnPropertyNames(HTMLElement.prototype));
var RESERVED_WORDS = new Set([
  "constructor",
  "prototype",
  "__proto__",
  "toString",
  "valueOf",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString"
]);
var isAttributeParser = (value) => isFunction(value) && value.length >= 2;
var validatePropertyName = (prop) => !(HTML_ELEMENT_PROPS.has(prop) || RESERVED_WORDS.has(prop));
var component = (name, init = {}, setup) => {

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
      const fns = setup(this);
      if (!Array.isArray(fns))
        throw new TypeError(`Expected array of functions as return value of setup function in ${elementName(this)}`);
      this.#cleanup = run(fns, this, this);
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
      if (!validatePropertyName(String(key)))
        throw new TypeError(`Invalid property name "${String(key)}". Property names must be valid JavaScript identifiers and not conflict with inherited HTMLElement properties.`);
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
var consume = (context) => (host) => {
  let consumed;
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
var asBoolean = (_, value) => value !== "false" && value != null;
var asInteger = (fallback = 0) => (_, value) => parseNumber(parseInt, value) ?? fallback;
var asNumber = (fallback = 0) => (_, value) => parseNumber(parseFloat, value) ?? fallback;
var asString = (fallback = "") => (_, value) => value ?? fallback;
var asEnum = (valid) => (_, value) => value != null && valid.includes(value.toLowerCase()) ? value : valid[0];
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
  const { op, read, update } = updater;
  const fallback = read(target);
  const ops = {
    a: "attribute ",
    c: "class ",
    h: "inner HTML",
    p: "property ",
    s: "style property ",
    t: "text content"
  };
  let name = "";
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
        name = updater.delete(target);
        return true;
      }, [target, op]).then(ok("Deleted")).catch(err("delete"));
    } else if (value != null) {
      const current = read(target);
      if (Object.is(value, current))
        return;
      enqueue(() => {
        name = update(target, value);
        return true;
      }, [target, op]).then(ok("Updated")).catch(err("update"));
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
      }, [target, "i"]).then(ok("Inserted")).catch(err("insert"));
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
      }, [target, "r"]).then(ok("Removed")).catch(err("remove"));
    }
  });
};
var setText = (s) => updateElement(s, {
  op: "t",
  read: (el) => el.textContent,
  update: (el, value) => {
    Array.from(el.childNodes).filter((node) => node.nodeType !== Node.COMMENT_NODE).forEach((node) => node.remove());
    el.append(document.createTextNode(value));
    return "";
  }
});
var setProperty = (key, s = key) => updateElement(s, {
  op: "p",
  read: (el) => (key in el) ? el[key] : UNSET,
  update: (el, value) => {
    el[key] = value;
    return String(key);
  }
});
var setAttribute = (name, s = name) => updateElement(s, {
  op: "a",
  read: (el) => el.getAttribute(name),
  update: (el, value) => {
    safeSetAttribute(el, name, value);
    return name;
  },
  delete: (el) => {
    el.removeAttribute(name);
    return name;
  }
});
var toggleAttribute = (name, s = name) => updateElement(s, {
  op: "a",
  read: (el) => el.hasAttribute(name),
  update: (el, value) => {
    el.toggleAttribute(name, value);
    return name;
  }
});
var toggleClass = (token, s = token) => updateElement(s, {
  op: "c",
  read: (el) => el.classList.contains(token),
  update: (el, value) => {
    el.classList.toggle(token, value);
    return token;
  }
});
var setStyle = (prop, s = prop) => updateElement(s, {
  op: "s",
  read: (el) => el.style.getPropertyValue(prop),
  update: (el, value) => {
    el.style.setProperty(prop, value);
    return prop;
  },
  delete: (el) => {
    el.style.removeProperty(prop);
    return prop;
  }
});
var dangerouslySetInnerHTML = (s, attachShadow, allowScripts) => updateElement(s, {
  op: "h",
  read: (el) => (el.shadowRoot || !attachShadow ? el : null)?.innerHTML ?? "",
  update: (el, html) => {
    if (!html) {
      if (el.shadowRoot)
        el.shadowRoot.innerHTML = "<slot></slot>";
      return "";
    }
    if (attachShadow && !el.shadowRoot)
      el.attachShadow({ mode: attachShadow });
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
  watch,
  updateElement,
  toggleClass,
  toggleAttribute,
  toSignal,
  state,
  setText,
  setStyle,
  setProperty,
  setAttribute,
  selection,
  provide,
  pass,
  on,
  log,
  isState,
  isSignal,
  isComputed,
  insertOrRemoveElement,
  first,
  enqueue,
  emit,
  effect,
  dangerouslySetInnerHTML,
  consume,
  computed,
  component,
  batch,
  asString,
  asNumber,
  asJSON,
  asInteger,
  asEnum,
  asBoolean,
  all,
  UNSET,
  RESET,
  LOG_WARN,
  LOG_INFO,
  LOG_ERROR,
  LOG_DEBUG
};

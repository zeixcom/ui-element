// node_modules/@zeix/cause-effect/lib/util.ts
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
// node_modules/@zeix/cause-effect/lib/scheduler.ts
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
var enqueue = (fn, dedupe = []) => new Promise((resolve, reject) => {
  updateMap.set(dedupe, () => {
    try {
      resolve(fn());
    } catch (error) {
      reject(error);
    }
  });
  requestTick();
});

// node_modules/@zeix/cause-effect/lib/effect.ts
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
      cleanup = match({ signals, ok, err, nil });
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

// node_modules/@zeix/cause-effect/lib/computed.ts
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
      if (changed)
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
      controller.signal.addEventListener("abort", abort, { once: true });
    }
    let result;
    computing = true;
    try {
      result = m && m.signals.length ? match(m) : fn(controller?.signal);
    } catch (e) {
      isAbortError(e) ? nil() : err(e);
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

// node_modules/@zeix/cause-effect/lib/state.ts
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

// node_modules/@zeix/cause-effect/lib/signal.ts
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
var isFunction2 = (value) => typeof value === "function";
var isDefinedObject = (value) => !!value && typeof value === "object";
var isString = (value) => typeof value === "string";

// src/core/log.ts
var DEV_MODE = true;
var LOG_DEBUG = "debug";
var LOG_INFO = "info";
var LOG_WARN = "warn";
var LOG_ERROR = "error";
var idString = (id) => id ? `#${id}` : "";
var classString = (classList) => classList.length ? `.${Array.from(classList).join(".")}` : "";
var elementName = (el) => `<${el.localName}${idString(el.id)}${classString(el.classList)}>`;
var valueString = (value) => isString(value) ? `"${value}"` : isDefinedObject(value) ? JSON.stringify(value) : String(value);
var log = (value, msg, level = LOG_DEBUG) => {
  if (DEV_MODE || [LOG_ERROR, LOG_WARN].includes(level))
    console[level](msg, value);
  return value;
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
var run = (fns, host, target, index = 0) => fns.flatMap((fn) => {
  const cleanup = isFunction2(fn) ? fn(host, target, index) : [];
  return Array.isArray(cleanup) ? cleanup.filter(isFunction2) : isFunction2(cleanup) ? [cleanup] : [];
});
var isParser = (value) => isFunction2(value) && value.length >= 2;
var isSignalProducer = (value) => isFunction2(value) && value.length < 2;
var isProvider = (value) => isFunction2(value) && value.length == 2;
var validatePropertyName = (prop) => !(HTML_ELEMENT_PROPS.has(prop) || RESERVED_WORDS.has(prop));
var isComponent = (value) => value instanceof HTMLElement && value.localName.includes("-");
var component = (name, init = {}, setup) => {

  class CustomElement extends HTMLElement {
    #signals = {};
    #cleanup = [];
    static observedAttributes = Object.entries(init)?.filter(([, ini]) => isParser(ini)).map(([prop]) => prop) ?? [];
    constructor() {
      super();
      for (const [prop, ini] of Object.entries(init)) {
        if (ini == null)
          continue;
        const result = isParser(ini) ? ini(this, null) : isSignalProducer(ini) ? ini(this) : ini;
        this.set(prop, toSignal(result ?? RESET));
      }
    }
    connectedCallback() {
      setup(this);
    }
    disconnectedCallback() {
      for (const off of this.#cleanup)
        off();
      this.#cleanup.length = 0;
    }
    attributeChangedCallback(attr, old, value) {
      if (value === old || isComputed(this.#signals[attr]))
        return;
      const parse = init[attr];
      if (!isParser(parse))
        return;
      this[attr] = parse(this, value, old);
    }
    has(prop) {
      return prop in this.#signals;
    }
    get(prop) {
      return this.#signals[prop];
    }
    set(prop, signal) {
      if (!validatePropertyName(prop)) {
        log(prop, `Property name ${valueString(prop)} in <${elementName(this)}> conflicts with HTMLElement properties or JavaScript reserved words.`, LOG_ERROR);
        return;
      }
      if (!isSignal(signal)) {
        log(signal, `Expected signal as value for property ${valueString(prop)} on ${elementName(this)}.`, LOG_ERROR);
        return;
      }
      const prev = this.#signals[prop];
      const writable = isState(signal);
      this.#signals[prop] = signal;
      Object.defineProperty(this, prop, {
        get: signal.get,
        set: writable ? signal.set : undefined,
        enumerable: true,
        configurable: writable
      });
      if (prev && isState(prev))
        prev.set(UNSET);
    }
    self(...fns) {
      this.#cleanup.push(...run(fns, this, this));
    }
    first(selector, ...fns) {
      const target = (this.shadowRoot || this).querySelector(selector);
      if (target)
        this.#cleanup.push(...run(fns, this, target));
    }
    all(selector, ...fns) {
      this.#cleanup.push(...Array.from((this.shadowRoot || this).querySelectorAll(selector)).flatMap((target, index) => run(fns, this, target, index)));
    }
  }
  customElements.define(name, CustomElement);
  return CustomElement;
};
var pass = (signals) => (host, target, index = 0) => {
  const targetName = target.localName;
  if (!isComponent(target)) {
    log(target, `Target element must be a custom element that extends HTMLElement.`, LOG_ERROR);
    return;
  }
  let disposed = false;
  customElements.whenDefined(targetName).then(() => {
    if (disposed)
      return;
    const sources = isProvider(signals) ? signals(target, index) : signals;
    if (!isDefinedObject(sources)) {
      log(sources, `Invalid passed signals provided.`, LOG_ERROR);
      return;
    }
    for (const [prop, source] of Object.entries(sources)) {
      const signal = isString(source) ? host.get(prop) : toSignal(source);
      target.set(prop, signal);
    }
  }).catch((error) => {
    log(error, `Failed to pass signals to ${elementName(target)}.`, LOG_ERROR);
  });
  return () => {
    disposed = true;
  };
};
var on = (type, handler) => (host, target = host, index = 0) => {
  const listener = isProvider(handler) ? handler(target, index) : handler;
  if (!(isFunction2(listener) || isDefinedObject(listener) && isFunction2(listener.handleEvent))) {
    log(listener, `Invalid listener provided for ${type} event on element ${elementName(target)}`, LOG_ERROR);
  }
  target.addEventListener(type, listener);
  return () => target.removeEventListener(type, listener);
};
var emit = (type, detail) => (host, target = host, index = 0) => {
  target.dispatchEvent(new CustomEvent(type, {
    detail: isProvider(detail) ? detail(target, index) : detail,
    bubbles: true
  }));
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
    if (provided.includes(context) && isFunction2(callback)) {
      e.stopPropagation();
      callback(host.get(String(context)));
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
  if (value == null)
    return fallback;
  let result;
  try {
    result = JSON.parse(value);
  } catch (error) {
    log(error, "Failed to parse JSON", LOG_ERROR);
  }
  return result ?? fallback;
};
// src/lib/effects.ts
var ops = {
  a: "attribute ",
  c: "class ",
  h: "inner HTML",
  p: "property ",
  s: "style property ",
  t: "text content"
};
var resolveSignalLike = (s, host, target, index) => isString(s) ? host.get(s).get() : isSignal(s) ? s.get() : isFunction2(s) ? s(target, index) : RESET;
var isSafeURL = (value) => {
  if (/^(mailto|tel):/i.test(value))
    return true;
  if (value.includes("://")) {
    try {
      const url = new URL(value, window.location.origin);
      return ["http:", "https:", "ftp:"].includes(url.protocol);
    } catch (_) {
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
var updateElement = (s, updater) => (host, target, index = 0) => {
  const { op, read, update } = updater;
  const fallback = read(target);
  if (isString(s) && isString(fallback) && host[s] === RESET)
    host.attributeChangedCallback(s, null, fallback);
  const err = (error, verb, prop = "element") => log(error, `Failed to ${verb} ${prop} ${elementName(target)} in ${elementName(host)}`, LOG_ERROR);
  return effect(() => {
    let value = RESET;
    try {
      value = resolveSignalLike(s, host, target, index);
    } catch (error) {
      err(error, "update");
      return;
    }
    if (value === RESET)
      value = fallback;
    if (value === UNSET)
      value = updater.delete ? null : fallback;
    if (updater.delete && value === null) {
      let name = "";
      enqueue(() => {
        name = updater.delete(target);
        return true;
      }, [target, op]).then(() => {
        if (DEV_MODE && host.debug)
          log(target, `Deleted ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`);
      }).catch((error) => {
        err(error, "delete", `${ops[op] + name} of`);
      });
    } else if (value != null) {
      const current = read(target);
      if (Object.is(value, current))
        return;
      let name = "";
      enqueue(() => {
        name = update(target, value);
        return true;
      }, [target, op]).then(() => {
        if (DEV_MODE && host.debug)
          log(target, `Updated ${ops[op] + name} of ${elementName(target)} in ${elementName(host)}`);
      }).catch((error) => {
        err(error, "update", `${ops[op] + name} of`);
      });
    }
  });
};
var insertNode = (s, { type, where, create }) => (host, target, index = 0) => {
  const methods = {
    beforebegin: "before",
    afterbegin: "prepend",
    beforeend: "append",
    afterend: "after"
  };
  if (!isFunction2(target[methods[where]])) {
    log(`Invalid insertPosition ${valueString(where)} for ${elementName(host)}:`, LOG_ERROR);
    return;
  }
  const err = (error) => log(error, `Failed to insert ${type} into ${elementName(host)}:`, LOG_ERROR);
  return effect(() => {
    let really = false;
    try {
      really = resolveSignalLike(s, host, target, index);
    } catch (error) {
      err(error);
      return;
    }
    if (!really)
      return;
    enqueue(() => {
      const node = create(host);
      if (!node)
        return;
      target[methods[where]](node);
    }, [target, "i"]).then(() => {
      if (isString(s) && Object.getOwnPropertyDescriptor(host, s)?.set)
        host[s] = false;
      if (isState(s))
        s.set(false);
      if (DEV_MODE && host.debug)
        log(target, `Inserted ${type} into ${elementName(host)}`);
    }).catch((error) => {
      err(error);
    });
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
var insertTemplate = (template, s, where = "beforeend") => insertNode(s, {
  type: "template content",
  where,
  create: (host) => {
    if (!(template instanceof HTMLTemplateElement)) {
      log(`Invalid template to insert into ${elementName(host)}:`, LOG_ERROR);
      return;
    }
    const clone = host.shadowRoot ? document.importNode(template.content, true) : template.content.cloneNode(true);
    return clone;
  }
});
var createElement = (tag, s, where = "beforeend", attributes = {}, text) => insertNode(s, {
  type: "new element",
  where,
  create: () => {
    const child = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes))
      safeSetAttribute(child, key, value);
    if (text)
      child.textContent = text;
    return child;
  }
});
var removeElement = (s) => (host, target, index = 0) => {
  const err = (error) => log(error, `Failed to delete ${elementName(target)} from ${elementName(host)}:`, LOG_ERROR);
  return effect(() => {
    let really = false;
    try {
      really = resolveSignalLike(s, host, target, index);
    } catch (error) {
      err(error);
      return;
    }
    if (!really)
      return;
    enqueue(() => {
      target.remove();
      return true;
    }, [target, "r"]).then(() => {
      if (DEV_MODE && host.debug)
        log(target, `Deleted ${elementName(target)} into ${elementName(host)}`);
    }).catch((error) => {
      err(error);
    });
  });
};
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
  removeElement,
  provide,
  pass,
  on,
  log,
  isState,
  isSignal,
  isComputed,
  insertTemplate,
  insertNode,
  enqueue,
  emit,
  effect,
  dangerouslySetInnerHTML,
  createElement,
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
  UNSET,
  RESET,
  LOG_WARN,
  LOG_INFO,
  LOG_ERROR,
  LOG_DEBUG
};

// node_modules/@zeix/cause-effect/lib/util.ts
var isFunction = (value) => typeof value === "function";
var isObjectOfType = (value, type) => Object.prototype.toString.call(value) === `[object ${type}]`;
var isInstanceOf = (type) => (value) => value instanceof type;
var isError = /* @__PURE__ */ isInstanceOf(Error);
var isPromise = /* @__PURE__ */ isInstanceOf(Promise);
var toError = (value) => isError(value) ? value : new Error(String(value));

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
queueMicrotask(updateDOM);
var subscribe = (watchers) => {
  if (active && !watchers.includes(active)) {
    watchers.push(active);
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

// node_modules/@zeix/cause-effect/lib/effect.ts
function effect(cb, ...maybeSignals) {
  let running = false;
  const run = () => watch(() => {
    if (running)
      throw new Error("Circular dependency in effect detected");
    running = true;
    const result = resolve(maybeSignals, cb);
    if (isError(result))
      console.error("Unhandled error in effect:", result);
    running = false;
  }, run);
  run();
}

// node_modules/@zeix/cause-effect/lib/computed.ts
var TYPE_COMPUTED = "Computed";
var isEquivalentError = (error1, error2) => {
  if (!error2)
    return false;
  return error1.name === error2.name && error1.message === error2.message;
};
var computed = (cb, ...maybeSignals) => {
  const watchers = [];
  let value = UNSET;
  let error;
  let dirty = true;
  let unchanged = false;
  let computing = false;
  const ok = (v) => {
    if (!Object.is(v, value)) {
      value = v;
      dirty = false;
      error = undefined;
      unchanged = false;
    }
  };
  const nil = () => {
    unchanged = UNSET === value;
    value = UNSET;
    error = undefined;
  };
  const err = (e) => {
    const newError = toError(e);
    unchanged = isEquivalentError(newError, error);
    value = UNSET;
    error = newError;
  };
  const mark = () => {
    dirty = true;
    if (!unchanged)
      notify(watchers);
  };
  const compute = () => watch(() => {
    if (computing)
      throw new Error("Circular dependency in computed detected");
    unchanged = true;
    computing = true;
    const result = resolve(maybeSignals, cb);
    if (isPromise(result)) {
      nil();
      result.then((v) => {
        ok(v);
        notify(watchers);
      }).catch(err);
    } else if (result == null || UNSET === result)
      nil();
    else if (isError(result))
      err(result);
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
    map: (cb2) => computed(cb2, c),
    match: (cb2) => {
      effect(cb2, c);
      return c;
    }
  };
  return c;
};
var isComputed = (value) => isObjectOfType(value, TYPE_COMPUTED);

// node_modules/@zeix/cause-effect/lib/state.ts
var TYPE_STATE = "State";
var state = (initialValue) => {
  const watchers = [];
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
        watchers.length = 0;
    },
    update: (fn) => {
      s.set(fn(value));
    },
    map: (cb) => computed(cb, s),
    match: (cb) => {
      effect(cb, s);
      return s;
    }
  };
  return s;
};
var isState = (value) => isObjectOfType(value, TYPE_STATE);

// node_modules/@zeix/cause-effect/lib/signal.ts
var UNSET = Symbol();
var isSignal = (value) => isState(value) || isComputed(value);
var isComputedCallbacks = (value) => isFunction(value) && !value.length || typeof value === "object" && value !== null && ("ok" in value) && isFunction(value.ok);
var toSignal = (value) => isSignal(value) ? value : isComputedCallbacks(value) ? computed(value) : state(value);
var resolve = (maybeSignals, cb) => {
  const { ok, nil, err } = isFunction(cb) ? { ok: cb } : cb;
  const values = [];
  const errors = [];
  let hasUnset = false;
  for (let i = 0;i < maybeSignals.length; i++) {
    const s = maybeSignals[i];
    try {
      const value = s.get();
      if (value === UNSET)
        hasUnset = true;
      values[i] = value;
    } catch (e) {
      errors.push(toError(e));
    }
  }
  let result = undefined;
  try {
    if (hasUnset && nil)
      result = nil();
    else if (errors.length)
      result = err ? err(...errors) : errors[0];
    else if (!hasUnset)
      result = ok(...values);
  } catch (e) {
    result = toError(e);
    if (err)
      result = err(result);
  }
  return result;
};
// node_modules/@zeix/pulse/lib/pulse.ts
if (!("requestAnimationFrame" in globalThis))
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 16);
var dedupeMap = new Map;
var queue = [];
var requestId2;
var flush2 = () => {
  requestId2 = null;
  queue.forEach((fn) => fn());
  queue = [];
  dedupeMap.clear();
};
var requestTick = () => {
  if (requestId2)
    cancelAnimationFrame(requestId2);
  requestId2 = requestAnimationFrame(flush2);
};
queueMicrotask(flush2);
var enqueue2 = (callback, dedupe) => new Promise((resolve2, reject) => {
  const wrappedCallback = () => {
    try {
      resolve2(callback());
    } catch (error) {
      reject(error);
    }
  };
  if (dedupe) {
    const [el, op] = dedupe;
    if (!dedupeMap.has(el))
      dedupeMap.set(el, new Map);
    const elementMap = dedupeMap.get(el);
    if (elementMap.has(op)) {
      const idx = queue.indexOf(callback);
      if (idx > -1)
        queue.splice(idx, 1);
    }
    elementMap.set(op, wrappedCallback);
  }
  queue.push(wrappedCallback);
  requestTick();
});
var animationFrame = async () => new Promise(requestAnimationFrame);
// node_modules/@zeix/pulse/lib/util.ts
var isComment = (node) => node.nodeType === Node.COMMENT_NODE;
var isSafeAttribute = (attr) => !/^on/i.test(attr);
var isSafeURL = (value) => {
  if (/^(mailto|tel):/i.test(value))
    return true;
  if (value.includes("://")) {
    try {
      const url = new URL(value, window.location.origin);
      return !["http:", "https:", "ftp:"].includes(url.protocol);
    } catch (error) {
      return true;
    }
  }
  return true;
};
var safeSetAttribute = (element, attr, value) => {
  if (!isSafeAttribute(attr))
    throw new Error(`Unsafe attribute: ${attr}`);
  value = String(value).trim();
  if (!isSafeURL(value))
    throw new Error(`Unsafe URL for ${attr}: ${value}`);
  element.setAttribute(attr, value);
};

// node_modules/@zeix/pulse/lib/update.ts
var ce = (parent, tag, attributes = {}, text) => enqueue2(() => {
  const child = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes))
    safeSetAttribute(child, key, value);
  if (text)
    child.textContent = text;
  parent.append(child);
  return child;
}, [parent, "e"]);
var re = (element) => enqueue2(() => {
  element.remove();
  return null;
}, [element, "r"]);
var st = (element, text) => enqueue2(() => {
  Array.from(element.childNodes).filter((node) => !isComment(node)).forEach((node) => node.remove());
  element.append(document.createTextNode(text));
  return element;
}, [element, "t"]);
var sa = (element, attribute, value) => enqueue2(() => {
  safeSetAttribute(element, attribute, value);
  return element;
}, [element, `a:${attribute}`]);
var ra = (element, attribute) => enqueue2(() => {
  element.removeAttribute(attribute);
  return element;
}, [element, `a:${attribute}`]);
var ta = (element, attribute, value) => enqueue2(() => {
  element.toggleAttribute(attribute, value);
  return element;
}, [element, `a:${attribute}`]);
var tc = (element, token, value) => enqueue2(() => {
  element.classList.toggle(token, value);
  return element;
}, [element, `c:${token}`]);
var ss = (element, property, value) => enqueue2(() => {
  element.style.setProperty(property, value);
  return element;
}, [element, `s:${property}`]);
var rs = (element, property) => enqueue2(() => {
  element.style.removeProperty(property);
  return element;
}, [element, `s:${property}`]);
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

// src/core/ui.ts
class UI {
  host;
  targets;
  constructor(host, targets = [host]) {
    this.host = host;
    this.targets = targets;
  }
  on(type, listenerOrProvider) {
    this.targets.forEach((target, index) => {
      let listener;
      if (isFunction2(listenerOrProvider)) {
        listener = listenerOrProvider.length === 2 ? listenerOrProvider(target, index) : listenerOrProvider;
      } else if (isDefinedObject(listenerOrProvider) && isFunction2(listenerOrProvider.handleEvent)) {
        listener = listenerOrProvider;
      } else {
        log(listenerOrProvider, `Invalid listener provided for ${type} event on element ${elementName(target)}`, LOG_ERROR);
        return;
      }
      target.addEventListener(type, listener);
      this.host.cleanup.push(() => target.removeEventListener(type, listener));
    });
    return this;
  }
  emit(type, detail) {
    this.targets.forEach((target) => {
      target.dispatchEvent(new CustomEvent(type, {
        detail,
        bubbles: true
      }));
    });
    return this;
  }
  pass(passedSignalsOrProvider) {
    this.targets.forEach(async (target, index) => {
      await UIElement.registry.whenDefined(target.localName);
      if (target instanceof UIElement) {
        let passedSignals;
        if (isFunction2(passedSignalsOrProvider) && passedSignalsOrProvider.length === 2) {
          passedSignals = passedSignalsOrProvider(target, index);
        } else if (isDefinedObject(passedSignalsOrProvider)) {
          passedSignals = passedSignalsOrProvider;
        } else {
          log(passedSignalsOrProvider, `Invalid passed signals provided`, LOG_ERROR);
          return;
        }
        Object.entries(passedSignals).forEach(([key, source]) => {
          if (isString(source)) {
            if (source in this.host.signals) {
              target.set(key, this.host.signals[source]);
            } else {
              log(source, `Invalid string key "${source}" for state ${valueString(key)}`, LOG_WARN);
            }
          } else if (isFunction2(source) || isSignal(source)) {
            target.set(key, toSignal(source));
          } else {
            log(source, `Invalid source for state ${valueString(key)}`, LOG_WARN);
          }
        });
      } else {
        log(target, `Target is not a UIElement`, LOG_ERROR);
      }
    });
    return this;
  }
  sync(...fns) {
    this.targets.forEach((target, index) => fns.forEach((fn) => fn(this.host, target, index)));
    return this;
  }
}

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
var useContext = (host) => {
  const proto = host.constructor;
  const consumed = proto.consumedContexts || [];
  queueMicrotask(() => {
    for (const context of consumed)
      host.dispatchEvent(new ContextRequestEvent(context, (value) => host.set(String(context), value ?? RESET)));
  });
  const provided = proto.providedContexts || [];
  if (!provided.length)
    return false;
  host.addEventListener(CONTEXT_REQUEST, (e) => {
    const { context, callback } = e;
    if (!provided.includes(context) || !isFunction2(callback))
      return;
    e.stopPropagation();
    callback(host.signals[String(context)]);
  });
  return true;
};

// src/ui-element.ts
var RESET = Symbol();
var isAttributeParser = (value) => isFunction2(value) && !!value.length;
var isComputeFunction = (value) => isFunction2(value) && !value.length;
var unwrap = (v) => isFunction2(v) ? unwrap(v()) : isSignal(v) ? unwrap(v.get()) : v;
var parse = (host, key, value, old) => {
  const parser = host.states[key];
  return isAttributeParser(parser) ? parser(value, host, old) : value;
};

class UIElement extends HTMLElement {
  static registry = customElements;
  static localName;
  static observedAttributes;
  static consumedContexts;
  static providedContexts;
  static define(name = this.localName) {
    try {
      this.registry.define(name, this);
      if (DEV_MODE)
        log(name, "Registered custom element");
    } catch (error) {
      log(error, `Failed to register custom element ${name}`, LOG_ERROR);
    }
    return this;
  }
  states = {};
  signals = {};
  cleanup = [];
  self = new UI(this);
  get root() {
    return this.shadowRoot || this;
  }
  debug = false;
  attributeChangedCallback(name, old, value) {
    if (value === old || isComputed(this.signals[name]))
      return;
    const parsed = parse(this, name, value, old);
    if (DEV_MODE && this.debug)
      log(value, `Attribute "${name}" of ${elementName(this)} changed from ${valueString(old)} to ${valueString(value)}, parsed as <${typeof parsed}> ${valueString(parsed)}`);
    this.set(name, parsed ?? RESET);
  }
  connectedCallback() {
    if (DEV_MODE) {
      this.debug = this.hasAttribute("debug");
      if (this.debug)
        log(this, "Connected");
    }
    for (const [key, init] of Object.entries(this.states)) {
      const result = isAttributeParser(init) ? init(this.getAttribute(key), this) : isComputeFunction(init) ? computed(init) : init;
      this.set(key, result ?? RESET);
    }
    useContext(this);
  }
  disconnectedCallback() {
    this.cleanup.forEach((off) => off());
    this.cleanup = [];
    if (DEV_MODE && this.debug)
      log(this, "Disconnected");
  }
  adoptedCallback() {
    if (DEV_MODE && this.debug)
      log(this, "Adopted");
  }
  has(key) {
    return key in this.signals;
  }
  get(key) {
    const value = unwrap(this.signals[key]);
    if (DEV_MODE && this.debug)
      log(value, `Get current value of state <${typeof value}> ${valueString(key)} in ${elementName(this)}`);
    return value;
  }
  set(key, value, update2 = true) {
    if (value == null) {
      log(value, `Attempt to set state ${valueString(key)} to null or undefined in ${elementName(this)}`, LOG_ERROR);
      return;
    }
    let op;
    const s = this.signals[key];
    const old = s?.get();
    if (!(key in this.signals)) {
      if (DEV_MODE && this.debug)
        op = "Create";
      this.signals[key] = toSignal(value);
    } else if (update2 || old === UNSET || old === RESET) {
      if (isSignal(value)) {
        if (DEV_MODE && this.debug)
          op = "Replace";
        this.signals[key] = value;
        if (isState(s))
          s.set(UNSET);
      } else {
        if (isState(s)) {
          if (DEV_MODE && this.debug)
            op = "Update";
          if (isFunction2(value))
            s.update(value);
          else
            s.set(value);
        } else {
          log(value, `Computed state ${valueString(key)} in ${elementName(this)} cannot be set`, LOG_WARN);
          return;
        }
      }
    } else
      return;
    if (DEV_MODE && this.debug)
      log(value, `${op} state <${typeof value}> ${valueString(key)} in ${elementName(this)}`);
  }
  delete(key) {
    if (DEV_MODE && this.debug)
      log(key, `Delete state ${valueString(key)} from ${elementName(this)}`);
    return delete this.signals[key];
  }
  first(selector) {
    const element = this.root.querySelector(selector);
    return new UI(this, element ? [element] : []);
  }
  all(selector) {
    return new UI(this, Array.from(this.root.querySelectorAll(selector)));
  }
}
// src/lib/parsers.ts
var parseNumber = (parseFn, value) => {
  if (value == null)
    return;
  const parsed = parseFn(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
var getFallback = (value) => Array.isArray(value) && value[0] ? value[0] : value;
var asBoolean = (value) => value !== "false" && value != null;
var asIntegerWithDefault = (fallback = 0) => (value) => parseNumber(parseInt, value) ?? fallback;
var asInteger = asIntegerWithDefault();
var asNumberWithDefault = (fallback = 0) => (value) => parseNumber(parseFloat, value) ?? fallback;
var asNumber = asNumberWithDefault();
var asStringWithDefault = (fallback = "") => (value) => value ?? fallback;
var asString = asStringWithDefault();
var asEnum = (valid) => (value) => value != null && valid.includes(value.toLowerCase()) ? value : getFallback(valid);
var asJSONWithDefault = (fallback) => (value) => {
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
var asJSON = asJSONWithDefault({});
// src/lib/effects.ts
var updateElement = (s, updater) => (host, target) => {
  const { read, update: update2 } = updater;
  const fallback = read(target);
  if (isString(s)) {
    const value = isString(fallback) ? parse(host, s, fallback) : fallback;
    if (value != null)
      host.set(s, value, false);
  }
  effect(() => {
    const current = read(target);
    const value = isString(s) ? host.get(s) : isSignal(s) ? s.get() : isFunction2(s) ? s(current) : undefined;
    if (!Object.is(value, current)) {
      if ((value === null || value === UNSET) && updater.delete) {
        updater.delete(target);
      } else if (value == null || value === RESET) {
        if (fallback)
          update2(target, fallback);
      } else {
        update2(target, value);
      }
    }
  });
};
var createElement = (tag, s) => updateElement(s, {
  read: () => null,
  update: (el, value) => ce(el, tag, value)
});
var removeElement = (s) => updateElement(s, {
  read: (el) => el != null,
  update: (el, value) => value ? re(el) : Promise.resolve(null)
});
var setText = (s) => updateElement(s, {
  read: (el) => el.textContent,
  update: (el, value) => st(el, value)
});
var setProperty = (key, s = key) => updateElement(s, {
  read: (el) => (key in el) ? el[key] : UNSET,
  update: (el, value) => {
    el[key] = value;
  }
});
var setAttribute = (name, s = name) => updateElement(s, {
  read: (el) => el.getAttribute(name),
  update: (el, value) => sa(el, name, value),
  delete: (el) => ra(el, name)
});
var toggleAttribute = (name, s = name) => updateElement(s, {
  read: (el) => el.hasAttribute(name),
  update: (el, value) => ta(el, name, value)
});
var toggleClass = (token, s = token) => updateElement(s, {
  read: (el) => el.classList.contains(token),
  update: (el, value) => tc(el, token, value)
});
var setStyle = (prop, s = prop) => updateElement(s, {
  read: (el) => el.style.getPropertyValue(prop),
  update: (el, value) => ss(el, prop, value),
  delete: (el) => rs(el, prop)
});
export {
  useContext,
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
  parse,
  log,
  isState,
  isSignal,
  isComputed,
  enqueue2 as enqueue,
  effect,
  createElement,
  computed,
  batch,
  asStringWithDefault,
  asString,
  asNumberWithDefault,
  asNumber,
  asJSONWithDefault,
  asJSON,
  asIntegerWithDefault,
  asInteger,
  asEnum,
  asBoolean,
  animationFrame,
  UNSET,
  UIElement,
  UI,
  RESET,
  LOG_WARN,
  LOG_INFO,
  LOG_ERROR,
  LOG_DEBUG
};

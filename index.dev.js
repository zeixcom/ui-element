// node_modules/@zeix/cause-effect/lib/util.ts
var isFunction = (value) => typeof value === "function";
var isAsyncFunction = (value) => isFunction(value) && /^async\s+/.test(value.toString());
var isInstanceOf = (type) => (value) => value instanceof type;
var isError = /* @__PURE__ */ isInstanceOf(Error);
var isPromise = /* @__PURE__ */ isInstanceOf(Promise);

// node_modules/@zeix/cause-effect/lib/computed.ts
var TYPE_COMPUTED = "Computed";
var computed = (fn, memo) => {
  memo = memo ?? isAsyncFunction(fn);
  const watchers = [];
  let value;
  let error = null;
  let stale = true;
  const mark = () => {
    stale = true;
    if (memo)
      notify(watchers);
  };
  const c = {
    [Symbol.toStringTag]: TYPE_COMPUTED,
    get: () => {
      if (memo)
        subscribe(watchers);
      if (!memo || stale)
        watch(() => {
          const handleOk = (v) => {
            value = v;
            stale = false;
            error = null;
          };
          const handleErr = (e) => {
            error = isError(e) ? e : new Error(`Computed function failed: ${e}`);
          };
          try {
            const res = fn(value);
            isPromise(res) ? res.then(handleOk).catch(handleErr) : handleOk(res);
          } catch (e) {
            handleErr(e);
          }
        }, mark);
      if (isError(error))
        throw error;
      return value;
    },
    map: (fn2) => computed(() => fn2(c.get()))
  };
  return c;
};
var isComputed = (value) => !!value && typeof value === "object" && value[Symbol.toStringTag] === TYPE_COMPUTED;

// node_modules/@zeix/cause-effect/lib/signal.ts
var active;
var batching = false;
var pending = [];
var isSignal = (value) => isState(value) || isComputed(value);
var toSignal = (value, memo = false) => isSignal(value) ? value : isFunction(value) ? computed(value, memo) : state(value);
var subscribe = (watchers) => {
  if (active && !watchers.includes(active))
    watchers.push(active);
};
var notify = (watchers) => watchers.forEach((n) => batching ? pending.push(n) : n());
var watch = (run, mark) => {
  const prev = active;
  active = mark;
  run();
  active = prev;
};
var batch = (run) => {
  batching = true;
  run();
  batching = false;
  pending.forEach((n) => n());
  pending.length = 0;
};

// node_modules/@zeix/cause-effect/lib/state.ts
var UNSET = Symbol();

class State {
  value;
  watchers = [];
  constructor(value) {
    this.value = value;
  }
  get() {
    subscribe(this.watchers);
    return this.value;
  }
  set(value) {
    if (UNSET !== value) {
      const newValue = isFunction(value) ? value(this.value) : value;
      if (Object.is(this.value, newValue))
        return;
      this.value = newValue;
    }
    notify(this.watchers);
    if (UNSET === value)
      this.watchers = [];
  }
  map(fn) {
    return computed(() => fn(this.get()));
  }
}
var state = (value) => new State(value);
var isState = /* @__PURE__ */ isInstanceOf(State);
// node_modules/@zeix/cause-effect/lib/effect.ts
var effect = (fn) => {
  const run = () => watch(() => {
    try {
      fn();
    } catch (error) {
      console.error(error);
    }
  }, run);
  run();
};
// node_modules/@zeix/pulse/lib/pulse.ts
if (!("requestAnimationFrame" in globalThis))
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 16);
var dedupeMap = new Map;
var queue = [];
var requestId;
var flush = () => {
  requestId = null;
  queue.forEach((fn) => fn());
  queue = [];
  dedupeMap.clear();
};
var requestTick = () => {
  if (requestId)
    cancelAnimationFrame(requestId);
  requestId = requestAnimationFrame(flush);
};
queueMicrotask(flush);
var enqueue = (callback, dedupe) => new Promise((resolve, reject) => {
  const wrappedCallback = () => {
    try {
      resolve(callback());
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
var ce = (parent, tag, attributes = {}, text) => enqueue(() => {
  const child = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes))
    safeSetAttribute(child, key, value);
  if (text)
    child.textContent = text;
  parent.append(child);
  return child;
}, [parent, "e"]);
var re = (element) => enqueue(() => {
  element.remove();
  return null;
}, [element, "r"]);
var st = (element, text) => enqueue(() => {
  Array.from(element.childNodes).filter((node) => !isComment(node)).forEach((node) => node.remove());
  element.append(document.createTextNode(text));
  return element;
}, [element, "t"]);
var sa = (element, attribute, value) => enqueue(() => {
  safeSetAttribute(element, attribute, value);
  return element;
}, [element, `a:${attribute}`]);
var ra = (element, attribute) => enqueue(() => {
  element.removeAttribute(attribute);
  return element;
}, [element, `a:${attribute}`]);
var ta = (element, attribute, value) => enqueue(() => {
  element.toggleAttribute(attribute, value);
  return element;
}, [element, `a:${attribute}`]);
var tc = (element, token, value) => enqueue(() => {
  element.classList.toggle(token, value);
  return element;
}, [element, `c:${token}`]);
var ss = (element, property, value) => enqueue(() => {
  element.style.setProperty(property, value);
  return element;
}, [element, `s:${property}`]);
var rs = (element, property) => enqueue(() => {
  element.style.removeProperty(property);
  return element;
}, [element, `s:${property}`]);
// src/core/util.ts
var isFunction2 = (value) => typeof value === "function";
var isDefinedObject = (value) => !!value && typeof value === "object";
var isNumber = (value) => typeof value === "number";
var isString = (value) => typeof value === "string";
var isSymbol = (value) => typeof value === "symbol";
var isPropertyKey = (value) => isString(value) || isSymbol(value) || isNumber(value);

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
var isFactoryFunction = (fn) => isFunction2(fn) && fn.length === 2;
var fromFactory = (fn, element, index = 0) => isFactoryFunction(fn) ? fn(element, index) : fn;

class UI {
  host;
  targets;
  constructor(host, targets = [host]) {
    this.host = host;
    this.targets = targets;
  }
  on(event, listener) {
    this.targets.forEach((target, index) => target.addEventListener(event, fromFactory(listener, target, index)));
    return this;
  }
  off(event, listener) {
    this.targets.forEach((target, index) => target.removeEventListener(event, fromFactory(listener, target, index)));
    return this;
  }
  pass(states) {
    this.targets.forEach(async (target, index) => {
      await UIElement.registry.whenDefined(target.localName);
      if (target instanceof UIElement) {
        Object.entries(states).forEach(([name, source]) => {
          const result = fromFactory(source, target, index);
          const value = isPropertyKey(result) ? this.host.signals.get(result) : toSignal(result, true);
          if (value)
            target.set(name, value);
          else
            log(source, `Invalid source for state ${valueString(name)}`, LOG_ERROR);
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

// src/core/parse.ts
var parseNumber = (parseFn, value) => {
  if (value == null)
    return;
  const parsed = parseFn(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
var parse = (host, name, value, old = undefined) => {
  const parser = host.constructor.states[name];
  return isFunction2(parser) && !!parser.length ? parser(value, host, old) : value;
};
var asBoolean = (value) => value != null;
var asInteger = (value) => parseNumber(parseInt, value);
var asNumber = (value) => parseNumber(parseFloat, value);
var asString = (value) => value;
var asEnum = (valid) => (value) => {
  if (value == null)
    return;
  return valid.includes(value.toLowerCase()) ? value : undefined;
};
var asJSON = (value) => {
  if (value == null)
    return;
  try {
    return JSON.parse(value);
  } catch (error) {
    log(error, "Failed to parse JSON", LOG_ERROR);
    return;
  }
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
var useContext = (host) => {
  const proto = host.constructor;
  const consumed = proto.consumedContexts || [];
  setTimeout(() => {
    for (const context of consumed)
      host.dispatchEvent(new ContextRequestEvent(context, (value) => host.set(String(context), value)));
  });
  const provided = proto.providedContexts || [];
  if (!provided.length)
    return false;
  host.addEventListener(CONTEXT_REQUEST, (e) => {
    const { context, callback } = e;
    if (!provided.includes(context) || !isFunction2(callback))
      return;
    e.stopPropagation();
    callback(host.signals.get(String(context)));
  });
  return true;
};

// src/ui-element.ts
class UIElement extends HTMLElement {
  static registry = customElements;
  static states = {};
  static observedAttributes;
  static consumedContexts;
  static providedContexts;
  static define(tag) {
    try {
      UIElement.registry.define(tag, this);
      if (DEV_MODE)
        log(tag, "Registered custom element");
    } catch (error) {
      log(error, `Failed to register custom element ${tag}`, LOG_ERROR);
    }
  }
  signals = new Map;
  self = new UI(this);
  root = this.shadowRoot || this;
  debug = false;
  attributeChangedCallback(name, old, value) {
    if (value === old)
      return;
    if (DEV_MODE && this.debug)
      log(`${valueString(old)} => ${valueString(value)}`, `Attribute "${name}" of ${elementName(this)} changed`);
    this.set(name, parse(this, name, value, old));
  }
  connectedCallback() {
    if (DEV_MODE) {
      this.debug = this.hasAttribute("debug");
      if (this.debug)
        log(this, "Connected");
    }
    Object.entries(this.constructor.states).forEach(([name, source]) => {
      const value = isFunction2(source) ? parse(this, name, this.getAttribute(name) ?? undefined, undefined) : source;
      this.set(name, value, false);
    });
    useContext(this);
  }
  disconnectedCallback() {
    if (DEV_MODE && this.debug)
      log(this, "Disconnected");
  }
  adoptedCallback() {
    if (DEV_MODE && this.debug)
      log(this, "Adopted");
  }
  has(key) {
    return this.signals.has(key);
  }
  get(key) {
    const unwrap = (v) => !isDefinedObject(v) ? v : isFunction2(v) ? unwrap(v()) : isSignal(v) ? unwrap(v.get()) : v;
    const value = unwrap(this.signals.get(key));
    if (DEV_MODE && this.debug)
      log(value, `Get current value of state ${valueString(key)} in ${elementName(this)}`);
    return value;
  }
  set(key, value, update2 = true) {
    let op;
    if (!this.signals.has(key)) {
      if (DEV_MODE && this.debug)
        op = "Create";
      this.signals.set(key, toSignal(value, true));
    } else if (update2) {
      const s = this.signals.get(key);
      if (isSignal(value)) {
        if (DEV_MODE && this.debug)
          op = "Replace";
        this.signals.set(key, value);
        if (isState(s))
          s.set(UNSET);
      } else {
        if (isState(s)) {
          if (DEV_MODE && this.debug)
            op = "Update";
          s.set(value);
        } else {
          log(value, `Computed state ${valueString(key)} in ${elementName(this)} cannot be set`, LOG_ERROR);
          return;
        }
      }
    } else
      return;
    if (DEV_MODE && this.debug)
      log(value, `${op} state ${valueString(key)} in ${elementName(this)}`);
  }
  delete(key) {
    if (DEV_MODE && this.debug)
      log(key, `Delete state ${valueString(key)} from ${elementName(this)}`);
    return this.signals.delete(key);
  }
  first(selector) {
    const element = this.root.querySelector(selector);
    return new UI(this, element ? [element] : []);
  }
  all(selector) {
    return new UI(this, Array.from(this.root.querySelectorAll(selector)));
  }
}
// src/lib/effects.ts
var emit = (event, s = event) => (host, target) => effect(() => {
  target.dispatchEvent(new CustomEvent(event, {
    detail: host.get(s),
    bubbles: true
  }));
});
var updateElement = (s, updater) => (host, target) => {
  const { read, update: update2 } = updater;
  const fallback = read(target);
  if (!isFunction2(s)) {
    const value = isString(s) && isString(fallback) ? parse(host, s, fallback) : fallback;
    host.set(s, value, false);
  }
  effect(() => {
    const current = read(target);
    const value = isFunction2(s) ? s(current) : host.get(s);
    if (!Object.is(value, current)) {
      if (value === null && updater.delete)
        updater.delete(target);
      else if (value == null && fallback)
        update2(target, fallback);
      else if (value != null)
        update2(target, value);
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
  read: (el) => el[key],
  update: (el, value) => el[key] = value
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
  enqueue,
  emit,
  effect,
  createElement,
  computed,
  batch,
  asString,
  asNumber,
  asJSON,
  asInteger,
  asEnum,
  asBoolean,
  animationFrame,
  UNSET,
  UIElement,
  UI,
  LOG_WARN,
  LOG_INFO,
  LOG_ERROR,
  LOG_DEBUG
};

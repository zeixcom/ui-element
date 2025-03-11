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
var requestTick = () => {
  if (requestId)
    cancelAnimationFrame(requestId);
  requestId = requestAnimationFrame(updateDOM);
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
var enqueue = (fn, dedupe) => new Promise((resolve, reject) => {
  const wrappedCallback = () => {
    try {
      resolve(fn());
    } catch (error) {
      reject(error);
    }
  };
  if (dedupe) {
    updateMap.set(dedupe, wrappedCallback);
  }
  requestTick();
});

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
var ui = (host, targets = [host]) => {
  const u = {
    host,
    targets,
    on: (type, listenerOrProvider) => {
      targets.forEach((target, index) => {
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
        host.cleanup.push(() => target.removeEventListener(type, listener));
      });
      return u;
    },
    emit: (type, detail) => {
      targets.forEach((target) => {
        target.dispatchEvent(new CustomEvent(type, {
          detail,
          bubbles: true
        }));
      });
      return u;
    },
    pass: (passedSignalsOrProvider) => {
      targets.forEach(async (target, index) => {
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
              if (source in host.signals) {
                target.set(key, host.signals[source]);
              } else {
                log(source, `Invalid string key "${source}" for state ${valueString(key)}`, LOG_WARN);
              }
            } else {
              try {
                target.set(key, toSignal(source));
              } catch (error) {
                log(error, `Invalid source for state ${valueString(key)}`, LOG_WARN);
              }
            }
          });
        } else {
          log(target, `Target is not a UIElement`, LOG_ERROR);
        }
      });
      return u;
    },
    sync: (...fns) => {
      targets.forEach((target, index) => fns.forEach((fn) => fn(host, target, index)));
      return u;
    }
  };
  return u;
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
var isStateUpdater = (value) => isFunction2(value) && !!value.length;
var unwrap = (v) => isFunction2(v) ? unwrap(v()) : isSignal(v) ? unwrap(v.get()) : v;
var parse = (host, key, value, old) => {
  const parser = host.init[key];
  return isAttributeParser(parser) ? parser(value, host, old) : value ?? undefined;
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
  init = {};
  signals = {};
  cleanup = [];
  self = ui(this);
  get root() {
    return this.shadowRoot || this;
  }
  debug = false;
  attributeChangedCallback(name, old, value) {
    if (value === old || isComputed(this.signals[name]))
      return;
    const parsed = parse(this, name, value, old);
    if (DEV_MODE && this.debug)
      log(value, `Attribute "${name}" of ${elementName(this)} changed from ${valueString(old)} to ${valueString(value)}, parsed as <${typeString(parsed)}> ${valueString(parsed)}`);
    this.set(name, parsed ?? RESET);
  }
  connectedCallback() {
    if (DEV_MODE) {
      this.debug = this.hasAttribute("debug");
      if (this.debug)
        log(this, "Connected");
    }
    for (const [key, init] of Object.entries(this.init)) {
      if (this.constructor.observedAttributes.includes(key))
        continue;
      const result = isAttributeParser(init) ? init(this.getAttribute(key), this) : isComputedCallbacks(init) ? computed(init) : init;
      this.set(key, result ?? RESET, false);
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
      log(value, `Get current value of signal <${typeString(value)}> ${valueString(key)} in ${elementName(this)}`);
    return value;
  }
  set(key, value, update = true) {
    if (value == null) {
      log(value, `Attempt to set state ${valueString(key)} to null or undefined in ${elementName(this)}`, LOG_ERROR);
      return;
    }
    let op;
    const s = this.signals[key];
    const old = s?.get();
    if (!(key in this.signals)) {
      if (isStateUpdater(value)) {
        log(value, `Cannot use updater function to create a computed signal in ${elementName(this)}`, LOG_ERROR);
        return;
      }
      if (DEV_MODE && this.debug)
        op = "Create";
      this.signals[key] = toSignal(value);
    } else if (update || old === UNSET || old === RESET) {
      if (isComputedCallbacks(value)) {
        log(value, `Cannot use computed callbacks to update signal ${valueString(key)} in ${elementName(this)}`, LOG_ERROR);
        return;
      }
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
          if (isStateUpdater(value))
            s.update(value);
          else
            s.set(value);
        } else {
          log(value, `Computed signal ${valueString(key)} in ${elementName(this)} cannot be set`, LOG_WARN);
          return;
        }
      }
    } else
      return;
    if (DEV_MODE && this.debug)
      log(value, `${op} signal <${typeString(value)}> ${valueString(key)} in ${elementName(this)}`);
  }
  delete(key) {
    if (DEV_MODE && this.debug)
      log(key, `Delete signal ${valueString(key)} from ${elementName(this)}`);
    return delete this.signals[key];
  }
  first(selector) {
    let element = this.root.querySelector(selector);
    if (this.shadowRoot && !element)
      element = this.querySelector(selector);
    return ui(this, element ? [element] : []);
  }
  all(selector) {
    let elements = this.root.querySelectorAll(selector);
    if (this.shadowRoot && !elements.length)
      elements = this.querySelectorAll(selector);
    return ui(this, Array.from(elements));
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
var asInteger = (fallback = 0) => (value) => parseNumber(parseInt, value) ?? fallback;
var asNumber = (fallback = 0) => (value) => parseNumber(parseFloat, value) ?? fallback;
var asString = (fallback = "") => (value) => value ?? fallback;
var asEnum = (valid) => (value) => value != null && valid.includes(value.toLowerCase()) ? value : getFallback(valid);
var asJSON = (fallback) => (value) => {
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
var isSafeURL = (value) => {
  if (/^(mailto|tel):/i.test(value))
    return true;
  if (value.includes("://")) {
    try {
      const url = new URL(value, window.location.origin);
      return ["http:", "https:", "ftp:"].includes(url.protocol);
    } catch (error) {
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
var updateElement = (s, updater) => (host, target, index) => {
  const { op, read, update } = updater;
  const fallback = read(target);
  if (isString(s) && !isComputed(host.signals[s])) {
    const value = isString(fallback) ? parse(host, s, fallback) : fallback;
    if (value != null)
      host.set(s, value, false);
  }
  effect(() => {
    let value = RESET;
    try {
      value = isString(s) ? host.get(s) : isSignal(s) ? s.get() : isFunction2(s) ? s(target, index) : RESET;
    } catch (error) {
      log(error, `Failed to update element ${elementName(target)} in ${elementName(host)}:`, LOG_ERROR);
    } finally {
      if (value === RESET)
        value = fallback;
      if (value === UNSET)
        value = null;
    }
    const current = read(target);
    if (!Object.is(value, current)) {
      if ((value === null || value == null && fallback === null) && updater.delete) {
        enqueue(() => {
          updater.delete(target);
          return true;
        }, [target, op]);
      } else if (value == null) {
        if (fallback) {
          enqueue(() => {
            update(target, fallback);
            return true;
          }, [target, op]);
        }
      } else {
        enqueue(() => {
          update(target, value);
          return true;
        }, [target, op]);
      }
    }
  });
};
var createElement = (tag, s, text) => updateElement(s, {
  op: "create",
  read: () => null,
  update: (el, attributes) => {
    const child = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes))
      safeSetAttribute(child, key, value);
    if (text)
      child.textContent = text;
    el.append(child);
  }
});
var removeElement = (s) => updateElement(s, {
  op: "remove",
  read: (el) => !!el,
  update: (el, really) => {
    if (really)
      el.remove();
  }
});
var setText = (s) => updateElement(s, {
  op: "text",
  read: (el) => el.textContent,
  update: (el, value) => {
    Array.from(el.childNodes).filter((node) => node.nodeType !== Node.COMMENT_NODE).forEach((node) => node.remove());
    el.append(document.createTextNode(value));
  }
});
var dangerouslySetInnerHTML = (s, attachShadow, allowScripts) => updateElement(s, {
  op: "html",
  read: (el) => (el.shadowRoot || !attachShadow ? el : null)?.innerHTML ?? "",
  update: (el, html) => {
    if (!html) {
      if (el.shadowRoot)
        el.shadowRoot.innerHTML = "<slot></slot>";
      return;
    }
    if (attachShadow && !el.shadowRoot)
      el.attachShadow({ mode: attachShadow });
    const target = el.shadowRoot || el;
    target.innerHTML = html;
    if (!allowScripts)
      return;
    target.querySelectorAll("script").forEach((script) => {
      const newScript = document.createElement("script");
      newScript.appendChild(document.createTextNode(script.textContent ?? ""));
      target.appendChild(newScript);
      script.remove();
    });
  }
});
var setProperty = (key, s = key) => updateElement(s, {
  op: "prop",
  read: (el) => (key in el) ? el[key] : UNSET,
  update: (el, value) => {
    el[key] = value;
  }
});
var setAttribute = (name, s = name) => updateElement(s, {
  op: "attr",
  read: (el) => el.getAttribute(name),
  update: (el, value) => {
    safeSetAttribute(el, name, value);
  },
  delete: (el) => {
    el.removeAttribute(name);
  }
});
var toggleAttribute = (name, s = name) => updateElement(s, {
  op: "attr",
  read: (el) => el.hasAttribute(name),
  update: (el, value) => {
    el.toggleAttribute(name, value);
  }
});
var toggleClass = (token, s = token) => updateElement(s, {
  op: "class",
  read: (el) => el.classList.contains(token),
  update: (el, value) => {
    el.classList.toggle(token, value);
  }
});
var setStyle = (prop, s = prop) => updateElement(s, {
  op: "style",
  read: (el) => el.style.getPropertyValue(prop),
  update: (el, value) => {
    el.style.setProperty(prop, value);
  },
  delete: (el) => {
    el.style.removeProperty(prop);
  }
});
export {
  watch,
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
  enqueue,
  effect,
  dangerouslySetInnerHTML,
  createElement,
  computed,
  batch,
  asString,
  asNumber,
  asJSON,
  asInteger,
  asEnum,
  asBoolean,
  UNSET,
  UIElement,
  RESET,
  LOG_WARN,
  LOG_INFO,
  LOG_ERROR,
  LOG_DEBUG
};

// node_modules/alien-signals/esm/index.mjs
function createReactiveSystem({
  updateComputed,
  notifyEffect: notifyEffect2
}) {
  let queuedEffects;
  let queuedEffectsTail;
  return {
    link(dep, sub) {
      const currentDep = sub.depsTail;
      if (currentDep !== undefined && currentDep.dep === dep) {
        return;
      }
      const nextDep = currentDep !== undefined ? currentDep.nextDep : sub.deps;
      if (nextDep !== undefined && nextDep.dep === dep) {
        sub.depsTail = nextDep;
        return;
      }
      const depLastSub = dep.subsTail;
      if (depLastSub !== undefined && depLastSub.sub === sub && isValidLink(depLastSub, sub)) {
        return;
      }
      return linkNewDep(dep, sub, nextDep, currentDep);
    },
    propagate(link2) {
      let targetFlag = 32;
      let subs = link2;
      let stack = 0;
      top:
        do {
          const sub = link2.sub;
          const subFlags = sub.flags;
          if (!(subFlags & (4 | 16 | 224)) && (sub.flags = subFlags | targetFlag | 8, true) || subFlags & 16 && !(subFlags & 4) && (sub.flags = subFlags & ~16 | targetFlag | 8, true) || !(subFlags & 224) && isValidLink(link2, sub) && (sub.flags = subFlags | 16 | targetFlag | 8, sub.subs !== undefined)) {
            const subSubs = sub.subs;
            if (subSubs !== undefined) {
              if (subSubs.nextSub !== undefined) {
                subSubs.prevSub = subs;
                link2 = subs = subSubs;
                targetFlag = 64;
                ++stack;
              } else {
                link2 = subSubs;
                targetFlag = subFlags & 2 ? 128 : 64;
              }
              continue;
            }
            if (subFlags & 2) {
              if (queuedEffectsTail !== undefined) {
                queuedEffectsTail.depsTail.nextDep = sub.deps;
              } else {
                queuedEffects = sub;
              }
              queuedEffectsTail = sub;
            }
          } else if (!(subFlags & (4 | targetFlag))) {
            sub.flags = subFlags | targetFlag | 8;
            if ((subFlags & (2 | 8)) === 2) {
              if (queuedEffectsTail !== undefined) {
                queuedEffectsTail.depsTail.nextDep = sub.deps;
              } else {
                queuedEffects = sub;
              }
              queuedEffectsTail = sub;
            }
          } else if (!(subFlags & targetFlag) && subFlags & 224 && isValidLink(link2, sub)) {
            sub.flags = subFlags | targetFlag;
          }
          if ((link2 = subs.nextSub) !== undefined) {
            subs = link2;
            targetFlag = stack ? 64 : 32;
            continue;
          }
          while (stack) {
            --stack;
            const dep = subs.dep;
            const depSubs = dep.subs;
            subs = depSubs.prevSub;
            depSubs.prevSub = undefined;
            if ((link2 = subs.nextSub) !== undefined) {
              subs = link2;
              targetFlag = stack ? 64 : 32;
              continue top;
            }
          }
          break;
        } while (true);
    },
    startTracking(sub) {
      sub.depsTail = undefined;
      sub.flags = sub.flags & ~(8 | 16 | 224) | 4;
    },
    endTracking(sub) {
      const depsTail = sub.depsTail;
      if (depsTail !== undefined) {
        const nextDep = depsTail.nextDep;
        if (nextDep !== undefined) {
          clearTracking(nextDep);
          depsTail.nextDep = undefined;
        }
      } else if (sub.deps !== undefined) {
        clearTracking(sub.deps);
        sub.deps = undefined;
      }
      sub.flags &= ~4;
    },
    updateDirtyFlag(sub, flags) {
      if (checkDirty(sub.deps)) {
        sub.flags = flags | 32;
        return true;
      } else {
        sub.flags = flags & ~64;
        return false;
      }
    },
    processComputedUpdate(computed2, flags) {
      if (flags & 32) {
        if (updateComputed(computed2)) {
          const subs = computed2.subs;
          if (subs !== undefined) {
            shallowPropagate(subs);
          }
        }
      } else if (flags & 64) {
        if (checkDirty(computed2.deps)) {
          if (updateComputed(computed2)) {
            const subs = computed2.subs;
            if (subs !== undefined) {
              shallowPropagate(subs);
            }
          }
        } else {
          computed2.flags = flags & ~64;
        }
      }
    },
    processPendingInnerEffects(sub, flags) {
      if (flags & 128) {
        sub.flags = flags & ~128;
        let link2 = sub.deps;
        do {
          const dep = link2.dep;
          if ("flags" in dep && dep.flags & 2 && dep.flags & 224) {
            notifyEffect2(dep);
          }
          link2 = link2.nextDep;
        } while (link2 !== undefined);
      }
    },
    processEffectNotifications() {
      while (queuedEffects !== undefined) {
        const effect2 = queuedEffects;
        const depsTail = effect2.depsTail;
        const queuedNext = depsTail.nextDep;
        if (queuedNext !== undefined) {
          depsTail.nextDep = undefined;
          queuedEffects = queuedNext.sub;
        } else {
          queuedEffects = undefined;
          queuedEffectsTail = undefined;
        }
        if (!notifyEffect2(effect2)) {
          effect2.flags &= ~8;
        }
      }
    }
  };
  function linkNewDep(dep, sub, nextDep, depsTail) {
    const newLink = {
      dep,
      sub,
      nextDep,
      prevSub: undefined,
      nextSub: undefined
    };
    if (depsTail === undefined) {
      sub.deps = newLink;
    } else {
      depsTail.nextDep = newLink;
    }
    if (dep.subs === undefined) {
      dep.subs = newLink;
    } else {
      const oldTail = dep.subsTail;
      newLink.prevSub = oldTail;
      oldTail.nextSub = newLink;
    }
    sub.depsTail = newLink;
    dep.subsTail = newLink;
    return newLink;
  }
  function checkDirty(link2) {
    let stack = 0;
    let dirty;
    top:
      do {
        dirty = false;
        const dep = link2.dep;
        if ("flags" in dep) {
          const depFlags = dep.flags;
          if ((depFlags & (1 | 32)) === (1 | 32)) {
            if (updateComputed(dep)) {
              const subs = dep.subs;
              if (subs.nextSub !== undefined) {
                shallowPropagate(subs);
              }
              dirty = true;
            }
          } else if ((depFlags & (1 | 64)) === (1 | 64)) {
            const depSubs = dep.subs;
            if (depSubs.nextSub !== undefined) {
              depSubs.prevSub = link2;
            }
            link2 = dep.deps;
            ++stack;
            continue;
          }
        }
        if (!dirty && link2.nextDep !== undefined) {
          link2 = link2.nextDep;
          continue;
        }
        if (stack) {
          let sub = link2.sub;
          do {
            --stack;
            const subSubs = sub.subs;
            if (dirty) {
              if (updateComputed(sub)) {
                if ((link2 = subSubs.prevSub) !== undefined) {
                  subSubs.prevSub = undefined;
                  shallowPropagate(sub.subs);
                  sub = link2.sub;
                } else {
                  sub = subSubs.sub;
                }
                continue;
              }
            } else {
              sub.flags &= ~64;
            }
            if ((link2 = subSubs.prevSub) !== undefined) {
              subSubs.prevSub = undefined;
              if (link2.nextDep !== undefined) {
                link2 = link2.nextDep;
                continue top;
              }
              sub = link2.sub;
            } else {
              if ((link2 = subSubs.nextDep) !== undefined) {
                continue top;
              }
              sub = subSubs.sub;
            }
            dirty = false;
          } while (stack);
        }
        return dirty;
      } while (true);
  }
  function shallowPropagate(link2) {
    do {
      const sub = link2.sub;
      const subFlags = sub.flags;
      if ((subFlags & (64 | 32)) === 64) {
        sub.flags = subFlags | 32 | 8;
        if ((subFlags & (2 | 8)) === 2) {
          if (queuedEffectsTail !== undefined) {
            queuedEffectsTail.depsTail.nextDep = sub.deps;
          } else {
            queuedEffects = sub;
          }
          queuedEffectsTail = sub;
        }
      }
      link2 = link2.nextSub;
    } while (link2 !== undefined);
  }
  function isValidLink(checkLink, sub) {
    const depsTail = sub.depsTail;
    if (depsTail !== undefined) {
      let link2 = sub.deps;
      do {
        if (link2 === checkLink) {
          return true;
        }
        if (link2 === depsTail) {
          break;
        }
        link2 = link2.nextDep;
      } while (link2 !== undefined);
    }
    return false;
  }
  function clearTracking(link2) {
    do {
      const dep = link2.dep;
      const nextDep = link2.nextDep;
      const nextSub = link2.nextSub;
      const prevSub = link2.prevSub;
      if (nextSub !== undefined) {
        nextSub.prevSub = prevSub;
      } else {
        dep.subsTail = prevSub;
      }
      if (prevSub !== undefined) {
        prevSub.nextSub = nextSub;
      } else {
        dep.subs = nextSub;
      }
      if (dep.subs === undefined && "deps" in dep) {
        const depFlags = dep.flags;
        if (!(depFlags & 32)) {
          dep.flags = depFlags | 32;
        }
        const depDeps = dep.deps;
        if (depDeps !== undefined) {
          link2 = depDeps;
          dep.depsTail.nextDep = nextDep;
          dep.deps = undefined;
          dep.depsTail = undefined;
          continue;
        }
      }
      link2 = nextDep;
    } while (link2 !== undefined);
  }
}
var {
  link,
  propagate,
  updateDirtyFlag,
  startTracking,
  endTracking,
  processEffectNotifications,
  processComputedUpdate,
  processPendingInnerEffects
} = createReactiveSystem({
  updateComputed(computed2) {
    const prevSub = activeSub;
    activeSub = computed2;
    startTracking(computed2);
    try {
      const oldValue = computed2.currentValue;
      const newValue = computed2.getter(oldValue);
      if (oldValue !== newValue) {
        computed2.currentValue = newValue;
        return true;
      }
      return false;
    } finally {
      activeSub = prevSub;
      endTracking(computed2);
    }
  },
  notifyEffect(e) {
    if ("isScope" in e) {
      return notifyEffectScope(e);
    } else {
      return notifyEffect(e);
    }
  }
});
var batchDepth = 0;
var activeSub;
var activeScope;
function signal(oldValue) {
  return signalGetterSetter.bind({
    currentValue: oldValue,
    subs: undefined,
    subsTail: undefined
  });
}
function computed(getter) {
  return computedGetter.bind({
    currentValue: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: 1 | 32,
    getter
  });
}
function effect(fn) {
  const e = {
    fn,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: 2
  };
  if (activeSub !== undefined) {
    link(e, activeSub);
  } else if (activeScope !== undefined) {
    link(e, activeScope);
  }
  runEffect(e);
  return effectStop.bind(e);
}
function runEffect(e) {
  const prevSub = activeSub;
  activeSub = e;
  startTracking(e);
  try {
    e.fn();
  } finally {
    activeSub = prevSub;
    endTracking(e);
  }
}
function notifyEffect(e) {
  const flags = e.flags;
  if (flags & 32 || flags & 64 && updateDirtyFlag(e, flags)) {
    runEffect(e);
  } else {
    processPendingInnerEffects(e, e.flags);
  }
  return true;
}
function notifyEffectScope(e) {
  const flags = e.flags;
  if (flags & 128) {
    processPendingInnerEffects(e, e.flags);
    return true;
  }
  return false;
}
function computedGetter() {
  const flags = this.flags;
  if (flags & (32 | 64)) {
    processComputedUpdate(this, flags);
  }
  if (activeSub !== undefined) {
    link(this, activeSub);
  } else if (activeScope !== undefined) {
    link(this, activeScope);
  }
  return this.currentValue;
}
function signalGetterSetter(...value) {
  if (value.length) {
    if (this.currentValue !== (this.currentValue = value[0])) {
      const subs = this.subs;
      if (subs !== undefined) {
        propagate(subs);
        if (!batchDepth) {
          processEffectNotifications();
        }
      }
    }
  } else {
    if (activeSub !== undefined) {
      link(this, activeSub);
    }
    return this.currentValue;
  }
}
function effectStop() {
  startTracking(this);
  endTracking(this);
}

// src/core/util.ts
var isFunction = (value) => typeof value === "function";
var isDefinedObject = (value) => !!value && typeof value === "object";
var isNumber = (value) => typeof value === "number";
var isString = (value) => typeof value === "string";
var isSymbol = (value) => typeof value === "symbol";
var isPropertyKey = (value) => isString(value) || isSymbol(value) || isNumber(value);
var isSignal = (value) => isFunction(value) && (("currentValue" in value.bind({})) || ("getter" in value));

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
var isFactoryFunction = (fn) => isFunction(fn) && fn.length === 2;
var fromFactory = (fn, element, index = 0) => isFactoryFunction(fn) ? fn(element, index) : fn;

class UI {
  host;
  targets;
  constructor(host, targets = [host]) {
    this.host = host;
    this.targets = targets;
  }
  on(event, listeners) {
    this.targets.forEach((target, index) => {
      const listener = fromFactory(listeners, target, index);
      target.addEventListener(event, listener);
      this.host.listeners.push(() => target.removeEventListener(event, listener));
    });
    return this;
  }
  pass(states) {
    this.targets.forEach(async (target, index) => {
      await UIElement.registry.whenDefined(target.localName);
      if (target instanceof UIElement) {
        Object.entries(states).forEach(([name, sources]) => {
          const source = fromFactory(sources, target, index);
          const value = isPropertyKey(source) ? this.host.signals.get(source) : isSignal(source) ? source : isFunction(source) ? computed(source) : signal(source);
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
  return isFunction(parser) && !!parser.length ? parser(value, host, old) : value;
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
  subscribe;
  constructor(context, callback, subscribe = false) {
    super(CONTEXT_REQUEST, {
      bubbles: true,
      composed: true
    });
    this.context = context;
    this.callback = callback;
    this.subscribe = subscribe;
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
    if (!provided.includes(context) || !isFunction(callback))
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
  listeners = [];
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
      const value = isFunction(source) ? parse(this, name, this.getAttribute(name) ?? undefined, undefined) : source;
      this.set(name, value, false);
    });
    useContext(this);
  }
  disconnectedCallback() {
    if (DEV_MODE && this.debug)
      log(this, "Disconnected");
    this.listeners.forEach((off) => off());
  }
  adoptedCallback() {
    if (DEV_MODE && this.debug)
      log(this, "Adopted");
  }
  has(key) {
    return this.signals.has(key);
  }
  get(key) {
    const unwrap = (v) => isFunction(v) ? unwrap(v()) : v;
    const value = unwrap(this.signals.get(key));
    if (DEV_MODE && this.debug)
      log(value, `Get current value of state ${valueString(key)} in ${elementName(this)}`);
    return value;
  }
  set(key, value, update = true) {
    let op;
    if (!this.signals.has(key)) {
      if (DEV_MODE && this.debug)
        op = "Create";
      this.signals.set(key, isFunction(value) ? computed(value) : signal(value));
    } else if (update) {
      const s = this.signals.get(key);
      if (isSignal(value)) {
        if (DEV_MODE && this.debug)
          op = "Replace";
        this.signals.set(key, value);
      } else if (isFunction(s)) {
        try {
          isFunction(value) && value.length === 1 ? s(value(s())) : s(value);
          if (DEV_MODE && this.debug)
            op = "Update";
        } catch (error) {
          log(value, `Read-only state ${valueString(key)} in ${elementName(this)} cannot be set`, LOG_ERROR);
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
var emit = (event, s = event) => (host, target) => {
  effect(() => {
    target.dispatchEvent(new CustomEvent(event, {
      detail: host.get(s),
      bubbles: true
    }));
  });
};
var updateElement = (s, updater) => (host, target) => {
  const { r, u, d } = updater;
  const fallback = r(target);
  if (!isFunction(s)) {
    const value = isString(s) && isString(fallback) ? parse(host, s, fallback) : fallback;
    host.set(s, value, false);
  }
  effect(() => {
    const current = r(target);
    const value = isFunction(s) ? s(current) : host.get(s);
    if (!Object.is(value, current)) {
      if (value === null && d)
        d(target);
      else if (value == null && fallback)
        u(target, fallback);
      else if (value != null)
        u(target, value);
    }
  });
};
var createElement = (tag, s, text) => updateElement(s, {
  r: () => null,
  u: (el, attributes) => {
    const child = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes))
      safeSetAttribute(child, key, value);
    if (text)
      child.textContent = text;
    el.append(child);
  }
});
var removeElement = (s) => updateElement(s, {
  r: (el) => el != null,
  u: (el, really) => {
    really && el.remove();
  }
});
var setText = (s) => updateElement(s, {
  r: (el) => el.textContent,
  u: (el, value) => {
    Array.from(el.childNodes).filter((node) => node.nodeType !== Node.COMMENT_NODE).forEach((node) => node.remove());
    el.append(document.createTextNode(value));
  }
});
var setProperty = (key, s = key) => updateElement(s, {
  r: (el) => el[key],
  u: (el, value) => {
    el[key] = value;
  }
});
var setAttribute = (name, s = name) => updateElement(s, {
  r: (el) => el.getAttribute(name),
  u: (el, value) => {
    safeSetAttribute(el, name, value);
  },
  d: (el) => {
    el.removeAttribute(name);
  }
});
var toggleAttribute = (name, s = name) => updateElement(s, {
  r: (el) => el.hasAttribute(name),
  u: (el, value) => {
    el.toggleAttribute(name, value);
  }
});
var toggleClass = (token, s = token) => updateElement(s, {
  r: (el) => el.classList.contains(token),
  u: (el, value) => {
    el.classList.toggle(token, value);
  }
});
var setStyle = (prop, s = prop) => updateElement(s, {
  r: (el) => el.style.getPropertyValue(prop),
  u: (el, value) => {
    el.style.setProperty(prop, value);
  },
  d: (el) => {
    el.style.removeProperty(prop);
  }
});
export {
  useContext,
  updateElement,
  toggleClass,
  toggleAttribute,
  setText,
  setStyle,
  setProperty,
  setAttribute,
  removeElement,
  parse,
  log,
  emit,
  createElement,
  asString,
  asNumber,
  asJSON,
  asInteger,
  asEnum,
  asBoolean,
  UIElement,
  UI,
  LOG_WARN,
  LOG_INFO,
  LOG_ERROR,
  LOG_DEBUG
};

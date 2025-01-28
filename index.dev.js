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
          const value = isPropertyKey(result) ? this.host.signals.get(result) : signal(result);
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
  set(key, value, update2 = true) {
    let op;
    if (!this.signals.has(key)) {
      if (DEV_MODE && this.debug)
        op = "Create";
      this.signals.set(key, signal(value));
    } else if (update2) {
      const s = this.signals.get(key);
      if (isFunction(value)) {
        if (DEV_MODE && this.debug)
          op = "Replace";
        this.signals.set(key, value);
      } else {
        if (isFunction(s)) {
          if (DEV_MODE && this.debug)
            op = "Update";
          s(value);
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
var emit = (event, s = event) => (host, target) => {
  effect(() => {
    target.dispatchEvent(new CustomEvent(event, {
      detail: host.get(s),
      bubbles: true
    }));
  });
};
var updateElement = (s, updater) => (host, target) => {
  const { read, update: update2 } = updater;
  const fallback = read(target);
  if (!isFunction(s)) {
    const value = isString(s) && isString(fallback) ? parse(host, s, fallback) : fallback;
    host.set(s, value, false);
  }
  effect(() => {
    const current = read(target);
    const value = isFunction(s) ? s(current) : host.get(s);
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
  setText,
  setStyle,
  setProperty,
  setAttribute,
  removeElement,
  parse,
  log,
  enqueue,
  emit,
  createElement,
  asString,
  asNumber,
  asJSON,
  asInteger,
  asEnum,
  asBoolean,
  animationFrame,
  UIElement,
  UI,
  LOG_WARN,
  LOG_INFO,
  LOG_ERROR,
  LOG_DEBUG
};

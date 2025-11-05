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

// node_modules/@zeix/cause-effect/src/util.ts
var isString = (value) => typeof value === "string";
var isNumber = (value) => typeof value === "number";
var isFunction = (fn) => typeof fn === "function";
var isAsyncFunction = (fn) => isFunction(fn) && fn.constructor.name === "AsyncFunction";
var isObjectOfType = (value, type) => Object.prototype.toString.call(value) === `[object ${type}]`;
var isRecord = (value) => isObjectOfType(value, "Object");
var validArrayIndexes = (keys) => {
  if (!keys.length)
    return null;
  const indexes = keys.map((k) => isString(k) ? parseInt(k, 10) : isNumber(k) ? k : NaN);
  return indexes.every((index) => Number.isFinite(index) && index >= 0) ? indexes.sort((a, b) => a - b) : null;
};
var hasMethod = (obj, methodName) => (methodName in obj) && isFunction(obj[methodName]);
var isAbortError = (error) => error instanceof DOMException && error.name === "AbortError";
var toError = (reason) => reason instanceof Error ? reason : Error(String(reason));

class CircularDependencyError extends Error {
  constructor(where) {
    super(`Circular dependency in ${where} detected`);
    this.name = "CircularDependencyError";
  }
}

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
      if (isEqual(value, v))
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

// node_modules/@zeix/cause-effect/src/effect.ts
var effect = (callback) => {
  const isAsync = isAsyncFunction(callback);
  let running = false;
  let controller;
  const run = watch(() => observe(() => {
    if (running)
      throw new CircularDependencyError("effect");
    running = true;
    controller?.abort();
    controller = undefined;
    let cleanup;
    try {
      if (isAsync) {
        controller = new AbortController;
        const currentController = controller;
        callback(controller.signal).then((cleanup2) => {
          if (isFunction(cleanup2) && controller === currentController)
            run.off(cleanup2);
        }).catch((error) => {
          if (!isAbortError(error))
            console.error("Async effect error:", error);
        });
      } else {
        cleanup = callback();
        if (isFunction(cleanup))
          run.off(cleanup);
      }
    } catch (error) {
      if (!isAbortError(error))
        console.error("Effect callback error:", error);
    }
    running = false;
  }, run));
  run();
  return () => {
    controller?.abort();
    run.cleanup();
  };
};

// node_modules/@zeix/cause-effect/src/store.ts
var TYPE_STORE = "Store";
var store = (initialValue) => {
  const watchers = new Set;
  const eventTarget = new EventTarget;
  const signals = new Map;
  const cleanups = new Map;
  const size = state(0);
  const current = () => {
    const keys = Array.from(signals.keys());
    const arrayIndexes = validArrayIndexes(keys);
    if (arrayIndexes)
      return arrayIndexes.map((index) => signals.get(String(index))?.get());
    const record = {};
    for (const [key, signal] of signals) {
      record[key] = signal.get();
    }
    return record;
  };
  const emit = (type, detail) => eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  const addProperty = (key, value) => {
    const stringKey = String(key);
    const signal = toMutableSignal(value);
    signals.set(stringKey, signal);
    const cleanup = effect(() => {
      const currentValue = signal.get();
      if (currentValue != null)
        emit("store-change", { [key]: currentValue });
    });
    cleanups.set(stringKey, cleanup);
  };
  const removeProperty = (key) => {
    const stringKey = String(key);
    signals.delete(stringKey);
    const cleanup = cleanups.get(stringKey);
    if (cleanup)
      cleanup();
    cleanups.delete(stringKey);
  };
  const reconcile = (oldValue, newValue) => {
    const changes = diff(oldValue, newValue);
    batch(() => {
      if (Object.keys(changes.add).length) {
        for (const key in changes.add) {
          const value = changes.add[key];
          if (value != null)
            addProperty(key, value);
        }
        emit("store-add", changes.add);
      }
      if (Object.keys(changes.change).length) {
        for (const key in changes.change) {
          const signal = signals.get(key);
          const value = changes.change[key];
          if (signal && value != null && hasMethod(signal, "set"))
            signal.set(value);
        }
        emit("store-change", changes.change);
      }
      if (Object.keys(changes.remove).length) {
        for (const key in changes.remove) {
          removeProperty(key);
        }
        emit("store-remove", changes.remove);
      }
      size.set(signals.size);
    });
    return changes.changed;
  };
  reconcile({}, initialValue);
  setTimeout(() => {
    const initialAdditionsEvent = new CustomEvent("store-add", {
      detail: initialValue
    });
    eventTarget.dispatchEvent(initialAdditionsEvent);
  }, 0);
  const storeProps = [
    "add",
    "get",
    "remove",
    "set",
    "update",
    "addEventListener",
    "removeEventListener",
    "dispatchEvent",
    "size"
  ];
  return new Proxy({}, {
    get(_target, prop) {
      switch (prop) {
        case "add":
          return (k, v) => {
            if (!signals.has(k)) {
              addProperty(k, v);
              notify(watchers);
              emit("store-add", {
                [k]: v
              });
              size.set(signals.size);
            }
          };
        case "get":
          return () => {
            subscribe(watchers);
            return current();
          };
        case "remove":
          return (k) => {
            if (signals.has(k)) {
              removeProperty(k);
              notify(watchers);
              emit("store-remove", { [k]: UNSET });
              size.set(signals.size);
            }
          };
        case "set":
          return (v) => {
            if (reconcile(current(), v)) {
              notify(watchers);
              if (UNSET === v)
                watchers.clear();
            }
          };
        case "update":
          return (fn) => {
            const oldValue = current();
            const newValue = fn(oldValue);
            if (reconcile(oldValue, newValue)) {
              notify(watchers);
              if (UNSET === newValue)
                watchers.clear();
            }
          };
        case "addEventListener":
          return eventTarget.addEventListener.bind(eventTarget);
        case "removeEventListener":
          return eventTarget.removeEventListener.bind(eventTarget);
        case "dispatchEvent":
          return eventTarget.dispatchEvent.bind(eventTarget);
        case "size":
          return size;
      }
      if (prop === Symbol.toStringTag)
        return TYPE_STORE;
      if (prop === Symbol.iterator) {
        return function* () {
          for (const [key, signal] of signals) {
            yield [key, signal];
          }
        };
      }
      return signals.get(String(prop));
    },
    has(_target, prop) {
      const key = String(prop);
      return signals.has(key) || storeProps.includes(key) || prop === Symbol.toStringTag || prop === Symbol.iterator;
    },
    ownKeys() {
      return Array.from(signals.keys()).map((key) => String(key));
    },
    getOwnPropertyDescriptor(_target, prop) {
      const signal = signals.get(String(prop));
      return signal ? {
        enumerable: true,
        configurable: true,
        writable: true,
        value: signal
      } : undefined;
    }
  });
};
var isStore = (value) => isObjectOfType(value, TYPE_STORE);

// node_modules/@zeix/cause-effect/src/signal.ts
var UNSET = Symbol();
var isSignal = (value) => isState(value) || isComputed(value) || isStore(value);
function toSignal(value) {
  if (isSignal(value))
    return value;
  if (isComputedCallback(value))
    return computed(value);
  if (Array.isArray(value))
    return store(value);
  if (Array.isArray(value) || isRecord(value))
    return store(value);
  return state(value);
}
function toMutableSignal(value) {
  if (isState(value) || isStore(value))
    return value;
  if (Array.isArray(value))
    return store(value);
  if (isRecord(value))
    return store(value);
  return state(value);
}

// node_modules/@zeix/cause-effect/src/diff.ts
var isEqual = (a, b, visited) => {
  if (Object.is(a, b))
    return true;
  if (typeof a !== typeof b)
    return false;
  if (typeof a !== "object" || a === null || b === null)
    return false;
  if (!visited)
    visited = new WeakSet;
  if (visited.has(a) || visited.has(b))
    throw new CircularDependencyError("isEqual");
  visited.add(a);
  visited.add(b);
  try {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length)
        return false;
      for (let i = 0;i < a.length; i++) {
        if (!isEqual(a[i], b[i], visited))
          return false;
      }
      return true;
    }
    if (Array.isArray(a) !== Array.isArray(b))
      return false;
    if (isRecord(a) && isRecord(b)) {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length)
        return false;
      for (const key of aKeys) {
        if (!(key in b))
          return false;
        if (!isEqual(a[key], b[key], visited))
          return false;
      }
      return true;
    }
    return false;
  } finally {
    visited.delete(a);
    visited.delete(b);
  }
};
var diff = (oldObj, newObj) => {
  const visited = new WeakSet;
  const diffRecords = (oldRecord, newRecord) => {
    const add = {};
    const change = {};
    const remove = {};
    const oldKeys = Object.keys(oldRecord);
    const newKeys = Object.keys(newRecord);
    const allKeys = new Set([...oldKeys, ...newKeys]);
    for (const key of allKeys) {
      const oldHas = key in oldRecord;
      const newHas = key in newRecord;
      if (!oldHas && newHas) {
        add[key] = newRecord[key];
        continue;
      } else if (oldHas && !newHas) {
        remove[key] = UNSET;
        continue;
      }
      const oldValue = oldRecord[key];
      const newValue = newRecord[key];
      if (!isEqual(oldValue, newValue, visited))
        change[key] = newValue;
    }
    const changed = Object.keys(add).length > 0 || Object.keys(change).length > 0 || Object.keys(remove).length > 0;
    return {
      changed,
      add,
      change,
      remove
    };
  };
  return diffRecords(oldObj, newObj);
};

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
    if (!isEqual(v, value)) {
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
    controller?.abort();
    if (watchers.size)
      notify(watchers);
    else
      mark.cleanup();
  });
  mark.off(() => {
    controller?.abort();
  });
  const compute = () => observe(() => {
    if (computing)
      throw new CircularDependencyError("computed");
    changed = false;
    if (isAsyncFunction(fn)) {
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
      if (isAbortError(e))
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
// node_modules/@zeix/cause-effect/src/match.ts
function match(result, handlers) {
  try {
    if (result.pending)
      handlers.nil?.();
    else if (result.errors)
      handlers.err?.(result.errors);
    else
      handlers.ok?.(result.values);
  } catch (error) {
    if (handlers.err && (!result.errors || !result.errors.includes(toError(error))))
      handlers.err(result.errors ? [...result.errors, toError(error)] : [toError(error)]);
    else
      throw error;
  }
}
// node_modules/@zeix/cause-effect/src/resolve.ts
function resolve(signals) {
  const errors = [];
  let pending2 = false;
  const values = {};
  for (const [key, signal] of Object.entries(signals)) {
    try {
      const value = signal.get();
      if (value === UNSET)
        pending2 = true;
      else
        values[key] = value;
    } catch (e) {
      errors.push(toError(e));
    }
  }
  if (pending2)
    return { ok: false, pending: true };
  if (errors.length > 0)
    return { ok: false, errors };
  return { ok: true, values };
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
var isString2 = (value) => typeof value === "string";
var hasMethod2 = (obj, methodName) => isString2(methodName) && (methodName in obj) && isFunction(obj[methodName]);
var isElement = (node) => node.nodeType === Node.ELEMENT_NODE;
var isCustomElement = (element) => element.localName.includes("-");
var elementName = (el) => el ? `<${el.localName}${idString(el.id)}${classString(el.classList)}>` : "<unknown>";
var valueString = (value) => isString2(value) ? `"${value}"` : isDefinedObject(value) ? JSON.stringify(value) : String(value);
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

// src/core/errors.ts
class CircularMutationError extends Error {
  constructor(host, selector) {
    super(`Circular dependency detected in selection signal for component ${elementName(host)} with selector "${selector}"`);
    this.name = "CircularMutationError";
  }
}

class InvalidComponentNameError extends Error {
  constructor(component) {
    super(`Invalid component name "${component}". Custom element names must contain a hyphen, start with a lowercase letter, and contain only lowercase letters, numbers, and hyphens.`);
    this.name = "InvalidComponentNameError";
  }
}

class InvalidPropertyNameError extends Error {
  constructor(component, prop, reason) {
    super(`Invalid property name "${prop}" for component <${component}>. ${reason}`);
    this.name = "InvalidPropertyNameError";
  }
}

class InvalidEffectsError extends Error {
  constructor(host, cause) {
    super(`Invalid effects in component ${elementName(host)}. Effects must be an array of effects, a single effect function, or a Promise that resolves to effects.`);
    this.name = "InvalidEffectsError";
    if (cause)
      this.cause = cause;
  }
}

class InvalidSignalError extends Error {
  constructor(host, prop) {
    super(`Expected signal as value for property "${String(prop)}" in component ${elementName(host)}.`);
    this.name = "InvalidSignalError";
  }
}

class MissingElementError extends Error {
  constructor(host, selector, required) {
    super(`Missing required element <${selector}> in component ${elementName(host)}. ${required}`);
    this.name = "MissingElementError";
  }
}

class DependencyTimeoutError extends Error {
  constructor(host, missing) {
    super(`Timeout waiting for: [${missing.join(", ")}] in component ${elementName(host)}.`);
    this.name = "DependencyTimeoutError";
  }
}

// src/core/reactive.ts
var RESET = Symbol("RESET");
var runEffects = (effects, host, target = host) => {
  try {
    if (effects instanceof Promise)
      throw effects;
    if (!Array.isArray(effects))
      return effects(host, target);
    const cleanups = effects.filter(isFunction).map((effect2) => effect2(host, target));
    return () => {
      cleanups.filter(isFunction).forEach((cleanup) => cleanup());
      cleanups.length = 0;
    };
  } catch (error) {
    if (error instanceof Promise) {
      error.then(() => runEffects(effects, host, target));
    } else {
      throw new InvalidEffectsError(host, error instanceof Error ? error : new Error(String(error)));
    }
  }
};
var resolveReactive = (reactive, host, target, context) => {
  try {
    return isString2(reactive) ? host.getSignal(reactive).get() : isSignal(reactive) ? reactive.get() : isFunction(reactive) ? reactive(target) : RESET;
  } catch (error) {
    if (context) {
      log(error, `Failed to resolve value of ${valueString(reactive)}${context ? ` for ${context}` : ""} in ${elementName(target)}${host !== target ? ` in ${elementName(host)}` : ""}`, LOG_ERROR);
    }
    return RESET;
  }
};

// src/core/dom.ts
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
var isParser = (value) => isFunction(value) && value.length >= 2;
var getFallback = (element, fallback) => isFunction(fallback) ? fallback(element) : fallback;
var fromDOM = (extractors, fallback) => (host) => {
  const root = host.shadowRoot ?? host;
  const fromFirst = (selector, extractor) => {
    const target = root.querySelector(selector);
    if (!target)
      return;
    const value2 = extractor(target);
    if (value2 != null)
      return value2;
  };
  let value = undefined;
  for (const [selector, extractor] of Object.entries(extractors)) {
    value = fromFirst(selector, extractor);
    if (value != null)
      break;
  }
  return isString2(value) && isParser(fallback) ? fallback(host, value) : value ?? getFallback(host, fallback);
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
var getHelpers = (host) => {
  const root = host.shadowRoot ?? host;
  const dependencies = new Set;
  function useElement(selector, required) {
    const target = root.querySelector(selector);
    if (required != null && !target)
      throw new MissingElementError(host, selector, required);
    if (target && isCustomElement(target) && target.matches(":not(:defined)"))
      dependencies.add(target.localName);
    return target;
  }
  function useElements(selector, required) {
    const targets = root.querySelectorAll(selector);
    if (required != null && !targets.length)
      throw new MissingElementError(host, selector, required);
    if (targets.length)
      targets.forEach((target) => {
        if (isCustomElement(target) && target.matches(":not(:defined)"))
          dependencies.add(target.localName);
      });
    return Array.from(targets);
  }
  const first = (selector, effects, required) => {
    const target = required != null ? useElement(selector, required) : useElement(selector);
    return () => {
      if (target)
        return runEffects(effects, host, target);
    };
  };
  const all = (selector, effects, required) => {
    const targets = required != null ? useElements(selector, required) : useElements(selector);
    return () => {
      const cleanups = new Map;
      const attach = (target) => {
        const cleanup = runEffects(effects, host, target);
        if (cleanup && !cleanups.has(target))
          cleanups.set(target, cleanup);
      };
      const detach = (target) => {
        const cleanup = cleanups.get(target);
        if (cleanup)
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
      if (targets.length)
        targets.forEach(attach);
      return () => {
        observer.disconnect();
        cleanups.forEach((cleanup) => cleanup());
        cleanups.clear();
      };
    };
  };
  return [
    { useElement, useElements, first, all },
    () => Array.from(dependencies)
  ];
};
function fromSelector(selector) {
  return (host) => {
    const watchers = new Set;
    const select = () => Array.from((host.shadowRoot ?? host).querySelectorAll(selector));
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
          throw new CircularMutationError(host, selector);
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
}

// src/component.ts
var DEPENDENCY_TIMEOUT = 50;
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
var validatePropertyName = (prop) => {
  if (RESERVED_WORDS.has(prop))
    return `Property name "${prop}" is a reserved word`;
  if (HTML_ELEMENT_PROPS.has(prop))
    return `Property name "${prop}" conflicts with inherited HTMLElement property`;
  return null;
};
function component(name, init = {}, setup) {
  if (!name.includes("-") || !name.match(/^[a-z][a-z0-9-]*$/))
    throw new InvalidComponentNameError(name);
  for (const prop of Object.keys(init)) {
    const error = validatePropertyName(prop);
    if (error)
      throw new InvalidPropertyNameError(name, prop, error);
  }

  class CustomElement extends HTMLElement {
    debug;
    #signals = {};
    #cleanup;
    static observedAttributes = Object.entries(init)?.filter(([, initializer]) => isParser(initializer)).map(([prop]) => prop) ?? [];
    connectedCallback() {
      if (DEV_MODE) {
        this.debug = this.hasAttribute("debug");
        if (this.debug)
          log(this, "Connected");
      }
      for (const [prop, initializer] of Object.entries(init)) {
        if (initializer == null || prop in this)
          continue;
        const result = isFunction(initializer) ? initializer(this, null) : initializer;
        if (result != null)
          this.setSignal(prop, toSignal(result));
      }
      const [helpers, getDependencies] = getHelpers(this);
      const effects = setup(this, helpers);
      const deps = getDependencies();
      const runSetup = () => {
        const cleanup = runEffects(effects, this);
        if (cleanup)
          this.#cleanup = cleanup;
      };
      if (deps.length) {
        Promise.race([
          Promise.all(deps.map((dep) => customElements.whenDefined(dep))),
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new DependencyTimeoutError(this, deps.filter((dep) => !customElements.get(dep))));
            }, DEPENDENCY_TIMEOUT);
          })
        ]).then(runSetup).catch((error) => {
          if (DEV_MODE)
            log(error, `Error during setup of <${name}>. Trying to run effects anyway.`, LOG_WARN);
          runSetup();
        });
      } else {
        runSetup();
      }
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
      const parser = init[attr];
      if (!isParser(parser))
        return;
      const parsed = parser(this, value, old);
      if (DEV_MODE && this.debug)
        log(value, `Attribute "${String(attr)}" of ${elementName(this)} changed from ${valueString(old)} to ${valueString(value)}, parsed as <${typeString(parsed)}> ${valueString(parsed)}`);
      if (attr in this)
        this[attr] = parsed;
      else
        this.setSignal(attr, toSignal(parsed));
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
        throw new InvalidPropertyNameError(this.localName, key, error);
      if (!isSignal(signal))
        throw new InvalidSignalError(this, key);
      const prev = this.#signals[key];
      const writable = isState(signal) || isStore(signal);
      this.#signals[key] = signal;
      Object.defineProperty(this, key, {
        get: signal.get,
        set: writable ? signal.set : undefined,
        enumerable: true,
        configurable: writable
      });
      if (prev && isState(prev) || isStore(prev))
        prev.set(UNSET);
      if (DEV_MODE && this.debug)
        log(signal, `Set ${typeString(signal)} "${String(key)} in ${elementName(this)}`);
    }
  }
  customElements.define(name, CustomElement);
}
// src/core/context.ts
var CONTEXT_REQUEST = "context-request";

class ContextRequestEvent extends Event {
  context;
  callback;
  subscribe;
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
  let consumed = toSignal(getFallback(host, fallback));
  host.dispatchEvent(new ContextRequestEvent(context, (value) => {
    consumed = value;
  }));
  return consumed;
};
// src/core/events.ts
var fromEvents = (selector, events, initialize) => (host) => {
  const watchers = new Set;
  let value = getFallback(host, initialize);
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
var on = (type, handler, options = false) => (host, target) => {
  const listener = (e) => {
    const result = handler({ host, target, event: e });
    if (!isDefinedObject(result))
      return;
    batch(() => {
      for (const [key, value] of Object.entries(result)) {
        try {
          host[key] = value;
        } catch (error) {
          log(error, `Reactive property "${key}" on ${elementName(host)} from event ${type} on ${elementName(target)} could not be set, because it is read-only.`, LOG_ERROR);
        }
      }
    });
  };
  target.addEventListener(type, listener, options);
  return () => target.removeEventListener(type, listener);
};
var emitEvent = (type, reactive) => (host, target) => effect(() => {
  const value = resolveReactive(reactive, host, target, `custom event "${type}" detail`);
  if (value === RESET || value === UNSET)
    return;
  target.dispatchEvent(new CustomEvent(type, {
    detail: value,
    bubbles: true
  }));
});
// src/lib/effects.ts
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
  const { op, name = "", read, update } = updater;
  const fallback = read(target);
  const operationDesc = getOperationDescription(op, name);
  const ok = (verb) => () => {
    if (DEV_MODE && host.debug) {
      log(target, `${verb} ${operationDesc} of ${elementName(target)} in ${elementName(host)}`);
    }
    updater.resolve?.(target);
  };
  const err = (verb) => (error) => {
    log(error, `Failed to ${verb} ${operationDesc} of ${elementName(target)} in ${elementName(host)}`, LOG_ERROR);
    updater.reject?.(error);
  };
  return effect(() => {
    const value = resolveReactive(reactive, host, target, operationDesc);
    const resolvedValue = value === RESET ? fallback : value === UNSET ? updater.delete ? null : fallback : value;
    if (updater.delete && resolvedValue === null) {
      try {
        updater.delete(target);
        ok("delete")();
      } catch (error) {
        err("delete")(error);
      }
    } else if (resolvedValue != null) {
      const current = read(target);
      if (Object.is(resolvedValue, current))
        return;
      try {
        update(target, resolvedValue);
        ok("update")();
      } catch (error) {
        err("update")(error);
      }
    }
  });
};
var insertOrRemoveElement = (reactive, inserter) => (host, target) => {
  const ok = (verb) => () => {
    if (DEV_MODE && host.debug) {
      log(target, `${verb} element in ${elementName(target)} in ${elementName(host)}`);
    }
    if (isFunction(inserter?.resolve)) {
      inserter.resolve(target);
    } else {
      const signal = isSignal(reactive) ? reactive : isString2(reactive) ? host.getSignal(reactive) : undefined;
      if (isState(signal))
        signal.set(0);
    }
  };
  const err = (verb) => (error) => {
    log(error, `Failed to ${verb} element in ${elementName(target)} in ${elementName(host)}`, LOG_ERROR);
    inserter?.reject?.(error);
  };
  return effect(() => {
    const diff2 = resolveReactive(reactive, host, target, "insertion or deletion");
    const resolvedDiff = diff2 === RESET ? 0 : diff2;
    if (resolvedDiff > 0) {
      if (!inserter)
        throw new TypeError(`No inserter provided`);
      try {
        for (let i = 0;i < resolvedDiff; i++) {
          const element = inserter.create(target);
          if (!element)
            continue;
          target.insertAdjacentElement(inserter.position ?? "beforeend", element);
        }
        ok("insert")();
      } catch (error) {
        err("insert")(error);
      }
    } else if (resolvedDiff < 0) {
      try {
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
        ok("remove")();
      } catch (error) {
        err("remove")(error);
      }
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
  name: key,
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
    if (value && hasMethod2(el, methodName)) {
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
    if (value && hasMethod2(el, "focus"))
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
var pass = (reactives) => (host, target) => {
  if (!isDefinedObject(reactives))
    throw new TypeError(`Reactives must be an object of passed signals`);
  if (!isCustomElement(target))
    throw new TypeError(`Target ${elementName(target)} is not a custom element`);
  if (!hasMethod2(target, "setSignal"))
    throw new TypeError(`Target ${elementName(target)} is not a Le Truc component`);
  for (const [prop, reactive] of Object.entries(reactives)) {
    target.setSignal(prop, isString2(reactive) ? host.getSignal(reactive) : toSignal(reactive));
  }
};
// src/lib/extractors.ts
var getText = () => (element) => element.textContent?.trim();
var getIdrefText = (attr) => (element) => {
  const id = element.getAttribute(attr);
  return id ? document.getElementById(id)?.textContent?.trim() : undefined;
};
var getProperty = (prop) => (element) => element[prop];
var hasAttribute = (attr) => (element) => element.hasAttribute(attr);
var getAttribute = (attr) => (element) => element.getAttribute(attr);
var hasClass = (token) => (element) => element.classList.contains(token);
var getStyle = (prop) => (element) => window.getComputedStyle(element).getPropertyValue(prop);
var getLabel = (selector) => fromDOM({ ".label": getText(), [selector]: getAttribute("aria-label") }, "");
var getDescription = (selector) => fromDOM({
  ".description": getText(),
  [selector]: getIdrefText("aria-describedby")
}, "");
// src/lib/parsers.ts
var parseNumber = (parseFn, value) => {
  if (value == null)
    return;
  const parsed = parseFn(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
var asBoolean = () => (_, value) => value != null && value !== "false";
var asInteger = (fallback = 0) => (element, value) => {
  if (value == null)
    return getFallback(element, fallback);
  const trimmed = value.trim();
  if (trimmed.toLowerCase().startsWith("0x"))
    return parseNumber((v) => parseInt(v, 16), trimmed) ?? getFallback(element, fallback);
  const parsed = parseNumber(parseFloat, value);
  return parsed != null ? Math.trunc(parsed) : getFallback(element, fallback);
};
var asNumber = (fallback = 0) => (element, value) => parseNumber(parseFloat, value) ?? getFallback(element, fallback);
var asString = (fallback = "") => (element, value) => value ?? getFallback(element, fallback);
var asEnum = (valid) => (_, value) => {
  if (value == null)
    return valid[0];
  const lowerValue = value.toLowerCase();
  const matchingValid = valid.find((v) => v.toLowerCase() === lowerValue);
  return matchingValid ? value : valid[0];
};
var asJSON = (fallback) => (element, value) => {
  if ((value ?? fallback) == null)
    throw new TypeError("asJSON: Value and fallback are both null or undefined");
  if (value == null)
    return getFallback(element, fallback);
  if (value === "")
    throw new TypeError("Empty string is not valid JSON");
  let result;
  try {
    result = JSON.parse(value);
  } catch (error) {
    throw new SyntaxError(`Failed to parse JSON: ${String(error)}`, {
      cause: error
    });
  }
  return result ?? getFallback(element, fallback);
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
  resolveReactive,
  resolve,
  provideContexts,
  pass,
  on,
  match,
  log,
  isState,
  isSignal,
  isParser,
  isComputed,
  insertOrRemoveElement,
  hasClass,
  hasAttribute,
  getText,
  getStyle,
  getProperty,
  getLabel,
  getFallback,
  getDescription,
  getAttribute,
  fromSelector,
  fromEvents,
  fromDOM,
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
  MissingElementError,
  LOG_WARN,
  LOG_INFO,
  LOG_ERROR,
  LOG_DEBUG,
  InvalidSignalError,
  InvalidPropertyNameError,
  InvalidEffectsError,
  InvalidComponentNameError,
  DependencyTimeoutError,
  DEV_MODE,
  CircularMutationError
};

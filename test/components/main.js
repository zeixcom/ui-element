// index.js
var H = (B) => typeof B === "function";
var g = (B, K) => Object.prototype.toString.call(B) === `[object ${K}]`;
var f = (B) => B instanceof Error ? B : Error(String(B));

class S extends Error {
  constructor(B) {
    super(`Circular dependency in ${B} detected`);
    return this;
  }
}
var _;
var v = new Set;
var s = 0;
var l = new Map;
var c;
var WB = () => {
  c = undefined;
  let B = Array.from(l.values());
  l.clear();
  for (let K of B)
    K();
};
var HB = () => {
  if (c)
    cancelAnimationFrame(c);
  c = requestAnimationFrame(WB);
};
queueMicrotask(WB);
var m = (B) => {
  let K = new Set, $ = B;
  return $.off = (W) => {
    K.add(W);
  }, $.cleanup = () => {
    for (let W of K)
      W();
    K.clear();
  }, $;
};
var D = (B) => {
  if (_ && !B.has(_)) {
    let K = _;
    B.add(K), _.off(() => {
      B.delete(K);
    });
  }
};
var M = (B) => {
  for (let K of B)
    if (s)
      v.add(K);
    else
      K();
};
var u = () => {
  while (v.size) {
    let B = Array.from(v);
    v.clear();
    for (let K of B)
      K();
  }
};
var ZB = (B) => {
  s++;
  try {
    B();
  } finally {
    u(), s--;
  }
};
var d = (B, K) => {
  let $ = _;
  _ = K;
  try {
    B();
  } finally {
    _ = $;
  }
};
var N = (B, K) => new Promise(($, W) => {
  l.set(K || Symbol(), () => {
    try {
      $(B());
    } catch (Z) {
      W(Z);
    }
  }), HB();
});
var r = "State";
var o = (B) => {
  let K = new Set, $ = B, W = { [Symbol.toStringTag]: r, get: () => {
    return D(K), $;
  }, set: (Z) => {
    if (Object.is($, Z))
      return;
    if ($ = Z, M(K), j === $)
      K.clear();
  }, update: (Z) => {
    W.set(Z($));
  } };
  return W;
};
var C = (B) => g(B, r);
var h = "Computed";
var i = (B) => {
  let K = new Set, $ = j, W, Z, J = true, z = false, G = false, I = (V) => {
    if (!Object.is(V, $))
      $ = V, z = true;
    W = undefined, J = false;
  }, X = () => {
    z = j !== $, $ = j, W = undefined;
  }, Y = (V) => {
    let q = f(V);
    z = !W || q.name !== W.name || q.message !== W.message, $ = j, W = q;
  }, x = (V) => (q) => {
    if (G = false, Z = undefined, V(q), z)
      M(K);
  }, A = m(() => {
    if (J = true, Z?.abort("Aborted because source signal changed"), K.size)
      M(K);
    else
      A.cleanup();
  }), R = () => d(() => {
    if (G)
      throw new S("computed");
    if (z = false, H(B) && B.constructor.name === "AsyncFunction") {
      if (Z)
        return $;
      Z = new AbortController, Z.signal.addEventListener("abort", () => {
        G = false, Z = undefined, R();
      }, { once: true });
    }
    let V;
    G = true;
    try {
      V = Z ? B(Z.signal) : B();
    } catch (q) {
      if (q instanceof DOMException && q.name === "AbortError")
        X();
      else
        Y(q);
      G = false;
      return;
    }
    if (V instanceof Promise)
      V.then(x(I), x(Y));
    else if (V == null || j === V)
      X();
    else
      I(V);
    G = false;
  }, A);
  return { [Symbol.toStringTag]: h, get: () => {
    if (D(K), u(), J)
      R();
    if (W)
      throw W;
    return $;
  } };
};
var k = (B) => g(B, h);
var a = (B) => H(B) && B.length < 2;
var j = Symbol();
var P = (B) => C(B) || k(B);
var E = (B) => P(B) ? B : a(B) ? i(B) : o(B);
function p(B) {
  let { signals: K, ok: $, err: W = console.error, nil: Z = () => {
  } } = H(B) ? { signals: [], ok: B } : B, J = false, z = m(() => d(() => {
    if (J)
      throw new S("effect");
    J = true;
    let G = [], I = false, X = K.map((x) => {
      try {
        let A = x.get();
        if (A === j)
          I = true;
        return A;
      } catch (A) {
        return G.push(f(A)), j;
      }
    }), Y = undefined;
    try {
      Y = I ? Z() : G.length ? W(...G) : $(...X);
    } catch (x) {
      Y = W(f(x));
    } finally {
      if (H(Y))
        z.off(Y);
    }
    J = false;
  }, z));
  return z(), () => z.cleanup();
}
var U = false;
var b = "error";
var FB = (B) => B ? `#${B}` : "";
var AB = (B) => B.length ? `.${Array.from(B).join(".")}` : "";
var t = (B) => !!B && typeof B === "object";
var O = (B) => typeof B === "string";
var JB = (B) => B.nodeType === Node.ELEMENT_NODE;
var Q = (B) => `<${B.localName}${FB(B.id)}${AB(B.classList)}>`;
var w = (B) => O(B) ? `"${B}"` : t(B) ? JSON.stringify(B) : String(B);
var n = (B) => {
  if (B === null)
    return "null";
  if (typeof B !== "object")
    return typeof B;
  if (Array.isArray(B))
    return "Array";
  if (Symbol.toStringTag in Object(B))
    return B[Symbol.toStringTag];
  return B.constructor?.name || "Object";
};
var F = (B, K, $ = "debug") => {
  if (["error", "warn"].includes($))
    console[$](K, B);
  return B;
};

class zB extends Error {
  constructor(B) {
    super(B);
    this.name = "CircularMutationError";
  }
}
var LB = (B) => B instanceof HTMLElement && B.localName.includes("-");
var xB = (B) => {
  let K = new Set;
  if (B.includes("."))
    K.add("class");
  if (B.includes("#"))
    K.add("id");
  if (B.includes("[")) {
    let $ = B.split("[");
    for (let W = 1;W < $.length; W++) {
      let Z = $[W];
      if (!Z.includes("]"))
        continue;
      let J = Z.split("=")[0].trim().replace(/[^a-zA-Z0-9_-]/g, "");
      if (J)
        K.add(J);
    }
  }
  return [...K];
};
var qB = (B, K) => {
  if (B.length !== K.length)
    return false;
  let $ = new Set(B);
  for (let W of K)
    if (!$.has(W))
      return false;
  return true;
};
var e = (B, K, $) => {
  let W = new MutationObserver($), Z = xB(K), J = { childList: true, subtree: true };
  if (Z.length)
    J.attributes = true, J.attributeFilter = Z;
  return W.observe(B, J), W;
};
var CB = (B, K) => {
  let $ = new Set, W = () => Array.from(B.querySelectorAll(K)), Z = j, J, z = 0, G = 2, I = () => {
    Z = W(), J = e(B, K, () => {
      if (!$.size) {
        J?.disconnect(), J = undefined;
        return;
      }
      if (z++, z > G)
        throw J?.disconnect(), J = undefined, z = 0, new zB("Circular mutation in element selection detected");
      try {
        let Y = W();
        if (!qB(Z, Y))
          Z = Y, M($);
      } finally {
        z--;
      }
    });
  };
  return { [Symbol.toStringTag]: h, get: () => {
    if (D($), !$.size)
      Z = W();
    else if (!J)
      I();
    return Z;
  } };
};
var UB = (B, K) => ($, W = $) => {
  if (!H(K))
    throw new TypeError(`Invalid event listener provided for "${B} event on element ${Q(W)}`);
  return W.addEventListener(B, K), () => W.removeEventListener(B, K);
};
var MB = (B, K) => ($, W = $) => {
  W.dispatchEvent(new CustomEvent(B, { detail: H(K) ? K(W) : K, bubbles: true }));
};
var PB = (B) => (K, $) => {
  let W = $.localName;
  if (!LB($))
    throw new TypeError("Target element must be a custom element");
  let Z = H(B) ? B($) : B;
  if (!t(Z))
    throw new TypeError("Passed signals must be an object or a provider function");
  customElements.whenDefined(W).then(() => {
    for (let [J, z] of Object.entries(Z)) {
      let G = O(z) ? K.getSignal(J) : E(z);
      $.setSignal(J, G);
    }
  }).catch((J) => {
    throw new Error(`Failed to pass signals to ${Q($)}}`, { cause: J });
  });
};
var T = Symbol();
var OB = new Set(["constructor", "prototype"]);
var yB = new Set(["id", "class", "className", "title", "role", "style", "dataset", "lang", "dir", "hidden", "children", "innerHTML", "outerHTML", "textContent", "innerText"]);
var BB = (B) => H(B) && B.length >= 2;
var GB = (B) => {
  if (OB.has(B))
    return `Property name "${B}" is a reserved word`;
  if (yB.has(B))
    return `Property name "${B}" conflicts with inherited HTMLElement property`;
  return null;
};
var $B = (B, K, $ = K) => {
  let W = B.filter(H).map((Z) => Z(K, $));
  return () => {
    W.filter(H).forEach((Z) => Z()), W.length = 0;
  };
};
var RB = () => ({ first: (B, ...K) => ($) => {
  let W = ($.shadowRoot || $).querySelector(B);
  if (W)
    $B(K, $, W);
}, all: (B, ...K) => ($) => {
  let W = new Map, Z = $.shadowRoot || $, J = (X) => {
    if (!W.has(X))
      W.set(X, $B(K, $, X));
  }, z = (X) => {
    let Y = W.get(X);
    if (H(Y))
      Y();
    W.delete(X);
  }, G = (X) => (Y) => {
    if (JB(Y)) {
      if (Y.matches(B))
        X(Y);
      Y.querySelectorAll(B).forEach(X);
    }
  }, I = e(Z, B, (X) => {
    for (let Y of X)
      Y.addedNodes.forEach(G(J)), Y.removedNodes.forEach(G(z));
  });
  return Z.querySelectorAll(B).forEach(J), () => {
    I.disconnect(), W.forEach((X) => X()), W.clear();
  };
} });
var _B = (B, K = {}, $) => {
  for (let Z of Object.keys(K)) {
    let J = GB(Z);
    if (J)
      throw new TypeError(`${J} in component "${B}".`);
  }

  class W extends HTMLElement {
    debug;
    #B = {};
    #$;
    static observedAttributes = Object.entries(K)?.filter(([, Z]) => BB(Z)).map(([Z]) => Z) ?? [];
    constructor() {
      super();
      for (let [Z, J] of Object.entries(K)) {
        if (J == null)
          continue;
        let z = BB(J) ? J(this, null) : H(J) ? J(this) : J;
        if (z != null)
          this.setSignal(Z, E(z));
      }
    }
    connectedCallback() {
      if (U) {
        if (this.debug = this.hasAttribute("debug"), this.debug)
          F(this, "Connected");
      }
      let Z = $(this, RB());
      if (!Array.isArray(Z))
        throw new TypeError(`Expected array of functions as return value of setup function in ${Q(this)}`);
      this.#$ = $B(Z, this);
    }
    disconnectedCallback() {
      if (H(this.#$))
        this.#$();
      if (U && this.debug)
        F(this, "Disconnected");
    }
    attributeChangedCallback(Z, J, z) {
      if (z === J || k(this.#B[Z]))
        return;
      let G = K[Z];
      if (!BB(G))
        return;
      let I = G(this, z, J);
      if (U && this.debug)
        F(z, `Attribute "${Z}" of ${Q(this)} changed from ${w(J)} to ${w(z)}, parsed as <${n(I)}> ${w(I)}`);
      this[Z] = I;
    }
    getSignal(Z) {
      let J = this.#B[Z];
      if (U && this.debug)
        F(J, `Get ${n(J)} "${String(Z)}" in ${Q(this)}`);
      return J;
    }
    setSignal(Z, J) {
      let z = GB(String(Z));
      if (z)
        throw new TypeError(`${z} on ${Q(this)}.`);
      if (!P(J))
        throw new TypeError(`Expected signal as value for property "${String(Z)}" on ${Q(this)}.`);
      let G = this.#B[Z], I = C(J);
      if (this.#B[Z] = J, Object.defineProperty(this, Z, { get: J.get, set: I ? J.set : undefined, enumerable: true, configurable: I }), G && C(G))
        G.set(j);
      if (U && this.debug)
        F(J, `Set ${n(J)} "${String(Z)} in ${Q(this)}`);
    }
  }
  return customElements.define(B, W), W;
};
var KB = "context-request";
var DB = (B) => (K) => {
  let $ = (W) => {
    let { context: Z, callback: J } = W;
    if (B.includes(Z) && H(J))
      W.stopPropagation(), J(K.getSignal(String(Z)));
  };
  return K.addEventListener(KB, $), () => K.removeEventListener(KB, $);
};
var XB = (B, K) => {
  if (K == null)
    return;
  let $ = B(K);
  return Number.isFinite($) ? $ : undefined;
};
var wB = (B, K) => K !== "false" && K != null;
var TB = (B = 0) => (K, $) => {
  if ($ == null)
    return B;
  let W = $.trim();
  if (W === "")
    return B;
  if (W.toLowerCase().startsWith("0x")) {
    let J = parseInt(W, 16);
    return Number.isFinite(J) ? J : B;
  }
  let Z = XB(parseFloat, $);
  return Z != null ? Math.trunc(Z) : B;
};
var kB = (B = "") => (K, $) => $ ?? B;
var YB = (B, K, $) => O(B) ? K.getSignal(B).get() : P(B) ? B.get() : H(B) ? B($) : T;
var fB = (B) => {
  if (/^(mailto|tel):/i.test(B))
    return true;
  if (B.includes("://"))
    try {
      let K = new URL(B, window.location.origin);
      return ["http:", "https:", "ftp:"].includes(K.protocol);
    } catch (K) {
      return false;
    }
  return true;
};
var mB = (B, K, $) => {
  if (/^on/i.test(K))
    throw new Error(`Unsafe attribute: ${K}`);
  if ($ = String($).trim(), !fB($))
    throw new Error(`Unsafe URL for ${K}: ${$}`);
  B.setAttribute(K, $);
};
var y = (B, K) => ($, W) => {
  let { op: Z, name: J = "", read: z, update: G } = K, I = z(W), X = { a: "attribute ", c: "class ", h: "inner HTML", p: "property ", s: "style property ", t: "text content" };
  if (O(B) && O(I) && $[B] === T)
    $.attributeChangedCallback(B, null, I);
  let Y = (A) => () => {
    if (U && $.debug)
      F(W, `${A} ${X[Z] + J} of ${Q(W)} in ${Q($)}`);
    K.resolve?.(W);
  }, x = (A) => (R) => {
    F(R, `Failed to ${A} ${X[Z] + J} of ${Q(W)} in ${Q($)}`, b), K.reject?.(R);
  };
  return p(() => {
    let A = Symbol(`${Z}:${J}`), R = Symbol(`${Z}-${J}`), L = T;
    try {
      L = YB(B, $, W);
    } catch (V) {
      F(V, `Failed to resolve value of ${w(B)} for ${X[Z] + J} of ${Q(W)} in ${Q($)}`, b);
      return;
    }
    if (L === T)
      L = I;
    else if (L === j)
      L = K.delete ? null : I;
    if (K.delete && L === null)
      N(() => {
        return K.delete(W), true;
      }, R).then(Y("Deleted")).catch(x("delete"));
    else if (L != null) {
      let V = z(W);
      if (Object.is(L, V))
        return;
      N(() => {
        return G(W, L), true;
      }, A).then(Y("Updated")).catch(x("update"));
    }
  });
};
var dB = (B, K) => ($, W) => {
  let Z = (z) => () => {
    if (U && $.debug)
      F(W, `${z} element in ${Q(W)} in ${Q($)}`);
    if (H(K?.resolve))
      K.resolve(W);
    else {
      let G = P(B) ? B : O(B) ? $.getSignal(B) : undefined;
      if (C(G))
        G.set(0);
    }
  }, J = (z) => (G) => {
    F(G, `Failed to ${z} element in ${Q(W)} in ${Q($)}`, b), K?.reject?.(G);
  };
  return p(() => {
    let z = Symbol("i"), G = Symbol("d"), I = 0;
    try {
      I = YB(B, $, W);
    } catch (X) {
      F(X, `Failed to resolve value of ${w(B)} for insertion or deletion in ${Q(W)} in ${Q($)}`, b);
      return;
    }
    if (I === T)
      I = 0;
    if (I > 0) {
      if (!K)
        throw new TypeError("No inserter provided");
      N(() => {
        for (let X = 0;X < I; X++) {
          let Y = K.create(W);
          if (!Y)
            continue;
          W.insertAdjacentElement(K.position ?? "beforeend", Y);
        }
        return true;
      }, z).then(Z("Inserted")).catch(J("insert"));
    } else if (I < 0)
      N(() => {
        if (K && (K.position === "afterbegin" || K.position === "beforeend"))
          for (let X = 0;X > I; X--)
            if (K.position === "afterbegin")
              W.firstElementChild?.remove();
            else
              W.lastElementChild?.remove();
        else
          W.remove();
        return true;
      }, G).then(Z("Removed")).catch(J("remove"));
  });
};
var hB = (B) => y(B, { op: "t", read: (K) => K.textContent, update: (K, $) => {
  Array.from(K.childNodes).filter((W) => W.nodeType !== Node.COMMENT_NODE).forEach((W) => W.remove()), K.append(document.createTextNode($));
} });
var pB = (B, K = B) => y(K, { op: "p", name: String(B), read: ($) => (B in $) ? $[B] : j, update: ($, W) => {
  $[B] = W;
} });
var gB = (B, K = B) => y(K, { op: "a", name: B, read: ($) => $.getAttribute(B), update: ($, W) => {
  mB($, B, W);
}, delete: ($) => {
  $.removeAttribute(B);
} });
var vB = (B, K = B) => y(K, { op: "a", name: B, read: ($) => $.hasAttribute(B), update: ($, W) => {
  $.toggleAttribute(B, W);
} });
var cB = (B, K = B) => y(K, { op: "c", name: B, read: ($) => $.classList.contains(B), update: ($, W) => {
  $.classList.toggle(B, W);
} });
var oB = (B, K = {}) => y(B, { op: "h", read: ($) => ($.shadowRoot || !K.shadowRootMode ? $ : null)?.innerHTML ?? "", update: ($, W) => {
  let { shadowRootMode: Z, allowScripts: J } = K;
  if (!W) {
    if ($.shadowRoot)
      $.shadowRoot.innerHTML = "<slot></slot>";
    return "";
  }
  if (Z && !$.shadowRoot)
    $.attachShadow({ mode: Z });
  let z = $.shadowRoot || $;
  if (z.innerHTML = W, !J)
    return "";
  return z.querySelectorAll("script").forEach((G) => {
    let I = document.createElement("script");
    I.appendChild(document.createTextNode(G.textContent ?? "")), z.appendChild(I), G.remove();
  }), " with scripts";
} });

// docs-src/functions/shared/fetch-with-cache.ts
var cache = new Map;
var parseCacheControl = (header) => {
  const directives = header.toLowerCase().split(",").map((d2) => d2.trim());
  const result = {
    noCache: false,
    noStore: false,
    maxAge: undefined
  };
  for (const directive of directives) {
    if (directive === "no-cache")
      result.noCache = true;
    else if (directive === "no-store")
      result.noStore = true;
    else if (directive.startsWith("max-age=")) {
      const value = parseInt(directive.substring(8), 10);
      if (!isNaN(value))
        result.maxAge = value;
    }
  }
  return result;
};
var isCacheEntryValid = (entry) => {
  if (entry.maxAge !== undefined) {
    const age = (Date.now() - entry.timestamp) / 1000;
    return age < entry.maxAge;
  }
  return true;
};
var fetchWithCache = async (url, signal) => {
  const cached = cache.get(url);
  const headers = {};
  if (cached?.etag)
    headers["If-None-Match"] = cached.etag;
  if (cached?.lastModified)
    headers["If-Modified-Since"] = cached.lastModified;
  const response = await fetch(url, { signal, headers });
  if (response.status === 304 && cached) {
    return { content: cached.content, fromCache: true };
  }
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const content = await response.text();
  const cacheControl = response.headers.get("cache-control");
  const etag = response.headers.get("etag");
  const lastModified = response.headers.get("last-modified");
  const cacheDirectives = cacheControl ? parseCacheControl(cacheControl) : { noCache: false, noStore: false };
  if (!cacheDirectives.noStore) {
    const entry = {
      content,
      timestamp: Date.now(),
      etag: etag || undefined,
      lastModified: lastModified || undefined,
      maxAge: cacheDirectives.maxAge
    };
    if (!cacheDirectives.noCache || isCacheEntryValid(entry)) {
      cache.set(url, entry);
    }
  }
  return { content, fromCache: false };
};

// docs-src/components/client-router/client-router.ts
var client_router_default = _B("client-router", {}, (el, { all, first }) => {
  const outlet = el.getAttribute("outlet") ?? "main";
  const pathname = o(window.location.pathname);
  const error = o("");
  const hasError = () => !error.get();
  const content = i(async (abort) => {
    const currentPath = pathname.get();
    const url = String(new URL(currentPath, window.location.origin));
    if (abort?.aborted) {
      return content.get();
    }
    try {
      error.set("");
      const { content: html } = await fetchWithCache(url, abort);
      const doc = new DOMParser().parseFromString(html, "text/html");
      const newTitle = doc.querySelector("title")?.textContent;
      if (newTitle)
        document.title = newTitle;
      if (currentPath !== window.location.pathname) {
        window.history.pushState({}, "", url);
      }
      return doc.querySelector(outlet)?.innerHTML ?? "";
    } catch (err) {
      const errorMessage = `Navigation failed: ${err instanceof Error ? err.message : String(err)}`;
      error.set(errorMessage);
      return content.get();
    }
  });
  return [
    all("a[href]", cB("active", (target) => {
      const href = target.getAttribute("href");
      if (!href)
        return false;
      try {
        return pathname.get() === new URL(href, window.location.href).pathname;
      } catch {
        return false;
      }
    }), UB("click", (e2) => {
      if (!(e2.target instanceof HTMLAnchorElement))
        return;
      const url = new URL(e2.target.href);
      if (url.origin === window.location.origin) {
        e2.preventDefault();
        pathname.set(url.pathname);
      }
    })),
    first(outlet, oB(content, { allowScripts: true })),
    first("callout-box", pB("hidden", hasError), cB("danger", hasError)),
    first(".error", hB(error)),
    () => {
      const handlePopState = () => {
        pathname.set(window.location.pathname);
      };
      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  ];
});

// docs-src/components/media-context/media-context.ts
var MEDIA_MOTION = "media-motion";
var MEDIA_THEME = "media-theme";
var MEDIA_VIEWPORT = "media-viewport";
var MEDIA_ORIENTATION = "media-orientation";
var media_context_default = _B("media-context", {
  [MEDIA_MOTION]: () => {
    const mql = matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = o(mql.matches);
    mql.addEventListener("change", (e2) => {
      reducedMotion.set(e2.matches);
    });
    return reducedMotion;
  },
  [MEDIA_THEME]: () => {
    const mql = matchMedia("(prefers-color-scheme: dark)");
    const colorScheme = o(mql.matches ? "dark" : "light");
    mql.addEventListener("change", (e2) => {
      colorScheme.set(e2.matches ? "dark" : "light");
    });
    return colorScheme;
  },
  [MEDIA_VIEWPORT]: (el) => {
    const getBreakpoint = (attr, fallback) => {
      const value = el.getAttribute(attr);
      const trimmed = value?.trim();
      if (!trimmed)
        return fallback;
      const unit = trimmed.match(/em$/) ? "em" : "px";
      const v2 = parseFloat(trimmed);
      return Number.isFinite(v2) ? v2 + unit : fallback;
    };
    const mqlSM = matchMedia(`(min-width: ${getBreakpoint("sm", "32em")})`);
    const mqlMD = matchMedia(`(min-width: ${getBreakpoint("md", "48em")})`);
    const mqlLG = matchMedia(`(min-width: ${getBreakpoint("lg", "72em")})`);
    const mqlXL = matchMedia(`(min-width: ${getBreakpoint("xl", "104em")})`);
    const getViewport = () => {
      if (mqlXL.matches)
        return "xl";
      if (mqlLG.matches)
        return "lg";
      if (mqlMD.matches)
        return "md";
      if (mqlSM.matches)
        return "sm";
      return "xs";
    };
    const viewport = o(getViewport());
    mqlSM.addEventListener("change", () => {
      viewport.set(getViewport());
    });
    mqlMD.addEventListener("change", () => {
      viewport.set(getViewport());
    });
    mqlLG.addEventListener("change", () => {
      viewport.set(getViewport());
    });
    mqlXL.addEventListener("change", () => {
      viewport.set(getViewport());
    });
    return viewport;
  },
  [MEDIA_ORIENTATION]: () => {
    const mql = matchMedia("(orientation: landscape)");
    const orientation = o(mql.matches ? "landscape" : "portrait");
    mql.addEventListener("change", (e2) => {
      orientation.set(e2.matches ? "landscape" : "portrait");
    });
    return orientation;
  }
}, () => [
  DB([MEDIA_MOTION, MEDIA_THEME, MEDIA_VIEWPORT, MEDIA_ORIENTATION])
]);

// docs-src/components/hello-world/hello-world.ts
var hello_world_default = _B("hello-world", {
  name: T
}, (el, { first }) => [
  first("span", hB("name")),
  first("input", UB("input", (e2) => {
    el.name = e2.target?.value || T;
  }))
]);

// docs-src/components/my-counter/my-counter.ts
var my_counter_default = _B("my-counter", {
  count: TB()
}, (el, { first }) => [
  first(".count", hB("count")),
  first(".parity", hB(() => el.count % 2 ? "odd" : "even")),
  first(".increment", UB("click", () => {
    el.count++;
  })),
  first(".decrement", UB("click", () => {
    el.count--;
  }))
]);

// docs-src/components/my-carousel/my-carousel.ts
var my_carousel_default = _B("my-carousel", {}, (el, { all, first }) => {
  const currentIndex = o(0);
  const slides = Array.from(el.querySelectorAll('[role="tabpanel"]'));
  const total = slides.length;
  const updateIndex = (direction) => {
    currentIndex.update((v2) => (v2 + direction + total) % total);
  };
  return [
    first("nav", UB("keyup", (e2) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e2.key)) {
        e2.preventDefault();
        e2.stopPropagation();
        if (e2.key === "Home")
          currentIndex.set(0);
        else if (e2.key === "End")
          currentIndex.set(total - 1);
        else
          updateIndex(e2.key === "ArrowLeft" ? -1 : 1);
        el.querySelectorAll('[role="tab"]')[currentIndex.get()].focus();
      }
    }), first(".prev", UB("click", () => {
      updateIndex(-1);
    })), first(".next", UB("click", () => {
      updateIndex(1);
    })), all('[role="tab"]', pB("ariaSelected", (target) => String(target.dataset["index"] === String(currentIndex.get()))), pB("tabIndex", (target) => target.dataset["index"] === String(currentIndex.get()) ? 0 : -1), UB("click", (e2) => {
      const rawIndex = e2.target?.dataset["index"];
      const nextIndex = rawIndex ? parseInt(rawIndex) : 0;
      currentIndex.set(Number.isInteger(nextIndex) ? nextIndex : 0);
    }))),
    all('[role="tabpanel"]', pB("ariaCurrent", (target) => String(target.id === slides[currentIndex.get()].id)))
  ];
});

// docs-src/components/input-button/input-button.ts
var input_button_default = _B("input-button", {
  disabled: wB,
  label: kB(T),
  badge: kB(T)
}, (_2, { first }) => [
  first("button", pB("disabled")),
  first(".label", hB("label")),
  first(".badge", hB("badge"))
]);

// docs-src/components/input-checkbox/input-checkbox.ts
var input_checkbox_default = _B("input-checkbox", {
  checked: wB,
  label: kB(T)
}, (el, { first }) => [
  vB("checked"),
  first("input", pB("checked"), UB("change", (e2) => {
    el.checked = e2.target?.checked;
  })),
  first(".label", hB("label"))
]);

// docs-src/functions/event-listener/manage-focus-on-keydown.ts
var HANDLED_KEYS = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End"
];
var clamp = (value, min, max) => Math.min(Math.max(value, min), max);
var manageFocusOnKeydown = (elements, index) => UB("keydown", (e2) => {
  if (HANDLED_KEYS.includes(e2.key)) {
    e2.preventDefault();
    e2.stopPropagation();
    if (e2.key === "Home")
      index.set(0);
    else if (e2.key === "End")
      index.set(elements.length - 1);
    else
      index.update((v2) => clamp(v2 + (e2.key === "ArrowRight" || e2.key === "ArrowDown" ? 1 : -1), 0, elements.length - 1));
    if (elements[index.get()])
      elements[index.get()].focus();
  }
});

// docs-src/components/input-radiogroup/input-radiogroup.ts
var input_radiogroup_default = _B("input-radiogroup", {
  value: kB()
}, (el, { all }) => {
  const inputs = Array.from(el.querySelectorAll("input"));
  const focusIndex = o(inputs.findIndex((input) => input.checked));
  return [
    gB("value"),
    manageFocusOnKeydown(inputs, focusIndex),
    all("input", UB("change", (e2) => {
      const input = e2.target;
      el.value = input.value;
      focusIndex.set(inputs.findIndex((input2) => input2.checked));
    }), UB("keyup", (e2) => {
      if (e2.key === "Enter" && e2.target)
        e2.target.click();
    }), pB("tabIndex", (target) => target.value === el.value ? 0 : -1)),
    all("label", cB("selected", (target) => el.value === target.querySelector("input")?.value))
  ];
});

// docs-src/components/input-field/input-field.ts
var isNumber = (num) => typeof num === "number";
var parseNumber = (v2, int = false, fallback = 0) => {
  if (!v2)
    return fallback;
  const temp = int ? parseInt(v2, 10) : parseFloat(v2);
  return Number.isFinite(temp) ? temp : fallback;
};
var countDecimals = (value) => {
  if (Math.floor(value) === value || String(value).indexOf(".") === -1)
    return 0;
  return String(value).split(".")[1].length || 0;
};
var asNumberOrString = (el, v2) => {
  const input = el.querySelector("input");
  return input && input.type === "number" ? parseNumber(v2, el.hasAttribute("integer"), 0) : v2 ?? "";
};
var input_field_default = _B("input-field", {
  value: asNumberOrString,
  length: 0,
  error: "",
  description: "",
  clear: (host) => {
    host.clear = () => {
      host.value = "";
      host.length = 0;
      const input = host.querySelector("input");
      if (input) {
        input.value = "";
        input.checkValidity();
        input.focus();
      }
    };
  }
}, (el, { first }) => {
  const fns = [];
  const input = el.querySelector("input");
  if (!input)
    throw new Error("No input element found");
  const typeNumber = input.type === "number";
  const integer = el.hasAttribute("integer");
  const validationEndpoint = el.getAttribute("validate");
  const triggerChange = (value) => {
    const newValue = typeof value === "function" ? value(el.value) : typeNumber && !isNumber(value) ? parseNumber(value, integer, 0) : value;
    if (Object.is(el.value, newValue))
      return;
    if (newValue !== null && validationEndpoint) {
      fetch(`${validationEndpoint}?name=${input.name}value=${newValue}`).then(async (response) => {
        const text = await response.text();
        input.setCustomValidity(text);
        el.error = text;
      }).catch((err) => {
        el.error = err.message;
      });
    }
    input.checkValidity();
    el.value = newValue;
    el.error = input.validationMessage ?? "";
    if (input?.value !== String(value))
      MB("value-change", value)(el);
  };
  fns.push(first("input", pB("value", () => String(el.value)), UB("change", () => {
    triggerChange(typeNumber ? input.valueAsNumber ?? 0 : input.value ?? "");
  }), UB("input", () => {
    el.length = input.value.length ?? 0;
  })));
  if (typeNumber) {
    const spinButton = el.querySelector(".spinbutton");
    const step = parseNumber(spinButton?.dataset["step"] || input.step, integer, 1);
    const min = parseNumber(input.min, integer, 0);
    const max = parseNumber(input.max, integer, 100);
    const nearestStep = (v2) => {
      if (!Number.isFinite(v2) || v2 < min)
        return min;
      if (v2 > max)
        return max;
      const value = min + Math.round((v2 - min) / step) * step;
      return integer ? Math.round(value) : parseFloat(value.toFixed(countDecimals(step)));
    };
    fns.push(first("input", UB("keydown", (e2) => {
      const { key, shiftKey } = e2;
      if (["ArrowUp", "ArrowDown"].includes(key)) {
        e2.stopPropagation();
        e2.preventDefault();
        const n2 = shiftKey ? step * 10 : step;
        const newValue = nearestStep(input.valueAsNumber + (key === "ArrowUp" ? n2 : -n2));
        input.value = String(newValue);
        triggerChange(newValue);
      }
    })));
    if (spinButton) {
      fns.push(first(".decrement", UB("click", (e2) => {
        const n2 = e2.shiftKey ? step * 10 : step;
        const newValue = nearestStep(input.valueAsNumber - n2);
        input.value = String(newValue);
        triggerChange(newValue);
      }), pB("disabled", () => (isNumber(min) ? el.value : 0) - step < min)), first(".increment", UB("click", (e2) => {
        const n2 = e2.shiftKey ? step * 10 : step;
        const newValue = nearestStep(input.valueAsNumber + n2);
        input.value = String(newValue);
        triggerChange(newValue);
      }), pB("disabled", () => (isNumber(max) ? el.value : 0) + step > max)));
    }
  } else {
    fns.push(first(".clear", UB("click", () => {
      el.clear();
      triggerChange("");
    }), pB("hidden", () => !el.length)));
  }
  const errorId = el.querySelector(".error")?.id;
  fns.push(first(".error", hB("error")), first("input", pB("ariaInvalid", () => el.error ? "true" : "false"), gB("aria-errormessage", () => el.error && errorId ? errorId : j)));
  const description = el.querySelector(".description");
  if (description) {
    const maxLength = input.maxLength;
    const remainingMessage = maxLength && description.dataset.remaining;
    if (remainingMessage) {
      el.setSignal("description", i(() => remainingMessage.replace("${x}", String(maxLength - el.length))));
    }
    fns.push(first(".description", hB("description")), first("input", gB("aria-describedby", () => el.description && description.id ? description.id : j)));
  }
  return fns;
});

// docs-src/components/input-textbox/input-textbox.ts
var input_textbox_default = _B("input-textbox", {
  value: kB(),
  length: 0,
  error: "",
  description: T
}, (el, { first }) => {
  const input = el.querySelector("input, textarea");
  if (!input)
    throw new Error("No Input or textarea element found");
  const errorId = el.querySelector(".error")?.id;
  const description = el.querySelector(".description");
  const descriptionId = description?.id;
  if (description?.dataset.remaining && input.maxLength) {
    el.setSignal("description", i(() => description.dataset.remaining.replace("${n}", String(input.maxLength - el.length))));
  }
  return [
    gB("value"),
    first(".description", hB("description")),
    first("input, textarea", pB("value"), pB("ariaInvalid", () => el.error ? "true" : "false"), gB("aria-errormessage", () => el.error && errorId ? errorId : j), gB("aria-describedby", () => el.description && descriptionId ? descriptionId : j), UB("input", () => el.length = input.value.length), UB("change", () => ZB(() => {
      el.value = input.value;
      el.error = input.validationMessage ?? "";
    }))),
    first(".clear", pB("hidden", () => !el.length), UB("click", () => {
      input.value = "";
      ZB(() => {
        el.value = "";
        el.error = input.validationMessage ?? "";
        el.length = 0;
      });
    })),
    first(".error", hB("error"))
  ];
});

// docs-src/components/input-combobox/input-combobox.ts
var input_combobox_default = _B("input-combobox", {
  value: kB(),
  length: 0,
  error: "",
  description: T
}, (el, { first, all }) => {
  const input = el.querySelector("input");
  if (!input)
    throw new Error("Input element not found");
  const errorId = el.querySelector(".error")?.id;
  const descriptionId = el.querySelector(".description")?.id;
  const mode = o("idle");
  const focusIndex = o(-1);
  const filterText = o("");
  const showPopup = o(false);
  const options = CB(el, '[role="option"]:not([hidden])');
  const isExpanded = () => mode.get() === "editing" && showPopup.get();
  const commit = (value) => {
    input.value = value;
    ZB(() => {
      mode.set("selected");
      el.value = value;
      el.length = value.length;
      el.error = input.validationMessage ?? "";
      filterText.set(value.toLowerCase());
      focusIndex.set(-1);
      showPopup.set(input.required && !input.value || false);
    });
  };
  return [
    gB("value"),
    () => p(() => {
      const m2 = mode.get();
      const i2 = focusIndex.get();
      if (m2 === "idle")
        return;
      else if (m2 === "editing" && i2 >= 0)
        options.get().at(i2)?.focus();
      else
        input.focus();
    }),
    UB("keydown", (e2) => {
      if (["ArrowDown", "ArrowUp"].includes(e2.key)) {
        e2.preventDefault();
        e2.stopPropagation();
        mode.set("editing");
        if (e2.altKey)
          showPopup.set(e2.key === "ArrowDown");
        else
          focusIndex.update((v2) => e2.key === "ArrowDown" ? Math.min(v2 + 1, options.get().length - 1) : Math.max(v2 - 1, -1));
      }
    }),
    UB("keyup", (e2) => {
      if (e2.key === "Delete") {
        e2.preventDefault();
        e2.stopPropagation();
        commit("");
      }
    }),
    UB("focusout", () => requestAnimationFrame(() => {
      if (!el.contains(document.activeElement))
        mode.set("idle");
    })),
    first(".description", hB("description")),
    first("input", pB("value"), pB("ariaExpanded", () => String(isExpanded())), pB("ariaInvalid", () => el.error ? "true" : "false"), gB("aria-errormessage", () => el.error && errorId ? errorId : j), gB("aria-describedby", () => el.description && descriptionId ? descriptionId : j), UB("input", () => ZB(() => {
      mode.set("editing");
      showPopup.set(true);
      filterText.set(input.value.trim().toLowerCase());
      el.length = input.value.length;
    })), UB("change", () => ZB(() => {
      el.value = input.value;
      el.error = input.validationMessage ?? "";
    }))),
    first(".clear", pB("hidden", () => !el.length), UB("click", () => commit(""))),
    first('[role="listbox"]', pB("hidden", () => !isExpanded()), UB("keyup", (e2) => {
      if (e2.key === "Enter") {
        commit(options.get().at(focusIndex.get())?.textContent?.trim() || "");
      } else if (e2.key === "Escape") {
        commit(el.value);
      } else {
        const key = e2.key.toLowerCase();
        const nextIndex = options.get().findIndex((option) => (option.textContent?.trim().toLowerCase() || "").startsWith(key));
        if (nextIndex !== -1)
          focusIndex.set(nextIndex);
      }
    })),
    all('[role="option"]', pB("ariaSelected", (target) => String(target.textContent?.trim().toLowerCase() === el.value.toLowerCase())), pB("hidden", (target) => !target.textContent?.trim().toLowerCase().includes(filterText.get())), UB("click", (e2) => {
      commit(e2.target.textContent?.trim() || "");
    })),
    first(".error", hB("error"))
  ];
});

// docs-src/components/code-block/code-block.ts
var code_block_default = _B("code-block", {
  collapsed: wB
}, (el, { first }) => {
  const code = el.querySelector("code");
  return [
    vB("collapsed"),
    first(".overlay", UB("click", () => {
      el.collapsed = false;
    })),
    first(".copy", UB("click", async (e2) => {
      const copyButton = e2.currentTarget;
      const label = copyButton.textContent?.trim() ?? "";
      let status = "success";
      try {
        await navigator.clipboard.writeText(code?.textContent?.trim() ?? "");
      } catch (err) {
        console.error("Error while trying to use navigator.clipboard.writeText()", err);
        status = "error";
      }
      copyButton.disabled = true;
      copyButton.label = el.getAttribute(`copy-${status}`) ?? label;
      setTimeout(() => {
        copyButton.disabled = false;
        copyButton.label = label;
      }, status === "success" ? 1000 : 3000);
    }))
  ];
});

// docs-src/components/tab-group/tab-group.ts
var tab_group_default = _B("tab-group", {
  selected: ""
}, (el, { all, first }) => {
  const getAriaControls = (target) => target?.getAttribute("aria-controls") ?? "";
  const tabs = Array.from(el.querySelectorAll('[role="tab"]'));
  const focusIndex = o(tabs.findIndex((tab) => tab.ariaSelected === "true"));
  el.selected = getAriaControls(tabs[focusIndex.get()]);
  return [
    first('[role="tablist"]', manageFocusOnKeydown(tabs, focusIndex)),
    all('[role="tab"]', UB("click", (e2) => {
      el.selected = getAriaControls(e2.currentTarget);
      focusIndex.set(tabs.findIndex((tab) => tab === e2.currentTarget));
    }), pB("ariaSelected", (target) => String(el.selected === getAriaControls(target))), pB("tabIndex", (target) => el.selected === getAriaControls(target) ? 0 : -1)),
    all('[role="tabpanel"]', pB("hidden", (target) => el.selected !== target.id))
  ];
});

// docs-src/functions/attribute-parser/as-url.ts
var asURL = (el, v2) => {
  let value = "";
  let error = "";
  if (!v2) {
    error = "No URL provided";
  } else if ((el.parentElement || el.getRootNode().host)?.closest(`${el.localName}[src="${v2}"]`)) {
    error = "Recursive loading detected";
  } else {
    try {
      const url = new URL(v2, location.href);
      if (url.origin === location.origin)
        value = String(url);
      else
        error = "Invalid URL origin";
    } catch (err) {
      error = String(err);
    }
  }
  return { value, error };
};

// docs-src/components/lazy-load/lazy-load.ts
var lazy_load_default = _B("lazy-load", {
  src: asURL
}, (el, { first }) => {
  const error = o("");
  const content = i(async (abort) => {
    const url = el.src.value;
    if (el.src.error || !url) {
      error.set(el.src.error ?? "No URL provided");
      return "";
    }
    try {
      error.set("");
      el.querySelector(".loading")?.remove();
      const { content: content2 } = await fetchWithCache(url, abort);
      return content2;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      error.set(errorMessage);
      return "";
    }
  });
  return [
    oB(content),
    first("callout-box", pB("hidden", () => !error.get() && content.get() !== j), cB("danger", () => !error.get())),
    first(".error", hB(error))
  ];
});

// docs-src/functions/signal-producer/select-checked.ts
var selectChecked = (selector, checked) => (el) => CB(el, `${selector}${checked ? "[checked]" : ":not([checked])"}`);

// docs-src/components/todo-app/todo-app.ts
var todo_app_default = _B("todo-app", {
  active: selectChecked("input-checkbox", false),
  completed: selectChecked("input-checkbox", true)
}, (el, { first }) => {
  const input = el.querySelector("input-field");
  if (!input)
    throw new Error("No input field found");
  const template = el.querySelector("template");
  if (!template)
    throw new Error("No template found");
  const list = el.querySelector("ol");
  if (!list)
    throw new Error("No list found");
  return [
    first(".submit", pB("disabled", () => !input.length)),
    first("form", UB("submit", (e2) => {
      e2.preventDefault();
      queueMicrotask(() => {
        const value = input.value.toString().trim();
        if (!value)
          return;
        const li = document.importNode(template.content, true).firstElementChild;
        if (!(li instanceof HTMLLIElement))
          throw new Error("Invalid template for list item; expected <li>");
        li.querySelector("slot")?.replaceWith(String(input.value));
        list.append(li);
        input.clear();
      });
    })),
    first("ol", gB("filter", () => el.querySelector("input-radiogroup")?.value ?? "all"), UB("click", (e2) => {
      const target = e2.target;
      if (target.localName === "button")
        target.closest("li").remove();
    })),
    first(".count", hB(() => String(el.active.length))),
    first(".singular", pB("hidden", () => el.active.length > 1)),
    first(".plural", pB("hidden", () => el.active.length === 1)),
    first(".remaining", pB("hidden", () => !el.active.length)),
    first(".all-done", pB("hidden", () => !!el.active.length)),
    first(".clear-completed", pB("disabled", () => !el.completed.length), pB("badge", () => el.completed.length > 0 ? String(el.completed.length) : ""), UB("click", () => {
      const items = Array.from(el.querySelectorAll("ol li"));
      for (let i2 = items.length - 1;i2 >= 0; i2--) {
        const task = items[i2].querySelector("input-checkbox");
        if (task?.checked)
          items[i2].remove();
      }
    }))
  ];
});

// docs-src/functions/signal-producer/sum-values.ts
var sumValues = (selector) => (el) => () => CB(el, selector).get().reduce((sum, item) => sum + item.value, 0);

// docs-src/components/product-catalog/product-catalog.ts
var product_catalog_default = _B("product-catalog", {
  total: sumValues("spin-button")
}, (el, { first }) => [
  first("input-button", PB({
    badge: () => el.total > 0 ? String(el.total) : "",
    disabled: () => !el.total
  }))
]);

// docs-src/components/spin-button/spin-button.ts
var spin_button_default = _B("spin-button", {
  value: TB()
}, (el, { all, first }) => {
  const zeroLabel = el.getAttribute("zero-label") || "Add to Cart";
  const incrementLabel = el.getAttribute("increment-label") || "Increment";
  const max = TB(9)(el, el.getAttribute("max"));
  const isZero = () => el.value === 0;
  return [
    first(".value", hB("value"), pB("hidden", isZero)),
    first(".decrement", pB("hidden", isZero), UB("click", () => {
      el.value--;
    })),
    first(".increment", hB(() => isZero() ? zeroLabel : "+"), pB("ariaLabel", () => isZero() ? zeroLabel : incrementLabel), pB("disabled", () => el.value >= max), UB("click", () => {
      el.value++;
    })),
    all("button", UB("keydown", (e2) => {
      const { key } = e2;
      if (["ArrowUp", "ArrowDown", "-", "+"].includes(key)) {
        e2.stopPropagation();
        e2.preventDefault();
        if (key === "ArrowDown" || key === "-")
          el.value--;
        if (key === "ArrowUp" || key === "+")
          el.value++;
      }
    }))
  ];
});

// docs-src/components/rating-stars/rating-stars.ts
var rating_stars_default = _B("rating-stars", {
  value: TB()
}, (el, { all }) => {
  const getKey = (element) => parseInt(element.dataset["key"] || "0");
  return [
    all("input", pB("checked", (target) => el.value === getKey(target)), UB("change", (e2) => {
      e2.stopPropagation();
      const value = parseInt(e2.currentTarget?.value) + 1;
      el.value = value;
      MB("change-rating", value)(el);
    })),
    all(".label", hB((target) => getKey(target) <= el.value ? "\u2605" : "\u2606"))
  ];
});

// docs-src/components/rating-feedback/rating-feedback.ts
var rating_feedback_default = _B("rating-feedback", {}, (el, { all, first }) => {
  const rating = o(0);
  const empty = o(true);
  const submitted = o(false);
  const stars = el.querySelector("rating-stars");
  if (!stars)
    throw new Error("No rating-stars component found");
  const hasDifferentKey = (element) => rating.get() !== parseInt(element.dataset["key"] || "0");
  return [
    UB("change-rating", (e2) => {
      rating.set(e2.detail);
    }),
    UB("submit", (e2) => {
      e2.preventDefault();
      submitted.set(true);
      console.log("Feedback submitted");
    }),
    first(".hide", UB("click", () => {
      const feedback = el.querySelector(".feedback");
      if (feedback)
        feedback.hidden = true;
    })),
    first("textarea", UB("input", (e2) => {
      empty.set(e2.target?.value.trim() === "");
    })),
    first(".feedback", pB("hidden", () => submitted.get() || !rating.get())),
    all(".feedback p", pB("hidden", hasDifferentKey)),
    first("input-button", pB("disabled", empty))
  ];
});

// docs-src/components/calc-table/calc-table.ts
var calc_table_default = _B("calc-table", {
  columns: TB(),
  rows: TB()
}, (el, { all, first }) => {
  const colHeads = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rowTemplate = el.querySelector(".calc-table-row");
  const colheadTemplate = el.querySelector(".calc-table-colhead");
  const cellTemplate = el.querySelector(".calc-table-cell");
  if (!rowTemplate || !colheadTemplate || !cellTemplate)
    throw new Error("Missing template elements");
  const colSums = new Map;
  for (let i2 = 0;i2 < el.columns; i2++) {
    colSums.set(colHeads[i2], o(0));
  }
  const calcColumnSum = (rowKey) => {
    return Array.from(el.querySelectorAll(`tbody input[data-key="${rowKey}"]`)).map((input) => Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : 0).reduce((acc, val) => acc + val, 0);
  };
  return [
    pB("rows", () => el.querySelector(".rows spin-button")?.value),
    pB("columns", () => el.querySelector(".columns spin-button")?.value),
    first("tbody", dB((target) => el.rows - target.querySelectorAll("tr").length, {
      position: "beforeend",
      create: (parent) => {
        const row = document.importNode(rowTemplate.content, true).firstElementChild;
        if (!(row instanceof HTMLTableRowElement))
          throw new Error(`Expected <tr> as root in table row template, got ${row}`);
        const rowKey = String(parent.querySelectorAll("tr").length + 1);
        row.dataset["key"] = rowKey;
        row.querySelector("slot")?.replaceWith(document.createTextNode(rowKey));
        return row;
      },
      resolve: () => {
        for (const [colKey, colSum] of colSums) {
          colSum.set(calcColumnSum(colKey));
        }
      }
    })),
    first("thead tr", dB((target) => el.columns - (target.querySelectorAll("th").length - 1), {
      position: "beforeend",
      create: (parent) => {
        const cell = document.importNode(colheadTemplate.content, true).firstElementChild;
        if (!(cell instanceof HTMLTableCellElement))
          throw new Error(`Expected <th> as root in column header template, got ${cell}`);
        const colKey = colHeads[parent.querySelectorAll("th").length - 1];
        colSums.set(colKey, o(0));
        cell.querySelector("slot")?.replaceWith(document.createTextNode(colKey));
        return cell;
      }
    })),
    all("tbody tr", dB((target) => el.columns - target.querySelectorAll("td").length, {
      position: "beforeend",
      create: (parent) => {
        const cell = document.importNode(cellTemplate.content, true).firstElementChild;
        if (!(cell instanceof HTMLTableCellElement))
          throw new Error(`Expected <td> as root in cell template, got ${cell}`);
        const rowKey = parent.dataset["key"];
        const colKey = colHeads[parent.querySelectorAll("td").length];
        const input = cell.querySelector("input");
        if (!input)
          throw new Error("No input found in cell template");
        input.dataset["key"] = colKey;
        cell.querySelector("slot")?.replaceWith(document.createTextNode(`${colKey}${rowKey}`));
        return cell;
      }
    })),
    first("tfoot tr", dB((target) => el.columns - target.querySelectorAll("td").length, {
      position: "beforeend",
      create: (parent) => {
        const cell = document.createElement("td");
        const colKey = colHeads[parent.querySelectorAll("td").length];
        cell.dataset["key"] = colKey;
        return cell;
      }
    })),
    all("tbody input", UB("change", (e2) => {
      const colKey = e2.target?.dataset["key"];
      colSums.get(colKey)?.set(calcColumnSum(colKey));
    })),
    all("tfoot td", hB((target) => String(colSums.get(target.dataset["key"]).get())))
  ];
});

//# debugId=16E609D16B20534C64756E2164756E21

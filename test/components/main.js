// index.js
var H = (B) => typeof B === "function";
var v = (B, W) => Object.prototype.toString.call(B) === `[object ${W}]`;
var m = (B) => B instanceof Error ? B : Error(String(B));

class S extends Error {
  constructor(B) {
    super(`Circular dependency in ${B} detected`);
    return this;
  }
}
var _;
var c = new Set;
var s = 0;
var l = new Map;
var i;
var ZB = () => {
  i = undefined;
  let B = Array.from(l.values());
  l.clear();
  for (let W of B)
    W();
};
var jB = () => {
  if (i)
    cancelAnimationFrame(i);
  i = requestAnimationFrame(ZB);
};
queueMicrotask(ZB);
var d = (B) => {
  let W = new Set, $ = B;
  return $.off = (Z) => {
    W.add(Z);
  }, $.cleanup = () => {
    for (let Z of W)
      Z();
    W.clear();
  }, $;
};
var D = (B) => {
  if (_ && !B.has(_)) {
    let W = _;
    B.add(W), _.off(() => {
      B.delete(W);
    });
  }
};
var M = (B) => {
  for (let W of B)
    if (s)
      c.add(W);
    else
      W();
};
var u = () => {
  while (c.size) {
    let B = Array.from(c);
    c.clear();
    for (let W of B)
      W();
  }
};
var JB = (B) => {
  s++;
  try {
    B();
  } finally {
    u(), s--;
  }
};
var h = (B, W) => {
  let $ = _;
  _ = W;
  try {
    B();
  } finally {
    _ = $;
  }
};
var N = (B, W) => new Promise(($, Z) => {
  l.set(W || Symbol(), () => {
    try {
      $(B());
    } catch (J) {
      Z(J);
    }
  }), jB();
});
var r = "State";
var o = (B) => {
  let W = new Set, $ = B, Z = { [Symbol.toStringTag]: r, get: () => {
    return D(W), $;
  }, set: (J) => {
    if (Object.is($, J))
      return;
    if ($ = J, M(W), Q === $)
      W.clear();
  }, update: (J) => {
    Z.set(J($));
  } };
  return Z;
};
var C = (B) => v(B, r);
var g = "Computed";
var k = (B) => {
  let W = new Set, $ = Q, Z, J, K = true, z = false, G = false, I = (V) => {
    if (!Object.is(V, $))
      $ = V, z = true;
    Z = undefined, K = false;
  }, X = () => {
    z = Q !== $, $ = Q, Z = undefined;
  }, Y = (V) => {
    let q = m(V);
    z = !Z || q.name !== Z.name || q.message !== Z.message, $ = Q, Z = q;
  }, x = (V) => (q) => {
    if (G = false, J = undefined, V(q), z)
      M(W);
  }, A = d(() => {
    if (K = true, J?.abort("Aborted because source signal changed"), W.size)
      M(W);
    else
      A.cleanup();
  }), R = () => h(() => {
    if (G)
      throw new S("computed");
    if (z = false, H(B) && B.constructor.name === "AsyncFunction") {
      if (J)
        return $;
      J = new AbortController, J.signal.addEventListener("abort", () => {
        G = false, J = undefined, R();
      }, { once: true });
    }
    let V;
    G = true;
    try {
      V = J ? B(J.signal) : B();
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
    else if (V == null || Q === V)
      X();
    else
      I(V);
    G = false;
  }, A);
  return { [Symbol.toStringTag]: g, get: () => {
    if (D(W), u(), K)
      R();
    if (Z)
      throw Z;
    return $;
  } };
};
var E = (B) => v(B, g);
var t = (B) => H(B) && B.length < 2;
var Q = Symbol();
var O = (B) => C(B) || E(B);
var b = (B) => O(B) ? B : t(B) ? k(B) : o(B);
function p(B) {
  let { signals: W, ok: $, err: Z = console.error, nil: J = () => {
  } } = H(B) ? { signals: [], ok: B } : B, K = false, z = d(() => h(() => {
    if (K)
      throw new S("effect");
    K = true;
    let G = [], I = false, X = W.map((x) => {
      try {
        let A = x.get();
        if (A === Q)
          I = true;
        return A;
      } catch (A) {
        return G.push(m(A)), Q;
      }
    }), Y = undefined;
    try {
      Y = I ? J() : G.length ? Z(...G) : $(...X);
    } catch (x) {
      Y = Z(m(x));
    } finally {
      if (H(Y))
        z.off(Y);
    }
    K = false;
  }, z));
  return z(), () => z.cleanup();
}
var P = false;
var f = "error";
var AB = (B) => B ? `#${B}` : "";
var LB = (B) => B.length ? `.${Array.from(B).join(".")}` : "";
var a = (B) => !!B && typeof B === "object";
var y = (B) => typeof B === "string";
var KB = (B) => B.nodeType === Node.ELEMENT_NODE;
var j = (B) => `<${B.localName}${AB(B.id)}${LB(B.classList)}>`;
var w = (B) => y(B) ? `"${B}"` : a(B) ? JSON.stringify(B) : String(B);
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
var F = (B, W, $ = "debug") => {
  if (["error", "warn"].includes($))
    console[$](W, B);
  return B;
};

class zB extends Error {
  constructor(B) {
    super(B);
    this.name = "CircularMutationError";
  }
}
var GB = (B) => B instanceof HTMLElement && B.localName.includes("-");
var xB = (B) => {
  let W = new Set;
  if (B.includes("."))
    W.add("class");
  if (B.includes("#"))
    W.add("id");
  if (B.includes("[")) {
    let $ = B.split("[");
    for (let Z = 1;Z < $.length; Z++) {
      let J = $[Z];
      if (!J.includes("]"))
        continue;
      let K = J.split("=")[0].trim().replace(/[^a-zA-Z0-9_-]/g, "");
      if (K)
        W.add(K);
    }
  }
  return [...W];
};
var qB = (B, W) => {
  if (B.length !== W.length)
    return false;
  let $ = new Set(B);
  for (let Z of W)
    if (!$.has(Z))
      return false;
  return true;
};
var e = (B, W, $) => {
  let Z = new MutationObserver($), J = xB(W), K = { childList: true, subtree: true };
  if (J.length)
    K.attributes = true, K.attributeFilter = J;
  return Z.observe(B, K), Z;
};
var CB = (B, W) => {
  let $ = new Set, Z = () => Array.from(B.querySelectorAll(W)), J = Q, K, z = 0, G = 2, I = () => {
    J = Z(), K = e(B, W, () => {
      if (!$.size) {
        K?.disconnect(), K = undefined;
        return;
      }
      if (z++, z > G)
        throw K?.disconnect(), K = undefined, z = 0, new zB("Circular mutation in element selection detected");
      try {
        let Y = Z();
        if (!qB(J, Y))
          J = Y, M($);
      } finally {
        z--;
      }
    });
  };
  return { [Symbol.toStringTag]: g, get: () => {
    if (D($), !$.size)
      J = Z();
    else if (!K)
      I();
    return J;
  } };
};
var PB = (B, W) => ($, Z = $) => {
  if (!H(W))
    throw new TypeError(`Invalid event listener provided for "${B} event on element ${j(Z)}`);
  return Z.addEventListener(B, W), () => Z.removeEventListener(B, W);
};
var UB = (B, W) => ($, Z = $) => {
  Z.dispatchEvent(new CustomEvent(B, { detail: H(W) ? W(Z) : W, bubbles: true }));
};
var MB = (B) => (W, $) => {
  if (!GB($))
    throw new TypeError("Target element must be a custom element");
  let Z = H(B) ? B($) : B;
  if (!a(Z))
    throw new TypeError("Passed signals must be an object or a provider function");
  customElements.whenDefined($.localName).then(() => {
    for (let [J, K] of Object.entries(Z)) {
      let z = y(K) ? W.getSignal(J) : b(K);
      $.setSignal(J, z);
    }
  }).catch((J) => {
    throw new Error(`Failed to pass signals to ${j($)}}`, { cause: J });
  });
};
var OB = (B, W, $) => {
  if (!B)
    return () => $;
  if (!GB(B))
    throw new TypeError("Target element must be a custom element");
  let Z = k(async () => {
    return await customElements.whenDefined(B.localName), B.getSignal(W);
  });
  return () => {
    let J = Z.get();
    return J === Q ? $ : J.get();
  };
};
var T = Symbol();
var yB = new Set(["constructor", "prototype"]);
var RB = new Set(["id", "class", "className", "title", "role", "style", "dataset", "lang", "dir", "hidden", "children", "innerHTML", "outerHTML", "textContent", "innerText"]);
var BB = (B) => H(B) && B.length >= 2;
var IB = (B) => {
  if (yB.has(B))
    return `Property name "${B}" is a reserved word`;
  if (RB.has(B))
    return `Property name "${B}" conflicts with inherited HTMLElement property`;
  return null;
};
var $B = (B, W, $ = W) => {
  let Z = B.filter(H).map((J) => J(W, $));
  return () => {
    Z.filter(H).forEach((J) => J()), Z.length = 0;
  };
};
var _B = () => ({ first: (B, ...W) => ($) => {
  let Z = ($.shadowRoot || $).querySelector(B);
  if (Z)
    $B(W, $, Z);
}, all: (B, ...W) => ($) => {
  let Z = new Map, J = $.shadowRoot || $, K = (X) => {
    if (!Z.has(X))
      Z.set(X, $B(W, $, X));
  }, z = (X) => {
    let Y = Z.get(X);
    if (H(Y))
      Y();
    Z.delete(X);
  }, G = (X) => (Y) => {
    if (KB(Y)) {
      if (Y.matches(B))
        X(Y);
      Y.querySelectorAll(B).forEach(X);
    }
  }, I = e(J, B, (X) => {
    for (let Y of X)
      Y.addedNodes.forEach(G(K)), Y.removedNodes.forEach(G(z));
  });
  return J.querySelectorAll(B).forEach(K), () => {
    I.disconnect(), Z.forEach((X) => X()), Z.clear();
  };
} });
var DB = (B, W = {}, $) => {
  for (let J of Object.keys(W)) {
    let K = IB(J);
    if (K)
      throw new TypeError(`${K} in component "${B}".`);
  }

  class Z extends HTMLElement {
    debug;
    #B = {};
    #$;
    static observedAttributes = Object.entries(W)?.filter(([, J]) => BB(J)).map(([J]) => J) ?? [];
    constructor() {
      super();
      for (let [J, K] of Object.entries(W)) {
        if (K == null)
          continue;
        let z = BB(K) ? K(this, null) : H(K) ? K(this) : K;
        if (z != null)
          this.setSignal(J, b(z));
      }
    }
    connectedCallback() {
      if (P) {
        if (this.debug = this.hasAttribute("debug"), this.debug)
          F(this, "Connected");
      }
      let J = $(this, _B());
      if (!Array.isArray(J))
        throw new TypeError(`Expected array of functions as return value of setup function in ${j(this)}`);
      this.#$ = $B(J, this);
    }
    disconnectedCallback() {
      if (H(this.#$))
        this.#$();
      if (P && this.debug)
        F(this, "Disconnected");
    }
    attributeChangedCallback(J, K, z) {
      if (z === K || E(this.#B[J]))
        return;
      let G = W[J];
      if (!BB(G))
        return;
      let I = G(this, z, K);
      if (P && this.debug)
        F(z, `Attribute "${J}" of ${j(this)} changed from ${w(K)} to ${w(z)}, parsed as <${n(I)}> ${w(I)}`);
      this[J] = I;
    }
    getSignal(J) {
      let K = this.#B[J];
      if (P && this.debug)
        F(K, `Get ${n(K)} "${String(J)}" in ${j(this)}`);
      return K;
    }
    setSignal(J, K) {
      let z = IB(String(J));
      if (z)
        throw new TypeError(`${z} on ${j(this)}.`);
      if (!O(K))
        throw new TypeError(`Expected signal as value for property "${String(J)}" on ${j(this)}.`);
      let G = this.#B[J], I = C(K);
      if (this.#B[J] = K, Object.defineProperty(this, J, { get: K.get, set: I ? K.set : undefined, enumerable: true, configurable: I }), G && C(G))
        G.set(Q);
      if (P && this.debug)
        F(K, `Set ${n(K)} "${String(J)} in ${j(this)}`);
    }
  }
  return customElements.define(B, Z), Z;
};
var WB = "context-request";
var NB = (B) => (W) => {
  let $ = (Z) => {
    let { context: J, callback: K } = Z;
    if (B.includes(J) && H(K))
      Z.stopPropagation(), K(W.getSignal(String(J)));
  };
  return W.addEventListener(WB, $), () => W.removeEventListener(WB, $);
};
var YB = (B, W) => {
  if (W == null)
    return;
  let $ = B(W);
  return Number.isFinite($) ? $ : undefined;
};
var TB = (B, W) => W !== "false" && W != null;
var SB = (B = 0) => (W, $) => {
  if ($ == null)
    return B;
  let Z = $.trim();
  if (Z === "")
    return B;
  if (Z.toLowerCase().startsWith("0x")) {
    let K = parseInt(Z, 16);
    return Number.isFinite(K) ? K : B;
  }
  let J = YB(parseFloat, $);
  return J != null ? Math.trunc(J) : B;
};
var EB = (B = "") => (W, $) => $ ?? B;
var HB = (B, W, $) => y(B) ? W.getSignal(B).get() : O(B) ? B.get() : H(B) ? B($) : T;
var mB = (B) => {
  if (/^(mailto|tel):/i.test(B))
    return true;
  if (B.includes("://"))
    try {
      let W = new URL(B, window.location.origin);
      return ["http:", "https:", "ftp:"].includes(W.protocol);
    } catch (W) {
      return false;
    }
  return true;
};
var dB = (B, W, $) => {
  if (/^on/i.test(W))
    throw new Error(`Unsafe attribute: ${W}`);
  if ($ = String($).trim(), !mB($))
    throw new Error(`Unsafe URL for ${W}: ${$}`);
  B.setAttribute(W, $);
};
var U = (B, W) => ($, Z) => {
  let { op: J, name: K = "", read: z, update: G } = W, I = z(Z), X = { a: "attribute ", c: "class ", h: "inner HTML", p: "property ", s: "style property ", t: "text content" };
  if (y(B) && y(I) && $[B] === T)
    $.attributeChangedCallback(B, null, I);
  let Y = (A) => () => {
    if (P && $.debug)
      F(Z, `${A} ${X[J] + K} of ${j(Z)} in ${j($)}`);
    W.resolve?.(Z);
  }, x = (A) => (R) => {
    F(R, `Failed to ${A} ${X[J] + K} of ${j(Z)} in ${j($)}`, f), W.reject?.(R);
  };
  return p(() => {
    let A = Symbol(`${J}:${K}`), R = Symbol(`${J}-${K}`), L = T;
    try {
      L = HB(B, $, Z);
    } catch (V) {
      F(V, `Failed to resolve value of ${w(B)} for ${X[J] + K} of ${j(Z)} in ${j($)}`, f);
      return;
    }
    if (L === T)
      L = I;
    else if (L === Q)
      L = W.delete ? null : I;
    if (W.delete && L === null)
      N(() => {
        return W.delete(Z), true;
      }, R).then(Y("Deleted")).catch(x("delete"));
    else if (L != null) {
      let V = z(Z);
      if (Object.is(L, V))
        return;
      N(() => {
        return G(Z, L), true;
      }, A).then(Y("Updated")).catch(x("update"));
    }
  });
};
var hB = (B, W) => ($, Z) => {
  let J = (z) => () => {
    if (P && $.debug)
      F(Z, `${z} element in ${j(Z)} in ${j($)}`);
    if (H(W?.resolve))
      W.resolve(Z);
    else {
      let G = O(B) ? B : y(B) ? $.getSignal(B) : undefined;
      if (C(G))
        G.set(0);
    }
  }, K = (z) => (G) => {
    F(G, `Failed to ${z} element in ${j(Z)} in ${j($)}`, f), W?.reject?.(G);
  };
  return p(() => {
    let z = Symbol("i"), G = Symbol("d"), I = 0;
    try {
      I = HB(B, $, Z);
    } catch (X) {
      F(X, `Failed to resolve value of ${w(B)} for insertion or deletion in ${j(Z)} in ${j($)}`, f);
      return;
    }
    if (I === T)
      I = 0;
    if (I > 0) {
      if (!W)
        throw new TypeError("No inserter provided");
      N(() => {
        for (let X = 0;X < I; X++) {
          let Y = W.create(Z);
          if (!Y)
            continue;
          Z.insertAdjacentElement(W.position ?? "beforeend", Y);
        }
        return true;
      }, z).then(J("Inserted")).catch(K("insert"));
    } else if (I < 0)
      N(() => {
        if (W && (W.position === "afterbegin" || W.position === "beforeend"))
          for (let X = 0;X > I; X--)
            if (W.position === "afterbegin")
              Z.firstElementChild?.remove();
            else
              Z.lastElementChild?.remove();
        else
          Z.remove();
        return true;
      }, G).then(J("Removed")).catch(K("remove"));
  });
};
var gB = (B) => U(B, { op: "t", read: (W) => W.textContent, update: (W, $) => {
  Array.from(W.childNodes).filter((Z) => Z.nodeType !== Node.COMMENT_NODE).forEach((Z) => Z.remove()), W.append(document.createTextNode($));
} });
var pB = (B, W = B) => U(W, { op: "p", name: String(B), read: ($) => (B in $) ? $[B] : Q, update: ($, Z) => {
  $[B] = Z;
} });
var vB = (B) => U(B, { op: "p", name: "hidden", read: (W) => !W.hidden, update: (W, $) => {
  W.hidden = !$;
} });
var cB = (B, W = B) => U(W, { op: "a", name: B, read: ($) => $.getAttribute(B), update: ($, Z) => {
  dB($, B, Z);
}, delete: ($) => {
  $.removeAttribute(B);
} });
var iB = (B, W = B) => U(W, { op: "a", name: B, read: ($) => $.hasAttribute(B), update: ($, Z) => {
  $.toggleAttribute(B, Z);
} });
var uB = (B, W = B) => U(W, { op: "c", name: B, read: ($) => $.classList.contains(B), update: ($, Z) => {
  $.classList.toggle(B, Z);
} });
var nB = (B, W = {}) => U(B, { op: "h", read: ($) => ($.shadowRoot || !W.shadowRootMode ? $ : null)?.innerHTML ?? "", update: ($, Z) => {
  let { shadowRootMode: J, allowScripts: K } = W;
  if (!Z) {
    if ($.shadowRoot)
      $.shadowRoot.innerHTML = "<slot></slot>";
    return "";
  }
  if (J && !$.shadowRoot)
    $.attachShadow({ mode: J });
  let z = $.shadowRoot || $;
  if (z.innerHTML = Z, !K)
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
var client_router_default = DB("client-router", {}, (el, { all, first }) => {
  const outlet = el.getAttribute("outlet") ?? "main";
  const pathname = o(window.location.pathname);
  const error = o("");
  const hasError = () => !error.get();
  const content = k(async (abort) => {
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
    all("a[href]", uB("active", (target) => {
      const href = target.getAttribute("href");
      if (!href)
        return false;
      try {
        return pathname.get() === new URL(href, window.location.href).pathname;
      } catch {
        return false;
      }
    }), PB("click", (e2) => {
      if (!(e2.target instanceof HTMLAnchorElement))
        return;
      const url = new URL(e2.target.href);
      if (url.origin === window.location.origin) {
        e2.preventDefault();
        pathname.set(url.pathname);
      }
    })),
    first(outlet, nB(content, { allowScripts: true })),
    first("callout-box", pB("hidden", hasError), uB("danger", hasError)),
    first(".error", gB(error)),
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
var media_context_default = DB("media-context", {
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
  NB([MEDIA_MOTION, MEDIA_THEME, MEDIA_VIEWPORT, MEDIA_ORIENTATION])
]);

// docs-src/components/hello-world/hello-world.ts
var hello_world_default = DB("hello-world", {
  name: T
}, (el, { first }) => [
  first("span", gB("name")),
  first("input", PB("input", (e2) => {
    el.name = e2.target?.value || T;
  }))
]);

// docs-src/components/my-counter/my-counter.ts
var my_counter_default = DB("my-counter", {
  count: SB()
}, (el, { first }) => [
  first(".count", gB("count")),
  first(".parity", gB(() => el.count % 2 ? "odd" : "even")),
  first(".increment", PB("click", () => {
    el.count++;
  })),
  first(".decrement", PB("click", () => {
    el.count--;
  }))
]);

// docs-src/components/my-carousel/my-carousel.ts
var my_carousel_default = DB("my-carousel", {}, (el, { all, first }) => {
  const currentIndex = o(0);
  const slides = Array.from(el.querySelectorAll('[role="tabpanel"]'));
  const total = slides.length;
  const updateIndex = (direction) => {
    currentIndex.update((v2) => (v2 + direction + total) % total);
  };
  return [
    first("nav", PB("keyup", (e2) => {
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
    }), first(".prev", PB("click", () => {
      updateIndex(-1);
    })), first(".next", PB("click", () => {
      updateIndex(1);
    })), all('[role="tab"]', pB("ariaSelected", (target) => String(target.dataset["index"] === String(currentIndex.get()))), pB("tabIndex", (target) => target.dataset["index"] === String(currentIndex.get()) ? 0 : -1), PB("click", (e2) => {
      const rawIndex = e2.target?.dataset["index"];
      const nextIndex = rawIndex ? parseInt(rawIndex) : 0;
      currentIndex.set(Number.isInteger(nextIndex) ? nextIndex : 0);
    }))),
    all('[role="tabpanel"]', pB("ariaCurrent", (target) => String(target.id === slides[currentIndex.get()].id)))
  ];
});

// docs-src/components/input-button/input-button.ts
var input_button_default = DB("input-button", {
  disabled: TB,
  label: EB(T),
  badge: EB(T)
}, (_2, { first }) => [
  first("button", pB("disabled")),
  first(".label", gB("label")),
  first(".badge", gB("badge"))
]);

// docs-src/components/input-checkbox/input-checkbox.ts
var input_checkbox_default = DB("input-checkbox", {
  checked: TB,
  label: EB(T)
}, (el, { first }) => [
  iB("checked"),
  first("input", pB("checked"), PB("change", (e2) => {
    el.checked = e2.target?.checked;
  })),
  first(".label", gB("label"))
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
var manageFocusOnKeydown = (elements, index) => PB("keydown", (e2) => {
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
var input_radiogroup_default = DB("input-radiogroup", {
  value: EB()
}, (el, { all }) => {
  const inputs = Array.from(el.querySelectorAll("input"));
  const focusIndex = o(inputs.findIndex((input) => input.checked));
  return [
    cB("value"),
    manageFocusOnKeydown(inputs, focusIndex),
    all("input", PB("change", (e2) => {
      const input = e2.target;
      el.value = input.value;
      focusIndex.set(inputs.findIndex((input2) => input2.checked));
    }), PB("keyup", (e2) => {
      if (e2.key === "Enter" && e2.target)
        e2.target.click();
    }), pB("tabIndex", (target) => target.value === el.value ? 0 : -1)),
    all("label", uB("selected", (target) => el.value === target.querySelector("input")?.value))
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
var input_field_default = DB("input-field", {
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
      UB("value-change", value)(el);
  };
  fns.push(first("input", pB("value", () => String(el.value)), PB("change", () => {
    triggerChange(typeNumber ? input.valueAsNumber ?? 0 : input.value ?? "");
  }), PB("input", () => {
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
    fns.push(first("input", PB("keydown", (e2) => {
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
      fns.push(first(".decrement", PB("click", (e2) => {
        const n2 = e2.shiftKey ? step * 10 : step;
        const newValue = nearestStep(input.valueAsNumber - n2);
        input.value = String(newValue);
        triggerChange(newValue);
      }), pB("disabled", () => (isNumber(min) ? el.value : 0) - step < min)), first(".increment", PB("click", (e2) => {
        const n2 = e2.shiftKey ? step * 10 : step;
        const newValue = nearestStep(input.valueAsNumber + n2);
        input.value = String(newValue);
        triggerChange(newValue);
      }), pB("disabled", () => (isNumber(max) ? el.value : 0) + step > max)));
    }
  } else {
    fns.push(first(".clear", PB("click", () => {
      el.clear();
      triggerChange("");
    }), pB("hidden", () => !el.length)));
  }
  const errorId = el.querySelector(".error")?.id;
  fns.push(first(".error", gB("error")), first("input", pB("ariaInvalid", () => el.error ? "true" : "false"), cB("aria-errormessage", () => el.error && errorId ? errorId : Q)));
  const description = el.querySelector(".description");
  if (description) {
    const maxLength = input.maxLength;
    const remainingMessage = maxLength && description.dataset.remaining;
    if (remainingMessage) {
      el.setSignal("description", k(() => remainingMessage.replace("${x}", String(maxLength - el.length))));
    }
    fns.push(first(".description", gB("description")), first("input", cB("aria-describedby", () => el.description && description.id ? description.id : Q)));
  }
  return fns;
});

// docs-src/functions/shared/clear-input.ts
var createClearFunction = (input, update) => () => {
  input.value = "";
  input.setCustomValidity("");
  input.checkValidity();
  update();
};
var standardClearUpdate = (host, input) => () => {
  JB(() => {
    host.value = "";
    host.length = 0;
    host.error = input.validationMessage ?? "";
  });
};
var standardClearEffects = (host) => [
  vB(() => !!host.length),
  PB("click", () => host.clear())
];

// docs-src/functions/shared/input-effects.ts
var standardInputEffects = (host, input, errorId, descriptionId) => [
  pB("ariaInvalid", () => String(!!host.error)),
  cB("aria-errormessage", () => host.error && errorId ? errorId : Q),
  cB("aria-describedby", () => host.description && descriptionId ? descriptionId : Q),
  PB("change", () => JB(() => {
    host.value = input.value;
    host.error = input.validationMessage ?? "";
  }))
];

// docs-src/components/input-textbox/input-textbox.ts
var input_textbox_default = DB("input-textbox", {
  value: EB(),
  length: 0,
  error: "",
  description: T,
  clear() {
  }
}, (el, { first }) => {
  const input = el.querySelector("input, textarea");
  if (!input)
    throw new Error("No Input or textarea element found");
  el.clear = createClearFunction(input, standardClearUpdate(el, input));
  const description = el.querySelector(".description");
  if (description?.dataset.remaining && input.maxLength) {
    el.setSignal("description", k(() => description.dataset.remaining.replace("${n}", String(input.maxLength - el.length))));
  }
  return [
    cB("value"),
    first(".description", gB("description")),
    first("input, textarea", ...standardInputEffects(el, input, el.querySelector(".error")?.id, description?.id), PB("input", () => el.length = input.value.length)),
    first(".clear", ...standardClearEffects(el)),
    first(".error", gB("error"))
  ];
});

// docs-src/components/input-combobox/input-combobox.ts
var input_combobox_default = DB("input-combobox", {
  value: EB(),
  length: 0,
  error: "",
  description: T,
  clear() {
  }
}, (el, { first, all }) => {
  const input = el.querySelector("input");
  if (!input)
    throw new Error("Input element not found");
  const mode = o("idle");
  const focusIndex = o(-1);
  const filterText = o("");
  const showPopup = o(false);
  const options = CB(el, '[role="option"]:not([hidden])');
  const isExpanded = () => mode.get() === "editing" && showPopup.get();
  const commit = (value) => {
    input.value = value;
    JB(() => {
      mode.set("selected");
      el.value = value;
      el.length = value.length;
      el.error = input.validationMessage ?? "";
      filterText.set(value.toLowerCase());
      focusIndex.set(-1);
      showPopup.set(input.required && !input.value || false);
    });
  };
  el.clear = createClearFunction(input, () => commit(""));
  return [
    cB("value"),
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
    PB("keydown", (e2) => {
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
    PB("keyup", (e2) => {
      if (e2.key === "Delete") {
        e2.preventDefault();
        e2.stopPropagation();
        commit("");
      }
    }),
    PB("focusout", () => requestAnimationFrame(() => {
      if (!el.contains(document.activeElement))
        mode.set("idle");
    })),
    first(".description", gB("description")),
    first("input", ...standardInputEffects(el, input, el.querySelector(".error")?.id, el.querySelector(".description")?.id), pB("ariaExpanded", () => String(isExpanded())), PB("input", () => JB(() => {
      mode.set("editing");
      showPopup.set(true);
      filterText.set(input.value.trim().toLowerCase());
      el.length = input.value.length;
    }))),
    first(".clear", ...standardClearEffects(el)),
    first('[role="listbox"]', vB(isExpanded), PB("keyup", (e2) => {
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
    all('[role="option"]', pB("ariaSelected", (target) => String(target.textContent?.trim().toLowerCase() === el.value.toLowerCase())), vB((target) => target.textContent?.trim().toLowerCase().includes(filterText.get())), PB("click", (e2) => {
      commit(e2.target.textContent?.trim() || "");
    })),
    first(".error", gB("error"))
  ];
});

// docs-src/components/code-block/code-block.ts
var code_block_default = DB("code-block", {
  collapsed: TB
}, (el, { first }) => {
  const code = el.querySelector("code");
  return [
    iB("collapsed"),
    first(".overlay", PB("click", () => {
      el.collapsed = false;
    })),
    first(".copy", PB("click", async (e2) => {
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
var tab_group_default = DB("tab-group", {
  selected: ""
}, (el, { all, first }) => {
  const getAriaControls = (target) => target?.getAttribute("aria-controls") ?? "";
  const tabs = Array.from(el.querySelectorAll('[role="tab"]'));
  const focusIndex = o(tabs.findIndex((tab) => tab.ariaSelected === "true"));
  el.selected = getAriaControls(tabs[focusIndex.get()]);
  return [
    first('[role="tablist"]', manageFocusOnKeydown(tabs, focusIndex)),
    all('[role="tab"]', PB("click", (e2) => {
      el.selected = getAriaControls(e2.currentTarget);
      focusIndex.set(tabs.findIndex((tab) => tab === e2.currentTarget));
    }), pB("ariaSelected", (target) => String(el.selected === getAriaControls(target))), pB("tabIndex", (target) => el.selected === getAriaControls(target) ? 0 : -1)),
    all('[role="tabpanel"]', vB((target) => el.selected === target.id))
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
var lazy_load_default = DB("lazy-load", {
  src: asURL
}, (el, { first }) => {
  const error = o("");
  const content = k(async (abort) => {
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
    nB(content),
    first("callout-box", pB("hidden", () => !error.get() && content.get() !== Q), uB("danger", () => !error.get())),
    first(".error", gB(error))
  ];
});

// docs-src/functions/signal-producer/select-checked.ts
var selectChecked = (selector, checked) => (el) => CB(el, `${selector}${checked ? "[checked]" : ":not([checked])"}`);

// docs-src/components/todo-app/todo-app.ts
var todo_app_default = DB("todo-app", {
  active: selectChecked("input-checkbox", false),
  completed: selectChecked("input-checkbox", true)
}, (el, { first }) => {
  const input = el.querySelector("input-textbox");
  if (!input)
    throw new Error("No input field found");
  const template = el.querySelector("template");
  if (!template)
    throw new Error("No template found");
  const list = el.querySelector("ol");
  if (!list)
    throw new Error("No list found");
  const inputLength = OB(input, "length", 0);
  const filterValue = OB(el.querySelector("input-radiogroup"), "value", "all");
  return [
    first(".submit", pB("disabled", () => !inputLength())),
    first("form", PB("submit", (e2) => {
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
    first("ol", cB("filter", filterValue), PB("click", (e2) => {
      const target = e2.target;
      if (target.localName === "button")
        target.closest("li").remove();
    })),
    first(".count", gB(() => String(el.active.length))),
    first(".singular", vB(() => el.active.length === 1)),
    first(".plural", vB(() => el.active.length > 1)),
    first(".remaining", vB(() => !!el.active.length)),
    first(".all-done", vB(() => !el.active.length)),
    first(".clear-completed", pB("disabled", () => !el.completed.length), pB("badge", () => el.completed.length > 0 ? String(el.completed.length) : ""), PB("click", () => {
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
var product_catalog_default = DB("product-catalog", {
  total: sumValues("spin-button")
}, (el, { first }) => [
  first("input-button", MB({
    badge: () => el.total > 0 ? String(el.total) : "",
    disabled: () => !el.total
  }))
]);

// docs-src/components/spin-button/spin-button.ts
var spin_button_default = DB("spin-button", {
  value: SB()
}, (el, { all, first }) => {
  const zeroLabel = el.getAttribute("zero-label") || "Add to Cart";
  const incrementLabel = el.getAttribute("increment-label") || "Increment";
  const max = SB(9)(el, el.getAttribute("max"));
  const isZero = () => el.value === 0;
  return [
    first(".value", gB("value"), pB("hidden", isZero)),
    first(".decrement", pB("hidden", isZero), PB("click", () => {
      el.value--;
    })),
    first(".increment", gB(() => isZero() ? zeroLabel : "+"), pB("ariaLabel", () => isZero() ? zeroLabel : incrementLabel), pB("disabled", () => el.value >= max), PB("click", () => {
      el.value++;
    })),
    all("button", PB("keydown", (e2) => {
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
var rating_stars_default = DB("rating-stars", {
  value: SB()
}, (el, { all }) => {
  const getKey = (element) => parseInt(element.dataset["key"] || "0");
  return [
    all("input", pB("checked", (target) => el.value === getKey(target)), PB("change", (e2) => {
      e2.stopPropagation();
      const value = parseInt(e2.currentTarget?.value) + 1;
      el.value = value;
      UB("change-rating", value)(el);
    })),
    all(".label", gB((target) => getKey(target) <= el.value ? "\u2605" : "\u2606"))
  ];
});

// docs-src/components/rating-feedback/rating-feedback.ts
var rating_feedback_default = DB("rating-feedback", {}, (el, { all, first }) => {
  const rating = o(0);
  const empty = o(true);
  const submitted = o(false);
  const stars = el.querySelector("rating-stars");
  if (!stars)
    throw new Error("No rating-stars component found");
  const hasDifferentKey = (element) => rating.get() !== parseInt(element.dataset["key"] || "0");
  return [
    PB("change-rating", (e2) => {
      rating.set(e2.detail);
    }),
    PB("submit", (e2) => {
      e2.preventDefault();
      submitted.set(true);
      console.log("Feedback submitted");
    }),
    first(".hide", PB("click", () => {
      const feedback = el.querySelector(".feedback");
      if (feedback)
        feedback.hidden = true;
    })),
    first("textarea", PB("input", (e2) => {
      empty.set(e2.target?.value.trim() === "");
    })),
    first(".feedback", pB("hidden", () => submitted.get() || !rating.get())),
    all(".feedback p", pB("hidden", hasDifferentKey)),
    first("input-button", pB("disabled", empty))
  ];
});

// docs-src/components/calc-table/calc-table.ts
var calc_table_default = DB("calc-table", {
  columns: SB(),
  rows: SB()
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
    first("tbody", hB((target) => el.rows - target.querySelectorAll("tr").length, {
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
    first("thead tr", hB((target) => el.columns - (target.querySelectorAll("th").length - 1), {
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
    all("tbody tr", hB((target) => el.columns - target.querySelectorAll("td").length, {
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
    first("tfoot tr", hB((target) => el.columns - target.querySelectorAll("td").length, {
      position: "beforeend",
      create: (parent) => {
        const cell = document.createElement("td");
        const colKey = colHeads[parent.querySelectorAll("td").length];
        cell.dataset["key"] = colKey;
        return cell;
      }
    })),
    all("tbody input", PB("change", (e2) => {
      const colKey = e2.target?.dataset["key"];
      colSums.get(colKey)?.set(calcColumnSum(colKey));
    })),
    all("tfoot td", gB((target) => String(colSums.get(target.dataset["key"]).get())))
  ];
});

//# debugId=1AD6481D2EC1610D64756E2164756E21

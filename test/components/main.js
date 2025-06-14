// index.js
var Y = (B) => typeof B === "function";
var v = (B, W) => Object.prototype.toString.call(B) === `[object ${W}]`;
var m = (B) => B instanceof Error ? B : Error(String(B));

class E extends Error {
  constructor(B) {
    super(`Circular dependency in ${B} detected`);
    return this;
  }
}
var w;
var c = new Set;
var s = 0;
var l = new Map;
var u;
var JB = () => {
  u = undefined;
  let B = Array.from(l.values());
  l.clear();
  for (let W of B)
    W();
};
var FB = () => {
  if (u)
    cancelAnimationFrame(u);
  u = requestAnimationFrame(JB);
};
queueMicrotask(JB);
var h = (B) => {
  let W = new Set, $ = B;
  return $.off = (Z) => {
    W.add(Z);
  }, $.cleanup = () => {
    for (let Z of W)
      Z();
    W.clear();
  }, $;
};
var O = (B) => {
  if (w && !B.has(w)) {
    let W = w;
    B.add(W), w.off(() => {
      B.delete(W);
    });
  }
};
var U = (B) => {
  for (let W of B)
    if (s)
      c.add(W);
    else
      W();
};
var i = () => {
  while (c.size) {
    let B = Array.from(c);
    c.clear();
    for (let W of B)
      W();
  }
};
var KB = (B) => {
  s++;
  try {
    B();
  } finally {
    i(), s--;
  }
};
var g = (B, W) => {
  let $ = w;
  w = W;
  try {
    B();
  } finally {
    w = $;
  }
};
var T = (B, W) => new Promise(($, Z) => {
  l.set(W || Symbol(), () => {
    try {
      $(B());
    } catch (J) {
      Z(J);
    }
  }), FB();
});
var r = "State";
var o = (B) => {
  let W = new Set, $ = B, Z = { [Symbol.toStringTag]: r, get: () => {
    return O(W), $;
  }, set: (J) => {
    if (Object.is($, J))
      return;
    if ($ = J, U(W), z === $)
      W.clear();
  }, update: (J) => {
    Z.set(J($));
  } };
  return Z;
};
var M = (B) => v(B, r);
var b = "Computed";
var R = (B) => {
  let W = new Set, $ = z, Z, J, K = true, G = false, I = false, H = (A) => {
    if (!Object.is(A, $))
      $ = A, G = true;
    Z = undefined, K = false;
  }, X = () => {
    G = z !== $, $ = z, Z = undefined;
  }, Q = (A) => {
    let C = m(A);
    G = !Z || C.name !== Z.name || C.message !== Z.message, $ = z, Z = C;
  }, q = (A) => (C) => {
    if (I = false, J = undefined, A(C), G)
      U(W);
  }, F = h(() => {
    if (K = true, J?.abort("Aborted because source signal changed"), W.size)
      U(W);
    else
      F.cleanup();
  }), V = () => g(() => {
    if (I)
      throw new E("computed");
    if (G = false, Y(B) && B.constructor.name === "AsyncFunction") {
      if (J)
        return $;
      J = new AbortController, J.signal.addEventListener("abort", () => {
        I = false, J = undefined, V();
      }, { once: true });
    }
    let A;
    I = true;
    try {
      A = J ? B(J.signal) : B();
    } catch (C) {
      if (C instanceof DOMException && C.name === "AbortError")
        X();
      else
        Q(C);
      I = false;
      return;
    }
    if (A instanceof Promise)
      A.then(q(H), q(Q));
    else if (A == null || z === A)
      X();
    else
      H(A);
    I = false;
  }, F);
  return { [Symbol.toStringTag]: b, get: () => {
    if (O(W), i(), K)
      V();
    if (Z)
      throw Z;
    return $;
  } };
};
var f = (B) => v(B, b);
var t = (B) => Y(B) && B.length < 2;
var z = Symbol();
var _ = (B) => M(B) || f(B);
var D = (B) => _(B) ? B : t(B) ? R(B) : o(B);
function p(B) {
  let { signals: W, ok: $, err: Z = console.error, nil: J = () => {
  } } = Y(B) ? { signals: [], ok: B } : B, K = false, G = h(() => g(() => {
    if (K)
      throw new E("effect");
    K = true;
    let I = [], H = false, X = W.map((q) => {
      try {
        let F = q.get();
        if (F === z)
          H = true;
        return F;
      } catch (F) {
        return I.push(m(F)), z;
      }
    }), Q = undefined;
    try {
      Q = H ? J() : I.length ? Z(...I) : $(...X);
    } catch (q) {
      Q = Z(m(q));
    } finally {
      if (Y(Q))
        G.off(Q);
    }
    K = false;
  }, G));
  return G(), () => G.cleanup();
}
var P = false;
var d = "error";
var LB = (B) => B ? `#${B}` : "";
var CB = (B) => B.length ? `.${Array.from(B).join(".")}` : "";
var a = (B) => !!B && typeof B === "object";
var N = (B) => typeof B === "string";
var GB = (B) => B.nodeType === Node.ELEMENT_NODE;
var j = (B) => `<${B.localName}${LB(B.id)}${CB(B.classList)}>`;
var S = (B) => N(B) ? `"${B}"` : a(B) ? JSON.stringify(B) : String(B);
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
var x = (B, W, $ = "debug") => {
  if (["error", "warn"].includes($))
    console[$](W, B);
  return B;
};

class IB extends Error {
  constructor(B) {
    super(B);
    this.name = "CircularMutationError";
  }
}
var HB = (B) => B instanceof HTMLElement && B.localName.includes("-");
var UB = (B) => {
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
var MB = (B, W) => {
  if (B.length !== W.length)
    return false;
  let $ = new Set(B);
  for (let Z of W)
    if (!$.has(Z))
      return false;
  return true;
};
var e = (B, W, $) => {
  let Z = new MutationObserver($), J = UB(W), K = { childList: true, subtree: true };
  if (J.length)
    K.attributes = true, K.attributeFilter = J;
  return Z.observe(B, K), Z;
};
var BB = (B, W) => {
  let $ = new Set, Z = () => Array.from(B.querySelectorAll(W)), J = z, K, G = 0, I = 2, H = () => {
    J = Z(), K = e(B, W, () => {
      if (!$.size) {
        K?.disconnect(), K = undefined;
        return;
      }
      if (G++, G > I)
        throw K?.disconnect(), K = undefined, G = 0, new IB("Circular mutation in element selection detected");
      try {
        let Q = Z();
        if (!MB(J, Q))
          J = Q, U($);
      } finally {
        G--;
      }
    });
  };
  return { [Symbol.toStringTag]: b, get: () => {
    if (O($), !$.size)
      J = Z();
    else if (!K)
      H();
    return J;
  } };
};
var PB = (B) => (W) => BB(W, B);
var yB = (B, W, $) => (Z) => R(() => BB(Z, B).get().reduce(W, $));
var OB = (B, W, $ = false) => (Z, J = Z) => {
  if (!Y(W))
    throw new TypeError(`Invalid event listener provided for "${B} event on element ${j(J)}`);
  return J.addEventListener(B, W, $), () => J.removeEventListener(B, W);
};
var XB = (B, W, $, Z, J, K = false) => {
  let G = new Set, I = J, H, X = () => {
    let q = (F) => {
      let V = Z(B, W, F, I);
      if (!Object.is(V, I)) {
        if (I = V, G.size)
          U(G);
      }
    };
    W.addEventListener($, q, K), H = () => {
      W.removeEventListener($, q), H = undefined;
    };
  };
  return { [Symbol.toStringTag]: b, get: () => {
    if (O(G), !H)
      X();
    return I;
  } };
};
var RB = (B, W, $, Z) => (J) => {
  let K = J.querySelector(B);
  if (!K)
    throw new Error(`Element not found for selector "${B}" in ${J.localName || "component"}`);
  let G = Y(Z) ? Z(J, K) : Z;
  return XB(J, K, W, $, G);
};
var _B = (B, W) => ($, Z = $) => {
  Z.dispatchEvent(new CustomEvent(B, { detail: Y(W) ? W(Z) : W, bubbles: true }));
};
var DB = (B) => (W, $) => {
  if (!HB($))
    throw new TypeError("Target element must be a custom element");
  let Z = Y(B) ? B($) : B;
  if (!a(Z))
    throw new TypeError("Passed signals must be an object or a provider function");
  customElements.whenDefined($.localName).then(() => {
    for (let [J, K] of Object.entries(Z)) {
      let G = N(K) ? W.getSignal(J) : D(K);
      $.setSignal(J, G);
    }
  }).catch((J) => {
    throw new Error(`Failed to pass signals to ${j($)}`, { cause: J });
  });
};
var QB = (B, W, $) => {
  if (!B)
    return () => $;
  if (!HB(B))
    throw new TypeError("Target element must be a custom element");
  let Z = R(async () => {
    return await customElements.whenDefined(B.localName), B.getSignal(W);
  });
  return () => {
    let J = Z.get();
    return J === z ? $ : J.get();
  };
};
var k = Symbol();
var wB = new Set(["constructor", "prototype"]);
var TB = new Set(["id", "class", "className", "title", "role", "style", "dataset", "lang", "dir", "hidden", "children", "innerHTML", "outerHTML", "textContent", "innerText"]);
var $B = (B) => Y(B) && B.length >= 2;
var YB = (B) => {
  if (wB.has(B))
    return `Property name "${B}" is a reserved word`;
  if (TB.has(B))
    return `Property name "${B}" conflicts with inherited HTMLElement property`;
  return null;
};
var WB = (B, W, $ = W) => {
  let Z = B.filter(Y).map((J) => J(W, $));
  return () => {
    Z.filter(Y).forEach((J) => J()), Z.length = 0;
  };
};
var SB = () => ({ first: (B, ...W) => ($) => {
  let Z = ($.shadowRoot || $).querySelector(B);
  if (Z)
    WB(W, $, Z);
}, all: (B, ...W) => ($) => {
  let Z = new Map, J = $.shadowRoot || $, K = (X) => {
    if (!Z.has(X))
      Z.set(X, WB(W, $, X));
  }, G = (X) => {
    let Q = Z.get(X);
    if (Y(Q))
      Q();
    Z.delete(X);
  }, I = (X) => (Q) => {
    if (GB(Q)) {
      if (Q.matches(B))
        X(Q);
      Q.querySelectorAll(B).forEach(X);
    }
  }, H = e(J, B, (X) => {
    for (let Q of X)
      Q.addedNodes.forEach(I(K)), Q.removedNodes.forEach(I(G));
  });
  return J.querySelectorAll(B).forEach(K), () => {
    H.disconnect(), Z.forEach((X) => X()), Z.clear();
  };
} });
var kB = (B, W = {}, $) => {
  for (let J of Object.keys(W)) {
    let K = YB(J);
    if (K)
      throw new TypeError(`${K} in component "${B}".`);
  }

  class Z extends HTMLElement {
    debug;
    #B = {};
    #$;
    static observedAttributes = Object.entries(W)?.filter(([, J]) => $B(J)).map(([J]) => J) ?? [];
    constructor() {
      super();
      for (let [J, K] of Object.entries(W)) {
        if (K == null)
          continue;
        let G = $B(K) ? K(this, null) : Y(K) ? K(this) : K;
        if (G != null)
          this.setSignal(J, D(G));
      }
    }
    connectedCallback() {
      if (P) {
        if (this.debug = this.hasAttribute("debug"), this.debug)
          x(this, "Connected");
      }
      let J = $(this, SB());
      if (!Array.isArray(J))
        throw new TypeError(`Expected array of functions as return value of setup function in ${j(this)}`);
      this.#$ = WB(J, this);
    }
    disconnectedCallback() {
      if (Y(this.#$))
        this.#$();
      if (P && this.debug)
        x(this, "Disconnected");
    }
    attributeChangedCallback(J, K, G) {
      if (G === K || f(this.#B[J]))
        return;
      let I = W[J];
      if (!$B(I))
        return;
      let H = I(this, G, K);
      if (P && this.debug)
        x(G, `Attribute "${J}" of ${j(this)} changed from ${S(K)} to ${S(G)}, parsed as <${n(H)}> ${S(H)}`);
      this[J] = H;
    }
    getSignal(J) {
      let K = this.#B[J];
      if (P && this.debug)
        x(K, `Get ${n(K)} "${String(J)}" in ${j(this)}`);
      return K;
    }
    setSignal(J, K) {
      let G = YB(String(J));
      if (G)
        throw new TypeError(`${G} on ${j(this)}.`);
      if (!_(K))
        throw new TypeError(`Expected signal as value for property "${String(J)}" on ${j(this)}.`);
      let I = this.#B[J], H = M(K);
      if (this.#B[J] = K, Object.defineProperty(this, J, { get: K.get, set: H ? K.set : undefined, enumerable: true, configurable: H }), I && M(I))
        I.set(z);
      if (P && this.debug)
        x(K, `Set ${n(K)} "${String(J)} in ${j(this)}`);
    }
  }
  return customElements.define(B, Z), Z;
};
var ZB = "context-request";
var EB = (B) => (W) => {
  let $ = (Z) => {
    let { context: J, callback: K } = Z;
    if (B.includes(J) && Y(K))
      Z.stopPropagation(), K(W.getSignal(String(J)));
  };
  return W.addEventListener(ZB, $), () => W.removeEventListener(ZB, $);
};
var zB = (B, W) => {
  if (W == null)
    return;
  let $ = B(W);
  return Number.isFinite($) ? $ : undefined;
};
var fB = (B, W) => W !== "false" && W != null;
var dB = (B = 0) => (W, $) => {
  if ($ == null)
    return B;
  let Z = $.trim();
  if (Z === "")
    return B;
  if (Z.toLowerCase().startsWith("0x")) {
    let K = parseInt(Z, 16);
    return Number.isFinite(K) ? K : B;
  }
  let J = zB(parseFloat, $);
  return J != null ? Math.trunc(J) : B;
};
var hB = (B = "") => (W, $) => $ ?? B;
var AB = (B, W, $) => N(B) ? W.getSignal(B).get() : _(B) ? B.get() : Y(B) ? B($) : k;
var vB = (B) => {
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
var cB = (B, W, $) => {
  if (/^on/i.test(W))
    throw new Error(`Unsafe attribute: ${W}`);
  if ($ = String($).trim(), !vB($))
    throw new Error(`Unsafe URL for ${W}: ${$}`);
  B.setAttribute(W, $);
};
var y = (B, W) => ($, Z) => {
  let { op: J, name: K = "", read: G, update: I } = W, H = G(Z), X = { a: "attribute ", c: "class ", h: "inner HTML", p: "property ", s: "style property ", t: "text content" };
  if (N(B) && N(H) && $[B] === k)
    $.attributeChangedCallback(B, null, H);
  let Q = (F) => () => {
    if (P && $.debug)
      x(Z, `${F} ${X[J] + K} of ${j(Z)} in ${j($)}`);
    W.resolve?.(Z);
  }, q = (F) => (V) => {
    x(V, `Failed to ${F} ${X[J] + K} of ${j(Z)} in ${j($)}`, d), W.reject?.(V);
  };
  return p(() => {
    let F = Symbol(`${J}:${K}`), V = Symbol(`${J}-${K}`), L = k;
    try {
      L = AB(B, $, Z);
    } catch (A) {
      x(A, `Failed to resolve value of ${S(B)} for ${X[J] + K} of ${j(Z)} in ${j($)}`, d);
      return;
    }
    if (L === k)
      L = H;
    else if (L === z)
      L = W.delete ? null : H;
    if (W.delete && L === null)
      T(() => {
        return W.delete(Z), true;
      }, V).then(Q("Deleted")).catch(q("delete"));
    else if (L != null) {
      let A = G(Z);
      if (Object.is(L, A))
        return;
      T(() => {
        return I(Z, L), true;
      }, F).then(Q("Updated")).catch(q("update"));
    }
  });
};
var uB = (B, W) => ($, Z) => {
  let J = (G) => () => {
    if (P && $.debug)
      x(Z, `${G} element in ${j(Z)} in ${j($)}`);
    if (Y(W?.resolve))
      W.resolve(Z);
    else {
      let I = _(B) ? B : N(B) ? $.getSignal(B) : undefined;
      if (M(I))
        I.set(0);
    }
  }, K = (G) => (I) => {
    x(I, `Failed to ${G} element in ${j(Z)} in ${j($)}`, d), W?.reject?.(I);
  };
  return p(() => {
    let G = Symbol("i"), I = Symbol("d"), H = 0;
    try {
      H = AB(B, $, Z);
    } catch (X) {
      x(X, `Failed to resolve value of ${S(B)} for insertion or deletion in ${j(Z)} in ${j($)}`, d);
      return;
    }
    if (H === k)
      H = 0;
    if (H > 0) {
      if (!W)
        throw new TypeError("No inserter provided");
      T(() => {
        for (let X = 0;X < H; X++) {
          let Q = W.create(Z);
          if (!Q)
            continue;
          Z.insertAdjacentElement(W.position ?? "beforeend", Q);
        }
        return true;
      }, G).then(J("Inserted")).catch(K("insert"));
    } else if (H < 0)
      T(() => {
        if (W && (W.position === "afterbegin" || W.position === "beforeend"))
          for (let X = 0;X > H; X--)
            if (W.position === "afterbegin")
              Z.firstElementChild?.remove();
            else
              Z.lastElementChild?.remove();
        else
          Z.remove();
        return true;
      }, I).then(J("Removed")).catch(K("remove"));
  });
};
var iB = (B) => y(B, { op: "t", read: (W) => W.textContent, update: (W, $) => {
  Array.from(W.childNodes).filter((Z) => Z.nodeType !== Node.COMMENT_NODE).forEach((Z) => Z.remove()), W.append(document.createTextNode($));
} });
var oB = (B, W = B) => y(W, { op: "p", name: String(B), read: ($) => (B in $) ? $[B] : z, update: ($, Z) => {
  $[B] = Z;
} });
var nB = (B) => y(B, { op: "p", name: "hidden", read: (W) => !W.hidden, update: (W, $) => {
  W.hidden = !$;
} });
var sB = (B, W = B) => y(W, { op: "a", name: B, read: ($) => $.getAttribute(B), update: ($, Z) => {
  cB($, B, Z);
}, delete: ($) => {
  $.removeAttribute(B);
} });
var lB = (B, W = B) => y(W, { op: "a", name: B, read: ($) => $.hasAttribute(B), update: ($, Z) => {
  $.toggleAttribute(B, Z);
} });
var rB = (B, W = B) => y(W, { op: "c", name: B, read: ($) => $.classList.contains(B), update: ($, Z) => {
  $.classList.toggle(B, Z);
} });
var aB = (B, W = {}) => y(B, { op: "h", read: ($) => ($.shadowRoot || !W.shadowRootMode ? $ : null)?.innerHTML ?? "", update: ($, Z) => {
  let { shadowRootMode: J, allowScripts: K } = W;
  if (!Z) {
    if ($.shadowRoot)
      $.shadowRoot.innerHTML = "<slot></slot>";
    return "";
  }
  if (J && !$.shadowRoot)
    $.attachShadow({ mode: J });
  let G = $.shadowRoot || $;
  if (G.innerHTML = Z, !K)
    return "";
  return G.querySelectorAll("script").forEach((I) => {
    let H = document.createElement("script");
    H.appendChild(document.createTextNode(I.textContent ?? "")), G.appendChild(H), I.remove();
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
var client_router_default = kB("client-router", {}, (el, { all, first }) => {
  const outlet = el.getAttribute("outlet") ?? "main";
  const pathname = o(window.location.pathname);
  const error = o("");
  const hasError = () => !error.get();
  const content = R(async (abort) => {
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
    all("a[href]", rB("active", (target) => {
      const href = target.getAttribute("href");
      if (!href)
        return false;
      try {
        return pathname.get() === new URL(href, window.location.href).pathname;
      } catch {
        return false;
      }
    }), OB("click", (e2) => {
      if (!(e2.target instanceof HTMLAnchorElement))
        return;
      const url = new URL(e2.target.href);
      if (url.origin === window.location.origin) {
        e2.preventDefault();
        pathname.set(url.pathname);
      }
    })),
    first(outlet, aB(content, { allowScripts: true })),
    first("callout-box", oB("hidden", hasError), rB("danger", hasError)),
    first(".error", iB(error)),
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
var media_context_default = kB("media-context", {
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
  EB([MEDIA_MOTION, MEDIA_THEME, MEDIA_VIEWPORT, MEDIA_ORIENTATION])
]);

// docs-src/components/hello-world/hello-world.ts
var hello_world_default = kB("hello-world", {
  name: k
}, (el, { first }) => [
  first("span", iB("name")),
  first("input", OB("input", (e2) => {
    el.name = e2.target?.value || k;
  }))
]);

// docs-src/components/my-counter/my-counter.ts
var my_counter_default = kB("my-counter", {
  count: dB()
}, (el, { first }) => [
  first(".count", iB("count")),
  first(".parity", iB(() => el.count % 2 ? "odd" : "even")),
  first(".increment", OB("click", () => {
    el.count++;
  })),
  first(".decrement", OB("click", () => {
    el.count--;
  }))
]);

// docs-src/components/my-carousel/my-carousel.ts
var my_carousel_default = kB("my-carousel", {}, (el, { all, first }) => {
  const currentIndex = o(0);
  const slides = Array.from(el.querySelectorAll('[role="tabpanel"]'));
  const total = slides.length;
  const updateIndex = (direction) => {
    currentIndex.update((v2) => (v2 + direction + total) % total);
  };
  return [
    first("nav", OB("keyup", (e2) => {
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
    }), first(".prev", OB("click", () => {
      updateIndex(-1);
    })), first(".next", OB("click", () => {
      updateIndex(1);
    })), all('[role="tab"]', oB("ariaSelected", (target) => String(target.dataset["index"] === String(currentIndex.get()))), oB("tabIndex", (target) => target.dataset["index"] === String(currentIndex.get()) ? 0 : -1), OB("click", (e2) => {
      const rawIndex = e2.target?.dataset["index"];
      const nextIndex = rawIndex ? parseInt(rawIndex) : 0;
      currentIndex.set(Number.isInteger(nextIndex) ? nextIndex : 0);
    }))),
    all('[role="tabpanel"]', oB("ariaCurrent", (target) => String(target.id === slides[currentIndex.get()].id)))
  ];
});

// docs-src/components/input-button/input-button.ts
var input_button_default = kB("input-button", {
  disabled: fB,
  label: hB(k),
  badge: hB(k)
}, (_2, { first }) => [
  first("button", oB("disabled")),
  first(".label", iB("label")),
  first(".badge", iB("badge"))
]);

// docs-src/components/input-checkbox/input-checkbox.ts
var input_checkbox_default = kB("input-checkbox", {
  checked: fB,
  label: hB(k)
}, (el, { first }) => [
  lB("checked"),
  first("input", oB("checked"), OB("change", (e2) => {
    el.checked = e2.target?.checked;
  })),
  first(".label", iB("label"))
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
var manageFocusOnKeydown = (elements, index) => OB("keydown", (e2) => {
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
var input_radiogroup_default = kB("input-radiogroup", {
  value: hB()
}, (el, { all }) => {
  const inputs = Array.from(el.querySelectorAll("input"));
  const focusIndex = o(inputs.findIndex((input) => input.checked));
  return [
    sB("value"),
    manageFocusOnKeydown(inputs, focusIndex),
    all("input", OB("change", (e2) => {
      const input = e2.target;
      el.value = input.value;
      focusIndex.set(inputs.findIndex((input2) => input2.checked));
    }), OB("keyup", (e2) => {
      if (e2.key === "Enter" && e2.target)
        e2.target.click();
    }), oB("tabIndex", (target) => target.value === el.value ? 0 : -1)),
    all("label", rB("selected", (target) => el.value === target.querySelector("input")?.value))
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
var input_field_default = kB("input-field", {
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
      _B("value-change", value)(el);
  };
  fns.push(first("input", oB("value", () => String(el.value)), OB("change", () => {
    triggerChange(typeNumber ? input.valueAsNumber ?? 0 : input.value ?? "");
  }), OB("input", () => {
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
    fns.push(first("input", OB("keydown", (e2) => {
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
      fns.push(first(".decrement", OB("click", (e2) => {
        const n2 = e2.shiftKey ? step * 10 : step;
        const newValue = nearestStep(input.valueAsNumber - n2);
        input.value = String(newValue);
        triggerChange(newValue);
      }), oB("disabled", () => (isNumber(min) ? el.value : 0) - step < min)), first(".increment", OB("click", (e2) => {
        const n2 = e2.shiftKey ? step * 10 : step;
        const newValue = nearestStep(input.valueAsNumber + n2);
        input.value = String(newValue);
        triggerChange(newValue);
      }), oB("disabled", () => (isNumber(max) ? el.value : 0) + step > max)));
    }
  } else {
    fns.push(first(".clear", OB("click", () => {
      el.clear();
      triggerChange("");
    }), oB("hidden", () => !el.length)));
  }
  const errorId = el.querySelector(".error")?.id;
  fns.push(first(".error", iB("error")), first("input", oB("ariaInvalid", () => el.error ? "true" : "false"), sB("aria-errormessage", () => el.error && errorId ? errorId : z)));
  const description = el.querySelector(".description");
  if (description) {
    const maxLength = input.maxLength;
    const remainingMessage = maxLength && description.dataset.remaining;
    if (remainingMessage) {
      el.setSignal("description", R(() => remainingMessage.replace("${x}", String(maxLength - el.length))));
    }
    fns.push(first(".description", iB("description")), first("input", sB("aria-describedby", () => el.description && description.id ? description.id : z)));
  }
  return fns;
});

// docs-src/components/input-textbox/input-textbox.ts
var input_textbox_default = kB("input-textbox", {
  value: RB("input, textarea", "change", (el, source) => {
    source.checkValidity();
    el.error = source.validationMessage;
    return source.value;
  }, ""),
  length: RB("input, textarea", "input", (_2, source) => source.value.length, 0),
  error: k,
  description: k,
  clear() {
  }
}, (el, { first }) => {
  const input = el.querySelector("input, textarea");
  if (!input)
    throw new Error("No Input or textarea element found");
  el.clear = () => {
    input.value = "";
    input.dispatchEvent(new Event("change"));
  };
  const description = el.querySelector(".description");
  if (description?.dataset.remaining && input.maxLength) {
    el.setSignal("description", R(() => description.dataset.remaining.replace("${n}", String(input.maxLength - el.length))));
  }
  const errorId = el.querySelector(".error")?.id;
  return [
    sB("value"),
    first(".error", iB("error")),
    first(".description", iB("description")),
    first("input, textarea", oB("ariaInvalid", () => String(!!el.error)), sB("aria-errormessage", () => el.error && errorId ? errorId : z), sB("aria-describedby", () => el.description && description?.id ? description.id : z)),
    first(".clear", nB(() => !!el.length), OB("click", () => el.clear()))
  ];
});

// docs-src/functions/shared/clear-input.ts
var createClearFunction = (input) => () => {
  input.value = "";
  input.setCustomValidity("");
  input.checkValidity();
};
var standardClearEffects = (host) => [
  nB(() => !!host.length),
  OB("click", () => host.clear())
];

// docs-src/functions/shared/input-effects.ts
var standardInputEffects = (host, input, errorId, descriptionId) => [
  oB("ariaInvalid", () => String(!!host.error)),
  sB("aria-errormessage", () => host.error && errorId ? errorId : z),
  sB("aria-describedby", () => host.description && descriptionId ? descriptionId : z),
  OB("change", () => KB(() => {
    host.value = input.value;
    host.error = input.validationMessage ?? "";
  }))
];

// docs-src/components/input-combobox/input-combobox.ts
var input_combobox_default = kB("input-combobox", {
  value: hB(),
  length: 0,
  error: k,
  description: k,
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
  const options = BB(el, '[role="option"]:not([hidden])');
  const isExpanded = () => mode.get() === "editing" && showPopup.get();
  const commit = (value) => {
    input.value = value;
    KB(() => {
      mode.set("selected");
      el.value = value;
      el.length = value.length;
      el.error = input.validationMessage ?? "";
      filterText.set(value.toLowerCase());
      focusIndex.set(-1);
      showPopup.set(input.required && !input.value || false);
    });
  };
  el.clear = createClearFunction(input);
  return [
    sB("value"),
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
    OB("keydown", (e2) => {
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
    OB("keyup", (e2) => {
      if (e2.key === "Delete") {
        e2.preventDefault();
        e2.stopPropagation();
        commit("");
      }
    }),
    OB("focusout", () => requestAnimationFrame(() => {
      if (!el.contains(document.activeElement))
        mode.set("idle");
    })),
    first(".error", iB("error")),
    first(".description", iB("description")),
    first("input", ...standardInputEffects(el, input, el.querySelector(".error")?.id, el.querySelector(".description")?.id), oB("ariaExpanded", () => String(isExpanded())), OB("input", () => KB(() => {
      mode.set("editing");
      showPopup.set(true);
      filterText.set(input.value.trim().toLowerCase());
      el.length = input.value.length;
    }))),
    first(".clear", ...standardClearEffects(el)),
    first('[role="listbox"]', nB(isExpanded), OB("keyup", (e2) => {
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
    all('[role="option"]', oB("ariaSelected", (target) => String(target.textContent?.trim().toLowerCase() === el.value.toLowerCase())), nB((target) => target.textContent?.trim().toLowerCase().includes(filterText.get())), OB("click", (e2) => {
      commit(e2.target.textContent?.trim() || "");
    }))
  ];
});

// docs-src/components/code-block/code-block.ts
var code_block_default = kB("code-block", {
  collapsed: fB
}, (el, { first }) => {
  const code = el.querySelector("code");
  return [
    lB("collapsed"),
    first(".overlay", OB("click", () => {
      el.collapsed = false;
    })),
    first(".copy", OB("click", async (e2) => {
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
var tab_group_default = kB("tab-group", {
  selected: ""
}, (el, { all, first }) => {
  const getAriaControls = (target) => target?.getAttribute("aria-controls") ?? "";
  const tabs = Array.from(el.querySelectorAll('[role="tab"]'));
  const focusIndex = o(tabs.findIndex((tab) => tab.ariaSelected === "true"));
  el.selected = getAriaControls(tabs[focusIndex.get()]);
  return [
    first('[role="tablist"]', manageFocusOnKeydown(tabs, focusIndex)),
    all('[role="tab"]', OB("click", (e2) => {
      el.selected = getAriaControls(e2.currentTarget);
      focusIndex.set(tabs.findIndex((tab) => tab === e2.currentTarget));
    }), oB("ariaSelected", (target) => String(el.selected === getAriaControls(target))), oB("tabIndex", (target) => el.selected === getAriaControls(target) ? 0 : -1)),
    all('[role="tabpanel"]', nB((target) => el.selected === target.id))
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
var lazy_load_default = kB("lazy-load", {
  src: asURL
}, (el, { first }) => {
  const error = o("");
  const content = R(async (abort) => {
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
    aB(content),
    first("callout-box", oB("hidden", () => !error.get() && content.get() !== z), rB("danger", () => !error.get())),
    first(".error", iB(error))
  ];
});

// docs-src/components/todo-app/todo-app.ts
var todo_app_default = kB("todo-app", {
  active: PB("input-checkbox:not([checked])"),
  completed: PB("input-checkbox[checked]")
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
  const inputLength = QB(input, "length", 0);
  const filterValue = QB(el.querySelector("input-radiogroup"), "value", "all");
  return [
    first(".submit", oB("disabled", () => !inputLength())),
    first("form", OB("submit", (e2) => {
      e2.preventDefault();
      queueMicrotask(() => {
        const value = input.value.toString().trim();
        if (!value)
          return;
        const li = document.importNode(template.content, true).firstElementChild;
        if (!(li instanceof HTMLLIElement))
          throw new Error("Invalid template for list item; expected <li>");
        li.querySelector("slot")?.replaceWith(String(input.value.trim()));
        list.append(li);
        input.clear();
      });
    })),
    first("ol", sB("filter", filterValue), OB("click", (e2) => {
      const target = e2.target;
      if (target.localName === "button")
        target.closest("li").remove();
    })),
    first(".count", iB(() => String(el.active.length))),
    first(".singular", nB(() => el.active.length === 1)),
    first(".plural", nB(() => el.active.length > 1)),
    first(".remaining", nB(() => !!el.active.length)),
    first(".all-done", nB(() => !el.active.length)),
    first(".clear-completed", oB("disabled", () => !el.completed.length), oB("badge", () => el.completed.length > 0 ? String(el.completed.length) : ""), OB("click", () => {
      const items = Array.from(el.querySelectorAll("ol li"));
      for (let i2 = items.length - 1;i2 >= 0; i2--) {
        const task = items[i2].querySelector("input-checkbox");
        if (task?.checked)
          items[i2].remove();
      }
    }))
  ];
});

// docs-src/components/product-catalog/product-catalog.ts
var product_catalog_default = kB("product-catalog", {
  total: yB("spin-button", (sum, item) => sum + item.value, 0)
}, (el, { first }) => [
  first("input-button", DB({
    badge: () => el.total > 0 ? String(el.total) : "",
    disabled: () => !el.total
  }))
]);

// docs-src/components/spin-button/spin-button.ts
var spin_button_default = kB("spin-button", {
  value: dB()
}, (el, { all, first }) => {
  const zeroLabel = el.getAttribute("zero-label") || "Add to Cart";
  const incrementLabel = el.getAttribute("increment-label") || "Increment";
  const max = dB(9)(el, el.getAttribute("max"));
  const isZero = () => el.value === 0;
  return [
    first(".value", iB("value"), oB("hidden", isZero)),
    first(".decrement", oB("hidden", isZero), OB("click", () => {
      el.value--;
    })),
    first(".increment", iB(() => isZero() ? zeroLabel : "+"), oB("ariaLabel", () => isZero() ? zeroLabel : incrementLabel), oB("disabled", () => el.value >= max), OB("click", () => {
      el.value++;
    })),
    all("button", OB("keydown", (e2) => {
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
var rating_stars_default = kB("rating-stars", {
  value: dB()
}, (el, { all }) => {
  const getKey = (element) => parseInt(element.dataset["key"] || "0");
  return [
    all("input", oB("checked", (target) => el.value === getKey(target)), OB("change", (e2) => {
      e2.stopPropagation();
      const value = parseInt(e2.currentTarget?.value) + 1;
      el.value = value;
      _B("change-rating", value)(el);
    })),
    all(".label", iB((target) => getKey(target) <= el.value ? "\u2605" : "\u2606"))
  ];
});

// docs-src/components/rating-feedback/rating-feedback.ts
var rating_feedback_default = kB("rating-feedback", {}, (el, { all, first }) => {
  const rating = o(0);
  const empty = o(true);
  const submitted = o(false);
  const stars = el.querySelector("rating-stars");
  if (!stars)
    throw new Error("No rating-stars component found");
  const hasDifferentKey = (element) => rating.get() !== parseInt(element.dataset["key"] || "0");
  return [
    OB("change-rating", (e2) => {
      rating.set(e2.detail);
    }),
    OB("submit", (e2) => {
      e2.preventDefault();
      submitted.set(true);
      console.log("Feedback submitted");
    }),
    first(".hide", OB("click", () => {
      const feedback = el.querySelector(".feedback");
      if (feedback)
        feedback.hidden = true;
    })),
    first("textarea", OB("input", (e2) => {
      empty.set(e2.target?.value.trim() === "");
    })),
    first(".feedback", oB("hidden", () => submitted.get() || !rating.get())),
    all(".feedback p", oB("hidden", hasDifferentKey)),
    first("input-button", oB("disabled", empty))
  ];
});

// docs-src/components/calc-table/calc-table.ts
var calc_table_default = kB("calc-table", {
  columns: dB(),
  rows: dB()
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
    oB("rows", () => el.querySelector(".rows spin-button")?.value),
    oB("columns", () => el.querySelector(".columns spin-button")?.value),
    first("tbody", uB((target) => el.rows - target.querySelectorAll("tr").length, {
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
    first("thead tr", uB((target) => el.columns - (target.querySelectorAll("th").length - 1), {
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
    all("tbody tr", uB((target) => el.columns - target.querySelectorAll("td").length, {
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
    first("tfoot tr", uB((target) => el.columns - target.querySelectorAll("td").length, {
      position: "beforeend",
      create: (parent) => {
        const cell = document.createElement("td");
        const colKey = colHeads[parent.querySelectorAll("td").length];
        cell.dataset["key"] = colKey;
        return cell;
      }
    })),
    all("tbody input", OB("change", (e2) => {
      const colKey = e2.target?.dataset["key"];
      colSums.get(colKey)?.set(calcColumnSum(colKey));
    })),
    all("tfoot td", iB((target) => String(colSums.get(target.dataset["key"]).get())))
  ];
});

//# debugId=D67188CF369AA9C964756E2164756E21

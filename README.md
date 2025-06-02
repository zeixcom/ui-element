# UIElement

Version 0.13.0

**UIElement** - the HTML-first microframework bringing reactivity to Web Components.

UIElement is a set of functions to build reusable, loosely coupled Web Components with reactive properties. It provides structure through components and simplifies state management and DOM synchronization using declarative signals and effects, leading to more organized and maintainable code without a steep learning curve.

Unlike SPA frameworks (React, Vue, Svelte, etc.) UIElement takes a HTML-first approach, progressively enhancing sever-rendered HTML rather than recreating (rendering) it using JavaScript. UIElement achieves the same result as SPA frameworks with SSR, but with a simpler, more efficient approach. It works with a backend written in any language or with any static site generator.

## Key Features

* 🧱 **HTML Web Components**: Build on standard HTML and enhance it with encapsulated, reusable Web Components. No virtual DOM – UIElement works directly with the real DOM.
* 🚦 **Reactive Properties**: Define reactive properties for fine-grained, efficient state management (signals). Changes automatically propagate only to the parts of the DOM that need updating, avoiding unnecessary re-renders.
* 🧩 **Function Composition**: Declare component behavior by composing small, reusable functions (attribute parsers and effects). This promotes cleaner code compared to spaghetti code problems that commonly occur when writing low-level imperative code.
* 🛠️ **Customizable**: UIElement is designed to be easily customizable and extensible. You can create your own custom attribute parsers and effects to suit your specific needs.
* 🌐 **Context Support**: Share global states across components without prop drilling or tightly coupling logic.
* 🪶 **Tiny footprint**: Minimal core (~4kB gzipped) with tree-shaking support, adding only the necessary JavaScript to enhance your HTML.
* 🛡️ **Type Safety**: Get early warnings when types don't match, improving code quality and reducing bugs.

UIElement uses [Cause & Effect](https://github.com/zeixcom/cause-effect) internally for state management with signals and for scheduled DOM updates. But you could easily rewrite the `component()` function to use a signals library of your choice or to produce something else than Web Components.

## Installation

```bash
# with npm
npm install @zeix/ui-element

# or with bun
bun add @zeix/ui-element
```

## Documentation

The full documentation is still work in progress. The following chapters are already reasonably complete:

* [Introduction](https://zeixcom.github.io/ui-element/index.html)
* [Getting Started](https://zeixcom.github.io/ui-element/getting-started.html)
* [Building Components](https://zeixcom.github.io/ui-element/building-components.html)
* [Styling Components](https://zeixcom.github.io/ui-element/styling-components.html)
* [Data Flow](https://zeixcom.github.io/ui-element/data-flow.html)
* [About & Community](https://zeixcom.github.io/ui-element/about-community.html)

## Basic Usage

### Show Appreciation

Server-rendered markup:

```html
<show-appreciation aria-label="Show appreciation">
    <button type="button">
        <span class="emoji">💐</span>
        <span class="count">5</span>
    </button>
</show-appreciation>
```

UIElement component:

```js
import { asInteger, component, on, RESET, setText } from "@zeix/ui-element";

component("show-appreciation", {
    count: asInteger(RESET) // Get initial value from .count element
}, (el, { first }) => [

    // Update count display when state changes
    first(".count", setText("count")),

    // Handle click events to change state
    first("button", on("click", () => { el.count++ }))
]);
```

Example styles:

```css
show-appreciation {
    display: inline-block;

    & button {
        display: flex;
        flex-direction: row;
        gap: var(--space-s);
        border: 1px solid var(--color-border);
        border-radius: var(--space-xs);
        background-color: var(--color-secondary);
        color: var(--color-text);
        padding: var(--space-xs) var(--space-s);
        cursor: pointer;
        font-size: var(--font-size-m);
        line-height: var(--line-height-xs);
        transition: transform var(--transition-short) var(--easing-inout);

        &:hover {
            background-color: var(--color-secondary-hover);
        }

        &:active {
            background-color: var(--color-secondary-active);

            .emoji {
                transform: scale(1.1);
            }
        }
    }
}
```

### Tab Group

An example demonstrating how to create a fully accessible tab navigation.

Server-rendered markup:

```html
<tab-group>
    <div role="tablist">
        <button
            type="button"
            role="tab"
            id="trigger1"
            aria-controls="panel1"
            aria-selected="true"
            tabindex="0"
        >
            Tab 1
        </button>
        <button
            type="button"
            role="tab"
            id="trigger2"
            aria-controls="panel2"
            aria-selected="false"
            tabindex="-1"
        >
            Tab 2
        </button>
        <button
            type="button"
            role="tab"
            id="trigger3"
            aria-controls="panel3"
            aria-selected="false"
            tabindex="-1"
        >
            Tab 3
        </button>
    </div>
    <div role="tabpanel" id="panel1" aria-labelledby="trigger1">
        Tab 1 content
    </div>
    <div role="tabpanel" id="panel2" aria-labelledby="trigger2" hidden>
        Tab 2 content
    </div>
    <div role="tabpanel" id="panel3" aria-labelledby="trigger3" hidden>
        Tab 3 content
    </div>
</tab-group>
```

UIElement component:

```js
import { component, on, setProperty } from "@zeix/ui-element"

// Function to create event handler for arrow key focus management
const manageArrowKeyFocus = (elements, index) => e => {
    if (!(e instanceof KeyboardEvent))
        throw new TypeError("Event is not a KeyboardEvent")
    const handledKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]
    if (handledKeys.includes(e.key)) {
        e.preventDefault()
        switch (e.key) {
            case "ArrowLeft":
            case "ArrowUp":
                index = index < 1 ? elements.length - 1 : index - 1
                break
            case "ArrowRight":
            case "ArrowDown":
                index = index >= elements.length - 1 ? 0 : index + 1
                break
            case "Home":
                index = 0
                break
            case "End":
                index = elements.length - 1
                break
        }
        if (elements[index]) elements[index].focus()
    }
}

// Component
component("tab-group", {
    selected: ""
}, (el, { all, first }) => {
    el.selected = el.querySelector("[role=tab][aria-selected=true]")?.getAttribute("aria-controls") ?? "";
    const isSelected = target =>
        el.selected === target.getAttribute("aria-controls");
    const tabs = Array.from(el.querySelectorAll("[role=tab]"));
    let focusIndex = 0;

    return [
        first("[role=tablist]",
            on("keydown", manageArrowKeyFocus(tabs, focusIndex)),
        ),
        all("[role=tab]",
            on("click", e => {
                el.selected = e.currentTarget.getAttribute("aria-controls") ?? "";
                focusIndex = tabs.findIndex(tab => isSelected(tab));
            }),
            setProperty("ariaSelected", target => String(isSelected(target))),
            setProperty("tabIndex", target => isSelected(target) ? 0 : -1),
        ),
        all("[role=tabpanel]",
            setProperty("hidden", target => el.selected !== target.id),
        )
    ];
});
```

Example styles:

```css
tab-group {
    display: block;
    margin-bottom: var(--space-l);

    > [role="tablist"] {
        display: flex;
        border-bottom: 1px solid var(--color-gray-50);
        padding: 0;
        margin-bottom: 0;

        & button {
            border: 0;
            border-top: 2px solid transparent;
            border-bottom-width: 0;
            font-family: var(--font-family-sans);
            font-size: var(--font-size-s);
            font-weight: var(--font-weight-bold);
            padding: var(--space-s) var(--space-m);
            color: var(--color-text-soft);
            background-color: var(--color-secondary);
            cursor: pointer;
            transition: all var(--transition-short) var(--easing-inout);

            &:hover,
            &:focus {
                color: var(--color-text);
                background-color: var(--color-secondary-hover);
            }

            &:active {
                color: var(--color-text);
                background-color: var(--color-secondary-active);
            }

            &[aria-selected="true"] {
                color: var(--color-primary-active);
                border-top: 3px solid var(--color-primary);
                background-color: var(--color-background);
                margin-bottom: -1px;
            }
        }
    }

    > [role="tabpanel"] {
        font-family: sans-serif;
        font-size: var(--font-size-m);
        background: var(--color-background);
        margin-block: var(--space-l);
    }
}
```

### Lazy Load

An example demonstrating how to use a custom attribute parser (sanitize an URL) and a signal producer (async fetch) to implement lazy loading.

```html
<lazy-load src="/lazy-load/snippet.html">
    <div class="loading" role="status">Loading...</div>
    <div class="error" role="alert" aria-live="polite"></div>
</lazy-load>
```

```js
import { component, dangerouslySetInnerHTML, setProperty, setText } from "@zeix/ui-element";

// Attribute Parser uses current element to detect recursion and set error message
const asURL = (el, v) => {
    let value = "";
    let error = "";
    if (!v) {
        error = "No URL provided in src attribute";
    } else if (
        (el.parentElement || (el.getRootNode() as ShadowRoot).host)?.closest(
            `${el.localName}[src="${v}"]`,
        )
    ) {
        error = "Recursive loading detected";
    } else {
        const url = new URL(v, location.href); // Ensure "src" attribute is a valid URL
        if (url.origin === location.origin)
            value = String(url); // Sanity check for cross-origin URLs
        else error = "Invalid URL origin";
    }
    el.error = error;
    return value;
};

// Signal Producer fetches inner HTML
const fetchText = el => async abort => {
    // Async Computed callback
    const url = el.src;
    if (!url) return "";
    try {
        const response = await fetch(url, { signal: abort });
        el.querySelector(".loading")?.remove();
        if (response.ok) return response.text();
        else el.error = response.statusText;
    } catch (error) {
        el.error = error.message;
    }
    return "";
};

// Component
component("lazy-load", {
    error: "",
    src: asURL,
    content: fetchText,
}, (el, { first }) => [
    dangerouslySetInnerHTML("content"),
    first(".error",
        setText("error"),
        setProperty("hidden", () => !el.error),
    ),
]);
```

## Contributing & License

Feel free to contribute, report issues, or suggest improvements.

License: [MIT](LICENSE)

(c) 2025 [Zeix AG](https://zeix.com)

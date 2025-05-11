# UIElement

Version 0.12.1

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
import { asInteger, component, first, on, RESET, setText } from '@zeix/ui-element'

component('show-appreciation', {
    count: asInteger(RESET) // Get initial value from .count element
}, el => [

	// Update count display when state changes
    first('.count', setText('count')),

    // Handle click events to change state
    first('button', on('click', () => { el.count++ }))
])
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

### Tab List or Accordion

An example demonstrating how to use just semantic HTML to compose a component that can be either a tab list or an accordion. Add `accordion` attribute or set its `accordion` property to `true` from a parent component to make it an accordion.

Server-rendered markup:

```html
<tab-list>
    <menu>
        <li><button type="button" aria-pressed="true">Tab 1</button></li>
        <li><button type="button">Tab 2</button></li>
        <li><button type="button">Tab 3</button></li>
    </menu>
    <details open>
        <summary>Tab 1</summary>
        <p>Content of tab panel 1</p>
    </details>
    <details>
        <summary>Tab 2</summary>
        <p>Content of tab panel 2</p>
    </details>
    <details>
        <summary>Tab 3</summary>
        <p>Content of tab panel 3</p>
    </details>
</tab-list>
```

UIElement component:

```js
import { asBoolean, component, all, on, setAttribute, setProperty, toggleAttribute, toggleClass } from '@zeix/ui-element'

component('tab-list', {
	active: 0,
	accordion: asBoolean,
}, el => {
	// Set inital active tab by querying details[open]
	const panels = Array.from(el.querySelectorAll('details'))
	el.active = panels.findIndex(panel => panel.hasAttribute('open'))

	return [
		// Reflect accordion attribute (may be used for styling)
		toggleAttribute('accordion'),

		// Update active tab state and bind click handlers
		all('menu button',
			on('click', (_, index) => () => {
				el.active = index
			}),
			setProperty('ariaPressed', (_, index) => String(el.active === index))
		),

		// Update details panels open, hidden and disabled states
		all('details',
			on('toggle', (_, index) => () => {
				el.active = el.active === index ? -1 : index
			}),
			setProperty('open', (_, index) => el.active === index),
			setAttribute('aria-disabled', () => String(!el.accordion))
		),

		// Update summary visibility
		all('summary', toggleClass('visually-hidden', () => !el.accordion))
	]
})
```

Example styles:

```css
tab-list {

    > menu {
        list-style: none;
        display: flex;
        gap: 0.2rem;
        padding: 0;

        & button[aria-pressed="true"] {
            color: purple;
        }
    }

    > details {

        &:not([open]) {
            display: none;
        }

        &[aria-disabled] {
            pointer-events: none;
        }
    }

    &[accordion] {

        > menu {
            display: none;
        }

        > details:not([open]) {
            display: block;
        }
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
import { component, first, dangerouslySetInnerHTML, setProperty, setText } from '@zeix/ui-element'

// Custom attribute parser
const asURL = (el, v) => {
	let value = ''
	let error = ''
	if (!v) {
		error = 'No URL provided in src attribute'
	} else if ((el.parentElement || (el.getRootNode() as ShadowRoot).host)?.closest(`${el.localName}[src="${v}"]`)) {
		error = 'Recursive loading detected'
	} else {
		const url = new URL(v, location.href) // Ensure 'src' attribute is a valid URL
		if (url.origin === location.origin) value = String(url) // Sanity check for cross-origin URLs
		else error = 'Invalid URL origin'
	}
	el.error = error
	return value
}

// Custom signal producer, needs src and error properties on element
const fetchText = el =>
	async abort => { // Async Computed callback
		const url = el.src
		if (!url) return ''
		try {
			const response = await fetch(url, { signal: abort })
			el.querySelector('.loading')?.remove()
			if (response.ok) return response.text()
			else el.error = response.statusText
		} catch (error) {
			el.error = error.message
		}
		return ''
	}

component('lazy-load', {
	error: '',
	src: asURL,
	content: fetchText
}, el => [
	dangerouslySetInnerHTML('content', 'open'),
	first('.error',
		setText('error'),
		setProperty('hidden', () => !el.error)
	)
])
```

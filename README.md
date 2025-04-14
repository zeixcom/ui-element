# UIElement

Version 0.12.0

**UIElement** - transform reusable markup, styles and behavior into powerful, reactive, and maintainable Web Components.

`UIElement` is a base class for Web Components with reactive states and UI effects. UIElement is tiny, around 4kB gzipped JS code, of which unused functions can be tree-shaken by build tools. It uses [Cause & Effect](https://github.com/zeixcom/cause-effect) internally for state management with signals and for scheduled DOM updates.

## Key Features

* **Reusable Components**: Create highly modular and reusable components to encapsulate styles and behavior.
* **Declarative States**: Bring static, server-rendered content to life with dynamic interactivity and state management.
* **Signal-Based Reactivity**: Employ signals for efficient state propagation, ensuring your components react instantly to changes.
* **Declarative Effects**: Use granular effects to automatically synchronize UI states with minimal code.
* **Context Support**: Share global states across your component tree without tightly coupling logic.

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
import { component, asInteger, setText } from '@zeix/ui-element'

component('show-appreciation', {
    count: asInteger(RESET) // Get initial value from .count element
}, el => {

    // Bind click event to increment count
    el.first('button', on('click', () => { el.count++ }))

    // Update.count text when count changes
    el.first('.count', setText('count'))
})
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

### Tab List and Panels

An example demonstrating how to pass states from one component to another. Server-rendered markup:

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

UIElement components:

```js
import { asBoolean, component, on, setAttribute, setProperty, toggleAttribute, toggleClass } from '@zeix/ui-element'

component('tab-list', {
	active: 0,
	accordion: asBoolean,
}, el => {
	// Set inital active tab by querying details[open]
	const panels = Array.from(el.querySelectorAll('details'))
	el.active = panels.findIndex(panel => panel.hasAttribute('open'))

	// Reflect accordion attribute (may be used for styling)
	el.self(toggleAttribute('accordion'))

	// Update active tab state and bind click handlers
	el.all('menu button',
		on('click', (_, index) => () => {
			el.active = index
		}),
		setProperty('ariaPressed', (_, index) => String(el.active === index))
	)

	// Update details panels open, hidden and disabled states
	el.all('details',
		on('toggle', (_, index) => () => {
			el.active = el.active === index ? -1 : index
		}),
		setProperty('open', (_, index) => !!(el.active === index)),
		setAttribute('aria-disabled', () => String(!el.accordion))
	)

	// Update summary visibility
	el.all('summary', toggleClass('visually-hidden', () => !el.accordion))
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

A more complex component demonstrating async fetch from the server:

```html
<lazy-load src="/lazy-load/snippet.html">
    <div class="loading" role="status">Loading...</div>
    <div class="error" role="alert" aria-live="polite"></div>
</lazy-load>
```

```js
import { component, dangerouslySetInnerHTML, setProperty, setText } from '@zeix/ui-element'

// Custom attribute parser
const asURL = (el, v) => {
	if (!v) {
		el.error = 'No URL provided in src attribute'
		return ''
	} else if ((el.parentElement || (el.getRootNode() as ShadowRoot).host)?.closest(`${el.localName}[src="${v}"]`)) {
		el.error = 'Recursive loading detected'
		return ''
	}
	const url = new URL(v, location.href) // Ensure 'src' attribute is a valid URL
	if (url.origin === location.origin) { // Sanity check for cross-origin URLs
		el.error = '' // Success: wipe previous error if there was any
		return String(url)
	}
	el.error = 'Invalid URL origin'
	return ''
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
}, el => {
	el.self(dangerouslySetInnerHTML('content', 'open'))
	el.first('.error',
		setText('error'),
		setProperty('hidden', () => !el.error)
	)
})
```
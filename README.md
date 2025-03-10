# UIElement

Version 0.10.2

**UIElement** - transform reusable markup, styles and behavior into powerful, reactive, and maintainable Web Components.

`UIElement` is a base class for Web Components with reactive states and UI effects. UIElement is tiny, around 3kB gzipped JS code, of which unused functions can be tree-shaken by build tools. It uses [Cause & Effect](https://github.com/zeixcom/cause-effect) internally for state management with signals and for scheduled DOM updates.

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
import { UIElement, asInteger, setText } from '@zeix/ui-element'

class ShowAppreciation extends UIElement {
    #count = Symbol() // Use a private Symbol as state key

    connectedCallback() {
        // Initialize count state
        this.set(this.#count, asInteger(0)(this.querySelector('.count').textContent))

        // Bind click event to increment count
        this.first('button').on('click', () => this.set(this.#count, v => ++v))

        // Update .count text when count changes
        this.first('.count').sync(setText(this.#count))
    }

    // Expose read-only property for count
    get count() {
        return this.get(this.#count)
    }
}
ShowAppreciation.define('show-appreciation')
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
import { UIElement, setAttribute, toggleAttribute } from '@zeix/ui-element'

class TabList extends UIElement {
	static localName = 'tab-list'
	static observedAttributes = ['accordion']

	states = {
		active: 0,
		accordion: asBoolean,
	}

	connectedCallback() {
		super.connectedCallback()

		// Set inital active tab by querying details[open]
		const getInitialActive = () => { 
			const panels = Array.from(this.querySelectorAll('details'))
			for (let i = 0; i < panels.length; i++) {
				if (panels[i].hasAttribute('open')) return i
			}
			return 0
		}
		this.set('active', getInitialActive())

		// Reflect accordion attribute (may be used for styling)
		this.self.sync(toggleAttribute('accordion'))

		// Update active tab state and bind click handlers
		this.all('menu button')
			.on('click', (_, index) => () => {
				this.set('active', index)
			})
			.sync(setProperty(
				'ariaPressed',
				(_, index) => String(this.get('active') === index)
			))

		// Update details panels open, hidden and disabled states
		this.all('details').sync(
			setProperty(
				'open',
				(_, index) => !!(this.get('active') === index)
			),
			setAttribute(
				'aria-disabled',
				() => String(!this.get('accordion'))
			)
		)

		// Update summary visibility
		this.all('summary').sync(toggleClass(
			'visually-hidden',
			() => !this.get('accordion')
		))
	}
}
TabList.define()
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
import { UIElement, setProperty, setText, dangerouslySetInnerHTML } from '@zeix/ui-element'

class LazyLoad extends UIElement {
	static localName = 'lazy-load'

	// Remove the following line if you don't want to listen to changes in 'src' attribute
	static observedAttributes = ['src']

	states = {
		src: v => { // Custom attribute parser
			if (!v) {
				this.set('error', 'No URL provided in src attribute')
				return ''
			}
			const url = new URL(v, location.href) // Ensure 'src' attribute is a valid URL
			if (url.origin === location.origin) // Sanity check for cross-origin URLs
				return url.toString()
			this.set('error', 'Invalid URL origin')
			return ''
		},
		content: async () => { // Async Computed callback
			const url = this.get('src')
			if (!url) return ''
			try {
				const response = await fetch(this.get('src'))
				this.querySelector('.loading')?.remove()
				if (response.ok) return response.text()
				else this.set('error', response.statusText)
			} catch (error) {
				this.set('error', error.message)
			}
			return ''
		},
		error: '',
	}

	connectedCallback() {
		super.connectedCallback()

		// Effect to set error message
		this.first('.error').sync(
			setProperty('hidden', () => !this.get('error')),
			setText('error'),
		)

		// Effect to set content in shadow root
		// Remove the second argument (for shadowrootmode) if you prefer light DOM
		this.self.sync(dangerouslySetInnerHTML('content', 'open'))
	}
}
LazyLoad.define()
```
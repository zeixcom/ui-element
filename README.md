# UIElement

Version 0.10.0

**UIElement** - transform reusable markup, styles and behavior into powerful, reactive, and maintainable Web Components.

`UIElement` is a base class for Web Components with reactive states and UI effects. UIElement is tiny, around 3kB gzipped JS code, of which unused functions can be tree-shaken by build tools. It uses [Cause & Effect](https://github.com/zeixcom/cause-effect) internally for state management with signals and [Pulse](https://github.com/zeixcom/pulse) for scheduled DOM updates.

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

For the functional core of your application we recommend [FlowSure](https://github.com/zeixcom/flow-sure) to create a robust and expressive data flow, supporting error handling and async processing with `Result` monads.

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
        this.set(this.#count, asInteger(this.querySelector('.count').textContent) ?? 0)

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
        <li><button type="button">Tab 1</button></li>
        <li><button type="button">Tab 2</button></li>
        <li><button type="button">Tab 3</button></li>
    </menu>
    <tab-panel open>
        <h2>Tab 1</h2>
        <p>Content of tab panel 1</p>
    </tab-panel>
    <tab-panel>
        <h2>Tab 2</h2>
        <p>Content of tab panel 2</p>
    </tab-panel>
    <tab-panel>
        <h2>Tab 3</h2>
        <p>Content of tab panel 3</p>
    </tab-panel>
</tab-list>
```

UIElement components:

```js
import { UIElement, setAttribute, toggleAttribute } from '@zeix/ui-element'

class TabList extends UIElement {
    connectedCallback() {

        // Set inital active tab by querying tab-panel[open]
        let openPanelIndex = 0;
        this.querySelectorAll('tab-panel').forEach((el, index) => {
            if (el.hasAttribute('open')) openPanelIndex = index
        })
        this.set('active', openPanelIndex)

        // Handle click events on menu buttons and update active tab index
        this.all('menu button')
            .on('click', (_el, index) => () => this.set('active', index))
            .sync((host, target, index) => setAttribute(
                'aria-pressed',
                () => host.get('active') === index ? 'true' : 'false')(host, target)
            )

        // Pass open attribute to tab-panel elements based on active tab index
        this.all('tab-panel').pass({
            open: (_el, index) => () => index === this.get('active')
        })
    }
}
TabList.define('tab-list')

class TabPanel extends UIElement {
    connectedCallback() {
        this.self.sync(toggleAttribute('open'))
    }
}
TabPanel.define('tab-panel')
```

Example styles:

```css
tab-list menu {
    list-style: none;
    display: flex;
    gap: 0.2rem;
    padding: 0;

    & button[aria-pressed="true"] {
        color: red;
    }
}

tab-panel {
    display: none;

    &[open] {
        display: block;
    }
}
```

### Lazy Load

A more complex component demonstrating async fetch from the server:

```html
<lazy-load src="/lazy-load/snippet.html">
    <div class="loading">Loading...</div>
    <div class="error"></div>
</lazy-load>
```

```js
import { UIElement, setText, setProperty, effect, enqueue } from '@zeix/ui-element'

class LazyLoad extends UIElement {
    static observedAttributes = ['src']
    states = {
        src: v => {
                let url = ''
                try {
                    url = new URL(v, location.href) // ensure 'src' attribute is a valid URL
                    if (url.origin !== location.origin) // sanity check for cross-origin URLs
                        throw new TypeError('Invalid URL origin')
                } catch (error) {
                    console.error(error, url)
                    url = ''
                }
                return url.toString()
            },
        error: ''
    }

    connectedCallback() {

        // Show / hide loading message
        this.first('.loading')
            .sync(setProperty('ariaHidden', () => !!this.get('error')))

        // Set and show / hide error message
        this.first('.error')
            .sync(setText('error'))
            .sync(setProperty('ariaHidden', () => !this.get('error')))

        // Load content from provided URL
        effect(async () => {
            const src = this.get('src')
            if (!src) return // silently fail if no valid URL is provided
            try {
                const response = await fetch(src)
                if (response.ok) {
                    const content = await response.text()
                    enqueue(() => {
                        // UNSAFE!, use only trusted sources in 'src' attribute
                        this.root.innerHTML = content
                        this.root.querySelectorAll('script').forEach(script => {
                            const newScript = document.createElement('script')
                            newScript.appendChild(document.createTextNode(script.textContent))
                            this.root.appendChild(newScript)
                            script.remove()
                        })
                    }, [this.root, 'h'])
                    this.set('error', '')
                } else {
                    this.set('error', response.status + ':'+ response.statusText)
                }
            } catch (error) {
                this.set('error', error)
            }
        })
    }
}
LazyLoad.define('lazy-load')
```
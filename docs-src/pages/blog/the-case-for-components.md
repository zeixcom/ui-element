---
title: 'The Case for Components'
emoji: ''
description: 'Components are a proven way to reduce complexity, encourage reuse, and allow teams to scale their work across independent user interface parts.'
---

<section class="hero">

# The Case for Components

<p class="lead"><strong>Components are a proven way to reduce complexity, encourage reuse, and allow teams to scale their work across independent user interface parts</strong>. But you don't need a framework to get these benefits. Let's explore how components help us build better interfaces – and how native Web Components and UIElement fit into that picture.</p>
</section>

<section>

## Why Components?

The idea of organizing user interfaces into components became mainstream with React over a decade ago, when Pete Hunt explained its core benefit: **reduce coupling, increase cohesion**.

Instead of writing large, monolithic pages where styling, behavior, and data flow are all tangled together, components encourage you to break your user interface into small, focused pieces that each:

- Own their internal structure and styles,
- Expose a clear public interface (via attributes or properties),
- And optionally encapsulate logic for interaction, validation, or data binding.

This separation of concerns helps in multiple ways:

- **Local reasoning**: You can understand and test a component in isolation.
- **Reusability**: A component written once can be used anywhere.
- **Parallel development**: Teams can divide work by component boundaries.

As requirements grow – new features, edge cases, accessibility tweaks – components give you a way to evolve your user interface incrementally. You don't have to rewrite your app. You just enhance or replace parts of it.

These benefits sound framework-specific, but they're not. The Web Platform itself provides everything you need to build components – let's see how.

</section>

<section>

## You Don't Need a Framework for That

Frameworks like React, Vue, or Svelte give you component models out of the box – but they aren't the only way. In fact, the Web Platform itself has a native component model: **Web Components**.

Web Components allow you to define your own HTML tags with scoped or encapsulated behavior and styles. Let's look at a simple example:

```html
<hello-world>Hello, world!</hello-world>
```

Underwhelmed because it's just HTML? – Well, that's the whole point! For now, it's just a custom element. But it gives you already a way to unambiguously scope your styles to your components.

```css
hello-world {
  display: block;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
}
```

Let's add some interactivity:

```html
<hello-world>
  <label>
    Your name
    <input type="text" />
  </label>
  <p>Hello, <span>world</span>!</p>
</hello-world>
```

Add the following to your JavaScript for the page:

```javascript
class HelloWorld extends HTMLElement {
  connectedCallback() {
    const nameEl = this.querySelector('span')
    this.querySelector('input')?.addEventListener('input', e => {
      if (nameEl) nameEl.textContent = e.target.value
    })
  }
}
customElements.define('hello-world', HelloWorld)
```

Web Components are registered using `customElements.define()` and automatically upgrade when they appear in the DOM – no bundler magic or runtime library required. Now, our `hello-world` component reacts to user input and updates the greeting accordingly. No external dependencies, just plain JavaScript and the browser's built-in APIs and it works – everywhere!

</section>

<section>

## Building on a Solid Foundation

**UIElement** builds on the Web Platform rather than abstracting over it. We embrace semantic HTML as the foundation. Add CSS to your components however you like and make them look great. Use Web Components to add reusable behavior.

While native Web Components are powerful, they require you to wire things together manually – querying elements, adding event listeners, and managing updates. This works great for simple interactions, but what if we want other components or JavaScript code to control our component's state? Let's add a public API.

To achieve this, we can expose an observed attribute and a public property. Observed attributes allow our component to react when the attribute changes. Element properties usually mirror attributes, but they can be of any type, not just strings. We need a setter function to react to changes in the property.

```js
class HelloWorld extends HTMLElement {
  static observedAttributes = ['name']
  #name = ''

  connectedCallback() {
    this.querySelector('input')?.addEventListener('input', e => {
      this.name = e.target.value
    })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'name') {
      this.name = newValue
    }
  }

  get name() {
    return this.#name
  }

  set name(value) {
    this.#name = value
    const nameEl = this.querySelector('span')
    if (nameEl) nameEl.textContent = this.name
  }
}
customElements.define('hello-world', HelloWorld)
```

Hooray, now we can set the name from outside the component in HTML:

```html
<hello-world name="Ada"><!-- contents --></hello-world>
```

... or via JavaScript:

```js
const helloWorld = document.querySelector('hello-world')
helloWorld.name = 'Betty'
```

This manual wiring works, but notice how much boilerplate we needed for a simple reactive property. As components grow more complex, this pattern becomes harder to maintain. This is where **UIElement** shines – it provides the reactivity patterns you need while staying close to the platform.

Here's the same component rewritten using UIElement. Notice how the concerns are cleanly separated:

- **State declaration**: `name: asString()` defines our component's reactive state
- **Input handling**: The `on('input', ...)` handler updates state declaratively
- **DOM updates**: `setText('name')` automatically keeps the display in sync

```js
import { component, asString, on, setText } from '@zeix/ui-element'

component(
  'hello-world',
  {
    name: asString(),
  },
  (el, { first }) => [
    first(
      'input',
      on('input', e => {
        el.name = e.target.value
      }),
    ),
    first('span', setText('name')),
  ],
)
```

This scales much better as complexity grows. You could add default values, validation rules, attribute reflection, or derived values – all while keeping effects and state management declarative and contained.

The functions we use:

- `component()` creates a Web Component with less boilerplate.
- `asString()` does nothing, but tells TypeScript that state `name` is a for sure a string.
- `first()` selects the first element matching a selector.
- `on()` adds an event listener to an element and removes it when the component is disconnected.
- `setText()` updates the text content of an element when a state change occurs.

Components in UIElement are still standard Web Components that can be used everywhere. Other components need to know nothing more about UIElement components other than they are standard HTML elements with a few reactive properties according to a clearly defined contract – its public interface.

</section>

<section>

## Takeaways

Here's what we've seen:

- **Components** help you organize frontend code in ways that scale – conceptually and organizationally.
- **Web Components** offer a native way to build encapsulated, reusable user interfaces without needing a framework.
- **UIElement** builds on this foundation, simplifying common tasks like wiring inputs and syncing state to the DOM.

In short: you don't need a framework to build with components. You just need a few functions that stay close to the platform, while smoothing over the rough edges.

</section>

<section>

## Coming Up Next: Rethinking Reactivity

In the next post, we'll revisit similar components and explore how reactivity can make more complex relationships easier to manage – like derived values, async state, and multiple sources of truth.

We'll look at the pitfalls of imperative state wiring as logic grows, and how UIElement's signal graph provides a robust and minimal foundation for keeping your user interface in sync.

Stay tuned!

</section>

---
title: "Building Components"
emoji: "🏗️"
description: "Anatomy, lifecycle, signals, effects"
---

<section class="hero">

# 🏗️ Building Components

<p class="lead"><strong>Create lightweight, self-contained Web Components with built-in reactivity</strong>. UIElement lets you define custom elements that manage state efficiently, update the DOM automatically, and enhance server-rendered pages without a framework.</p>
</section>

<section>

## Anatomy of a UIElement Component

UIElement builds on **Web Components**, extending `HTMLElement` to provide **built-in state management and reactive updates**.

### Defining a Component

A UIElement component is created by extending `UIElement`:

```js
class MyComponent extends UIElement {
	/* component definition */
}
```

### Registering a Custom Element

Every UIElement component must be registered with a valid custom tag name (two or more words joined with `-`) using `.define()`.

```js
MyComponent.define('my-component');
```

### Using the Custom Element in HTML

Once registered, the component can be used like any native HTML element:

```html
<my-component>Content goes here</my-component>
```

</section>

<section>

## Web Component Lifecycle in UIElement

Every UIElement component follows a **lifecycle** from creation to removal. Here’s how the key lifecycle methods work:

### Component Creation (constructor())

Runs when the element is created **but before it’s attached to the DOM**. Avoid accessing attributes or child elements here.

### Mounted in the DOM (connectedCallback())

Runs when the component is added to the page. This is where you:

* ✅ **Initialize state**
* ✅ **Set up event listeners**
* ✅ **Apply effects**

```js
class MyComponent extends UIElement {
	connectedCallback() {
		this.first('.increment').on('click', () => { // Add click event listener
			this.set('count', v => null != v ? ++v : 1);
		});
		this.first('.count').sync(setText('count')); // Apply effect to update text
	}
}
```

If your component initializes states from `static states` or provides or consumes context (`static providedContexts` / `static consumedContexts`), you need to call `super.connectedCallback()`.

```js
class HelloUser extends UIElement {
	static consumedContexts = ['display-name']; // Signal provided by a parent component
	static states = {
		greeting: 'Hello', // Initial value of 'greeting' signal
	}

	connectedCallback() {
		this.connectedCallback();
		this.first('.greeting').sync(setText('greeting'));
		this.first('.user').sync(setText('display-name'));
	}
}
```

### Removed from the DOM (disconnectedCallback())

Runs when the component is removed. Event listeners bound with `.on()` are automatically removed by UIElement.

If you added **event listeners** outside the scope of your component or **external subscriptions**, you need to manually clean up.

```js
class MyComponent extends UIElement {

	connectedCallback() {
		this.intersectionObserver = new IntersectionObserver(([entry]) => {
			// Do something
		}).observe(this)
	}

	disconnentedCallback() {
		super.disconnectedCallback();
		if (this.intersectionObserver) this.intersectionObserver.disconnect();
	}
}
```

Use this to clean up **event listeners or external subscriptions**.

### Observed Attributes (attributeChangedCallback())

UIElement **automatically converts attributes to reactive signals**. Usually, you don’t need to override this method manually.

</section>

<section>

## State Management with UIElement

UIElement manages state using **signals**, which are reactive values that trigger updates when they change. We use a familiar `Map`-like API:

### Defining & Using Signals

```js
this.set('count', 0); // Create a state signal
this.set('isEven', () => !((this.get('count') ?? 0) % 2)); // Create a derived signal
```

### Checking & Removing Signals

```js
if (this.has('count')) { /* Do something */ }
this.delete('count'); // Removes the signal and its dependencies
```

### Why Signals with a Map Interface?

UIElement **uses signals** instead of standard properties or attributes because it **ensures reactivity, loose coupling, and avoids common pitfalls with the DOM API**.

* ✅ **Signals enable loose coupling between components**: A component that modifies state doesn’t need to know which or how many elements depend on that state. Any UI updates happen automatically wherever that signal is used.
* ✅ **Signals trigger automatic updates**: Any DOM element or effect that depends on a signal updates itself when the signal changes. The source doesn't need to know how the updated state should change the DOM.
* ✅ **Standard JavaScript properties are not reactive**: JavaScript properties don’t automatically trigger updates when changed. The distinct `Map`-like interface avoids confusion.
* ✅ **Attributes can only store strings**: Attributes in HTML are always strings. If you store numbers, booleans, or objects, you must manually convert them between string format and usable values. Signals avoid this extra conversion step.
* ✅ **The Map interface avoids name conflicts**:
  * The `HTMLElement` **namespace is crowded**, meaning using direct properties can accidentally override existing methods or properties.
  * HTML attributes are **kebab-case** (`data-user-id`), but JavaScript properties are **camelCase** (`dataUserId`), which can cause inconsistencies.
  * With a Map, we can **use attributes names directly** as state keys (e.g., `"count"` or `"is-active"`) without conversion or worrying about naming conflicts.

</section>

<section>

## Initializing State from Attributes

### Declaring Observed Attributes

```js
static observedAttributes = ['count']; // Automatically becomes a signal
```

### Parsing Attribute Values

```js
static states = {
	count: asInteger, // Convert '42' -> 42
	date: v => new Date(v), // Custom parser: '2025-02-14' -> Date object
};
```

### Pre-defined Parsers in UIElement

| Function     | Description |
| ------------ | ----------- |
| `asBoolean`  | Converts `"true"` / `"false"` to a **boolean** (`true` / `false`). Also treats empty attributes (`checked`) as `true`. |
| `asInteger`  | Converts a numeric string (e.g., `"42"`) to an **integer** (`42`). |
| `asNumber`   | Converts a numeric string (e.g., `"3.14"`) to a **floating-point number** (`3.14`). |
| `asString`   | Returns the attribute value as a **string** (unchanged). |
| `asEnum([...])` | Ensures the string matches **one of the allowed values**. Example: `asEnum(['small', 'medium', 'large'])`. If the value is not in the list, it defaults to the first option. |
| `asJSON`     | Parses a JSON string (e.g., `'["a", "b", "c"]'`) into an **array** or **object**. If invalid, returns `null`. |

</section>

<section>

## Accessing Sub-elements within the Component

Before adding **event listeners**, **applying effects**, or **passing states**, you need to select elements inside the component.

UIElement provides the following methods for **element selection**:

| Method                 | Description |
| -----------------------| ----------- |
| `this.self`            | Selects **the component itself**. |
| `this.first(selector)` | Selects **the first matching element** inside the component. |
| `this.all(selector)`   | Selects **all matching elements** inside the component. |

```js
// Select the component itself
this.self.sync(setProperty('hidden'));

// Select the first '.increment' button & add a click event
this.first('.increment').on('click', () => {
	this.set('count', v => null != v ? ++v : 1);
});

// Select all <button> elements & sync their 'disabled' properties
this.all('button').sync(setProperty('disabled', 'hidden'));
```

</section>

<section>

## Updating State with Events

User interactions should **update signals**, not the DOM directly. This keeps the components loosly coupled.

Bind event handlers to one or many elements using the `.on()` method:

```js
this.first('.increment').on('click', () => {
	this.set('count', v => null != v ? v++ : 1)
});
this.first('input').on('input', e => {
	this.set('name', e.target.value || undefined)
});
```

</section>

<section>

## Synchronizing State with Effects

Effects **automatically update the DOM** when signals change, avoiding manual DOM manipulation.

### Applying Effects with .sync()

Apply one or multiple effects to elements using `.sync()`:

```js
this.first('.count').sync(
	setText('count'), // Update text content according to 'count' signal
	toggleClass('even', 'isEven') // Toggle 'even' class according to 'isEven' signal
);
```

### Pre-defined Effects in UIElement

| Function            | Description |
| ------------------- | ----------- |
| `setText()`         | Updates **text content** with a `string` signal value (while preserving comment nodes). |
| `setProperty()`     | Updates a given **property** with any signal value. |
| `setAttribute()`    | Updates a given **attribute** with a `string` signal value. |
| `toggleAttribute()` | Toggles a given **boolean attribute** with a `boolean` signal value. |
| `toggleClass()`     | Toggles a given **CSS class** with a `boolean` signal value. |
| `setStyle()`        | Updates a given **CSS property** with a `string` signal value. |
| `createElement()`   | Inserts a **new element** with a given tag name with a `Record<string, string>` signal value for attributes. |
| `removeElement()`   | Removes an element if the `boolean` signal value is `true`. |

### Simplifying Effect Notation

For effects that take two arguments, **the second argument can be omitted** if the signal key matches the targeted property name, attribute, class, or style property.

When signal key matches property name:

```js
this.first('.count').sync(toggleClass('even'));
```

Here, `toggleClass('even')` automatically uses the `"even"` signal.

### Using Functions for Ad-hoc Derived State

Instead of a signal key, you can **pass a function** that derives a value dynamically:

```js
this.first('.count').sync(toggleClass('even', () => !((this.get('count') ?? 0) % 2)));
```

<callout-box class="tip">

**When to use**

* **Use a signal key** when the state is already **stored as a signal**.
* **Use a function** when you **derive a value on the fly** needed only in this one place and you don't want to expose it as a signal on the element.

</callout-box>

### Custom Effects

For complex DOM manipulations, **define your own effect** using `effect()`.

Here's an example effect that attaches a Shadow DOM and updates its content:

```js
// Update the shadow DOM when content changes
effect(() => {
	const content = this.get('content')
	if (content) {
		this.root = this.shadowRoot || this.attachShadow({ mode: 'open' })
		this.root.innerHTML = content
	}
});
```

### Efficient & Fine-Grained Updates

Unlike some frameworks that **re-render entire components**, UIElement updates only what changes:

* ✅ **No virtual DOM** – UIElement modifies the DOM directly.
* ✅ **Signals propagate automatically** – No need to track dependencies manually.
* ✅ **Optimized with a scheduler** – Multiple updates are batched efficiently.

**In practical terms**: UIElement is as easy as React but without re-renders.

</section>

<section>

## Single Component Example

Bringing all of the above together, you are now ready to build your own components like this slider with prev / next buttons and dot indicators, demonstrating single-component reactivity.

<component-demo>
<div class="preview">
<my-slider>
<div class="slides">
<div class="slide active">First Slide</div>
<div class="slide">Second Slide</div>
<div class="slide">Third Slide</div>
</div>
<button type="button" class="prev" aria-label="Previous">‹</button>
<button type="button" class="next" aria-label="Next">›</button>
<div class="dots">
<span class="active"></span>
<span></span>
<span></span>
</div>
</my-slider>
</div>
<accordion-panel collapsible>
<details>
<summary>MySlider Source Code</summary>
<lazy-load src="./examples/my-slider.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
</component-demo>

</section>

<section>

## Next Steps

Now that you understand the basics, explore:

* [Styling Components](styling-components.html) – Learn techniques to apply styles to components.
* [Data Flow](data-flow.html) – Learn about passing state between components.

</section>
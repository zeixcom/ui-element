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

## Anatomy of Components

UIElement builds on **Web Components**, extending `HTMLElement` to provide **built-in state management and reactive updates**.

### Defining a Component

A UIElement creates components using the `component()` function:

```js
component('my-component', {}, () => {
	// Component setup
})
```

Every UIElement component must be registered with a valid custom element tag name (two or more words joined with `-`) as the first parameter.

### Using the Custom Element in HTML

Once registered, the component can be used like any native HTML element:

```html
<my-component>Content goes here</my-component>
```

</section>

<section>

## Web Component Lifecycle in UIElement

UIElement manages the **Web Component lifecycle** from creation to removal. Here's what happens.

### Component Creation (constructor())

This is when reactive properties are initialized. You pass a second argument to the `component()` function to defines initial values for **component states**.

```js
component('my-component', {
	count: 0, // Initial value of 'count' signal
	isEven: el => () => !(el.count % 2) // Computed signal based on 'count'
	value: asInteger(5), // Parse 'value' attribute as integer
	name: consume('display-name') // Consume 'display-name' signal from closest context provider
}, () => {
	// Component setup
})
```

In this example you see all 4 ways to define a reactive property:

* A **static initial value** for a `State` signal (e.g., `count: 0`)
* A **signal producer** that derives an initial value or a callback function from other properties of the element (e.g., `isEven: el => () => !(el.count % 2)`)
* An **attribute parser** that may provide a fallback value (e.g., `value: asInteger(5)`)
* A **context consumer** that emits a `ContextRequestEvent` (e.g., `name: consume('display-name')`)

<callout-box class="caution">

**Note**: Property initialization runs **before the element is attached to the DOM**. You can't access other properties or child elements here.

</callout-box>

### Mounted in the DOM (connectedCallback())

Runs when the component is added to the page. This is where you:

* **Access sub-elements**
* **Set up event listeners**
* **Apply effects**
* **Emit custom events**
* **Provide context**

```js
component('my-component', {
	count: 0,
}, el => {
	el.first('.increment', on('click', () => { el.count++ })) // Add click event listener
	el.first('.count', setText('count')) // Apply effect to update text
	el.self(
		emit('update-count', el.count) // Emit custom event
		provide('count') // Provide context
	)
})
```

### Removed from the DOM (disconnectedCallback())

Runs when the component is removed. Event listeners bound with `on()` and signal subscriptions of effects are automatically removed by UIElement.

If you added **event listeners** outside the scope of your component or **external subscriptions**, you need to return a cleanup function:

```js
component('my-component', {}, el => {
	const intersectionObserver = new IntersectionObserver(([entry]) => {
		// Do something
	}).observe(el)

	return () => {
		// Cleanup logic
		intersectionObserver.disconnect()
	}
})
```

### Observed Attributes (attributeChangedCallback())

UIElement **automatically converts attributes to signals**. Usually, you don’t need to override this method manually.

</section>

<section>

## State Management with UIElement

UIElement manages state using **signals**, which are atomic reactive states that trigger updates when they change. We use regular properties to access or update them.

### Accessing and Updating Signal Values

```js
console.log('count' in el); // Check if the signal exists
console.log(el.count); // Read the signal value
el.count = 42; // Update the signal value
```

### Accessing & Setting Signals Directly

If you need to access the signals for a property key directly, you can use the `getSignal()` and `setSignal()` methods:

```js
const doubleString = el.getSignal('count').map(v => String(v * 2)); // Derive a new Computed signal from 'count' signal
el.querySelector('input-field').setSignal('description', doubleString); // Replace the signal on another element with a new one
```

However, you should **avoid manipulating signals directly** unless you have a **specific reason** to do so. Use the `pass()`function to pass a signal or a derivation thereof to other elements.

### Characteristics and Special Values

Signals in UIElement are of a **fixed type** and **non-nullable**. This allows to **simplify the logic** as you will never have to check the type or perform null-checks.

* If you use **TypeScript** (recommended), **you will be warned** that `null` or `undefined` cannot be assigned to a signal or if you try to assign a value of a wrong type.
* If you use vanilla **JavaScript** without a build step, setting a signal to `null` or `undefined` **will log an error to the console and abort**. However, strict type checking is not enforced at runtime.

Because of the **non-nullable nature of signals** in UIElement, we need two special values that can be assigned to any signal type:

* **`RESET`**: Will **reset to the server-rendered version** that was there before UIElement took control. This is what you want to do most of the times when a signal lacks a specific value.
* **`UNSET`**: Will **delete the signal**, **unsubscribe its watchers** and also **delete related attributes or style properties** in effects. Use this with special care!

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
init = {
	count: asInteger(), // Convert '42' -> 42
	date: v => new Date(v), // Custom parser: '2025-02-14' -> Date object
};
```

<callout-box class="caution">

**Careful**: Attributes **may not be present** on the element or **parsing to the desired type may fail**. To ensure **non-nullability** of signals, UIElement falls back to neutral defaults:

* `''` (empty string) for `string`
* `0` for `number`
* `{}` (empty object) for objects of any kind

</callout-box>

### Pre-defined Parsers in UIElement

| Function        | Description |
| --------------- | ----------- |
| `asBoolean`     | Converts `"true"` / `"false"` to a **boolean** (`true` / `false`). Also treats empty attributes (`checked`) as `true`. |
| `asInteger()`   | Converts a numeric string (e.g., `"42"`) to an **integer** (`42`). |
| `asNumber()`    | Converts a numeric string (e.g., `"3.14"`) to a **floating-point number** (`3.14`). |
| `asString()`    | Returns the attribute value as a **string** (unchanged). |
| `asEnum([...])` | Ensures the string matches **one of the allowed values**. Example: `asEnum(['small', 'medium', 'large'])`. If the value is not in the list, it defaults to the first option. |
| `asJSON({...})` | Parses a JSON string (e.g., `'["a", "b", "c"]'`) into an **array** or **object**. If invalid, returns the fallback object. |

The pre-defined parsers `asInteger()`, `asNumber()` and `asString()` allow to set a custom fallback value as parameter.

The `asEnum()` parser requires an array of valid values, while the first will be the fallback value for invalid results.

The `asJSON()` parser requires a fallback object as parameter as `{}` probably won't match the type you're expecting.

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
| `setProperty()`     | Updates a given **property** with any signal value.* |
| `setAttribute()`    | Updates a given **attribute** with a `string` signal value. |
| `toggleAttribute()` | Toggles a given **boolean attribute** with a `boolean` signal value. |
| `toggleClass()`     | Toggles a given **CSS class** with a `boolean` signal value. |
| `setStyle()`        | Updates a given **CSS property** with a `string` signal value. |
| `createElement()`   | Inserts a **new element** with a given tag name with a `Record<string, string>` signal value for attributes. |
| `removeElement()`   | Removes an element if the `boolean` signal value is `true`. |

<callout-box class="tip">

**Tip**: TypeScript will check whether a value of a given type is assignable to a certain element type. You might have to specify a type hint for the queried element type. Prefer `setProperty()` over `setAttribute()` for increased type safety. Setting string attributes is possible for all elements, but will have an effect only on some.

</callout-box>

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

## Single Component Example: MySlider

Bringing all of the above together, you are now ready to build your own components like this slider with prev / next buttons and dot indicators, demonstrating single-component reactivity.

<component-demo>
	<div class="preview">
		<my-slider>
			<h2 class="visually-hidden">Slides</h2>
			<div class="slides">
				<div class="slide active" data-index="0">
					<h3>Slide 1</h3>
					<hello-world>
						<label>Your name<br>
							<input type="text">
						</label>
						<p>Hello, <span>World</span>!</p>
					</hello-world>
				</div>
				<div class="slide" data-index="1">
					<h3>Slide 2</h3>
					<calc-table rows="3" columns="3">
						<table>
							<thead>
								<tr>
									<th scope="col">Row</th>
								</tr>
							</thead>
							<tbody>
							</tbody>
							<tfoot>
								<tr>
									<th scope="row">Sum</th>
								</tr>
							</tfoot>
						</table>
						<template class="calc-table-row">
							<tr><th scope="row"><slot></slot></th></tr>
						</template>
						<template class="calc-table-colhead">
							<th scope="col"><slot></slot></th>
						</template>
						<template class="calc-table-cell">
							<td>
								<label>
									<span class="visually-hidden"><slot></slot></span>
									<input type="number" min="0" max="100" step="1" value="" />
								</label>
							</td>
						</template>
					</calc-table>
				</div>
				<div class="slide" data-index="2">
					<h3>Slide 3</h3>
					<rating-feedback>
						<form>
							<rating-stars>
								<fieldset>
									<legend class="visually-hidden">Rate</legend>
									<label>
										<input type="radio" class="visually-hidden" name="rating" value="1">
										<span class="label">☆</span>
									</label>
									<label>
										<input type="radio" class="visually-hidden" name="rating" value="2">
										<span class="label">☆</span>
									</label>
									<label>
										<input type="radio" class="visually-hidden" name="rating" value="3">
										<span class="label">☆</span>
									</label>
									<label>
										<input type="radio" class="visually-hidden" name="rating" value="4">
										<span class="label">☆</span>
									</label>
									<label>
										<input type="radio" class="visually-hidden" name="rating" value="5">
										<span class="label">☆</span>
									</label>
								</fieldset>
							</rating-stars>
							<div class="feedback" hidden>
								<header>
									<button button="button" class="hide" aria-label="Hide">×</button>
									<p hidden>We're sorry to hear that! Your feedback is important, and we'd love to improve. Let us know how we can do better.</p>
									<p hidden>Thank you for your honesty. We appreciate your feedback and will work on making things better.</p>
									<p hidden>Thanks for your rating! If there's anything we can improve, we'd love to hear your thoughts.</p>
									<p hidden>We're glad you had a good experience! If there's anything that could make it even better, let us know.</p>
									<p hidden>Thank you for your support! We're thrilled you had a great experience. Your feedback keeps us motivated!</p>
								</header>
								<fieldset>
									<label for="rating-feedback">Describe your experience (optional)</label>
									<textarea id="rating-feedback"></textarea>
									<input-button disabled>
										<button type="submit" class="primary" disabled>Submit</button>
									</input-button>
								</fieldset>
							</div>
						</form>
					</rating-feedback>
				</div>
			</div>
			<button type="button" class="prev" aria-label="Previous">‹</button>
			<button type="button" class="next" aria-label="Next">›</button>
			<div class="dots">
				<span class="active" data-index="0"></span>
				<span data-index="1"></span>
				<span data-index="2"></span>
			</div>
		</my-slider>
	</div>
	<details>
		<summary>Source Code</summary>
		<lazy-load src="./examples/my-slider.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
</component-demo>

</section>

<section>

## Next Steps

Now that you understand the basics, explore:

* [Styling Components](styling-components.html) – Learn techniques to apply styles to components.
* [Data Flow](data-flow.html) – Learn about passing state between components.

</section>
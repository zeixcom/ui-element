---
title: "Building Components"
emoji: "🏗️"
description: "Anatomy, lifecycle, signals, effects"
---

<section class="hero">

# 🏗️ Building Components

<p class="lead"><strong>Create lightweight, self-contained Web Components with built-in reactivity</strong>. UIElement lets you define custom elements that manage state efficiently, update the DOM automatically, and enhance server-rendered pages without an SPA framework.</p>
</section>

<section>

## Defining a Component

UIElement builds on **Web Components**, extending `HTMLElement` to provide **built-in state management and reactive updates**.

A UIElement creates components using the `component()` function:

```js
component("my-component", {}, () => [
	// Component setup
]);
```

Every UIElement component must be registered with a valid custom element tag name (two or more words joined with `-`) as the first parameter.

### Using the Custom Element in HTML

Once registered, the component can be used like any native HTML element:

```html
<my-component>Content goes here</my-component>
```

</section>

<section>

## Component Lifecycle

UIElement manages the **Web Component lifecycle** from creation to removal. Here's what happens.

### Component Creation

In the `constructor()` reactive properties are initialized. You pass a second argument to the `component()` function to defines initial values for **component states**.

```js
component("my-component", {
	count: 0, // Initial value of "count" signal
	isEven: el => () => !(el.count % 2), // Computed signal based on "count" signal
	value: asInteger(5), // Parse "value" attribute as integer defaulting to 5
	name: consume("display-name") // Consume "display-name" signal from closest context provider
}, () => [
	// Component setup
]);
```

In this example you see all four ways to define a reactive property:

* A **static initial value** for a `State` signal (e.g., `count: 0`)
* A **signal producer** that derives an initial value or a callback function from other properties of the element (e.g., `isEven: el => () => !(el.count % 2)`)
* An **attribute parser** that may provide a fallback value (e.g., `value: asInteger(5)`)
* A **context consumer** that emits a `ContextRequestEvent` (e.g., `name: consume("display-name")`)

<callout-box class="caution">

**Note**: Property initialization runs **before the element is attached to the DOM**. You can't access not yet defined properties or child elements here.

</callout-box>

### Mounted in the DOM

Runs when the component is added to the page (`connectedCallback()`). This is where you:

* **Access sub-elements**
* **Set up event listeners**
* **Apply effects**
* **Emit custom events**
* **Provide context**

UIElement expects you to return an array of partially applied functions to be executed during the setup phase. The order doesn't matter, as each function targets a specific element or event. So feel free to organize your code in a way that makes sense to you.

Each of these functions will return a cleanup function that will be executed during the `disconnectedCallback()` lifecycle method.

```js
component("my-component", {
	count: 0,
}, el => [
	emit("update-count", el.count), // Emit custom event
	provide("count"), // Provide context
	first(".increment",
		on("click", () => { el.count++ }) // Add click event listener
	),
	first(".count",
		setText("count") // Apply effect to update text
	)
]);
```

### Removed from the DOM

Runs when the component is removed (`disconnectedCallback()`). UIElement will run all cleanup functions returned by event listeners and effects during the setup phase (`connectedCallback()`). This will unsubscribe all signals the component is subscribed to, so you don't need to worry about memory leaks.

If you added **event listeners** outside the scope of your component or **subscribed manually to external APIs**, you need to return a cleanup function:

```js
component("my-component", {}, el => {
	const intersectionObserver = new IntersectionObserver(([entry]) => {
		// Do something
	}).observe(el);

	return [
		// Component setup: effects and event listeners
		() => {
			intersectionObserver.disconnect(); // Cleanup logic
		}
	]
});
```

### Observed Attributes

UIElement automatically observes and converts attributes with an associated **parser function** in the init block and updates them whenever the attribute changes (`attributeChangedCallback()`).

</section>

<section>

## Managing State with Signals

UIElement manages state using **signals**, which are atomic reactive states that trigger updates when they change. We use regular properties to access or update them:

```js
console.log("count" in el); // Check if the signal exists
console.log(el.count); // Read the signal value
el.count = 42; // Update the signal value
```

### Characteristics and Special Values

Signals in UIElement are of a **static type** and **non-nullable**. This allows to **simplify the logic** as you will never have to check the type or perform null-checks.

* If you use **TypeScript** (recommended), **you will be warned** that `null` or `undefined` cannot be assigned to a signal or if you try to assign a value of a wrong type.
* If you use vanilla **JavaScript** without a build step, setting a signal to `null` or `undefined` **will log an error to the console and abort**. However, strict type checking is not enforced at runtime.

Because of the **non-nullable nature of signals** in UIElement, we need two special values that can be assigned to any signal type:

* **`RESET`**: Will **reset to the server-rendered version** that was there before UIElement took control. This is what you want to do most of the times when a signal lacks a specific value.
* **`UNSET`**: Will **delete the signal**, **unsubscribe its watchers** and also **delete related attributes or style properties** in effects. Use this with special care!

### Initializing State from Attributes

The standard way to set initial state in UIElement is via **server-rendered attributes** on the component that needs it. No props drilling as in other frameworks. UIElements provides some bundled attribute parsers to convert attribute values to the desired type. And you can also define your own custom parsers.

```js
component("my-component", {
	count: asInteger(), // Bundled parser: Convert '42' -> 42
	date: (_, v) => new Date(v), // Custom parser: '2025-02-14' -> Date object
}, () => [
	// Component setup
]);
```

<callout-box class="caution">

**Careful**: Attributes **may not be present** on the element or **parsing to the desired type may fail**. To ensure **non-nullability** of signals, UIElement falls back to neutral defaults:

* `""` (empty string) for `string`
* `0` for `number`
* `{}` (empty object) for objects of any kind

</callout-box>

### Bundled Attribute Parsers

| Function        | Description |
| --------------- | ----------- |
| `asBoolean`     | Converts `"true"` / `"false"` to a **boolean** (`true` / `false`). Also treats empty attributes (`checked`) as `true`. |
| `asInteger()`   | Converts a numeric string (e.g., `"42"`) to an **integer** (`42`). |
| `asNumber()`    | Converts a numeric string (e.g., `"3.14"`) to a **floating-point number** (`3.14`). |
| `asString()`    | Returns the attribute value as a **string** (unchanged). |
| `asEnum([...])` | Ensures the string matches **one of the allowed values**. Example: `asEnum(["small", "medium", "large"])`. If the value is not in the list, it defaults to the first option. |
| `asJSON({...})` | Parses a JSON string (e.g., `'["a", "b", "c"]'`) into an **array** or **object**. If invalid, returns the fallback object. |

The pre-defined parsers `asInteger()`, `asNumber()` and `asString()` allow to set a custom fallback value as parameter.

The `asEnum()` parser requires an array of valid values, while the first will be the fallback value for invalid results.

The `asJSON()` parser requires a fallback object as parameter as `{}` probably won't match the type you're expecting.

</section>

<section>

## Accessing Sub-elements

Before adding **event listeners**, **applying effects**, or **passing states** to sub-elements, you need to select them using a function for **element selection**:

| Function                  | Description |
| --------------------------| ----------- |
| `first(selector, ...fns)` | Selects **the first matching element** inside the component and applies the given setup functions. |
| `all(selector, ...fns)`   | Selects **all matching elements** inside the component and applies the given setup functions. |

```js
// Select the first ".increment" button and apply effects on it
first(".increment",
	// Fx functions
)

// Select all <button> elements and apply effects on them
all("button",
	// Fx functions
)
```

The `first()` function expects the matched element to be present at connection time. If not, it will silently ignore the call.

On the other hand, the `all()` function creates a dynamic array of elements that will be updated whenever the matching elements are added or removed from the component's DOM branch. UIElement will apply the given setup functions to added elements and run the cleanup functions on removed elements.

<callout-box class="tip">

**Tip**: The `all()` function is more flexible but also more resource-intensive than `first()`. Prefer `first()` when targeting a single element known to be present at connection time.

</callout-box>

### Adding Event Listeners

Event listeners allow to respond to user interactions. They are the cause of changes in the component's state.

```js
component("my-component", {
	active: 0,
	value: ''
}, (el) => [
	all("button",
		on("click", (e) => {
			// Set "active" signal to value of data-index attribute of button
			const index = parseInt(e.target.dataset['index'], 10);
			el.active = Number.isInteger(index) ? index : 0;
		})
	),
	first("input",
		on("change", (e) => {
			// Set "value" signal to value of input element
			el.value = e.target.value;
		})
	)
]
```

</section>

<section>

## Synchronizing State with Effects

Effects **automatically update the DOM** when signals change, avoiding manual DOM manipulation.

### Applying Effects

Apply one or multiple effects in the setup function (for component itself) or in element selector functions:

```js
() => [
	// On the component itself
	setAttribute("open", "isOpen"), // Set "open" attribute according to "isOpen" signal

	// On first element matching ".count"
	first(".count",
		setText("count"), // Update text content according to "count" signal
		toggleClass("even", "isEven") // Toggle "even" class according to "isEven" signal
	)
];
```

Again, the order of effects is not important. Feel free to apply them in any order that suits your needs.

### Bundled Effects

| Function                    | Description |
| --------------------------- | ----------- |
| `setText()`                 | Updates **text content** with a `string` signal value (while preserving comment nodes). |
| `setProperty()`             | Updates a given **property** with any signal value.* |
| `setAttribute()`            | Updates a given **attribute** with a `string` signal value. |
| `toggleAttribute()`         | Toggles a given **boolean attribute** with a `boolean` signal value. |
| `toggleClass()`             | Toggles a given **CSS class** with a `boolean` signal value. |
| `setStyle()`                | Updates a given **CSS property** with a `string` signal value. |
| `dangerouslySetInnerHTML()` | Sets **HTML content** with a `string` signal value. |
| `insertOrRemoveElement()`   | Inserts (positive integer) or removes (negative integer) elements with a `number` signal value. |

<callout-box class="tip">

**Tip**: TypeScript will check whether a value of a given type is assignable to a certain element type. You might have to pass a type hint for the queried element type. Prefer `setProperty()` over `setAttribute()` for increased type safety. Setting string attributes is possible for all elements, but will have an effect only on some.

</callout-box>

### Simplifying Effect Notation

For effects that take two arguments, **the second argument can be omitted** if the signal key matches the targeted property name, attribute, class, or style property.

When signal key matches property name:

```js
first(".count", toggleClass("even"))
```

Here, `toggleClass("even")` automatically uses the `"even"` signal.

### Using Local Signals for Protected State

Local signals are useful for storing state that should not be exposed to the outside world. They can be used to manage internal state within a component:

```js
component("my-component", {}, () => {
	const count = state(0);
	const double = count.map(v => v * 2);
	return [
		first(".increment", on("click", () => {
			count.update(v => ++v);
		})),
		first(".count", setText(count)),
		first(".double", setText(double))
	];
});
```

Outside components cannot access the `count` or `double` signals.

### Using Functions for Ad-hoc Derived State

Instead of a signal key or a local signal, you can **pass a function** that derives a value dynamically:

```js
component("my-component", {
	count: 0
}, el => {
	const double = computed(() => el.count * 2);
	return [
		first(".count", toggleClass("even", () => !(el.count % 2)))),
		first(".double", setText(() => String(double.get())))
	];
});
```

<callout-box class="tip">

**When to use**

* **Use a signal key or a local signal** when the state is part of the component's public interface or internally reused.
* **Use a function** to **derive a value on the fly** when it is needed only in this one place.

Ad-hoc derived state is more efficient than the overhead of a memoized computed signal for simple functions like converting to a string or boolean, formatting a value or performing a calculation.

</callout-box>

### Efficient & Fine-Grained Updates

Unlike some frameworks that **re-render entire components**, UIElement updates only what changes:

* **No virtual DOM** – UIElement modifies the DOM directly.
* **Signals propagate automatically** – No need to track dependencies manually.
* **Optimized with a scheduler** – Multiple updates are batched efficiently.

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
						<div class="rows">
							<p>Number of rows:</p>
							<spin-button value="3" zero-label="Add Row" increment-label="Increment">
								<button type="button" class="decrement" aria-label="Decrement">
									−
								</button>
								<p class="value">3</p>
								<button type="button" class="increment" aria-label="Increment">
									+
								</button>
							</spin-button>
						</div>
						<div class="columns">
							<p>Number of columns:</p>
							<spin-button
								value="3"
								zero-label="Add Column"
								increment-label="Increment"
							>
								<button type="button" class="decrement" aria-label="Decrement">
									−
								</button>
								<p class="value">3</p>
								<button type="button" class="increment" aria-label="Increment">
									+
								</button>
							</spin-button>
						</div>
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

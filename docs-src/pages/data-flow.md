---
title: "Data Flow"
emoji: "🔄"
description: "Passing state, events, context"
---

<section class="hero">

# 🔄 Data Flow

<p class="lead"><strong>UIElement enables smooth data flow between components using signals, events, and context.</strong> State can be <strong>passed down</strong> to child components, events can <strong>bubble up</strong> to notify parents of changes, and context can propagate across the component tree to <strong>share global state</strong> efficiently. This page explores different patterns for structuring data flow, helping you create modular, loosely coupled components that work seamlessly together.</p>
</section>

<section>

## Component Coordination

Let's consider a **product catalog** where users can add items to a shopping cart. We have **three independent components** that work together:

* `ProductCatalog` **(Parent)**:
	- **Tracks all `SpinButton` components** in its subtree and calculates the total count of items in the shopping cart.
	- **Passes that total** to a `InputButton`.
* `InputButton` **(Child)**:
	- Displays a **badge** in the top-right corner when the `badge` property is set.
	- **Does not track any state** – it simply renders whatever value is passed to it.
* `SpinButton` **(Child)**:
	- Displays an **Add to Cart** button initially.
	- When an item is added, it transforms into a **stepper** (increment/decrement buttons).

Although `InputButton` and `SpinButton` are completely independent, they need to work together.
So `ProductCatalog` **coordinates the data flow between them**.

### Parent Component: ProductCatalog

The **parent component (`ProductCatalog`) knows about its children**, meaning it can **retrieve state from and pass state to** them.

First, we need to observe the quantities of all `SpinButton` components. For this, we create a signal of all children matching the `spin-button` selector:

```js
component("product-catalog", {
	total: (el) => () =>
		selection(el, "spin-button")
			.get()
			.reduce((sum, item) => sum + item.value, 0),
}, () => []);
```

The `selection()` function returns a signal that emits an array of all matching elements. In contrast to a static `querySelectorAll()` call, the `selection()` function is reactive and updates whenever new elements are added or removed from the DOM.

Then, we need to calculate the total of all product quantities and pass it on to the `InputButton` component. In UIElement we use the `pass()` function to share state across components:

```js
component("product-catalog", {
	total: (el) => () =>
		selection(el, "spin-button")
			.get()
			.reduce((sum, item) => sum + item.value, 0),
}, (el) => [
	first("input-button",
		pass({
			badge: () => (el.total > 0 ? String(el.total) : ""),
			disabled: () => !el.total,
		}),
	),
]);
```

Allright, that's it!

* ✅ Whenever one of the `value` signals of a `<spin-button>` updates, the total in the badge of `<input-button>` automatically updates.
* ✅ No need for event listeners or manual updates!

### Child Component: InputButton

The `InputButton` component **displays a badge when needed** – it does not know about any other component nor track state itself. It just exposes a reactive property `badge` of type `string` and has an effect to react to state changes that updates the DOM subtree.

```js
component("input-button", {
	badge: asString(RESET),
}, () => [
	first(".badge", setText("badge")),
])
```

* ✅ Whenever the `badge` property is updated by a parent component, the badge text updates.
* ✅ If `badge` is an empty string, the badge indicator is hidden (via CSS).

### ChildComponent: SpinButton

The `SpinButton` component reacts to user interactions and exposes a reactive property `value` of type `number`. It updates its own internal DOM subtree, but doesn't know about any other component nor where the value is used.

```js
component("spin-button", {
	value: asInteger(),
}, (el) => {
	const max = asInteger(9)(el, el.getAttribute("max"));
	const isZero = () => el.value === 0;
	return [
		first(".value",
			setText("value"),
			setProperty("hidden", isZero),
		),
		first(".decrement",
			setProperty("hidden", isZero),
			on("click", () => {
				el.value--;
			}),
		),
		first(".increment",
			setProperty("disabled", () => el.value >= max),
			on("click", () => {
				el.value++;
			}),
		),
		all("button",
			on("keydown", (e) => {
				const { key } = e;
				if (["ArrowUp", "ArrowDown", "-", "+"].includes(key)) {
					e.stopPropagation();
					e.preventDefault();
					if (key === "ArrowDown" || key === "-") el.value--;
					if (key === "ArrowUp" || key === "+") el.value++;
				}
			}),
		),
	];
});
```

* ✅ Whenever the user clicks a button or presses a handled key, the value property is updated.
* ✅ The component sets hidden and disabled states of buttons and updates the text of the `.value` element.

### Full Example

Here's how everything comes together:

* Each `SpinButton` tracks its own value.
* The `ProductCatalog` sums all quantities and passes the total to `InputButton`.
* The `InputButton` displays the total if it's greater than zero.

**No custom events are needed – state flows naturally!**

<component-demo>
	<div class="preview">
		<product-catalog>
			<header>
				<p>Shop</p>
				<input-button disabled>
					<button type="button" disabled>
						<span class="label">🛒 Shopping Cart</span>
						<span class="badge"></span>
					</button>
				</input-button>
			</header>
			<ul>
				<li>
					<p>Product 1</p>
					<spin-button value="0" zero-label="Add to Cart" increment-label="Increment">
						<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
						<p class="value" hidden>0</p>
						<button type="button" class="increment">Add to Cart</button>
					</spin-button>
				</li>
				<li>
					<p>Product 2</p>
					<spin-button value="0" zero-label="Add to Cart" increment-label="Increment">
						<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
						<p class="value" hidden>0</p>
						<button type="button" class="increment">Add to Cart</button>
					</spin-button>
				</li>
				<li>
					<p>Product 3</p>
					<spin-button value="0" zero-label="Add to Cart" increment-label="Increment">
						<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
						<p class="value" hidden>0</p>
						<button type="button" class="increment">Add to Cart</button>
					</spin-button>
				</li>
			</ul>
		</product-catalog>
	</div>
	<details>
		<summary>ProductCatalog Source Code</summary>
		<lazy-load src="./examples/product-catalog.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
	<details>
		<summary>InputButton Source Code</summary>
		<lazy-load src="./examples/input-button.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
	<details>
		<summary>SpinButton Source Code</summary>
		<lazy-load src="./examples/spin-button.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
</component-demo>

</section>

<section>

## Custom Events

Passing state down works well when a **parent component can directly observe child state**, but sometimes a **child needs to notify its parent** about an action **without managing shared state itself**.

Let's consider a Todo App, where users can add tasks:

* `TodoApp` **(Parent)**:
	- Holds the list of todos as a state signal.
	- Listens for an `add-todo` event from the child (`TodoForm`).
	- Updates the state when a new todo is submitted.
* `TodoForm` **(Child)**:
	- Handles **user input** but does **not** store todos.
	- Emits an `add-todo` event when the user submits the form.
	- Lets the parent decide **what to do with the data**.

### Why use events here?

* The child **doesn't need to know where the data goes** – it just **emits an event**.
* The parent **decides what to do** with the new todo (e.g., adding it to a list).
* This keeps `TodoForm` **reusable** – it could work in different apps without modification.

### Parent Component: TodoApp

The parent (`TodoApp`) **listens for events** and calls the `.addItem()` method on `TodoList` when a new todo is added:

```js
this.self.on('add-todo', e => {
	this.querySelector('todo-list').addItem(e.detail)
})
```
* ✅ **Whenever `TodoForm` emits an `'add-todo'` event**, a new task is appended to the todo list.
* ✅ The **event carries data** (`e.detail`), so the parent knows what was submitted.

### Child Component: TodoForm

The child (`TodoForm`) **collects user input** and emits an event when the form is submitted:

```js
const input = this.querySelector('input-field')
this.first('form').on('submit', e => {
	e.preventDefault()

	// Wait for microtask to ensure the input field value is updated before dispatching the event
	queueMicrotask(() => {
		const value = input?.get('value')?.trim()
		if (value) {
			this.self.emit('add-todo', value)
			input?.clear()
		}
	})
})
```

* ✅ The form does **NOT store the todo** – it just emits an event.
* ✅ The parent (`TodoApp`) **decides what happens next**.
* ✅ The **event includes data** (value), making it easy to handle.

### Full Example

Here's how everything comes together:

* **User types a task** into input field in `TodoForm`.
* **On submit, `TodoForm` emits `'add-todo'`** with the new task as event detail.
* **`TodoApp` listens for `'add-todo'`** and updates the todo list.

<component-demo>
	<div class="preview">
		<todo-app>
			<form action="#">
				<input-field>
					<label for="add-todo">What needs to be done?</label>
					<div class="row">
						<div class="group auto">
							<input id="add-todo" type="text" value="" required>
						</div>
					</div>
				</input-field>
				<input-button class="submit">
					<button type="submit" class="constructive" disabled>Add Todo</button>
				</input-button>
			</form>
			<ol filter="all"></ol>
			<template>
				<li>
					<input-checkbox class="todo">
						<label>
							<input type="checkbox" class="visually-hidden" />
							<span class="label"><slot></slot></span>
						</label>
					</input-checkbox>
					<input-button class="delete">
						<button type="button" class="destructive small">Delete</button>
					</input-button>
				</li>
			</template>
			<footer>
				<div class="todo-count">
					<p class="all-done">Well done, all done!</p>
					<p class="remaining">
						<span class="count"></span>
						<span class="singular">task</span>
						<span class="plural">tasks</span>
						remaining
					</p>
				</div>
				<input-radiogroup value="all" class="split-button">
					<fieldset>
						<legend class="visually-hidden">Filter</legend>
							<label class="selected">
								<input type="radio" class="visually-hidden" name="filter" value="all" checked>
								<span>All</span>
							</label>
							<label>
								<input type="radio" class="visually-hidden" name="filter" value="active">
								<span>Active</span>
							</label>
							<label>
								<input type="radio" class="visually-hidden" name="filter" value="completed">
								<span>Completed</span>
							</label>
					</fieldset>
				</input-radiogroup>
				<input-button class="clear-completed">
					<button type="button" class="destructive">
						<span class="label">Clear Completed</span>
						<span class="badge"></span>
					</button>
				</input-button>
			</footer>
		</todo-app>
	</div>
	<details>
		<summary>TodoApp Source Code</summary>
		<lazy-load src="./examples/todo-app.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
	<details>
		<summary>InputField Source Code</summary>
		<lazy-load src="./examples/input-field.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
	<details>
		<summary>InputButton Source Code</summary>
		<lazy-load src="./examples/input-button.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
	<details>
		<summary>InputCheckbox Source Code</summary>
		<lazy-load src="./examples/input-checkbox.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
	<details>
		<summary>InputRadiogroup Source Code</summary>
		<lazy-load src="./examples/input-radiogroup.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
</component-demo>

</section>

<section>

## Providing Context



</section>

<section>

## Consuming Context



</section>

<section>

## Next Steps



</section>

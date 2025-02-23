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

## Passing State Down

Let's consider a **product catalog** where users can add items to a shopping cart. We have **three independent components** that work together:

* `ProductCatalog` **(Parent)**:
	- **Tracks all `SpinButton` components** in its subtree and derives the **total count** of items in the shopping cart.
	- **Passes that total** to a `BadgeButton`, which displays the number of items in the cart.
* `BadgeButton` **(Child)**:
	- Displays a **cart badge** when the `'badge'` signal is set.
	- **Does not track any state** – it simply renders whatever value is passed down.
* `SpinButton` **(Child)**:
	- Displays an **“Add to Cart”** button initially.
	- When an item is added, it transforms into a **stepper** (increment/decrement buttons).

Although `BadgeButton` **and** `SpinButton` are completely independent, they need to work together.
So `ProductCatalog` **coordinates the data flow between them**.

### Parent Component: ProductCatalog

The **parent component (`ProductCatalog`) knows about its children**, meaning it can **observe and pass state** to them.

Use the `.pass()` method to send values to child components. It takes an object where:

* **Keys** = Signal names in the **child** (`BadgeButton`)
* **Values** = Signal names in the parent (`ProductCatalog`) or functions returning computed values

```js
this.first('input-button').pass({
	badge: () => {
		const total = this.get('total');
		return typeof total === 'number' && total > 0 ? String(total) : '';
	}
});
```

* ✅ **Whenever the `total` signal updates, `<input-button>` automatically updates.**
* ✅ **No need for event listeners or manual updates!**

### Child Component: BadgeButton

The `InputButton` component **displays a badge when needed** – it does not track state itself.

Whenever the `'badge'` **signal assigned by a parent component** updates, the badge text updates.

```js
class InputButton extends UIElement {
	connectedCallback() {
		this.first('.badge').sync(setText('badge'));
	}
}
```

* ✅ The `setText('badge')` effect **keeps the badge in sync** with the `'badge'` signal.
* ✅ If badge is an **empty string**, the badge is **hidden**.

The `BadgeButton` **doesn’t care how the badge value is calculated** – just that it gets one!

### Full Example

Here's how everything comes together:

* Each `SpinButton` **tracks its own count**.
* The `ProductCatalog` **sums all counts and passes the total to `BadgeButton`**.
* The `BadgeButton` **displays the total** if it's greater than zero.

**No custom events are needed – state flows naturally!**

<component-demo>
<div class="preview">
<product-catalog>
<header>
<p>Shop</p>
<input-button>
<button type="button">
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
<button type="button" class="increment primary">Add to Cart</button>
</spin-button>
</li>
<li>
<p>Product 2</p>
<spin-button value="0" zero-label="Add to Cart" increment-label="Increment">
<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
<p class="value" hidden>0</p>
<button type="button" class="increment primary">Add to Cart</button>
</spin-button>
</li>
<li>
<p>Product 3</p>
<spin-button value="0" zero-label="Add to Cart" increment-label="Increment">
<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
<p class="value" hidden>0</p>
<button type="button" class="increment primary">Add to Cart</button>
</spin-button>
</li>
</ul>
</product-catalog>
</div>
<accordion-panel collapsible>
<details>
<summary>
<div class="summary">ProductCatalog Source Code</div>
</summary>
<lazy-load src="./examples/product-catalog.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
<accordion-panel collapsible>
<details>
<summary>
<div class="summary">InputButton Source Code</div>
</summary>
<lazy-load src="./examples/input-button.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
<accordion-panel collapsible>
<details>
<summary>
<div class="summary">SpinButton Source Code</div>
</summary>
<lazy-load src="./examples/spin-button.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
</component-demo>

</section>

<section>

## Events Bubbling Up

Passing state down works well when a **parent component can directly observe child state**, but sometimes a **child needs to notify its parent** about an action **without managing shared state itself**.

Let's consider a Todo App, where users can add tasks:

* `TodoApp` **(Parent)**:
	- Holds the list of todos as a state signal.
	- Listens for an `'add-todo'` event from the child (`TodoForm`).
	- Updates the state when a new todo is submitted.
* `TodoForm` **(Child)**:
	- Handles **user input** but does **not** store todos.
	- Emits an `'add-todo'` event when the user submits the form.
	- Lets the parent decide **what to do with the data**.

### Why use events here?

* The child **doesn’t need to know where the data goes** – it just **emits an event**.
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
					<button type="submit" class="primary" disabled>Add Todo</button>
				</input-button>
			</form>
			<ol filter="all"></ol>
			<template>
				<li>
					<input-checkbox class="todo">
						<label>
							<input type="checkbox" class="visually-hidden" />
							<span></span>
						</label>
					</input-checkbox>
					<input-button class="delete">
						<button type="button">Delete</button>
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
					<button type="button">Clear Completed</button>
				</input-button>
			</footer>
		</todo-app>
	</div>
	<accordion-panel collapsible>
		<details>
			<summary>TodoApp Source Code</summary>
			<lazy-load src="./examples/todo-app.html">
				<p class="loading">Loading...</p>
			</lazy-load>
		</details>
	</accordion-panel>
	<accordion-panel collapsible>
		<details>
			<summary>InputField Source Code</summary>
			<lazy-load src="./examples/input-field.html">
				<p class="loading">Loading...</p>
			</lazy-load>
		</details>
	</accordion-panel>
	<accordion-panel collapsible>
		<details>
			<summary>InputButton Source Code</summary>
			<lazy-load src="./examples/input-button.html">
				<p class="loading">Loading...</p>
			</lazy-load>
		</details>
	</accordion-panel>
	<accordion-panel collapsible>
		<details>
			<summary>InputCheckbox Source Code</summary>
			<lazy-load src="./examples/input-checkbox.html">
				<p class="loading">Loading...</p>
			</lazy-load>
		</details>
	</accordion-panel>
	<accordion-panel collapsible>
		<details>
			<summary>InputRadiogroup Source Code</summary>
			<lazy-load src="./examples/input-radiogroup.html">
				<p class="loading">Loading...</p>
			</lazy-load>
		</details>
	</accordion-panel>
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
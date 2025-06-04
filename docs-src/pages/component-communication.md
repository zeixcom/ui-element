---
title: "Component Communication"
emoji: "🔄"
description: "How components work together"
---

<section class="hero">

# 🔄 Component Communication

<p class="lead"><strong>Learn how UIElement components can work together seamlessly.</strong> Start with simple parent-child relationships, then explore advanced patterns like custom events and shared state. Build modular, loosely coupled components that communicate efficiently.</p>
</section>

<section>

## Simple Parent-Child Communication

The most basic form of component communication is when a parent component manages state and passes it to child components.

### Basic State Passing

Let's start with a simple counter where a parent manages the count and passes it to display components:

```js
// Parent component manages state
component("counter-app", {
    count: asInteger(0)
}, (el, { first, all }) => [
    // Pass state down to children
    first("counter-display", pass({ value: "count" })),
    first("counter-controls", pass({ value: "count" })),
    
    // Listen for updates from children
    first("counter-controls", on("increment", () => el.count++)),
    first("counter-controls", on("decrement", () => el.count--))
]);

// Child component displays the value
component("counter-display", {
    value: asInteger(0)
}, (el, { first }) => [
    first(".count", setText("value"))
]);

// Child component provides controls
component("counter-controls", {
    value: asInteger(0)
}, (el, { first }) => [
    first(".increment", on("click", () => {
        el.dispatchEvent(new CustomEvent("increment"));
    })),
    first(".decrement", on("click", () => {
        el.dispatchEvent(new CustomEvent("decrement"));
    }))
]);
```

**Key Pattern:**
* Parent owns the state
* Children receive state via `pass()`
* Children notify parent via custom events
* No child needs to know about siblings

</section>

<section>

## Observing Child State

Sometimes a parent needs to react to state changes in its children. Use the `selection()` function to observe multiple child components:

```js
component("form-validator", {
    // Computed from all child inputs
    isValid: (el) => () => 
        selection(el, "input-field")
            .get()
            .every(field => field.isValid)
}, (el, { first }) => [
    // Enable submit button only when all fields are valid
    first(".submit-button", 
        setProperty("disabled", () => !el.isValid)
    )
]);
```

**How it works:**
* `selection()` returns a reactive signal of matching elements
* Signal updates when children are added/removed or their state changes
* Parent can compute derived state from all children
</section>

<section>

## Advanced Coordination Example

Now let's look at a more complex example - a **product catalog** where multiple components work together:

### The Parent Coordinates Everything

```js
component("product-catalog", {
    // Calculate total from all spin buttons
    total: (el) => () =>
        selection(el, "spin-button")
            .get()
            .reduce((sum, item) => sum + item.value, 0)
}, (el, { first }) => [
    // Pass calculated total to the shopping cart button
    first("cart-button",
        pass({
            badge: () => el.total > 0 ? String(el.total) : "",
            disabled: () => el.total === 0
        })
    )
]);
```

**What happens:**
* `selection(el, "spin-button")` finds all product quantity controls
* The total is automatically recalculated when any quantity changes
* The cart button receives the total and updates its badge
* No manual event handling needed!

### The Cart Button is Simple

```js
component("cart-button", {
    badge: asString(""),
    disabled: asBoolean(false)
}, (el, { first }) => [
    first(".badge", setText("badge")),
    first("button", setProperty("disabled", "disabled"))
]);
```

**Key insight:** The cart button doesn't know about products or totals. It just displays what the parent tells it to display.

### Each Product Manages Its Own State

```js
component("spin-button", {
    value: asInteger(0)
}, (el, { first }) => {
    const isZero = () => el.value === 0;
    
    return [
        first(".value", 
            setText("value"),
            setProperty("hidden", isZero)
        ),
        first(".decrement",
            setProperty("hidden", isZero),
            on("click", () => el.value--)
        ),
        first(".increment",
            on("click", () => el.value++)
        )
    ];
});
```

**The magic:** Each product button manages its own quantity, but the parent automatically knows when any quantity changes.

### How It All Works Together

This pattern demonstrates several key principles:

* **Single responsibility**: Each component has one clear job
* **Reactive aggregation**: The parent automatically recalculates when children change  
* **Declarative updates**: No manual DOM manipulation or event handling
* **Loose coupling**: Components don't need to know about each other

**The result:** Add any number of products, and the cart total updates automatically!

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
			<callout-box>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</callout-box>
		</lazy-load>
	</details>
	<details>
		<summary>InputButton Source Code</summary>
		<lazy-load src="./examples/input-button.html">
			<callout-box>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</callout-box>
		</lazy-load>
	</details>
	<details>
		<summary>SpinButton Source Code</summary>
		<lazy-load src="./examples/spin-button.html">
			<callout-box>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</callout-box>
		</lazy-load>
	</details>
</component-demo>

</section>

<section>

## Custom Events for Actions

Sometimes children need to notify parents about actions rather than state changes. Custom events are perfect for this:

### When to Use Events vs State Observation

**Use state observation when:**
* Child manages persistent state (like form input values)
* Parent needs to aggregate or compute from child state
* State changes frequently and parent needs to react

**Use custom events when:**
* Child performs an action (like submitting a form)
* Child doesn't need to store the data permanently  
* Parent decides what happens with the action

### Example: Todo Form

Let's see how a form component can notify its parent about new todos:

**Why events work well here:**
* Form doesn't need to store todos permanently
* Parent decides how to handle the new todo
* Form stays reusable across different contexts
* Clear separation of concerns

**Parent listens and manages the todo list:**

```js
component("todo-app", {
    todos: asJSON([])
}, (el, { first }) => [
    // Listen for new todos from the form
    first("todo-form", on("add-todo", (e) => {
        el.todos = [...el.todos, {
            id: Date.now(),
            text: e.detail,
            completed: false
        }];
    })),
    
    // Pass todos to the list component
    first("todo-list", pass({ items: "todos" }))
]);
```

**Form handles input and emits events:**

```js
component("todo-form", {
    input: asString("")
}, (el, { first }) => [
    first("input", 
        setProperty("value", "input"),
        on("input", (e) => el.input = e.target.value)
    ),
    
    first("form", on("submit", (e) => {
        e.preventDefault();
        
        if (el.input.trim()) {
            // Emit event with the todo text
            el.dispatchEvent(new CustomEvent("add-todo", {
                detail: el.input.trim()
            }));
            
            // Clear the form
            el.input = "";
        }
    }))
]);
```

**The complete flow:**

1. User types in the form input
2. User submits the form  
3. Form emits `add-todo` event with the text
4. Parent catches the event and adds to todos array
5. Todo list automatically updates to show the new item

This pattern keeps components focused and reusable!

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
			<callout-box>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</callout-box>
		</lazy-load>
	</details>
	<details>
		<summary>InputField Source Code</summary>
		<lazy-load src="./examples/input-field.html">
			<callout-box>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</callout-box>
		</lazy-load>
	</details>
	<details>
		<summary>InputButton Source Code</summary>
		<lazy-load src="./examples/input-button.html">
			<callout-box>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</callout-box>
		</lazy-load>
	</details>
	<details>
		<summary>InputCheckbox Source Code</summary>
		<lazy-load src="./examples/input-checkbox.html">
			<callout-box>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</callout-box>
		</lazy-load>
	</details>
	<details>
		<summary>InputRadiogroup Source Code</summary>
		<lazy-load src="./examples/input-radiogroup.html">
			<callout-box>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</callout-box>
		</lazy-load>
	</details>
</component-demo>

</section>

<section>

## Shared State with Context

For state that needs to be shared across many components (like user authentication, theme preferences, or global settings), UIElement provides a context system.

### Setting Up Context

```js
// Create a global theme context
const ThemeContext = createContext({
    theme: "light",
    toggleTheme: () => {}
});

// Provide context at the app level
component("app-root", {
    theme: asString("light")
}, (el, { provide }) => [
    provide(ThemeContext, {
        theme: () => el.theme,
        toggleTheme: () => {
            el.theme = el.theme === "light" ? "dark" : "light";
        }
    })
]);
```

### Consuming Context

```js
// Any child component can access the theme
component("theme-toggle", {}, (el, { consume, first }) => {
    const theme = consume(ThemeContext);
    
    return [
        first("button",
            setText(() => `Switch to ${theme.theme === "light" ? "dark" : "light"}`),
            on("click", theme.toggleTheme)
        )
    ];
});
```

**When to use context:**
* Global application state (user, theme, language)
* Configuration that affects many components
* Avoiding prop drilling through many component layers

**When to avoid context:**
* Local component state
* Simple parent-child communication
* Performance-critical frequent updates

</section>

<section>

## Component Lifecycle & State Management

### Component State Persistence

UIElement components are **stateful** and maintain their state throughout their lifecycle. This has important implications for how components behave:

```js
component('stateful-demo', {
    count: 0
}, (el, { first }) => [
    first('.display', setText('count')),
    first('button', on('click', () => el.count++))
]);
```

**Key behaviors:**
* Component state persists as long as the element remains in the DOM
* Moving a component in the DOM preserves its state
* Component initialization only runs once when first connected
* State carries over if the same DOM element is reused

### State Reset Patterns

Sometimes you need to reset component state:

```js
// Manual state reset
const resetComponent = (component) => {
    component.count = 0;
    component.name = "";
    // Reset other properties as needed
};

// Or define a reset method in the component
component('resettable-component', {
    count: 0,
    name: ""
}, (el, { first }) => {
    // Add reset method to component
    el.reset = () => {
        el.count = 0;
        el.name = "";
    };
    
    return [
        first('.display', setText('count')),
        first('.reset-btn', on('click', () => el.reset()))
    ];
});
```

### Component Isolation

When components share DOM elements or IDs, state can interfere:

```html
<!-- Avoid sharing IDs between test scenarios -->
<my-component id="test1">...</my-component>
<my-component id="test2">...</my-component>

<!-- Better: Use unique identifiers -->
<my-component data-test="scenario-1">...</my-component>
<my-component data-test="scenario-2">...</my-component>
```

## Best Practices

### Keep Components Focused

Each component should have a single, clear responsibility:

```js
// Good: Focused on displaying user info
component("user-profile", {
    user: asJSON({ name: "", email: "" })
}, (el, { first }) => [
    first(".name", setText(() => el.user.name)),
    first(".email", setText(() => el.user.email))
]);

// Avoid: Mixing display and data fetching
component("user-profile-bad", {
    userId: asString("")
}, (el, { first }) => [
    // Don't mix data fetching with display logic
    first(".content", async () => {
        const user = await fetchUser(el.userId);
        // Complex rendering logic here...
    })
]);
```

### Prefer Composition Over Configuration

Build complex UIs by composing simple components:

```js
// Good: Compose simple components
<user-dashboard>
    <user-profile user-id="123"></user-profile>
    <user-settings user-id="123"></user-settings>
    <user-activity user-id="123"></user-activity>
</user-dashboard>

// Avoid: One complex component that does everything
<user-everything user-id="123" show-profile show-settings show-activity></user-everything>
```

### Use Events for Actions, State for Data

* **Events**: User actions, workflow steps, notifications
* **State observation**: Data that changes and needs to be displayed
* **Context**: Global state that many components need

</section>

<section>

## Next Steps

Now you understand how UIElement components communicate and coordinate. Continue your journey:

* **[Examples & Recipes](examples-recipes.html)** - See these patterns applied in complete, real-world components
* **[Patterns & Techniques](patterns-techniques.html)** - Advanced architectural patterns and optimization techniques
* **[Styling Components](styling-components.html)** - Learn how to style your components effectively

</section>
</edits>

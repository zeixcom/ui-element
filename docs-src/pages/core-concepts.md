---
title: 'Core Concepts'
emoji: '🏗️'
description: 'Component anatomy, lifecycle, and basic patterns'
---

<section class="hero">

# 🏗️ Core Concepts

<p class="lead"><strong>Master the fundamental building blocks of UIElement components.</strong> Learn how to define components, manage their lifecycle, select elements, and handle basic state and events. These core concepts form the foundation for building reactive, maintainable Web Components.</p>
</section>

<section>

## Component Anatomy

Every UIElement component follows the same basic structure. Let's break down a simple example:

```js
component(
	'my-counter',
	{
		// State definition - reactive properties
		count: 0,
	},
	(el, { first, all }) => [
		// Effects array - what happens when the component mounts
		first('.display', setText('count')),
		first(
			'.increment',
			on('click', () => el.count++),
		),
	],
)
```

**Three main parts:**

1. **Component name** (`"my-counter"`) - Must contain a hyphen for Web Components
2. **State definition** (`{ count: 0 }`) - Reactive properties and their initial values
3. **Effects function** - Returns an array of effects that define component behavior

</section>

<section>

## Defining Your First Component

Let's build a simple greeting component step by step:

### HTML Structure

Start with semantic HTML:

```html
<user-greeting name="Alice">
	<p>Hello, <span class="name">Alice</span>!</p>
	<button type="button">Change Name</button>
</user-greeting>
```

### Component Definition

```js
import { component, on, setText } from '@zeix/ui-element'

component(
	'user-greeting',
	{
		// Define a reactive property called "name"
		name: 'Guest',
	},
	(el, { first }) => [
		// Update the .name element when state changes
		first('.name', setText('name')),

		// Handle button clicks to change the name
		first(
			'button',
			on('click', () => {
				const names = ['Alice', 'Bob', 'Charlie', 'Diana']
				const currentIndex = names.indexOf(el.name)
				const nextIndex = (currentIndex + 1) % names.length
				el.name = names[nextIndex]
			}),
		),
	],
)
```

**What happens here:**

- `name: "Guest"` creates a reactive string property with a default value
- `setText("name")` updates the text content when the `name` property changes
- `on("click", ...)` adds an event listener that cycles through names
- The component automatically updates the DOM when `el.name` changes

</section>

<section>

## Component Lifecycle

UIElement components follow the standard Web Components lifecycle:

### Component Creation

When a component is first defined:

```js
component(
	'my-component',
	{
		// State is initialized here
		message: 'Hello',
	},
	(el, selectors) => {
		// This function runs once when the component is created
		console.log('Component created:', el.tagName)

		return [
			// Effects are set up but not yet active
			first('.output', setText('message')),
		]
	},
)
```

### Mounted in the DOM

When the component is added to the page:

```js
component(
	'lifecycle-demo',
	{
		status: 'created',
	},
	(el, { first }) => [
		first('.status', setText('status')),

		// Use a setup function for mount logic
		() => {
			console.log('Component mounted')
			el.status = 'mounted'

			// Return cleanup function for unmount
			return () => {
				console.log('Component will unmount')
			}
		},
	],
)
```

### Cleanup on Removal

UIElement automatically handles cleanup when components are removed from the DOM:

- Event listeners are removed
- Signal subscriptions are cleaned up
- Custom cleanup functions are called

</section>

<section>

## Selecting Elements

Use the provided selector utilities to find elements within your component:

### `first(selector, ...effects)`

Selects the first matching element and applies effects:

```js
component(
	'selector-demo',
	{
		value: '',
	},
	(el, { first }) => [
		// Select first input and add event listener
		first(
			'input',
			on('input', e => {
				el.value = e.target.value
			}),
		),

		// Select first .output and update text
		first('.output', setText('value')),
	],
)
```

### `all(selector, ...effects)`

Selects all matching elements and applies effects to each:

```js
component(
	'multi-select',
	{
		activeClass: 'active',
	},
	(el, { all }) => [
		// Apply click handler to all buttons
		all(
			'button',
			on('click', e => {
				// Toggle active class on clicked button
				const isActive = e.target.classList.contains(el.activeClass)
				e.target.classList.toggle(el.activeClass, !isActive)
			}),
		),
	],
)
```

### Chaining Effects

You can apply multiple effects to the same element:

```js
first(
	'button',
	setText('label'),
	setProperty('disabled', () => !el.isValid),
	on('click', handleClick),
)
```

</section>

<section>

## Basic State Management

UIElement provides three distinct ways to initialize component state, each serving different use cases:

### 1. Direct Values (Component Defaults)

Use plain JavaScript values when you want hardcoded defaults that don't come from HTML:

```js
component(
	'my-component',
	{
		title: 'Default Title', // String default
		count: 0, // Number default
		enabled: false, // Boolean default
	},
	(el, { first }) => [
		first('.title', setText('title')),
		first('.count', setText('count')),
		first(
			'.status',
			setText(() => (el.enabled ? 'Enabled' : 'Disabled')),
		),
	],
)
```

**When to use:** Component has sensible defaults that work without any HTML configuration.

### 2. From HTML Attributes (Parser Functions)

Use parser functions when you want to read initial values from HTML attributes:

```js
component(
	'configurable-component',
	{
		title: asString('Fallback Title'), // Reads from title="" attribute
		count: asInteger(10), // Reads from count="" attribute
		enabled: asBoolean, // Reads from enabled="" attribute
	},
	(el, { first }) => [
		first('.title', setText('title')),
		first('.count', setText('count')),
		first(
			'.status',
			setText(() => (el.enabled ? 'Enabled' : 'Disabled')),
		),
	],
)
```

```html
<configurable-component title="Custom Title" count="25" enabled>
	<!-- Component will start with: title="Custom Title", count=25, enabled=true -->
</configurable-component>
```

**When to use:** Component behavior should be configurable via HTML attributes.

**Default values for parsers:**

- `asString()` without argument defaults to `""`
- `asInteger()` without argument defaults to `0`
- `asNumber()` without argument defaults to `0`
- `asBoolean` has no default parameter - automatically determines true/false from attribute presence

### 3. From DOM Content (RESET Pattern)

Use `RESET` when you want to read initial values from existing DOM text content:

```js
component(
	'server-hydrated',
	{
		// Get initial value from the .count element's text content
		count: RESET,
	},
	(el, { first }) => [first('.count', setText('count'))],
)
```

```html
<server-hydrated>
	<p>Count: <span class="count">42</span></p>
</server-hydrated>
```

The component will start with `count = 42` from the HTML content.

**When to use:** Enhancing server-rendered content where the initial state is already in the DOM.

**Important:** `RESET` does **not** read from HTML attributes. It only reads from DOM text content. If you want to read from attributes like `<my-component title="Hello">`, you must use parser functions like `asString()`.

```html
<!-- This WON'T work with RESET -->
<my-component title="Hello">
	<span>World</span>
	<!-- RESET reads "World", ignores title attribute -->
</my-component>

<!-- To read from attributes, use parser functions -->
<my-component title="Hello">
	<!-- Component with title: asString() will read "Hello" from title="" -->
</my-component>
```

### Boolean Attribute Special Case

The `asBoolean` parser has special behavior - it doesn't need a default value:

```js
component(
	'toggle-component',
	{
		active: asBoolean,
	},
	(el, { first }) => [
		first(
			'.status',
			setText(() => (el.active ? 'Active' : 'Inactive')),
		),
	],
)
```

**Boolean evaluation rules:**

- `true` if attribute exists and doesn't have value `"false"`
- `false` if attribute doesn't exist or has value `"false"`

```html
<toggle-component active>
	<!-- active = true -->
	<toggle-component active="true">
		<!-- active = true -->
		<toggle-component active="false">
			<!-- active = false -->
			<toggle-component>
				<!-- active = false --></toggle-component
			></toggle-component
		></toggle-component
	></toggle-component
>
```

### Combining Approaches

You can mix different initialization approaches in the same component:

```js
component(
	'flexible-component',
	{
		// Direct value - always starts with this default
		theme: 'light',

		// From attribute - configurable via HTML
		title: asString('Default Title'),

		// From DOM content - enhance existing content
		currentValue: RESET,
	},
	(el, { first }) => [
		first('.theme', setText('theme')),
		first('.title', setText('title')),
		first('.value', setText('currentValue')),
	],
)
```

</section>

<section>

## Event Handling

### Basic Event Listeners

Add event listeners using the `on()` effect:

```js
component(
	'event-demo',
	{
		clicks: 0,
	},
	(el, { first }) => [
		first(
			'button',
			on('click', () => {
				el.clicks++
			}),
		),

		first('.counter', setText('clicks')),
	],
)
```

### Event Object Access

Access the event object for more control:

```js
component(
	'form-handler',
	{
		input: '',
	},
	(el, { first }) => [
		first(
			'input',
			on('input', event => {
				el.input = event.target.value
			}),
		),

		first(
			'form',
			on('submit', event => {
				event.preventDefault()
				console.log('Submitted:', el.input)
			}),
		),
	],
)
```

### Multiple Event Types

Handle multiple events on the same element:

```js
first(
	'input',
	on('focus', () => console.log('Input focused')),
	on('blur', () => console.log('Input blurred')),
	on('input', e => (el.value = e.target.value)),
)
```

</section>

<section>

## Putting It All Together

Here's a complete example that demonstrates all the core concepts:

```js
component(
	'task-item',
	{
		text: RESET,
		completed: false,
	},
	(el, { first }) => [
		// Update task text display
		first('.task-text', setText('text')),

		// Handle completion toggle
		first(
			'.checkbox',
			setProperty('checked', 'completed'),
			on('change', e => {
				el.completed = e.target.checked
			}),
		),

		// Handle text editing
		first(
			'.edit-input',
			setProperty('value', 'text'),
			on('blur', e => {
				el.text = e.target.value
			}),
		),

		// Toggle edit mode
		first(
			'.edit-button',
			on('click', () => {
				const input = el.querySelector('.edit-input')
				input.focus()
			}),
		),

		// Apply completed styling
		() => {
			const updateStyle = () => {
				el.classList.toggle('completed', el.completed)
			}
			updateStyle() // Initial state
			return updateStyle // Update function
		},
	],
)
```

```html
<task-item completed="false">
	<label>
		<input type="checkbox" class="checkbox" />
		<span class="task-text">Learn UIElement</span>
	</label>
	<input type="text" class="edit-input" style="display: none;" />
	<button class="edit-button">Edit</button>
</task-item>
```

This component demonstrates:

- State initialization from HTML (`RESET`)
- Multiple element selections and effects
- Event handling for user interactions
- Dynamic property updates
- Custom styling logic

</section>

<section>

## Next Steps

Now that you understand the core concepts, you're ready to explore:

- **[Reactive State & Effects](reactive-state.html)** - Deep dive into UIElement's reactivity system
- **[Component Communication](component-communication.html)** - Learn how components can work together
- **[Examples & Recipes](examples-recipes.html)** - See these concepts applied in real-world scenarios

</section>

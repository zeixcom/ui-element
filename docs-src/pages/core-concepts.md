---
title: 'Core Concepts'
emoji: '🏗️'
description: 'Component anatomy, lifecycle, and basic patterns'
---

<section class="hero">

# 🏗️ Core Concepts

<p class="lead"><strong>Master the fundamental building blocks of UIElement components.</strong> This chapter explores the fundamental building blocks of UIElement: components, signals, effects, and element interactions.</p>
</section>

<section>

## Component Anatomy

Every UIElement component follows the same basic structure. Let's break down a simple example:

```js
component(
	'my-component',
	{
		// Reactive properties
	},
	(el, { first, all }) => [
		// Setup logic and effects
	],
)
```

The `component()` function has three parameters:

1. **Component name**: A unique tag name for your custom element (must include a hyphen)
2. **Reactive properties**: An object defining properties and their initializers
3. **Setup function**: Runs when the component connects to the DOM and returns an array of effects that define component behavior

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
		// Reactive properties are initialized here
		message: 'Hello',
	},
	(el, selectors) => [
		// Effects are set up but not yet active
	],
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

### first()

Selects the first matching element and applies effects:

```js
component(
	'my-counter',
	{
		count: asInteger(),
	},
	(el, { first }) => [
		first('.count', setText('count')),
		first(
			'button',
			on('click', () => {
				el.count++
			}),
		),
	],
)
```

### all()

Selects all matching elements and applies effects to each:

```js
component(
	'tab-group',
	{
		selected: '',
	},
	(el, { all }) => [
		// Apply click handler to all buttons
		all(
			'[role="tab"]',
			on('click', e => {
				el.selected =
					e.currentTarget?.getAttribute('aria-controls') ?? ''
			}),
			setProperty(
				'ariaSelected',
				target => target?.getAttribute('aria-controls') === el.selected,
			),
			setProperty('tabIndex', target =>
				target?.getAttribute('aria-controls') === el.selected ? 0 : -1,
			),
		),

		// Apply hidden property to all tabs
		all(
			'[role="tabpanel"]',
			show(target => el.selected === target.id),
		),
	],
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

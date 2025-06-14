---
title: 'Reactive State & Effects'
emoji: '⚡'
description: 'Signals, effects, and advanced reactivity patterns'
---

<section class="hero">

# ⚡ Reactive State & Effects

<p class="lead"><strong>Master UIElement's powerful reactivity system.</strong> Learn how signals enable fine-grained updates, how effects synchronize state with the DOM, and discover patterns for managing complex state interactions efficiently.</p>
</section>

<section>

## Understanding Signals

Signals are the heart of UIElement's reactivity system. They're observable values that automatically notify subscribers when they change.

### Signal Characteristics

Every signal in UIElement has these key properties:

- **Reactive**: Changes automatically trigger updates to dependent effects
- **Efficient**: Only affected DOM elements are updated, never the entire component
- **Composable**: Signals can be derived from other signals
- **Type-safe**: Full TypeScript support with proper type inference

### Special Values

UIElement provides special constants for common scenarios:

```js
import { RESET, UNSET } from '@zeix/ui-element'

component(
	'signal-demo',
	{
		// RESET: Use server-rendered content as initial value
		title: asString(RESET),

		// UNSET: Remove the element from DOM when signal is falsy
		message: asString(UNSET),

		// Regular default value
		count: asInteger(0),
	},
	(el, { first }) => [
		first('.title', setText('title')),
		first('.message', setText('message')),
		first('.count', setText('count')),
	],
)
```

**When to use each:**

- `RESET` - Server-side rendered content that becomes reactive
- `UNSET` - Conditional rendering (show/hide elements)
- Default values - Fixed starting states

</section>

<section>

## Attribute Parsers Deep Dive

Attribute parsers are functions that tell UIElement to read initial values from HTML attributes and convert them to the appropriate JavaScript types. This is different from using plain values or `RESET`.

### When to Use Parser Functions

Use parser functions when you want your component to be **configurable via HTML attributes**:

```html
<!-- Component configured via attributes -->
<my-component title="Custom Title" count="25" enabled></my-component>
```

```js
component('my-component', {
    // These will read from HTML attributes
    title: asString(),      // Reads title="" attribute
    count: asInteger(),     // Reads count="" attribute
    enabled: asBoolean,     // Reads enabled attribute presence
}, (el, { first }) => [...]);
```

### Built-in Parsers

```js
component(
	'parser-showcase',
	{
		// String parsing with default and validation
		name: asString('Anonymous', {
			validate: value => (value.length > 0 ? value : 'Anonymous'),
		}),

		// Integer with default and bounds
		age: asInteger(0, {
			min: 0,
			max: 150,
		}),

		// Boolean from attribute presence (no default needed)
		active: asBoolean, // true if attribute exists and isn't "false"

		// Enum-like string validation
		status: asString('pending', {
			validate: value =>
				['pending', 'active', 'completed'].includes(value)
					? value
					: 'pending',
		}),
	},
	(el, { first }) => [
		first('.name', setText('name')),
		first('.age', setText('age')),
		first('.status', setText('status')),
		first(
			'.indicator',
			toogleClass('active', 'active'),
			setText(() => (el.active ? 'Active' : 'Inactive')),
		),
	],
)
```

### Parser Function Defaults

All parser functions ensure non-nullability by providing sensible defaults:

- `asString()` without argument defaults to `""`
- `asInteger()` without argument defaults to `0`
- `asNumber()` without argument defaults to `0`
- `asBoolean` doesn't need a default - automatically determines true/false

### Boolean Parser Special Behavior

The `asBoolean` parser has unique logic for determining true/false:

```html
<my-component enabled>
	<!-- enabled = true -->
	<my-component enabled="true">
		<!-- enabled = true -->
		<my-component enabled="false">
			<!-- enabled = false -->
			<my-component>
				<!-- enabled = false (missing) --></my-component
			></my-component
		></my-component
	></my-component
>
```

```js
component(
	'my-component',
	{
		enabled: asBoolean,
	},
	(el, { first }) => [
		first(
			'.status',
			setText(() => (el.enabled ? 'Enabled' : 'Disabled')),
		),
	],
)
```

### Custom Attribute Parsers

Create your own parsers for complex data types:

```js
// Custom date parser
const asDate =
	(defaultValue = new Date()) =>
	(el, attrValue) => {
		if (attrValue === RESET) {
			const timeEl = el.querySelector('time')
			return timeEl ? new Date(timeEl.dateTime) : defaultValue
		}
		return attrValue ? new Date(attrValue) : defaultValue
	}

// Custom JSON parser
const asJSON =
	(defaultValue = {}) =>
	(el, attrValue) => {
		if (attrValue === RESET) {
			const scriptEl = el.querySelector('script[type="application/json"]')
			return scriptEl ? JSON.parse(scriptEl.textContent) : defaultValue
		}
		try {
			return JSON.parse(attrValue || '{}')
		} catch {
			return defaultValue
		}
	}

component(
	'data-component',
	{
		created: asDate(),
		config: asJSON({ theme: 'light' }),
	},
	(el, { first }) => [
		first(
			'.created',
			setText(() => el.created.toLocaleDateString()),
		),
		first(
			'.theme',
			setText(() => el.config.theme),
		),
	],
)
```

</section>

<section>

## Effect System

Effects define how your component responds to state changes. They're the bridge between reactive state and DOM updates.

### Built-in Effects

UIElement provides effects for common DOM manipulations:

```js
component(
	'effect-showcase',
	{
		text: asString('Hello'),
		count: asInteger(0),
		visible: asBoolean(true),
		disabled: asBoolean(false),
	},
	(el, { first }) => [
		// Text content updates
		first('.text', setText('text')),
		first('.count', setText('count')),

		// Property updates
		first(
			'.input',
			setProperty('value', 'text'),
			setProperty('disabled', 'disabled'),
		),

		// Attribute updates
		first(
			'.link',
			setAttribute('href', () => `/page/${el.count}`),
			setAttribute('aria-label', 'text'),
		),

		// Class management
		first(
			'.status',
			toogleClass('visible', 'visible'),
			toogleClass('has-content', () => el.text.length > 0),
		),

		// Style updates
		first(
			'.progress',
			setStyle('width', () => `${el.count}%`),
			setStyle('opacity', () => (el.visible ? 1 : 0.5)),
		),
	],
)
```

### Effect Composition

Combine multiple effects on the same element:

```js
first(
	'.button',
	setText('label'),
	setProperty('disabled', 'isDisabled'),
	toogleClass('primary', 'isPrimary'),
	setAttribute('aria-pressed', () => (el.isPressed ? 'true' : 'false')),
	on('click', handleClick),
)
```

### Custom Effects

Create reusable effects for complex behaviors:

```js
// Custom effect for form validation
const validateField = (validationFn, errorMessage) => (element, signal) => {
	const update = () => {
		const isValid = validationFn(signal())
		element.classList.toggle('error', !isValid)
		element.setAttribute('aria-invalid', isValid ? 'false' : 'true')

		let errorEl = element.nextElementSibling
		if (!errorEl || !errorEl.classList.contains('error-message')) {
			errorEl = document.createElement('div')
			errorEl.className = 'error-message'
			element.after(errorEl)
		}
		errorEl.textContent = isValid ? '' : errorMessage
	}

	update() // Initial state
	return update // Update function
}

// Usage
component(
	'validated-form',
	{
		email: asString(''),
		password: asString(''),
	},
	(el, { first }) => [
		first(
			'.email-input',
			setProperty('value', 'email'),
			on('input', e => (el.email = e.target.value)),
			validateField(
				email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
				'Please enter a valid email address',
			),
		),

		first(
			'.password-input',
			setProperty('value', 'password'),
			on('input', e => (el.password = e.target.value)),
			validateField(
				password => password.length >= 8,
				'Password must be at least 8 characters',
			),
		),
	],
)
```

</section>

<section>

## Local Signals for Protected State

Use local signals for internal component state that shouldn't be exposed as attributes:

```js
component(
	'toggle-button',
	{
		// Public state (attribute-driven)
		label: asString('Toggle'),
		disabled: asBoolean(false),
	},
	(el, { first }) => {
		// Private state (internal only)
		const isPressed = signal(false)
		const animating = signal(false)

		return [
			first(
				'button',
				setText('label'),
				setProperty('disabled', 'disabled'),
				setAttribute('aria-pressed', () =>
					isPressed() ? 'true' : 'false',
				),
				toogleClass('pressed', isPressed),
				toogleClass('animating', animating),

				on('click', async () => {
					if (el.disabled || animating()) return

					animating.set(true)
					isPressed.set(!isPressed())

					// Simulate animation duration
					await new Promise(resolve => setTimeout(resolve, 200))
					animating.set(false)

					// Emit custom event
					el.dispatchEvent(
						new CustomEvent('toggle', {
							detail: { pressed: isPressed() },
						}),
					)
				}),
			),
		]
	},
)
```

**Benefits of local signals:**

- Keep implementation details private
- Prevent external modification of critical state
- Enable complex internal state machines
- Maintain clean public APIs

</section>

<section>

## Derived State with Functions

Use functions for computed values that depend on multiple signals:

```js
component(
	'shopping-cart',
	{
		items: asJSON([]),
		taxRate: asNumber(0.08),
		discount: asNumber(0),
	},
	(el, { first }) => {
		// Derived calculations
		const subtotal = () =>
			el.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

		const tax = () => subtotal() * el.taxRate

		const total = () => subtotal() + tax() - el.discount

		const itemCount = () =>
			el.items.reduce((sum, item) => sum + item.quantity, 0)

		return [
			first('.item-count', setText(itemCount)),
			first(
				'.subtotal',
				setText(() => `$${subtotal().toFixed(2)}`),
			),
			first(
				'.tax',
				setText(() => `$${tax().toFixed(2)}`),
			),
			first(
				'.discount',
				setText(() => `$${el.discount.toFixed(2)}`),
			),
			first(
				'.total',
				setText(() => `$${total().toFixed(2)}`),
			),

			// Conditional rendering based on derived state
			first(
				'.empty-message',
				setStyle('display', () =>
					itemCount() === 0 ? 'block' : 'none',
				),
			),
			first(
				'.checkout-button',
				setProperty('disabled', () => total() <= 0),
			),
		]
	},
)
```

**When to use functions vs signals:**

- **Functions** - For computed values that depend on existing state
- **Signals** - For independent state that can be modified directly

</section>

<section>

## Understanding UIElement's Scheduled Effect System

UIElement uses a **scheduled effect system** that batches DOM updates for optimal performance. Understanding this timing is crucial for building reliable components.

### How Effects Are Scheduled

When you change a component property, DOM updates don't happen immediately:

```js
component(
	'timing-demo',
	{
		count: 0,
	},
	(el, { first }) => [
		first('.display', setText('count')),

		first(
			'button',
			on('click', () => {
				el.count++ // Property changes immediately
				console.log(el.count) // Shows new value: 1

				// But DOM update is scheduled, not immediate
				const display = el.querySelector('.display')
				console.log(display.textContent) // Still shows old value: "0"

				// DOM update happens after current microtask
				queueMicrotask(() => {
					console.log(display.textContent) // Now shows: "1"
				})
			}),
		),
	],
)
```

**Key insight:** Property changes are immediate, but DOM updates are batched and scheduled.

### Timing Patterns for Different Operations

**For reactive property updates (most common):**

```js
// Change properties
el.name = 'Alice'
el.count = 10

// Wait for DOM updates
await new Promise(resolve => requestAnimationFrame(resolve))
// or
queueMicrotask(() => {
	// DOM is now updated
})
```

**For async operations (network requests, complex initialization):**

```js
component('async-component', {}, (el, { first }) => [
	// Component lifecycle effect
	() => {
		// This runs when component mounts
		setTimeout(async () => {
			const data = await fetch('/api/data')
			el.data = await data.json()
		}, 200) // Allow time for async operations

		return () => {
			// Cleanup when component unmounts
		}
	},
])
```

### Batched Updates in Action

Multiple property changes in the same execution context are automatically batched:

```js
// All these changes happen in the same batch
el.user = { ...el.user, name: 'Alice' }
el.theme = 'dark'
el.notifications = 5
el.isActive = true

// Only ONE DOM update cycle occurs after all changes
// Much more efficient than updating after each property change
```

### Testing Implications

When testing components, you need to account for the scheduled effects:

```js
// In tests, wait for effects to apply
it('updates display when count changes', async () => {
	const component = document.querySelector('my-component')

	component.count = 5

	// Wait for scheduled effect to run
	await new Promise(resolve => requestAnimationFrame(resolve))

	expect(component.querySelector('.count').textContent).toBe('5')
})
```

## Efficient Updates & Performance

UIElement's reactivity system is designed for maximum efficiency:

### Fine-Grained Updates

Only the specific DOM elements that depend on changed state are updated:

```js
component(
	'performance-demo',
	{
		user: asJSON({ name: '', email: '', avatar: '' }),
		theme: asString('light'),
		notifications: asInteger(0),
	},
	(el, { first, all }) => [
		// Only updates when user.name changes
		first(
			'.user-name',
			setText(() => el.user.name),
		),

		// Only updates when user.email changes
		first(
			'.user-email',
			setText(() => el.user.email),
		),

		// Only updates when theme changes
		all(
			'.themed',
			toogleClass('dark', () => el.theme === 'dark'),
		),

		// Only updates when notifications change
		first(
			'.notification-badge',
			setText('notifications'),
			setStyle('display', () =>
				el.notifications > 0 ? 'block' : 'none',
			),
		),
	],
)
```

### Batched Updates

Multiple state changes in the same microtask are automatically batched:

```js
// These updates will be batched together
el.user = { ...el.user, name: 'Alice' }
el.theme = 'dark'
el.notifications = 5
// DOM updates happen once, after all changes
```

### Avoiding Unnecessary Work

UIElement skips updates when values haven't actually changed:

```js
// No DOM update occurs if the value is the same
el.count = 5
el.count = 5 // No effect - value unchanged

// Object/array changes are detected by reference
el.items = [...el.items] // Triggers update
el.items = el.items // No update - same reference
```

</section>

<section>

## Advanced Patterns

### State Machines with Signals

Implement complex state logic using local signals:

```js
component(
	'file-uploader',
	{
		files: asJSON([]),
	},
	(el, { first }) => {
		const state = signal('idle') // idle, uploading, success, error
		const progress = signal(0)
		const error = signal('')

		const upload = async files => {
			state.set('uploading')
			progress.set(0)

			try {
				for (let i = 0; i < files.length; i++) {
					await uploadFile(files[i])
					progress.set(((i + 1) / files.length) * 100)
				}
				state.set('success')
			} catch (err) {
				state.set('error')
				error.set(err.message)
			}
		}

		return [
			first(
				'.drop-zone',
				toogleClass('uploading', () => state() === 'uploading'),
				toogleClass('success', () => state() === 'success'),
				toogleClass('error', () => state() === 'error'),

				on('drop', e => {
					e.preventDefault()
					upload(Array.from(e.dataTransfer.files))
				}),
			),

			first(
				'.progress-bar',
				setStyle('width', () => `${progress()}%`),
				setStyle('display', () =>
					state() === 'uploading' ? 'block' : 'none',
				),
			),

			first(
				'.error-message',
				setText(error),
				setStyle('display', () =>
					state() === 'error' ? 'block' : 'none',
				),
			),
		]
	},
)
```

### Reactive Collections

Handle dynamic lists efficiently:

```js
component(
	'todo-list',
	{
		todos: asJSON([]),
	},
	(el, { first }) => {
		const filter = signal('all') // all, active, completed

		const filteredTodos = () => {
			const todos = el.todos
			switch (filter()) {
				case 'active':
					return todos.filter(todo => !todo.completed)
				case 'completed':
					return todos.filter(todo => todo.completed)
				default:
					return todos
			}
		}

		return [
			first('.todo-container', () => {
				const container = el.querySelector('.todo-container')
				const update = () => {
					// Clear existing todos
					container.innerHTML = ''

					// Render filtered todos
					filteredTodos().forEach((todo, index) => {
						const todoEl = createTodoElement(todo, index)
						container.appendChild(todoEl)
					})
				}

				update()
				return update
			}),

			first(
				'.filter-all',
				on('click', () => filter.set('all')),
			),
			first(
				'.filter-active',
				on('click', () => filter.set('active')),
			),
			first(
				'.filter-completed',
				on('click', () => filter.set('completed')),
			),
		]
	},
)
```

</section>

<section>

## Next Steps

Now that you understand UIElement's reactivity system, explore:

- **[Component Communication](component-communication.html)** - Learn how components share state and coordinate behavior
- **[Examples & Recipes](examples-recipes.html)** - See reactive patterns applied in real-world components
- **[Patterns & Techniques](patterns-techniques.html)** - Advanced optimization and architectural patterns

</section>

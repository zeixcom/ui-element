---
title: 'Examples & Recipes'
emoji: '🍽️'
description: 'Common use cases and demos'
---

<section class="hero">

# 🍽️ Examples & Recipes

<p class="lead">Discover practical examples and patterns for building reactive, modular components with UIElement. Each example focuses on showcasing a specific feature or best practice, guiding you through real-world use cases.</p>
</section>

<section>

## Simple Click Counter

This example demonstrates basic state management and user interactions, building on the concepts from Getting Started.

**What it shows:**

- Numeric properties with `asInteger()`
- Multiple effects on the same element
- Dynamic CSS classes based on state
- Functions for computed values

```js
import {
	asInteger,
	component,
	first,
	on,
	RESET,
	setText,
	toogleClass,
} from '@zeix/ui-element'

component(
	'click-counter',
	{
		count: asInteger(RESET), // Get initial count from HTML
	},
	(el, { first }) => [
		// Apply multiple effects to the same button
		first(
			'button',
			// Update the count display (nested selector)
			first('.count', setText('count')),

			// Handle clicks to increment
			on('click', () => {
				el.count++
			}),

			// Update button style based on count
			toogleClass('popular', () => el.count >= 10),
		),
	],
)
```

```html
<click-counter>
	<button type="button">
		Click me!
		<span class="count">0</span> clicks
	</button>
</click-counter>
```

**New concepts introduced:**

- `asInteger()` for numeric properties
- Multiple effects on the same element (button)
- Nested selectors (`first(".count", ...)` inside `first("button", ...)`)
- Dynamic CSS classes based on state (`toogleClass`)
- Functions for computed values (`() => el.count >= 10`)

This example shows how UIElement scales from simple text updates to more complex interactions while keeping the code readable and declarative.

</section>

<section>

## Interactive Appreciation Button

This example demonstrates state management, conditional rendering, and user interactions in a single component.

**What it shows:**

- Reactive state with `asInteger(RESET)`
- Conditional DOM updates based on state
- Event handling for user clicks
- Server-side rendering hydration

```js
import { asInteger, component, on, RESET, setText } from '@zeix/ui-element'

component(
	'show-appreciation',
	{
		count: asInteger(RESET), // Get initial value from .count element
	},
	(el, { first }) => [
		// Update count display when state changes
		first('.count', setText('count')),

		// Handle click events to change state
		first(
			'button',
			on('click', () => {
				el.count++
			}),
		),
	],
)
```

```html
<show-appreciation aria-label="Show appreciation">
	<button type="button">
		<span class="emoji">💐</span>
		<span class="count">5</span>
	</button>
</show-appreciation>
```

**Key patterns:**

- Using `RESET` to hydrate from server-rendered content
- Simple state mutations with automatic DOM updates
- Semantic HTML structure with progressive enhancement

</section>

<section>

## Advanced Slider Component

This example shows complex state management, multiple effects, and custom validation.

**What it demonstrates:**

- Multiple reactive properties with validation
- Complex derived state calculations
- Custom attribute parsers and effects
- Keyboard accessibility

```js
component(
	'my-slider',
	{
		value: asInteger(50),
		min: asInteger(0),
		max: asInteger(100),
		step: asInteger(1),
	},
	(el, { first }) => {
		// Derived calculations
		const percentage = () => ((el.value - el.min) / (el.max - el.min)) * 100

		const isAtMin = () => el.value <= el.min
		const isAtMax = () => el.value >= el.max

		// Validation function
		const clampValue = newValue => {
			return Math.max(el.min, Math.min(el.max, newValue))
		}

		return [
			// Update visual progress
			first(
				'.progress',
				setStyle('width', () => `${percentage()}%`),
			),

			// Update text displays
			first('.current-value', setText('value')),
			first('.min-value', setText('min')),
			first('.max-value', setText('max')),

			// Handle button interactions
			first(
				'.decrease',
				setProperty('disabled', isAtMin),
				on('click', () => {
					el.value = clampValue(el.value - el.step)
				}),
			),

			first(
				'.increase',
				setProperty('disabled', isAtMax),
				on('click', () => {
					el.value = clampValue(el.value + el.step)
				}),
			),

			// Keyboard support
			first(
				'.slider-track',
				setAttribute('tabindex', '0'),
				setAttribute('role', 'slider'),
				setAttribute('aria-valuemin', 'min'),
				setAttribute('aria-valuemax', 'max'),
				setAttribute('aria-valuenow', 'value'),

				on('keydown', e => {
					let newValue = el.value

					switch (e.key) {
						case 'ArrowLeft':
						case 'ArrowDown':
							newValue -= el.step
							break
						case 'ArrowRight':
						case 'ArrowUp':
							newValue += el.step
							break
						case 'Home':
							newValue = el.min
							break
						case 'End':
							newValue = el.max
							break
						default:
							return // Don't prevent default for other keys
					}

					e.preventDefault()
					el.value = clampValue(newValue)
				}),
			),
		]
	},
)
```

```html
<my-slider value="75" min="0" max="100" step="5">
	<div class="slider-container">
		<div class="slider-track" tabindex="0" role="slider">
			<div class="progress"></div>
		</div>
		<div class="controls">
			<button class="decrease">-</button>
			<span class="current-value">75</span>
			<button class="increase">+</button>
		</div>
		<div class="range">
			<span class="min-value">0</span>
			<span class="max-value">100</span>
		</div>
	</div>
</my-slider>
```

**Advanced patterns shown:**

- Derived state calculations with functions
- Input validation and clamping
- Full keyboard accessibility
- Multiple coordinated effects
- ARIA attributes for screen readers

</section>

<section>

## Form Validation with Real-time Feedback

This example demonstrates client-side validation, async operations, and error handling.

**What it covers:**

- Custom validation effects
- Async server-side validation
- Error state management
- User experience patterns

```js
// Custom validation effect
const validateField = (validationFn, errorMessage) => (element, signal) => {
	const update = () => {
		const isValid = validationFn(signal())
		element.classList.toggle('error', !isValid)
		element.setAttribute('aria-invalid', isValid ? 'false' : 'true')

		let errorEl = element.nextElementSibling
		if (!errorEl?.classList.contains('error-message')) {
			errorEl = document.createElement('div')
			errorEl.className = 'error-message'
			element.after(errorEl)
		}
		errorEl.textContent = isValid ? '' : errorMessage
	}

	update()
	return update
}

// Async username availability checker
const checkUsernameAvailability = async username => {
	if (username.length < 3) return { available: false, message: 'Too short' }

	// Simulate API call
	await new Promise(resolve => setTimeout(resolve, 500))

	const taken = ['admin', 'user', 'test'].includes(username.toLowerCase())
	return {
		available: !taken,
		message: taken ? 'Username already taken' : 'Username available',
	}
}

component(
	'registration-form',
	{
		email: asString(''),
		username: asString(''),
		password: asString(''),
	},
	(el, { first }) => {
		// Local state for async validation
		const usernameStatus = signal('idle') // idle, checking, available, taken
		const usernameMessage = signal('')

		let usernameTimeout

		return [
			// Email validation
			first(
				'.email-input',
				setProperty('value', 'email'),
				on('input', e => (el.email = e.target.value)),
				validateField(
					email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
					'Please enter a valid email address',
				),
			),

			// Username with async validation
			first(
				'.username-input',
				setProperty('value', 'username'),
				toogleClass('checking', () => usernameStatus() === 'checking'),
				toogleClass(
					'available',
					() => usernameStatus() === 'available',
				),
				toogleClass('taken', () => usernameStatus() === 'taken'),

				on('input', async e => {
					el.username = e.target.value

					clearTimeout(usernameTimeout)

					if (el.username.length < 3) {
						usernameStatus.set('idle')
						usernameMessage.set('')
						return
					}

					usernameStatus.set('checking')
					usernameMessage.set('Checking availability...')

					usernameTimeout = setTimeout(async () => {
						const result = await checkUsernameAvailability(
							el.username,
						)
						usernameStatus.set(
							result.available ? 'available' : 'taken',
						)
						usernameMessage.set(result.message)
					}, 300)
				}),
			),

			// Username status display
			first('.username-status', setText(usernameMessage)),

			// Password validation
			first(
				'.password-input',
				setProperty('value', 'password'),
				on('input', e => (el.password = e.target.value)),
				validateField(
					password => password.length >= 8,
					'Password must be at least 8 characters',
				),
			),

			// Submit button state
			first(
				'.submit-button',
				setProperty('disabled', () => {
					const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
						el.email,
					)
					const usernameValid = usernameStatus() === 'available'
					const passwordValid = el.password.length >= 8

					return !(emailValid && usernameValid && passwordValid)
				}),
			),
		]
	},
)
```

**Patterns demonstrated:**

- Custom reusable validation effects
- Debounced async validation
- Complex form state management
- Real-time user feedback
- Accessibility considerations

</section>

<section>

## Dynamic Content Loading

This example shows how to handle asynchronous data loading and error states.

**Features:**

- Lazy loading with intersection observer
- Loading states and error handling
- Content replacement patterns

```js
component(
	'lazy-load',
	{
		src: asString(''),
		loaded: asBoolean(false),
		loading: asBoolean(false),
		error: asString(''),
	},
	(el, { first }) => {
		let observer

		const loadContent = async () => {
			if (el.loaded || el.loading || !el.src) return

			el.loading = true
			el.error = ''

			try {
				const response = await fetch(el.src)
				if (!response.ok) throw new Error(`HTTP ${response.status}`)

				const content = await response.text()
				el.querySelector('.content').innerHTML = content
				el.loaded = true
			} catch (err) {
				el.error = err.message
			} finally {
				el.loading = false
			}
		}

		return [
			// Loading state
			first(
				'.loading',
				setStyle('display', () => (el.loading ? 'block' : 'none')),
			),

			// Error state
			first(
				'.error',
				setText('error'),
				setStyle('display', () => (el.error ? 'block' : 'none')),
			),

			// Content container
			first(
				'.content',
				setStyle('display', () => (el.loaded ? 'block' : 'none')),
			),

			// Setup intersection observer
			() => {
				observer = new IntersectionObserver(entries => {
					if (entries[0].isIntersecting) {
						loadContent()
						observer.disconnect()
					}
				})

				observer.observe(el)

				return () => observer?.disconnect()
			},
		]
	},
)
```

```html
<lazy-load src="/api/user-profile">
	<div class="loading">Loading user profile...</div>
	<div class="error"></div>
	<div class="content"></div>
</lazy-load>
```

**Key techniques:**

- Intersection Observer for performance
- Async/await for clean error handling
- Progressive enhancement with loading states
- Proper cleanup in lifecycle hooks

</section>

<section>

## Component Composition Patterns

These examples show how to build complex UIs by composing simple components.

### Tab System

```js
// Tab container manages active state
component(
	'tab-list',
	{
		active: asString('tab1'),
	},
	(el, { all, first }) => [
		// Update tab buttons
		all(
			'.tab-button',
			toogleClass('active', button => button.dataset.tab === el.active),
			setAttribute('aria-selected', button =>
				button.dataset.tab === el.active ? 'true' : 'false',
			),
			on('click', e => {
				el.active = e.target.dataset.tab
			}),
		),

		// Update tab panels
		all(
			'.tab-panel',
			setProperty('hidden', panel => panel.dataset.tab !== el.active),
			setAttribute('aria-hidden', panel =>
				panel.dataset.tab !== el.active ? 'true' : 'false',
			),
		),
	],
)
```

### Accordion Component

```js
component(
	'accordion-panel',
	{
		open: asBoolean(false),
	},
	(el, { first }) => [
		first(
			'.toggle',
			setAttribute('aria-expanded', () => (el.open ? 'true' : 'false')),
			on('click', () => (el.open = !el.open)),
		),

		first(
			'.content',
			setProperty('hidden', () => !el.open),
			setAttribute('aria-hidden', () => (el.open ? 'false' : 'true')),
		),
	],
)
```

**Composition benefits:**

- Each component has a single responsibility
- Components can be reused in different contexts
- Easy to test and maintain
- Clear data flow between components

</section>

<section>

## Testing UIElement Components

Testing reactive components requires understanding UIElement's scheduled effect system and component lifecycle.

### Testing Reactive Updates

UIElement schedules DOM updates for performance, so tests need to wait for effects to apply:

```js
// Test reactive property changes
it('updates display when count changes', async () => {
	const component = document.querySelector('click-counter')

	component.count = 5

	// Wait for scheduled effect to run
	await new Promise(resolve => requestAnimationFrame(resolve))

	expect(component.querySelector('.count').textContent).toBe('5')
})
```

### Testing Component State Persistence

Components maintain state between interactions, which affects testing:

```js
// Components remember their state
it('maintains count between clicks', async () => {
	const component = document.querySelector('click-counter')
	const button = component.querySelector('button')

	// First click
	button.click()
	await new Promise(resolve => requestAnimationFrame(resolve))
	expect(component.count).toBe(1)

	// Second click - state persists
	button.click()
	await new Promise(resolve => requestAnimationFrame(resolve))
	expect(component.count).toBe(2)

	// Reset for next test
	component.count = 0
})
```

### Testing Components with Browser APIs

When components use browser APIs, mock individual methods rather than entire objects:

```js
// Mock clipboard API for copy functionality
it('copies code to clipboard', async () => {
	const originalWriteText = navigator.clipboard?.writeText
	let copiedText = ''

	// Mock the specific method
	if (navigator.clipboard) {
		navigator.clipboard.writeText = async text => {
			copiedText = text
			return Promise.resolve()
		}
	}

	// Test the component
	const codeBlock = document.querySelector('code-block')
	const copyButton = codeBlock.querySelector('.copy-btn')

	copyButton.click()
	await new Promise(resolve => requestAnimationFrame(resolve))

	expect(copiedText).toBe('console.log("Hello, world!");')

	// Restore original method
	if (navigator.clipboard && originalWriteText) {
		navigator.clipboard.writeText = originalWriteText
	}
})
```

### Component Isolation Best Practices

Ensure tests don't interfere with each other:

```js
// Use unique identifiers for test components
beforeEach(() => {
	document.body.innerHTML = `
        <test-component data-test="unique-${Date.now()}">
            <span class="output">0</span>
        </test-component>
    `
})

// Or reset component state between tests
afterEach(() => {
	const components = document.querySelectorAll('my-component')
	components.forEach(comp => {
		comp.count = 0
		comp.text = ''
		// Reset other properties as needed
	})
})
```

</section>

<section>

## Next Steps

These examples demonstrate UIElement's flexibility and power. To continue learning:

- **[Patterns & Techniques](patterns-techniques.html)** - Advanced architectural patterns and optimization strategies
- **[Component Communication](component-communication.html)** - Learn how these examples can work together
- **[Styling Components](styling-components.html)** - Add professional styling to your components

</section>

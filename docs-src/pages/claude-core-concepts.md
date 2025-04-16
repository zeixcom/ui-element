# Core Concepts

Understanding UIElement's core concepts will give you the foundation to build efficient, responsive web components. This chapter explores the fundamental building blocks of UIElement: components, signals, effects, and element interactions.

## Component Definition

At the heart of UIElement is the `component()` function, which defines a new Web Component with reactive capabilities.

### Basic Structure

```js
import { component } from '@zeix/ui-element'

component('custom-element', {
  // Initial properties and attribute parsers
}, el => {
  // Setup logic and effects
})
```

The `component()` function has three parameters:
1. **name**: A unique tag name for your custom element (must include a hyphen)
2. **init**: An object defining properties and their initializers
3. **setup**: A function that runs when the component connects to the DOM

Let's examine each part in detail:

### Component Naming

Custom element names must:
- Include at least one hyphen (`-`)
- Be lowercase
- Not conflict with existing HTML elements

```js
// Good examples
component('my-counter', {...}, el => {...})
component('app-navigation', {...}, el => {...})

// Invalid examples
// component('counter', {...}, el => {...})     // No hyphen
// component('DIV-element', {...}, el => {...}) // Not lowercase
```

### Initialization Object

The initialization object defines reactive properties for your component:

```js
component('user-card', {
  // Basic properties
  name: 'Anonymous',              // String default
  age: 0,                         // Number default
  active: true,                   // Boolean default
  
  // Using attribute parsers
  level: asInteger(1),            // Parse as integer with default 1
  theme: asEnum(['light', 'dark']), // Restrict to enum values
  
  // Computed properties
  fullName: el => `${el.firstName} ${el.lastName}`,
  
  // Value from DOM (RESET)
  count: asInteger(RESET)         // Get initial value from DOM
}, el => {
  // Setup logic
})
```

Each property becomes:
- A reactive state on the component
- A getter/setter for direct property access
- Automatically connected to observed attributes

The special `RESET` value tells UIElement to look for an initial value in the DOM. This is useful for progressive enhancement.

### Setup Function

The setup function runs when the component connects to the DOM:

```js
component('expandable-section', {
  expanded: false
}, el => {
  // Select elements and apply effects
  el.first('.toggle', 
    on('click', () => {
      el.expanded = !el.expanded
    })
  )
  
  el.first('.content', 
    toggleClass('hidden', () => !el.expanded)
  )
  
  // Return cleanup function (optional)
  return () => {
    console.log('Component disconnected and cleaned up')
  }
})
```

The setup function:
- Receives the component instance as its parameter
- Sets up event listeners and effects
- Can return a cleanup function that runs when the component disconnects

## Signal-Based State

UIElement uses a signal-based reactivity system that efficiently tracks dependencies and updates only what changed.

### State Signals

State signals are writable values that notify subscribers when they change:

```js
import { state } from '@zeix/ui-element'

// Create a state signal with initial value
const count = state(0)

// Read the current value
console.log(count.get()) // 0

// Update the value
count.set(5)

// Modify based on current value
count.update(current => current + 1)
```

When you define properties in the component initialization object, UIElement creates state signals for them automatically:

```js
component('my-counter', {
  count: 0
}, el => {
  // Access state through property
  console.log(el.count) // 0
  
  // Update state through property
  el.count = 5
  
  // Access underlying signal directly (rarely needed)
  const countSignal = el.getSignal('count')
})
```

### Computed Signals

Computed signals derive their value from other signals:

```js
import { state, computed } from '@zeix/ui-element'

// Create state signals
const firstName = state('John')
const lastName = state('Doe')

// Create a computed signal
const fullName = computed(() => {
  return `${firstName.get()} ${lastName.get()}`
})

console.log(fullName.get()) // "John Doe"

// When a dependency changes, the computed value updates
lastName.set('Smith')
console.log(fullName.get()) // "John Smith"
```

In components, computed signals are often created from state signals:

```js
component('price-calculator', {
  quantity: 1,
  unitPrice: 10,
  
  // Create a computed property
  total: el => el.quantity * el.unitPrice
}, el => {
  // The total automatically updates when quantity or unitPrice changes
  el.first('.total', setText('total'))
})
```

### Signal Dependencies

UIElement automatically tracks dependencies between signals:

```js
// This effect depends on count
effect(() => {
  console.log(`Count is now: ${count.get()}`)
})

// This triggers the effect
count.set(10)
```

Signal dependencies form a directed acyclic graph that ensures:
- Updates propagate efficiently
- Each dependent is notified exactly once
- Circular dependencies are detected and prevented

## Effects and DOM Updates

Effects are functions that run when their signal dependencies change. They're the bridge between your component's state and its appearance in the DOM.

### Basic Effects

The `effect()` function creates a reactive effect:

```js
import { effect } from '@zeix/ui-element'

effect(() => {
  document.title = `Count: ${count.get()}`
})
```

This effect:
1. Runs immediately when created
2. Automatically tracks what signals it reads
3. Re-runs whenever those signals change

### DOM Effects

UIElement provides specialized effect functions for DOM manipulation:

```js
component('status-badge', {
  status: 'inactive'
}, el => {
  el.self(
    // Update text content
    setText(() => `Status: ${el.status}`),
    
    // Toggle classes based on status
    toggleClass('active', () => el.status === 'active'),
    toggleClass('warning', () => el.status === 'warning'),
    toggleClass('error', () => el.status === 'error')
  )
})
```

Common DOM effect functions include:
- `setText()`: Update text content
- `toggleClass()`: Add/remove CSS classes
- `setAttribute()`: Set HTML attributes
- `setProperty()`: Set DOM properties
- `setStyle()`: Update CSS styles

### Effect Composition

You can combine multiple effects for complex UI updates:

```js
component('progress-indicator', {
  progress: 0,
  status: 'idle'
}, el => {
  el.first('.bar', 
    // Update multiple aspects based on state
    setStyle('width', () => `${el.progress}%`),
    toggleClass('complete', () => el.progress >= 100),
    setAttribute('aria-valuenow', 'progress')
  )
  
  el.first('.label', 
    setText(() => {
      if (el.status === 'error') return 'Error occurred'
      return `${el.progress}% complete`
    })
  )
})
```

### Batched Updates

UIElement batches DOM updates to minimize browser reflow:

```js
import { batch } from '@zeix/ui-element'

batch(() => {
  // These state changes trigger only one UI update
  name.set('Jane')
  age.set(30)
  active.set(true)
})
```

Even without explicit batching, UIElement schedules DOM updates efficiently using requestAnimationFrame.

## Component Lifecycle

Understanding a component's lifecycle helps you manage resources and handle initialization properly.

### Connection and Disconnection

The component lifecycle has several phases:

1. **Construction**: The element instance is created
2. **Connection**: The element is added to the DOM
3. **Attribute changes**: Attributes are modified
4. **Disconnection**: The element is removed from the DOM

```js
component('time-display', {
  format: 'HH:mm:ss'
}, el => {
  // This runs when connected to DOM
  console.log('Time display connected')
  
  // Set up an interval
  const intervalId = setInterval(() => {
    el.first('.time', setText(() => new Date().toLocaleTimeString()))
  }, 1000)
  
  // Clean up when disconnected
  return () => {
    console.log('Time display disconnected')
    clearInterval(intervalId)
  }
})
```

### Cleanup Functions

To prevent memory leaks, return a cleanup function that:
- Clears intervals or timeouts
- Removes global event listeners
- Releases resources

```js
el.first('.dialog', on('click', () => {
  // Add global event listener
  const handleEscape = (e) => {
    if (e.key === 'Escape') el.open = false
  }
  
  document.addEventListener('keydown', handleEscape)
  
  // Return cleanup for this effect
  return () => {
    document.removeEventListener('keydown', handleEscape)
  }
}))
```

UIElement automatically manages cleanup for DOM effects and event listeners attached through `on()`.

## Attribute Parsers

Attribute parsers convert HTML attribute strings to typed JavaScript values:

```html
<user-card name="John" age="42" premium="true" level="2"></user-card>
```

```js
component('user-card', {
  name: asString('Anonymous'),
  age: asInteger(0),
  premium: asBoolean,
  level: asInteger(1)
}, el => {
  // Access typed values
  console.log(typeof el.name)    // "string" 
  console.log(typeof el.age)     // "number"
  console.log(typeof el.premium) // "boolean"
})
```

### Built-in Parsers

UIElement provides several built-in parsers:

```js
import { 
  asBoolean, 
  asInteger, 
  asNumber, 
  asString, 
  asEnum, 
  asJSON 
} from '@zeix/ui-element'

component('config-panel', {
  enabled: asBoolean,               // true for any value except "false"
  count: asInteger(0),              // Parse as integer with default 0
  amount: asNumber(0),              // Parse as float with default 0
  name: asString('Default'),        // String with default
  theme: asEnum(['light', 'dark']), // Restrict to enum values
  options: asJSON({ active: true }) // Parse JSON with default object
}, el => {
  // Setup code
})
```

### Custom Parsers

You can create custom parsers for specialized needs:

```js
// Custom date parser
const asDate = (fallback = new Date()) => (el, value) => {
  if (!value) return fallback
  
  const date = new Date(value)
  return isNaN(date.getTime()) ? fallback : date
}

component('event-card', {
  eventDate: asDate()
}, el => {
  el.first('.date', setText(() => {
    return el.eventDate.toLocaleDateString()
  }))
})
```

A parser function:
1. Receives the element and attribute value
2. Returns the parsed value
3. Can access component properties if needed

## Element Selectors

UIElement provides three methods to select and manipulate elements:

### el.self()

Apply effects to the component itself:

```js
component('toggle-switch', {
  active: false
}, el => {
  el.self(
    toggleClass('active'),
    toggleAttribute('aria-pressed', 'active')
  )
})
```

### el.first()

Select and manipulate the first element matching a selector:

```js
component('message-box', {
  message: '',
  type: 'info'
}, el => {
  el.first('.message', 
    setText('message'),
    toggleClass('error', () => el.type === 'error'),
    toggleClass('warning', () => el.type === 'warning'),
    toggleClass('info', () => el.type === 'info')
  )
})
```

### el.all()

Select and manipulate all elements matching a selector:

```js
component('star-rating', {
  rating: 0,
  maxStars: 5
}, el => {
  el.all('.star', 
    // Each star gets these effects
    toggleClass('filled', (_, index) => index < el.rating),
    on('click', (_, index) => () => {
      el.rating = index + 1
    })
  )
})
```

The callback receives:
- The host element (component)
- The target element (selected element)
- The index (for `el.all()`)

## Summary

UIElement's core concepts work together to create a powerful, efficient system for building reactive web components:

- **Components** define custom elements with reactive properties
- **Signals** track values and their dependencies
- **Effects** connect state changes to DOM updates
- **Element selectors** target DOM elements for manipulation

With these fundamentals in place, you can now move on to advanced component building techniques in the next chapter.

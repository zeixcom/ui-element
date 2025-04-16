# Getting Started with UIElement

Welcome to UIElement! This chapter will guide you through the essential steps to install the library and create your first component. You'll learn how to connect state to UI updates, handle events, and progressively enhance HTML with interactive behavior.

## Installation

UIElement is available as an npm package and can be installed with your package manager of choice:

```bash
# Using npm
npm install @zeix/ui-element

# Using bun
bun add @zeix/ui-element

# Using yarn
yarn add @zeix/ui-element

# Using pnpm
pnpm add @zeix/ui-element
```

Once installed, you can import UIElement's functions directly in your JavaScript or TypeScript files:

```js
import { component, state, effect } from '@zeix/ui-element'
```

## Your First Component

Let's create a simple counter component to demonstrate UIElement's core concepts. We'll start with HTML, then add behavior using UIElement.

### HTML Structure

First, create the markup for your counter:

```html
<count-display>
  <button type="button" class="decrement">-</button>
  <span class="value">0</span>
  <button type="button" class="increment">+</button>
</count-display>
```

This is a semantic HTML structure with two buttons and a span for displaying the counter value.

### Creating the Component

Now, let's enhance this static HTML with interactive behavior:

```js
import { component, asInteger, setText, on } from '@zeix/ui-element'

component('count-display', {
  // Initialize component state with type conversion
  count: asInteger(0)
}, el => {
  // Update the value display when count changes
  el.first('.value', setText('count'))
  
  // Handle click events on buttons
  el.first('.decrement', on('click', () => {
    el.count--
  }))
  
  el.first('.increment', on('click', () => {
    el.count++
  }))
})
```

Let's break down what's happening:

1. We define a custom element named `count-display` using the `component()` function
2. We initialize a `count` state with the value `0` and type conversion using `asInteger()`
3. We select the `.value` element and bind it to display our `count` state
4. We attach click handlers to the buttons that increase or decrease the count

### Adding Styles

You can style your component using regular CSS. Create a CSS file for your component:

```css
count-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
  
  & button {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 1px solid #ccc;
    background-color: #f5f5f5;
    cursor: pointer;
    font-size: 1rem;
    
    &:hover {
      background-color: #e5e5e5;
    }
  }
  
  & .value {
    min-width: 2rem;
    text-align: center;
    font-size: 1.25rem;
  }
}
```

Then import it in your JavaScript file or include it in your HTML:

```js
import './count-display.css'
```

### Complete Example

Putting it all together, your JavaScript file would look like this:

```js
import { component, asInteger, setText, on } from '@zeix/ui-element'
import './count-display.css'

component('count-display', {
  count: asInteger(0)
}, el => {
  el.first('.value', setText('count'))
  
  el.first('.decrement', on('click', () => {
    el.count--
  }))
  
  el.first('.increment', on('click', () => {
    el.count++
  }))
})
```

Now when you use the `<count-display>` element in your HTML, it will become an interactive counter with increment and decrement buttons.

## Declarative UI Effects

One of UIElement's strengths is its declarative approach to UI updates. Let's enhance our counter with more UI effects:

```js
import { component, asInteger, setText, toggleClass, toggleAttribute, on } from '@zeix/ui-element'

component('count-display', {
  count: asInteger(0),
  max: asInteger(10),
  min: asInteger(0)
}, el => {
  // Display the current count
  el.first('.value', setText('count'))
  
  // Disable decrement button when at minimum
  el.first('.decrement', 
    toggleAttribute('disabled', () => el.count <= el.min),
    on('click', () => {
      if (el.count > el.min) el.count--
    })
  )
  
  // Disable increment button when at maximum
  el.first('.increment', 
    toggleAttribute('disabled', () => el.count >= el.max),
    on('click', () => {
      if (el.count < el.max) el.count++
    })
  )
  
  // Add visual feedback based on count value
  el.self(
    toggleClass('at-min', () => el.count === el.min),
    toggleClass('at-max', () => el.count === el.max)
  )
})
```

In this enhanced version:
- We've added `min` and `max` properties to set boundaries for the counter
- We disable buttons when reaching these boundaries
- We add CSS classes to the component itself for visual feedback
- All UI updates happen automatically when state changes

This declarative approach makes the relationship between state and UI explicit and easy to understand.

## Event Handling

UIElement provides a simple way to handle DOM events using the `on()` function. Let's see how to handle different types of events:

```js
import { component, asInteger, asString, setText, on, emit } from '@zeix/ui-element'

component('user-form', {
  username: asString(''),
  age: asInteger(0)
}, el => {
  // Handle input changes
  el.first('input[name="username"]', 
    on('input', (e) => {
      el.username = e.target.value
    })
  )
  
  el.first('input[name="age"]', 
    on('input', (e) => {
      el.age = parseInt(e.target.value, 10) || 0
    })
  )
  
  // Handle form submission
  el.first('form', 
    on('submit', (e) => {
      e.preventDefault()
      
      // Emit a custom event with form data
      emit('user-updated', {
        username: el.username,
        age: el.age
      })(el)
    })
  )
  
  // Display a preview
  el.first('.preview', 
    setText(() => {
      if (!el.username) return ''
      return `Hello, ${el.username}! You are ${el.age} years old.`
    })
  )
})
```

Key points about event handling:
- The `on()` function takes the event type and a handler function
- You can access event properties like `target` and call methods like `preventDefault()`
- Use `emit()` to create and dispatch custom events
- Event handlers can update component state, which triggers UI updates

## Browser Support

UIElement is designed for modern browsers and uses standard Web APIs. All key features, including Custom Elements, Shadow DOM, and the features UIElement relies on are supported in current versions of Chrome, Firefox, Safari, and Edge.

For projects requiring legacy browser support, you may need to use polyfills for Web Components, but these are becoming increasingly unnecessary as browser support improves.

## Next Steps

Now that you've created your first component, you're ready to explore more advanced features of UIElement:

- Learn about [Core Concepts](./core-concepts.html) to deepen your understanding of signals and effects
- Explore [Building Components](./building-components.html) for best practices in component design
- Discover [Data Flow](./data-flow.html) patterns for component communication

As you continue your journey with UIElement, remember that it's designed to enhance your existing HTML rather than replace it. This approach leads to more resilient, accessible, and performant web applications.

In the next chapter, we'll dive deeper into UIElement's core concepts to help you build more sophisticated components.

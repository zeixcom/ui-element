---
title: 'Components'
emoji: '🏗️'
description: 'Anatomy, lifecycle, signals, effects'
---

<section-hero>

# 🏗️ Components

<div>
  <p class="lead"><strong>Create lightweight, self-contained Web Components with built-in reactivity</strong>. UIElement lets you define custom elements that manage state efficiently, update the DOM automatically, and enhance server-rendered pages without an SPA framework.</p>
  {{ toc }}
</div>
</section-hero>

<section>

## Defining a Component

UIElement builds on **Web Components**, extending `HTMLElement` to provide **built-in state management and reactive updates**.

UIElement creates components using the `component()` function:

```js
component('my-component', {}, () => [
  // Component setup
])
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
component(
  'my-component',
  {
    count: 0, // Initial value of "count" signal
    value: asInteger(5), // Parse "value" attribute as integer defaulting to 5
    isEven: el => () => !(el.count % 2), // Computed signal based on "count" signal
    name: fromContext('display-name', 'World'), // Consume "display-name" signal from closest context provider
  },
  () => [
    // Component setup
  ],
)
```

In this example you see all three ways to define a reactive property:

- A **static initial value** for a `State` signal (e.g., `count: 0`)
- An **attribute parser** that may provide a fallback value (e.g., `value: asInteger(5)`)
- A **signal producer** function that derives an initial value or a callback function from other properties of the element (e.g., `isEven: el => () => !(el.count % 2)`) or bundled signal producers (e.g. `fromContext(context, fallback)`)

<card-callout class="caution">

**Note**: Property initialization runs **before the element is attached to the DOM**. You can't access not yet defined properties or child elements here.

</card-callout>

### Mounted in the DOM

Runs when the component is added to the page (`connectedCallback()`). This is where you:

- **Access sub-elements**
- **Set up event listeners**
- **Apply effects**
- **Emit custom events**
- **Provide context**

The setup function has two arguments:

1. `el`: The component element instance.
2. `{ all, first }`: An object containing two functions, `all` and `first`, which can be used to select elements within the component. See [Accessing Sub-elements](#accessing-sub-elements).

UIElement expects you to return an array of partially applied functions to be executed during the setup phase. The order doesn't matter, as each function targets a specific element or event. So feel free to organize your code in a way that makes sense to you.

Each of these functions will return a cleanup function that will be executed during the `disconnectedCallback()` lifecycle method.

```js
component(
  'my-component',
  {
    count: 0,
  },
  (el, { first }) => [
    emit('update-count', el.count), // Emit custom event
    provide('count'), // Provide context
    first(
      '.increment',
      on('click', () => {
        el.count++
      }), // Add click event listener
    ),
    first(
      '.count',
      setText('count'), // Apply effect to update text
    ),
  ],
)
```

### Removed from the DOM

Runs when the component is removed (`disconnectedCallback()`). UIElement will run all cleanup functions returned by event listeners and effects during the setup phase (`connectedCallback()`). This will unsubscribe all signals the component is subscribed to, so you don't need to worry about memory leaks.

If you added **event listeners** outside the scope of your component or **subscribed manually to external APIs**, you need to return a cleanup function:

```js
component('my-component', {}, el => [
  // Setup logic
  () => {
    const observer = new IntersectionObserver(([entry]) => {
      // Do something
    })
    observer.observe(el)

    // Cleanup logic
    return () => observer.disconnect()
  },
])
```

### Observed Attributes

UIElement automatically observes and converts attributes with an associated **parser function** in the init block and updates them whenever the attribute changes (`attributeChangedCallback()`).

</section>

<section>

## Managing State with Signals

UIElement manages state using **signals**, which are atomic reactive states that trigger updates when they change. We use regular properties to access or update them:

```js
console.log('count' in el) // Check if the signal exists
console.log(el.count) // Read the signal value
el.count = 42 // Update the signal value
```

### Characteristics and Special Values

Signals in UIElement are of a **static type** and **non-nullable**. This allows to **simplify the logic** as you will never have to check the type or perform null-checks.

- If you use **TypeScript** (recommended), **you will be warned** that `null` or `undefined` cannot be assigned to a signal or if you try to assign a value of a wrong type.
- If you use vanilla **JavaScript** without a build step, setting a signal to `null` or `undefined` **will log an error to the console and abort**. However, strict type checking is not enforced at runtime.

Because of the **non-nullable nature of signals** in UIElement, we need two special values that can be assigned to any signal type:

- **`RESET`**: Will **reset to the server-rendered version** that was there before UIElement took control. This is what you want to do most of the times when a signal lacks a specific value.
- **`UNSET`**: Will **delete the signal**, **unsubscribe its watchers** and also **delete related attributes or style properties** in effects. Use this with special care!

### Initializing State from Attributes

The standard way to set initial state in UIElement is via **server-rendered attributes** on the component that needs it. No props drilling as in other frameworks. UIElements provides some bundled attribute parsers to convert attribute values to the desired type. And you can also define your own custom parsers.

```js
component(
  'my-component',
  {
    count: asInteger(), // Bundled parser: Convert '42' -> 42
    date: (_, v) => new Date(v), // Custom parser: '2025-02-14' -> Date object
  },
  () => [
    // Component setup
  ],
)
```

<card-callout class="caution">

**Careful**: Attributes **may not be present** on the element or **parsing to the desired type may fail**. To ensure **non-nullability** of signals, UIElement falls back to neutral defaults:

- `""` (empty string) for `string`
- `0` for `number`
- `{}` (empty object) for objects of any kind

</card-callout>

### Bundled Attribute Parsers

| Function                                      | Description                                                                                                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [asBoolean()](api/functions/asBoolean.html)   | Converts `"true"` / `"false"` to a **boolean** (`true` / `false`). Also treats empty attributes (`checked`) as `true`.                                                       |
| [asInteger()](api/functions/asInteger.html)   | Converts a numeric string (e.g., `"42"`) to an **integer** (`42`).                                                                                                           |
| [asNumber()](api/functions/asNumber.html)     | Converts a numeric string (e.g., `"3.14"`) to a **floating-point number** (`3.14`).                                                                                          |
| [asString()](api/functions/asString.html)     | Returns the attribute value as a **string** (unchanged).                                                                                                                     |
| [asEnum(values)](api/functions/asEnum.html)   | Ensures the string matches **one of the allowed values**. Example: `asEnum(["small", "medium", "large"])`. If the value is not in the list, it defaults to the first option. |
| [asJSON(fallback)](api/functions/asJSON.html) | Parses a JSON string (e.g., `'["a", "b", "c"]'`) into an **array** or **object**. If invalid, returns the fallback object.                                                   |

The pre-defined parsers `asInteger()`, `asNumber()` and `asString()` allow to set a custom fallback value as parameter.

The `asEnum()` parser requires an array of valid values, while the first will be the fallback value for invalid results.

The `asJSON()` parser requires a fallback object as parameter as `{}` probably won't match the type you're expecting.

</section>

<section>

## Selecting Elements

Use the provided selector utilities to find elements within your component:

### first()

Selects the first matching element and applies effects:

```js
component(
  'basic-counter',
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
  'module-tabgroup',
  {
    selected: '',
  },
  (el, { all }) => [
    // Apply click handler to all buttons
    all(
      '[role="tab"]',
      on('click', e => {
        el.selected = e.currentTarget?.getAttribute('aria-controls') ?? ''
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

The `first()` function expects the matched element to be present at connection time. If not, it will silently ignore the call.

On the other hand, the `all()` function creates a dynamic array of elements that will be updated whenever the matching elements are added or removed from the component's DOM branch. UIElement will apply the given setup functions to added elements and run the cleanup functions on removed elements.

<card-callout class="tip">

**Tip**: The `all()` function is more flexible but also more resource-intensive than `first()`. Prefer `first()` when targeting a single element known to be present at connection time.

</card-callout>

</section>

<section>

## Adding Event Listeners

Event listeners allow to respond to user interactions. They are the cause of changes in the component's state.

```js
component("my-component", {
	active: 0,
	value: ''
}, (el, { all, first }) => [
	all("button",
		on("click", e => {
			// Set "active" signal to value of data-index attribute of button
			const index = parseInt(e.target.dataset['index'], 10);
			el.active = Number.isInteger(index) ? index : 0;
		})
	),
	first("input",
		on("change", e => {
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
;(_, { first }) => [
  // On the component itself
  setAttribute('open', 'isOpen'), // Set "open" attribute according to "isOpen" signal

  // On first element matching ".count"
  first(
    '.count',
    setText('count'), // Update text content according to "count" signal
    toggleClass('even', 'isEven'), // Toggle "even" class according to "isEven" signal
  ),
]
```

Again, the order of effects is not important. Feel free to apply them in any order that suits your needs.

### Bundled Effects

| Function                                                                | Description                                                                                     |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [setText()](api/functions/setText.html)                                 | Updates **text content** with a `string` signal value (while preserving comment nodes).         |
| [setProperty()](api/functions/setProperty.html)                         | Updates a given **property** with any signal value.                                             |
| [show()](api/functions/show.html)                                       | Updates the **visibility** of an element with a `boolean` signal value.                         |
| [setAttribute()](api/functions/setAttribute.html)                       | Updates a given **attribute** with a `string` signal value.                                     |
| [toggleAttribute()](api/functions/toggleAttribute.html)                 | Toggles a given **boolean attribute** with a `boolean` signal value.                            |
| [toggleClass()](api/functions/toggleClass.html)                         | Toggles a given **CSS class** with a `boolean` signal value.                                    |
| [setStyle()](api/functions/setStyle.html)                               | Updates a given **CSS property** with a `string` signal value.                                  |
| [dangerouslySetInnerHTML()](api/functions/dangerouslySetInnerHTML.html) | Sets **HTML content** with a `string` signal value.                                             |
| [insertOrRemoveElement()](api/functions/insertOrRemoveElement.html)     | Inserts (positive integer) or removes (negative integer) elements with a `number` signal value. |

<card-callout class="tip">

**Tip**: TypeScript will check whether a value of a given type is assignable to a certain element type. You might have to pass a type hint for the queried element type. Prefer `setProperty()` over `setAttribute()` for increased type safety. Setting string attributes is possible for all elements, but will have an effect only on some.

</card-callout>

### Simplifying Effect Notation

For effects that take two arguments, **the second argument can be omitted** if the signal key matches the targeted property name, attribute, class, or style property.

When signal key matches property name:

```js
first('.count', toggleClass('even'))
```

Here, `toggleClass("even")` automatically uses the `"even"` signal.

### Using Local Signals for Protected State

Local signals are useful for storing state that should not be exposed to the outside world. They can be used to manage internal state within a component:

```js
component('my-component', {}, (_, { first }) => {
  const count = state(0)
  const double = count.map(v => v * 2)
  return [
    first(
      '.increment',
      on('click', () => {
        count.update(v => ++v)
      }),
    ),
    first('.count', setText(count)),
    first('.double', setText(double)),
  ]
})
```

Outside components cannot access the `count` or `double` signals.

### Using Functions for Ad-hoc Derived State

Instead of a signal key or a local signal, you can **pass a function** that derives a value dynamically:

```js
component("my-component", {
	count: 0
}, (el, { first }) => {
	const double = computed(() => el.count * 2);
	return [
		first(".count", toggleClass("even", () => !(el.count % 2)))),
		first(".double", setText(() => String(double.get())))
	];
});
```

<card-callout class="tip">

**When to use**

- **Use a signal key or a local signal** when the state is part of the component's public interface or internally reused.
- **Use a function** to **derive a value on the fly** when it is needed only in this one place.

Ad-hoc derived state is more efficient than the overhead of a memoized computed signal for simple functions like converting to a string or boolean, formatting a value or performing a calculation.

</card-callout>

### Efficient & Fine-Grained Updates

Unlike some frameworks that **re-render entire components**, UIElement updates only what changes:

- **No virtual DOM** – UIElement modifies the DOM directly.
- **Signals propagate automatically** – no need to track dependencies manually.
- **Optimized with a scheduler** – multiple updates are batched efficiently.

</section>

<section>

## Next Steps

Now that you understand the basics, explore:

- [Styling](styling.html) – Learn techniques to apply styles to components.
- [Data Flow](data-flow.html) – Learn about passing state between components.

</section>

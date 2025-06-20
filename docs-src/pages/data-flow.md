---
title: 'Data Flow'
emoji: '🔄'
description: 'Passing state, events, context'
---

<section class="hero">

# 🔄 Data Flow

<p class="lead"><strong>Learn how UIElement components can work together seamlessly.</strong> Start with simple parent-child relationships, then explore advanced patterns like custom events and shared state. Build modular, loosely coupled components that communicate efficiently.</p>
</section>

<section>

## Component Coordination

Let's consider a **product catalog** where users can add items to a shopping cart. We have **three independent components** that work together:

- `ProductCatalog` **(Parent)**:
  - **Tracks all `SpinButton` components** in its subtree and calculates the total count of items in the shopping cart.
  - **Passes that total** to a `InputButton`.
- `InputButton` **(Child)**:
  - Displays a **badge** in the top-right corner when the `badge` property is set.
  - **Does not track any state** – it simply renders whatever value is passed to it.
- `SpinButton` **(Child)**:
  - Displays an **Add to Cart** button initially.
  - When an item is added, it transforms into a **stepper** (increment/decrement buttons).

Although `InputButton` and `SpinButton` are completely independent, they need to work together.
So `ProductCatalog` **coordinates the data flow between them**.

### Parent Component: ProductCatalog

The **parent component (`ProductCatalog`) knows about its children**, meaning it can **retrieve state from and pass state to** them.

First, we need to observe the quantities of all `SpinButton` components. For this, we create a signal of all children matching the `form-spinbutton` selector:

```js
component(
  'product-catalog',
  {
    total: el => () =>
      selection(el, 'form-spinbutton')
        .get()
        .reduce((sum, item) => sum + item.value, 0),
  },
  () => [],
)
```

The `selection()` function returns a signal that emits an array of all matching elements. In contrast to a static `querySelectorAll()` call, the `selection()` function is reactive and updates whenever new elements are added or removed from the DOM.

Then, we need to calculate the total of all product quantities and pass it on to the `InputButton` component. In UIElement we use the `pass()` function to share state across components:

```js
component(
  'product-catalog',
  {
    total: el => () =>
      selection(el, 'form-spinbutton')
        .get()
        .reduce((sum, item) => sum + item.value, 0),
  },
  (el, { first }) => [
    first(
      'basic-button',
      pass({
        badge: () => (el.total > 0 ? String(el.total) : ''),
        disabled: () => !el.total,
      }),
    ),
  ],
)
```

Allright, that's it!

- ✅ Whenever one of the `value` signals of a `<form-spinbutton>` updates, the total in the badge of `<basic-button>` automatically updates.
- ✅ No need for event listeners or manual updates!

### Child Component: InputButton

The `InputButton` component **displays a badge when needed** – it does not know about any other component nor track state itself. It just exposes a reactive property `badge` of type `string` and has an effect to react to state changes that updates the DOM subtree.

```js
component(
  'basic-button',
  {
    badge: asString(RESET),
  },
  (_, { first }) => [first('.badge', setText('badge'))],
)
```

- ✅ Whenever the `badge` property is updated by a parent component, the badge text updates.
- ✅ If `badge` is an empty string, the badge indicator is hidden (via CSS).

### ChildComponent: SpinButton

The `SpinButton` component reacts to user interactions and exposes a reactive property `value` of type `number`. It updates its own internal DOM subtree, but doesn't know about any other component nor where the value is used.

```js
component(
  'form-spinbutton',
  {
    value: asInteger(),
  },
  (el, { all, first }) => {
    const max = asInteger(9)(el, el.getAttribute('max'))
    const isZero = () => el.value === 0
    return [
      first('.value', setText('value'), setProperty('hidden', isZero)),
      first(
        '.decrement',
        setProperty('hidden', isZero),
        on('click', () => {
          el.value--
        }),
      ),
      first(
        '.increment',
        setProperty('disabled', () => el.value >= max),
        on('click', () => {
          el.value++
        }),
      ),
      all(
        'button',
        on('keydown', e => {
          const { key } = e
          if (['ArrowUp', 'ArrowDown', '-', '+'].includes(key)) {
            e.stopPropagation()
            e.preventDefault()
            if (key === 'ArrowDown' || key === '-') el.value--
            if (key === 'ArrowUp' || key === '+') el.value++
          }
        }),
      ),
    ]
  },
)
```

- ✅ Whenever the user clicks a button or presses a handled key, the value property is updated.
- ✅ The component sets hidden and disabled states of buttons and updates the text of the `.value` element.

### Full Example

Here's how everything comes together:

- Each `SpinButton` tracks its own value.
- The `ProductCatalog` sums all quantities and passes the total to `InputButton`.
- The `InputButton` displays the total if it's greater than zero.

**No custom events are needed – state flows naturally!**

<module-demo>
	<div class="preview">
		<product-catalog>
			<header>
				<p>Shop</p>
				<basic-button disabled>
					<button type="button" disabled>
						<span class="label">🛒 Shopping Cart</span>
						<span class="badge"></span>
					</button>
				</basic-button>
			</header>
			<ul>
				<li>
					<p>Product 1</p>
					<form-spinbutton value="0" zero-label="Add to Cart" increment-label="Increment">
						<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
						<p class="value" hidden>0</p>
						<button type="button" class="increment">Add to Cart</button>
					</form-spinbutton>
				</li>
				<li>
					<p>Product 2</p>
					<form-spinbutton value="0" zero-label="Add to Cart" increment-label="Increment">
						<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
						<p class="value" hidden>0</p>
						<button type="button" class="increment">Add to Cart</button>
					</form-spinbutton>
				</li>
				<li>
					<p>Product 3</p>
					<form-spinbutton value="0" zero-label="Add to Cart" increment-label="Increment">
						<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
						<p class="value" hidden>0</p>
						<button type="button" class="increment">Add to Cart</button>
					</form-spinbutton>
				</li>
			</ul>
		</product-catalog>
	</div>
	<details>
		<summary>ProductCatalog Source Code</summary>
		<module-lazy src="./examples/product-catalog.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
	<details>
		<summary>InputButton Source Code</summary>
		<module-lazy src="./examples/basic-button.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
	<details>
		<summary>SpinButton Source Code</summary>
		<module-lazy src="./examples/form-spinbutton.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
</module-demo>

</section>

<section>

## Custom Events

Passing state down works well when a **parent component can directly observe child state**, but sometimes a **child needs to notify its parent** about an action **without managing shared state itself**.

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

---
title: 'Data Flow'
emoji: '🔄'
description: 'Passing state, events, context'
---

<section-hero>

# 🔄 Data Flow

<div>
  <p class="lead"><strong>Learn how UIElement components can work together seamlessly.</strong> Start with simple parent-child relationships, then explore advanced patterns like custom events and shared state. Build modular, loosely coupled components that communicate efficiently.</p>
  {{ toc }}
</div>
</section-hero>

<section>

## Component Coordination

Let's consider a **product catalog** where users can add items to a shopping cart. We have **three independent components** that work together:

- `ModuleCatalog` **(Parent)**:
  - **Tracks all `SpinButton` components** in its subtree and calculates the total count of items in the shopping cart.
  - **Passes that total** to a `BasicButton`.
- `BasicButton` **(Child)**:
  - Displays a **badge** in the top-right corner when the `badge` property is set.
  - **Does not track any state** – it simply renders whatever value is passed to it.
- `FormSpinbutton` **(Child)**:
  - Displays an **Add to Cart** button initially.
  - When an item is added, it transforms into a **stepper** (increment/decrement buttons).

Although `BasicButton` and `FormSpinbutton` are completely independent, they need to work together. So `ModuleCatalog` **coordinates the data flow between them**.

### Parent Component: ModuleCatalog

The **parent component (`ModuleCatalog`) knows about its children**, meaning it can **read state from and pass state to** them.

First, we need to observe the quantities of all `FormSpinbutton` components. For this, we create a signal of all children matching the `form-spinbutton` selector:

```js
component(
  'module-catalog',
  {
    total: fromDescendants(
      'form-spinbutton',
      (sum, item) => sum + item.value,
      0,
    ),
  },
  () => [],
)
```

The `fromDescendants()` function returns a signal of the reduced array of all matching elements. In contrast to a static `querySelectorAll()` call, the `fromDescendants()` function is reactive and updates whenever new elements are added or removed from the DOM.

Then, we need to convert the total of all product quantities to a string and pass it on to the `BasicButton` component. In UIElement we use the `pass()` function to share state across components:

```js
component(
  'module-catalog',
  {
    total: fromDescendants(
      'form-spinbutton',
      (sum, item) => sum + item.value,
      0,
    ),
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

- Whenever one of the `value` signals of a `<form-spinbutton>` updates, the total in the badge of `<basic-button>` automatically updates.
- No need for event listeners or manual updates!

### Child Component: BasicButton

The `BasicButton` component **displays a badge when needed** – it does not know about any other component nor track state itself. It just exposes a reactive properties `badge` of type `string` and `disabled` of type `boolean` and has effects to react to state changes that updates the DOM subtree.

```js
component(
  'basic-button',
  {
    disabled: asBoolean(),
    badge: asString(RESET),
  },
  (_, { first }) => [
    first('button', setProperty('disabled')),
    first('.badge', setText('badge')),
  ],
)
```

- Whenever the `disabled` property is updated by a parent component, the button is disabled or enabled.
- Whenever the `badge` property is updated by a parent component, the badge text updates.
- If `badge` is an empty string, the badge indicator is hidden (via CSS).

### Child Component: FormSpinbutton

The `FormSpinbutton` component reacts to user interactions and exposes a reactive property `value` of type `number`. It updates its own internal DOM subtree, but doesn't know about any other component nor where the value is used.

```js
component(
  'form-spinbutton',
  {
    value: asInteger(),
  },
  (el, { all, first }) => {
    const zeroLabel = el.getAttribute('zero-label') || 'Add to Cart'
    const incrementLabel = el.getAttribute('increment-label') || 'Increment'
    const max = asInteger(9)(el, el.getAttribute('max'))
    const nonZero = () => el.value !== 0

    return [
      first('.value', setText('value'), show(nonZero)),
      first(
        '.decrement',
        show(nonZero),
        on('click', () => {
          el.value--
        }),
      ),
      first(
        '.increment',
        setText(() => (nonZero() ? '+' : zeroLabel)),
        setProperty('ariaLabel', () =>
          nonZero() ? incrementLabel : zeroLabel,
        ),
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

- Whenever the user clicks a button or presses a handled key, the value property is updated.
- The component sets hidden and disabled states of buttons and updates the text of the `.value` element.

### Full Example

Here's how everything comes together:

- Each `FormSpinbutton` tracks its own value.
- The `ModuleCatalog` sums all quantities and passes the total to `BasicButton`.
- The `BasicButton` displays the total if it's greater than zero.

**No custom events are needed – state flows naturally!**

<module-demo>
	<div class="preview">
  	<module-catalog>
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
  				<form-spinbutton
  					value="0"
  					zero-label="Add to Cart"
  					increment-label="Increment"
  				>
  					<button
  						type="button"
  						class="decrement"
  						aria-label="Decrement"
  						hidden
  					>
  						−
  					</button>
  					<p class="value" hidden>0</p>
  					<button type="button" class="increment">Add to Cart</button>
  				</form-spinbutton>
  			</li>
  			<li>
  				<p>Product 2</p>
  				<form-spinbutton
  					value="0"
  					zero-label="Add to Cart"
  					increment-label="Increment"
  				>
  					<button
  						type="button"
  						class="decrement"
  						aria-label="Decrement"
  						hidden
  					>
  						−
  					</button>
  					<p class="value" hidden>0</p>
  					<button type="button" class="increment">Add to Cart</button>
  				</form-spinbutton>
  			</li>
  			<li>
  				<p>Product 3</p>
  				<form-spinbutton
  					value="0"
  					zero-label="Add to Cart"
  					increment-label="Increment"
  				>
  					<button
  						type="button"
  						class="decrement"
  						aria-label="Decrement"
  						hidden
  					>
  						−
  					</button>
  					<p class="value" hidden>0</p>
  					<button type="button" class="increment">Add to Cart</button>
  				</form-spinbutton>
  			</li>
  		</ul>
	  </module-catalog>
	</div>
	<details>
		<summary>ModuleCatalog Source Code</summary>
		<module-lazy src="./examples/module-catalog.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
	<details>
		<summary>BasicButton Source Code</summary>
		<module-lazy src="./examples/basic-button.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
	<details>
		<summary>FormSpinbutton Source Code</summary>
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

Custom events are perfect for this - they allow components to communicate upward through the DOM tree without tight coupling.

### TypeScript Support for Components and Events

To get full TypeScript support, declare your components and custom events globally:

```typescript
// In your component file
export type ProductCardProps = {
  productId: string
  quantity: number
}

declare global {
  interface HTMLElementTagNameMap {
    'product-card': Component<ProductCardProps>
    'shopping-cart': Component<ShoppingCartProps>
  }
  interface HTMLElementEventMap {
    itemAdded: CustomEvent<{ id: string; quantity: number }>
    cartUpdated: CustomEvent<{ total: number }>
  }
}
```

This enables full type checking, autocompletion, and access to UIElement component methods like `.getSignal()` and `.setSignal()`.

### Example: Shopping Cart Events

Consider a **product card** that needs to notify its parent when an item is added:

```js
// Child component dispatches custom event
component(
  'product-card',
  {
    productId: asString(),
    quantity: asInteger(),
  },
  (el, { first }) => [
    first(
      '.add-button',
      on('click', () => {
        // Dispatch custom event with product details
        el.dispatchEvent(
          new CustomEvent('itemAdded', {
            detail: {
              id: el.productId,
              quantity: el.quantity,
            },
            bubbles: true,
          }),
        )
      }),
    ),
  ],
)
```

```js
// Parent component listens for custom events
component(
  'shopping-cart',
  {
    items: fromEvent(
      'product-card',
      'itemAdded',
      ({ event, source, value }) => {
        // TypeScript knows 'source' is Component<ProductCardProps>
        // Can access UIElement methods like source.getSignal('quantity')
        const newItem = {
          id: event.detail.id,
          quantity: event.detail.quantity,
          addedAt: Date.now(),
        }
        return [...value, newItem]
      },
      [],
    ),
    total: () => el.items.reduce((sum, item) => sum + item.quantity, 0),
  },
  (el, { first }) => [
    first('.cart-count', setText('total')),
    first(
      '.items-list',
      setText(() =>
        el.items.map(item => `${item.id}: ${item.quantity}`).join(', '),
      ),
    ),
  ],
)

declare global {
  interface HTMLElementTagNameMap {
    'shopping-cart': Component<ShoppingCartProps>
  }
}
```

### Benefits of Custom Events

- **Decoupling**: Child components don't need to know about parent implementation
- **Reusability**: Components can be used in different contexts
- **Standard DOM**: Uses native event system, works with any framework
- **Bubbling**: Events naturally flow up the DOM tree
- **Cancellable**: Parent can prevent default behavior if needed

### When to Use Custom Events

- **User Actions**: Button clicks, form submissions, gestures
- **State Changes**: When a component's internal state affects others
- **Lifecycle Events**: Component initialization, destruction, errors
- **Data Flow**: When child needs to send data upward without direct coupling

### Component Type Safety Best Practices

Each UIElement component should declare its own `HTMLElementTagNameMap` extension:

```ts
// In my-component.ts
export type MyComponentProps = {
  value: string
  count: number
}

export default component(
  'my-component',
  {
    /* ... */
  },
  () => [],
)

declare global {
  interface HTMLElementTagNameMap {
    'my-component': Component<MyComponentProps>
  }
}
```

This enables:

- **Full type safety** when using signal producers like `fromDescendants('my-component', ...)`
- **Access to UIElement methods** like `.getSignal()` and `.setSignal()`
- **IntelliSense** for component properties and methods
- **Compile-time validation** of component interactions

</section>

<section>

## Providing Context

<card-callout class="caution">

**TODO**: Add example

</card-callout>

</section>

<section>

## Consuming Context

<card-callout class="caution">

**TODO**: Add example

</card-callout>

</section>

<section>

## Next Steps

</section>

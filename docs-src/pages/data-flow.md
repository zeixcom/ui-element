---
title: "Data Flow"
emoji: "🔄"
description: "Passing state, events, context"
---

<section class="hero">

# 🔄 Data Flow

<p class="lead"></p>
</section>

<section>

## Passing State Down

Let’s consider a **product catalog** where users can add items to a shopping cart. We have **three independent components** that work together:

* `ProductCatalog` **(Parent)**:
	- **Tracks all `SpinButton` components** in its subtree and derives the **total count** of items in the shopping cart.
	- **Passes that total** to a `BadgeButton`, which displays the number of items in the cart.
* `BadgeButton` **(Child)**:
	- Displays a **cart badge** when the `'badge'` signal is set.
	- **Does not track any state** – it simply renders whatever value is passed down.
* `SpinButton` **(Child)**:
	- Displays an **“Add to Cart”** button initially.
	- When an item is added, it transforms into a **stepper** (increment/decrement buttons).

Although `BadgeButton` **and** `SpinButton` are completely independent, they need to work together.
So `ProductCatalog` **coordinates the data flow between them**.

### Parent Component: ProductCatalog

The **parent component (`ProductCatalog`) knows about its children**, meaning it can **observe and pass state** to them.

Use the `.pass()` method to send values to child components. It takes an object where:

* **Keys** = Signal names in the **child** (`BadgeButton`)
* **Values** = Signal names in the parent (`ProductCatalog`) or functions returning computed values

```js
this.first('badge-button').pass({ badge: () => {
	const total = this.get('total');
	return typeof total === 'number' && total > 0 ? String(total) : '';
}});
```

* ✅ **Whenever the `total` signal updates, `<badge-button>` automatically updates.**
* ✅ **No need for event listeners or manual updates!**

### Child Component: BadgeButton

The `BadgeButton` component **displays a badge when needed** – it does not track state itself.

Whenever the `'badge'` **signal assigned by a parent component** updates, the badge text updates.

```js
class BadgeButton extends UIElement {
	connectedCallback() {
		this.first('.badge').sync(setText('badge'));
	}
}
```

* ✅ The `setText('badge')` effect **keeps the badge in sync** with the `'badge'` signal.
* ✅ If badge is an **empty string**, the badge is **hidden**.

The `BadgeButton` **doesn’t care how the badge value is calculated** – just that it gets one!

### Full Example

Here’s how everything comes together:

* Each `SpinButton` **tracks its own count**.
* The `ProductCatalog` **sums all counts and passes the total to `BadgeButton`**.
* The `BadgeButton` **displays the total** if it’s greater than zero.

**No custom events are needed – state flows naturally!**

<component-demo>
<div class="preview">
<product-catalog>
<header>
<p>Shop</p>
<badge-button>
<button type="button">
<span class="label">🛒 Shopping Cart</span>
<span class="badge"></span>
</button>
</badge-button>
</header>
<ul>
<li>
<p>Product 1</p>
<spin-button count="0" zero-label="Add to Cart" increment-label="Increment">
<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
<p class="count" hidden>0</p>
<button type="button" class="increment">Add to Cart</button>
</spin-button>
</li>
<li>
<p>Product 2</p>
<spin-button count="0" zero-label="Add to Cart" increment-label="Increment">
<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
<p class="count" hidden>0</p>
<button type="button" class="increment">Add to Cart</button>
</spin-button>
</li>
<li>
<p>Product 3</p>
<spin-button count="0" zero-label="Add to Cart" increment-label="Increment">
<button type="button" class="decrement" aria-label="Decrement" hidden>−</button>
<p class="count" hidden>0</p>
<button type="button" class="increment">Add to Cart</button>
</spin-button>
</li>
</ul>
</product-catalog>
</div>
<accordion-panel collapsible>
<details>
<summary>
<div class="summary">ProductCatalog Source Code</div>
</summary>
<lazy-load src="./examples/product-catalog.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
<accordion-panel collapsible>
<details>
<summary>
<div class="summary">BadgeButton Source Code</div>
</summary>
<lazy-load src="./examples/badge-button.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
<accordion-panel collapsible>
<details>
<summary>
<div class="summary">SpinButton Source Code</div>
</summary>
<lazy-load src="./examples/spin-button.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
</component-demo>

</section>

<section>

## Events Bubbling Up



</section>

<section>

## Providing Context



</section>

<section>

## Consuming Context



</section>
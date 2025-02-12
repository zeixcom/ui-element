---
title: "Styling Components"
emoji: "🎨"
description: "Scoped styles, CSS custom properties"
---

<section class="hero">

# 🎨 Styling Components

<p class="lead"><strong>Keep your components’ styles self-contained while supporting shared design tokens.</strong> UIElement does not enforce a specific styling method, but we recommend techniques that help balance encapsulation, reusability, and maintainability.</p>
</section>

<section>

## Design Principles

UIElement is focused on **state management and reactivity**, not styling. However, to **ensure consistent, maintainable, and reusable styles**, we recommend techniques that **scope component styles properly while allowing shared design tokens** (e.g., spacing, font sizes, colors, layout grids).

* ✅ **Each component brings along its own specific styles.**
* ✅ Component styles should be **scoped or encapsulated** so they don't leak out.
* ✅ **Allow customizations** via CSS custom properties or pre-defined classes.

Parent components may apply styles to the wrapper element of known sub-components for layout purposes. But avoid styling inner elements of sub-components directly. This would tightly couple the styles of the outer and inner components.

</section>

<section>

## Scope Styles to Custom Element

Use the **custom element name** to scope component styles if **you control the page and the components within**. This protects against component styles leaking out, while still allowing to use the CSS cascade. No need for Shadow DOM, no duplicate style rules.

```css
my-component {

	& button {
		/* Button style rules */
	}

	/* More selectors for inner elements */

}
```

### Advantages of Custom Element Names

* ✅ By definition **unique within the document** with a descriptive name.
* ✅ **Low specificity**, making it easy to override when you need to with a single class.

<callout-box class="tip">

**When to use**

✅ **Best when** you control the page and need styles to cascade naturally.
❌ **Avoid if** you expect style clashes from third-party styles.

</callout-box>

</section>

<section>

## Encapsulate Styles with Shadow DOM

Use **Shadow DOM** to encapsulate styles if your component is going to be used in a pages **where you don't control the styles**. This way you make sure page styles don't leak in and component styles don't leak out.

```html
<my-component>
	<template shadowrootmode="open">
		<style>
			button {
				/* Button style rules */
			}

			/* More selectors for inner elements */
		</style>
		<!-- Inner elements -->
	</template>
</my-component>
```

<callout-box class="tip">

**When to use**

✅ **Best when** your component is used in environments where you don’t control styles.
❌ **Avoid if** you need global styles to apply inside the component.

</callout-box>

</section>

<section>

## Shared Design Tokens with CSS Custom Properties

Web Components can’t inherit global styles inside **Shadow DOM**, but CSS custom properties allow components to remain **flexible and themeable**.

### Defining Design Tokens

Set global tokens in a stylesheet:

```css
:root {
	--button-bg: #007bff;
	--button-text: #fff;
	--spacing: 1rem;
}
```


### Using Tokens in a Component

```css
my-component {
	padding: var(--spacing);

	& button {
		background: var(--button-bg);
		color: var(--button-text);
	}
}
```

### Advantages of CSS Custom Properties

* ✅ **Supports theming** – Users can override styles globally.
* ✅ **Works inside Shadow DOM** – Unlike normal CSS, custom properties are inherited inside the shadow tree.

</section>

<section>

## Defined Variants with Classes

Use **classes** if your components can appear in a **limited set of specific manifestations**. For example, buttons could come in certain sizes and have primary, secondary and tertiary variants.

```css
my-button {
	/* Style rules for default (medium-sized, secondary) buttons */

	&.small {
		/* Style rules for small buttons */
	}

	&.large {
		/* Style rules for large buttons */
	}

	&.primary {
		/* Style rules for primary buttons */
	}

	&.tertiary {
		/* Style rules for tertiary buttons */
	}
}
```

</section>

<section>

## CSS-only Components

Just because UIElement is a JavaScript library doesn't mean you have to use JavaScript in every component. It's perfectly fine to use custom elements just for styling purposes.

Here's the example of the `<callout-box>` we're using in this documentation:

<component-demo>
<div class="preview">
<callout-box>This is an informational message.</callout-box>
<callout-box class="tip">Remember to hydrate while coding!</callout-box>
<callout-box class="caution">Be careful with this operation.</callout-box>
<callout-box class="danger">This action is irreversible!</callout-box>
<callout-box class="note">This is just a side note.</callout-box>
</div>
<accordion-panel collapsible>
<details>
<summary>Source Code</summary>
<lazy-load src="./examples/callout-box.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
</component-demo>

</section>

<section>

## Next Steps

Now that you know how to style components, explore:

* [Data Flow](data-flow.html) – Learn about communication between components.
* [Patterns & Techniques](patterns-techniques.html) – Explore best practices and advanced topics.

</section>
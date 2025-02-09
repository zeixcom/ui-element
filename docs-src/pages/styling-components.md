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

## UIElement and Styling

UIElement is focused on **state management and reactivity**, not styling. However, to **ensure consistent, maintainable, and reusable styles**, we recommend techniques that **scope component styles properly while allowing shared design tokens** (e.g., spacing, font sizes, colors, layout grids).

</section>

<section>

## Scope Styles via Custom Element Name

If you control the page and the components within, it's best to scope component styles to the custom element name. This allows you to use the CSS cascade. You don't need Shadow DOM and duplicate style rules from the outer context to achieve the desired appearance.

```css
my-component {

	& button {
		/* Button style rules */
	}

	/* More selectors for inner elements */

}
```

**Advantages of Custom Element Names:**

* ✅ By definition **unique within the document** with a descriptive name.
* ✅ **Low specificity**, making it easy to overwrite when you need to.

**When to Use**

* ✅ **Best when** you control the page and need styles to cascade naturally.
* ❌ **Avoid if** you expect style clashes from third-party styles.

</section>

<section>

## Encapsulate Styles with Shadow DOM

If your component is going to be used in a pages where you don't control the styles, it's best to encapsulate neccessary styles in a Shadow DOM. This way you make sure page styles don't leak in and component styles don't leak out.

```html
<my-component>
	<template shadowrootmode="open">
		<style>
			button {
				/* Button style rules */
			}

			/* More selectors for inner elements */
		</style>
		<!-- inner elements -->
	</template>
</my-component>
```

**When to Use**

* ✅ **Best when** your component is used in environments where you don’t control styles.
* ❌ **Avoid if** you need global styles to apply inside the component.

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

**Advantages of CSS Custom Properties:**

* ✅ **Supports theming** – Users can override styles globally.
* ✅ **Works inside Shadow DOM** – Unlike normal CSS, custom properties are inherited inside the shadow tree.

</section>

<section>

## Next Steps

Now that you know how to style components, explore:

* [Data Flow](data-flow.html) – Learn about inter-component communication.
* [Examples & Recipes](examples-recipes.html) – See styling techniques in action.

</section>
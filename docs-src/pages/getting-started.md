---
title: "Getting Started"
emoji: "🚀"
description: "Installation, setup, and first steps"
---

<section class="hero">

# 🚀 Getting Started

<p class="lead"><strong>Set up UIElement in minutes – no build tools required</strong>. Whether you’re enhancing server-rendered HTML with lightweight interactivity or integrating Web Components into a modern JavaScript project, UIElement makes it simple to get started.</p>
</section>

<section>

## How to Install UIElement

UIElement works **without build tools** but also supports **NPM and module bundlers** for larger projects. Choose the option that best fits your needs.

### Using a CDN

For the easiest setup, include <strong>UIElement</strong> via a CDN. This is ideal for **testing or quick projects** where you want lightweight interactivity without additional tooling.

```html
<script src="https://cdn.jsdelivr.net/npm/@zeix/ui-element@latest/index.js"></script>
```

Or use `<script type="module">` to import UIElement in your HTML:

```html
<script type="module">
import { UIElement } from 'https://cdn.jsdelivr.net/npm/@zeix/ui-element@latest/index.js'

// Your code here
</script>
```

* ✅ **No build step** required
* ✅ **Works with any server-rendered HTML**
* ✅ **Automatic hydration** when components are dynamically inserted

</section>

<section>

### Self-Hosting UIElement

For production use, you may want to **self-host UIElement** to avoid relying on a CDN. You can download the latest version from:

<a href="https://github.com/zeixcom/ui-element/blob/main/index.js" target="_blank">Github Repository</a>

Simply host the file on your server and include it like this:

```html
<script src="/path/to/your/hosted/ui-element.js"></script>
```

**Why self-host?**

* You **control updates** and avoid breaking changes from external CDNs.
* Works for **projects with stricter Content Security Policy rules**.

Remember to keep the hosted file updated to use the latest features and bug fixes.

</section>

<section>

### Installing via NPM

If you’re using a **bundler** like **Vite, Webpack, or Rollup**, install UIElement via NPM:

```bash
npm install @zeix/ui-element
```

Then import `UIElement` in your JavaScript:

```js
import { UIElement } from '@zeix/ui-element'
```

* ✅ Best for **larger projects** using a build pipeline
* ✅ Works with **modern JavaScript/TypeScript tooling**

</section>

<section>

## Creating Your First Component

Now, let's create an interactive Web Component to verify your setup.

**What This Component Does**

* Displays **“Hello, World!”** by default.
* Updates dynamically when you **type into the input field**.

### Markup

Include the following in your server-rendered HTML:

```html
<hello-world>
	<label>Your name<br>
		<input type="text">
	</label>
	<p>Hello, <span>World</span>!</p>
</hello-world>
```

### Component Definition

Save the following inside a `<script type="module">` tag or an external JavaScript file.

```html
<script type="module">
	import { UIElement, setText, RESET } from 'https://cdn.jsdelivr.net/npm/@zeix/ui-element@latest/index.js'

	class HelloWorld extends UIElement {
		static localName = 'hello-world';

		connectedCallback() {

			// Update content dynamically based on the 'name' signal
			this.first('span').sync(setText('name'));

			// Handle user input to change the 'name'
			this.first('input').on('input', e => {
				this.set('name', e.target.value || RESET)
			});
		}
	}
	HelloWorld.define();
</script>
```

**What Happens Here?**

* ✅ The `setText('name')` effect **syncs the state** with the `<span>`.
* ✅ The `.on('input')` event **updates the state** whenever you type, falling back to the initial value if empty with (constant `RESET`).
* ✅ The Web Component **hydrates automatically** when inserted into the page.

</section>

<section>

## Verifying Your Installation

If everything is set up correctly, you should see:

* A text input field
* A greeting (Hello, World!)
* The greeting updates as you type

<component-demo>
	<div class="preview">
		<hello-world>
			<template shadowrootmode="open">
				<label>Your name<br>
					<input type="text">
				</label>
				<p>Hello, <span>World</span>!</p>
			</template>
		</hello-world>
	</div>
</component-demo>

If it's not working:

* Check the browser console for errors (missing imports, typos).
* Ensure your `<script>` tag is set to `type="module"` when using ES modules.
* If using NPM, confirm UIElement is installed inside `node_modules/@zeix/ui-element`.

</section>

<section>

## Next Steps

Now that UIElement is installed, explore the core concepts for [Building Components](building-components.html):

* ✅ **Component anatomy and lifecycle** (using Web Components)
* ✅ **Accessing sub-elements** (select children)
* ✅ **Signals & effects** (state-driven DOM updates)
* ✅ **Event listeners** (react to user interaction)

Or jump straight to [Styling Components](styling-components.html) for CSS best practices.

</section>
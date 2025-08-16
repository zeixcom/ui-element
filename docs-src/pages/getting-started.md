---
title: 'Getting Started'
emoji: '🚀'
description: 'Installation, setup, and first steps'
---

<section-hero>

# 🚀 Getting Started

<div>
  <p class="lead"><strong>Set up UIElement in minutes – no build tools required</strong>. Or use any package manager and bundler to take advantage of TypeScript support and optimize frontend assets.</p>
  {{ toc }}
</div>
</section-hero>

<section>

## How to Install UIElement

UIElement works **without build tools** but also supports **package managers and bundlers** for larger projects. Choose the option that best fits your needs.

### Using a CDN

For the easiest setup, include UIElement via a CDN. This is ideal for **testing or quick projects** where you want lightweight interactivity without additional tooling.

```html (page.html)
<script src="https://cdn.jsdelivr.net/npm/@zeix/ui-element@latest/index.js"></script>
```

</section>

<section>

### Self-Hosting UIElement

For production use, you may want to **self-host UIElement** to avoid relying on a CDN. You can download the latest version from:

<a href="https://github.com/zeixcom/ui-element/blob/main/index.js" target="_blank">Github Repository</a>

Simply host the file on your server and include it like this:

```html (page.html)
<script src="/path/to/your/hosted/ui-element.js"></script>
```

**Why self-host?**

- You **control updates** and avoid breaking changes from external CDNs.
- Works for **projects with stricter Content Security Policy rules**.

Remember to keep the hosted file updated to use the latest features and bug fixes.

</section>

<section>

### Installing via Package Managers

If you're using a **bundler** like **Vite, Webpack, or Rollup**, install UIElement via NPM or Bun:

<module-tabgroup>
<div role="tablist">
<button role="tab" id="trigger_installation-npm" aria-controls="panel_installation-npm" aria-selected="true" tabindex="0">NPM</button>
<button role="tab" id="trigger_installation-bun" aria-controls="panel_installation-bun" aria-selected="false" tabindex="-1">Bun</button>
</div>
<div role="tabpanel" id="panel_installation-npm" aria-labelledby="trigger_installation-npm">

```bash (user@computer project %)
npm install @zeix/ui-element
```

</div>
<div role="tabpanel" id="panel_installation-bun" aria-labelledby="trigger_installation-bun">

```bash (user@computer project %)
bun add @zeix/ui-element
```

</div>
</module-tabgroup>

Then import the needed functions in your JavaScript:

```js (main.js)
import { asString, component, on, setText } from '@zeix/ui-element'
```

</section>

<section>

## Creating Your First Component

Now, let's create an interactive Web Component to verify your setup.

**What This Component Does**

- Displays `Hello, World!` by default.
- Updates dynamically when you type into the input field.

### Markup

Include the following in your server-rendered HTML:

```html (page.html)
<hello-world>
  <label>
    Your name<br />
    <input name="name" type="text" autocomplete="given-name" />
  </label>
  <p>Hello, <span>World</span>!</p>
</hello-world>
```

### Component Definition

Save the following inside a `<script type="module">` tag or an external JavaScript file.

```html (page.html)
<script type="module">
  import {
    asString,
    component,
    on,
    setText,
  } from 'https://cdn.jsdelivr.net/npm/@zeix/ui-element@latest/index.js'

  component(
    'hello-world',
    {
      name: asString(el => el.querySelector('span')?.textContent?.trim() ?? ''),
    },
    (el, { first }) => {
      const fallback = el.name
      return [
        first(
          'input',
          on('input', ({ target }) => ({ name: target.value || fallback })),
        ),
        first('span', setText('name')),
      ]
    },
  )
</script>
```

### Understanding Your First Component

This component demonstrates UIElement's core concepts:

- **Reactive Properties**: `name: asString(...)` creates a reactive property that syncs with the `name` attribute and falls back to the `<span>` content
- **Effects**: The setup function returns effects that handle user input and update the display text
- **Element Selection**: `first()` selects descendant elements to apply effects to

Learn more about these concepts in the [Components](components.html) guide.

</section>

<section>

## Verifying Your Installation

If everything is set up correctly, you should see:

- A text input field
- A greeting (`Hello, World!`)
- The greeting updates as you type

<module-demo>
	<div class="preview">
		<hello-world>
			<label>Your name<br>
				<input name="name" type="text">
			</label>
			<p>Hello, <span>World</span>!</p>
		</hello-world>
	</div>
</module-demo>

If it's not working:

- Check the browser console for errors (missing imports, typos).
- Ensure your `<script>` tag is set to `type="module"` when using ES modules.
- If using NPM, confirm UIElement is installed inside `node_modules/@zeix/ui-element`.

</section>

<section>

## Next Steps

You've successfully created your first reactive component! Now you're ready to dive deeper into UIElement's core concepts:

**Next: Building [Components](components.html)**
Learn the fundamental building blocks: component anatomy, element selection, basic state management, and event handling patterns.

</section>

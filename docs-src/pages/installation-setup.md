---
title: "Installation & Setup"
emoji: "⚙️"
description: "How to install and set up the library"
---

<section class="hero">

# ⚙️ Installation & Setup

<p class="lead">Start using <strong>UIElement</strong> to enhance server-rendered pages with interactive Web Components – no framework required.</p>
</section>

<section>

## How to Install UIElement

UIElement works **without build tools** but also supports **NPM and module bundlers** for larger projects. Choose the option that best fits your needs.

### Using a CDN

For the easiest setup, include <strong>UIElement</strong> via a CDN. This is ideal for **testing or quick projects** where you want lightweight interactivity without additional tooling.

<code-block language="html" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
<p class="meta"><span class="language">html</span></p>
<pre class="language-html"><code>&lt;script src="https://cdn.jsdelivr.net/npm/@zeix/ui-element@latest/index.js"&gt;&lt;/script&gt;</code></pre>
<input-button class="copy">
<button type="button" class="secondary small">Copy</button>
</input-button>
</code-block>

Or use `<script type="module">` to import UIElement in your HTML:

<code-block language="html" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
<p class="meta"><span class="language">html</span></p>
<pre class="language-html"><code>&lt;script type="module"&gt;
import { UIElement } from 'https://cdn.jsdelivr.net/npm/@zeix/ui-element@latest/index.js'

// Your code here
&lt;/script&gt;</code></pre>
<input-button class="copy">
<button type="button" class="secondary small">Copy</button>
</input-button>
</code-block>

* ✅ **No build step** required
* ✅ **Works with any server-rendered HTML**
* ✅ **Automatic hydration** when components are dynamically inserted

</section>

<section>

### Self-Hosting UIElement

For production use, you may want to **self-host UIElement** to avoid relying on a CDN. You can download the latest version from:

<a href="https://github.com/zeixcom/ui-element/blob/main/index.js" target="_blank">Github Repository</a>

Simply host the file on your server and include it like this:

<code-block language="html" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
<p class="meta"><span class="language">html</span></p>
<pre class="language-html"><code>&lt;script src="/path/to/your/hosted/ui-element.js"&gt;&lt;/script&gt;</code></pre>
<input-button class="copy">
<button type="button" class="secondary small">Copy</button>
</input-button>
</code-block>

**Why self-host?**

* You **control updates** and avoid breaking changes from external CDNs.
* Works for **projects with stricter Content Security Policy rules**.

Remember to keep the hosted file updated to use the latest features and bug fixes.

</section>

<section>

### Installing via NPM

If you’re using a **bundler** like **Vite, Webpack, or Rollup**, install UIElement via NPM:

<code-block language="bash" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
<p class="meta"><span class="language">bash</span></p>
<pre class="language-bash"><code>npm install @zeix/ui-element</code></pre>
<input-button class="copy">
<button type="button" class="secondary small">Copy</button>
</input-button>
</code-block>

Then import `UIElement` in your JavaScript:

<code-block language="js" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
<p class="meta"><span class="language">js</span></p>
<pre class="language-js"><code>import { UIElement } from '@zeix/ui-element'</code></pre>
<input-button class="copy">
<button type="button" class="secondary small">Copy</button>
</input-button>
</code-block>

* ✅ Best for **larger projects** using a build pipeline
* ✅ Works with **modern JavaScript/TypeScript tooling**

</section>

<section>

## Creating Your First Component

Now, let’s create an interactive Web Component to verify your setup.

**What This Component Does**

* Displays **“Hello, World!”** by default.
* Updates dynamically when you **type into the input field**.

### Markup

Include the following in your server-rendered HTML:

<code-block language="html" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
<p class="meta"><span class="language">html</span></p>
<pre class="language-html"><code>&lt;hello-world&gt;
&lt;label&gt;Your name&lt;br&gt;
&lt;input type="text"&gt;
&lt;/label&gt;
&lt;p&gt;Hello, &lt;span&gt;World&lt;/span&gt;!&lt;/p&gt;
&lt;/hello-world&gt;</code></pre>
<input-button class="copy">
<button type="button" class="secondary small">Copy</button>
</input-button>
</code-block>

### Component Definition

Save the following inside a `<script type="module">` tag or an external JavaScript file.

<code-block language="js" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
<p class="meta"><span class="language">js</span></p>
<pre class="language-js"><code>&lt;script type="module"&gt;
import { UIElement, setText } from 'https://cdn.jsdelivr.net/npm/@zeix/ui-element@latest/index.js'

class HelloWorld extends UIElement {
	connectedCallback() {

		// Update content dynamically based on the 'name' signal
		this.first('span').sync(setText('name'))

		// Handle user input to change the 'name'
		this.first('input').on('input', e =&gt; this.set('name', e.target.value || undefined))
	}
}
HelloWorld.define('hello-world')
&lt;/script&gt;</code></pre>
<input-button class="copy">
<button type="button" class="secondary small">Copy</button>
</input-button>
</code-block>

**What Happens Here?**

* ✅ The `setText('name')` effect **syncs the state** with the `<span>`.
* ✅ The `.on('input')` event **updates the state** whenever you type, falling back to the initial value if empty.
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

If it’s not working:

* Check the browser console for errors (missing imports, typos).
* Ensure your `<script>` tag is set to `type="module"` when using ES modules.
* If using NPM, confirm UIElement is installed inside `node_modules/@zeix/ui-element`.

</section>

<section>

## Next Steps

Now that UIElement is installed, explore the Core Concepts to learn about:

* ✅ **Signals & Effects** (state-driven DOM updates)
* ✅ **Component Lifecycle** (building interactive UI components)
* ✅ **State Passing & State Sharing** (Communicating between components)

Or jump straight into the [Detailed Walkthrough](detailed-walkthrough.html) to get hands-on.

</section>
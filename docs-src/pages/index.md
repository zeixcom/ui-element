---
title: "Introduction"
emoji: "📘"
description: "Overview and key benefits of UIElement"
---

<section class="hero">
  <h1>📘 Introduction</h1>
  <p class="lead">
    A lightweight solution to bring signals-based reactivity and state management to vanilla Web Components without the need for a complex framework.
  </p>
</section>

<section>

## What is UIElement?

**UIElement** is a lightweight JavaScript library that extends the native `HTMLElement` class to bring efficient state management and reactivity to your Web Components without client-side rendering or the overhead of a larger framework.

- **Minimalist & Lightweight**: Only what you need to manage state and reactivity.
- **Signals-Based Reactivity**: Fine-grained updates based on state changes.
- **Server-Rendered HTML Updates**: Designed to work seamlessly with HTML rendered on the server, only updating what's necessary on the client side.

</section>

<section>

## Why Use UIElement?

If you're looking for:

- **Efficient State Management**: No need for large frameworks—just manage client-side state and update HTML efficiently.
- **Full Control with Web Standards**: Build fully functional components with standard Web Components, no special syntax or magic.
- **Fine-Grained Reactivity**: Update exactly what's needed when state changes, reducing re-renders and keeping components performant.
- **Flexibility to Work with Existing HTML**: Update server-rendered HTML dynamically without re-rendering the entire page.

</section>

<section>

## When Should You Use UIElement?

**Best Use Cases:**

- **Enhancing Server-Rendered Pages**: When you want to add interactivity to server-rendered pages without doing client-side rendering.
- **Building Web Components with State**: When creating custom elements that require easy state management.
- **Projects Prioritizing Performance & Simplicity**: When you want to maintain a simple, fast project without the need for a full JavaScript framework like React, Vue, or Angular.

**Example Scenarios:**

- Enhancing form interactions without reloading the page.
- Adding client-side features like counters, tabs, or toggles to a server-rendered app.
- Managing shared state between multiple components on the client.

</section>

<section>

## How UIElement Works

UIElement relies on signals — small pieces of reactive state that notify your components when changes occur. This allows for efficient updates to HTML content, handling reactivity only when necessary.

**Signals & Effects:** Signals automatically trigger updates to the DOM when they change.

<code-block language="js">
<pre class="language-js"><code>this.set('count', 0) // Define a signal for 'count'
this.first('.count').sync(setText('count')) // Automatically update content when 'count' changes</code></pre>
</code-block>
</section>

<section>

## Benefits of UIElement over Traditional Frameworks

* **No Virtual DOM**: Unlike React or Vue, UIElement updates HTML directly, avoiding unnecessary renders.
* **Minimal Overhead**: Since it builds on Web Components, it has minimal impact on performance and bundle size.
* **Simple API**: Few, clear concepts (signals, effects, context) allow developers to quickly build interactive components.

</section>
		  
<section>

## Quick Start Guide

A simple example to get started:
				
<component-demo>
	<div class="preview">
		<my-counter count="42">
			<p>
				Count: <span class="count"></span>
				Parity: <span class="parity"></span>
			</p>
			<button type="button" class="decrement">−</button>
			<button type="button" class="increment">+</button>
		</my-counter>
	</div>
	<accordion-panel collapsible>
		<details>
			<summary>
				<div class="summary">Source Code</div>
			</summary>
			<lazy-load src="./examples/my-counter.html">
				<p class="loading">Loading...</p>
			</lazy-load>
		</details>
	</accordion-panel>
</component-demo>

</section>
		  
<section>

## Next Steps

Continue to the [Installation & Setup](installation-setup.html) to get started, or dive into [Core Concepts](core-concepts.html) to learn more about signals and reactivity.

</section>
---
title: "Introduction"
emoji: "📖"
description: "Overview and key benefits of UIElement"
---

<section class="hero">

# 📖 Introduction

<p class="lead">Enhance server-rendered pages with lightweight, self-contained Web Components. No framework, no hydration issues, no unnecessary complexity.</p>
</section>

<section>

## What is UIElement?

**UIElement** is a lightweight JavaScript library that lets you build interactive Web Components without requiring a full JavaScript framework like React or Vue.

It **works with your existing server-rendered HTML**, enhancing it with stateful, reusable components that hydrate automatically – even when inserted dynamically.

* **Works with any backend** – No need for a JavaScript-first stack like Next.js.
* **No build tools required** – Just drop in components and they work.
* **Minimal JavaScript footprint** – Less code over the wire, less complexity.
* **Future-proof** – Web Components don’t break with framework updates.

</section>

<section>

## Why UIElement?

If you’re looking for a simple, **framework-free way to add interactivity** to your web pages, UIElement is the perfect fit.

* **Enhancing Server-Rendered Pages**: Add client-side behavior to static HTML without worrying about hydration mismatches.
* **Creating Standalone Web Components**: Build self-contained UI elements that work anywhere — inside any CMS, e-commerce site, or dashboard.
* **Adding Lightweight Interactivity**: Skip the complexity of React or Vue for simple UI elements like tabs, counters, and interactive lists.
* **Long-Term Stability**: Web Components outlive JavaScript frameworks release cycles – your components won’t break with each major update.

</section>

<section>

## How UIElement Works

UIElement extends the native `HTMLElement` class, letting you define **custom Web Components** that manage state with minimal code.

Unlike traditional frameworks that rely on a virtual DOM or dirty-checking, UIElement synchronizes automic pieces of state (signals) directly with the DOM, making fine-grained updates **fast and efficient**.

### Example: Counter Component

<component-demo>
	<div class="preview">
		<my-counter count="42">
			<p>
				Count: <span class="count"></span><br>
				Parity: <span class="parity"></span>
			</p>
			<button type="button" class="decrement">−</button>
			<button type="button" class="increment">+</button>
		</my-counter>
	</div>
	<details>
		<summary>Source Code</summary>
		<lazy-load src="./examples/my-counter.html">
			<p class="loading" role="status">Loading...</p>
			<p class="error" role="alert" aria-live="polite" hidden></p>
		</lazy-load>
	</details>
</component-demo>

* ✅ **Zero renders** – Only updates what changes.
* ✅ **No abstraction over the DOM** – Works with plain HTML.
* ✅ **Fully self-contained** – Can be used anywhere, even inside CMS templates.

<section>

## How UIElement Compares

* **No Virtual DOM**: Builds upon server-rendered HTML and does only atomic DOM updates, avoiding unnecessary renders.
* **Minimal Overhead**: Since it adds only a thin layer over native Web Standards, it has minimal bundle size and high performance.
* **Simple API**: Few, clear concepts (signals, effects, context) allow developers to quickly build interactive components.

</section>
		  
<section>

## Next Steps

Continue to [Getting Started](getting-started.html), or dive into [Building Components](building-components.html) to learn more about signals and reactivity.

</section>
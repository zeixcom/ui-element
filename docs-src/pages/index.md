---
title: 'Introduction'
emoji: '📖'
description: 'Overview and key benefits of UIElement'
---

<section class="hero">

# 📖 Introduction

<p class="lead"><strong>Web development doesn't need to be complicated</strong>. UIElement offers a refreshingly simple approach to create reactive Web Components that enhance your existing HTML.</p>
</section>

<section>

## What is UIElement?

UIElement is a lightweight TypeScript library (approximately 4kB gzipped) that brings signal-based reactivity to Web Components. It serves as a thin layer between standard web technologies and modern reactivity patterns, empowering you to:

- Transform ordinary HTML elements into reactive components
- Bind UI updates directly to state changes with minimal boilerplate
- Create reusable component patterns without complex abstractions
- Progressively enhance server-rendered content with client-side interactivity

```js
// Transform HTML into reactive components with minimal code
component('hello-world', { name: RESET }, (el, { first }) => [
	first('span', setText('name')),
])
```

UIElement augments what the platform already provides. It leverages the Web Components standard while adding just enough convenience functions to make reactive UI behaviors easy to implement.

</section>

<section>

## Philosophy & Design Goals

### HTML-First Approach

UIElement assumes you start with semantic HTML and want to enhance it with behavior:

```html
<hello-world>
	<p>Hello, <span>Alice</span>!</p>
</hello-world>
```

This means better SEO, faster initial page loads, and progressive enhancement that works even when JavaScript fails.

### Reactive by Design

UIElement uses signals for efficient, targeted DOM updates. Only the parts that actually changed get updated - no virtual DOM overhead, no unnecessary re-renders.

</section>

<section>

## Why Choose UIElement?

UIElement shines when you want:

- **Server-rendered content** with client-side enhancements
- **High performance** on all devices (no virtual DOM overhead)
- **Component reusability** without framework lock-in
- **Future-proof** code built on web standards
- **Easy integration** with existing codebases

**Key Benefits:**

- ~4kB gzipped with no dependencies
- TypeScript support with full type safety
- Works with any backend or build setup
- Progressive enhancement friendly

</section>

<section>

## Next Steps

Now that you understand what UIElement is and its core philosophy, you're ready to:

- Move on to [Getting Started](getting-started.html) to install the library and build your first component

</section>

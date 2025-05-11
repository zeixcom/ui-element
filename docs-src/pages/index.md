---
title: "Introduction"
emoji: "📖"
description: "Overview and key benefits of UIElement"
---

<section class="hero">

# 📖 Introduction

<p class="lead">Web development doesn't need to be complicated. UIElement offers a refreshingly simple approach to create reactive Web Components that enhance your existing HTML.</p>
</section>

<section>

## What is UIElement?

UIElement is a lightweight TypeScript library (approximately 4kB gzipped) that brings signal-based reactivity to Web Components. It serves as a thin layer between standard web technologies and modern reactivity patterns, empowering you to:

* Transform ordinary HTML elements into reactive components
* Bind UI updates directly to state changes with minimal boilerplate
* Create reusable component patterns without complex abstractions
* Progressively enhance server-rendered content with client-side interactivity

```js
import { asInteger, component, first, on, RESET, setText } from "@zeix/ui-element";

component("show-appreciation", {
    count: asInteger(RESET) // Get initial value from .count element
}, el => [

    // Update count display when state changes
    first(".count", setText("count")),

    // Handle click events to change state
    first("button", on("click", () => { el.count++ }))
]);
```

UIElement augments what the platform already provides. It leverages the Web Components standard while adding just enough convenience functions to make reactive UI behaviors easy to implement.

</section>

<section>

## Philosophy & Design Goals

### HTML-First Approach

While many frameworks start with JavaScript and generate HTML, UIElement takes the opposite approach. It assumes you already have HTML (usually server-rendered) and want to enhance it with behavior:

```html
<!-- Start with semantic HTML -->
<show-appreciation aria-label="Show appreciation">
    <button type="button">
        <span class="emoji">💐</span>
        <span class="count">5</span>
    </button>
</show-appreciation>
```

This philosophy means:

* Better SEO and initial page load performance
* Progressive enhancement for resilient UIs
* Less client-side rendering overhead
* Simpler accessibility implementation

### Performance By Design

UIElement avoids the overhead of virtual DOM diffing, instead using precise, targeted DOM updates through a fine-grained reactivity system:

* Efficient signal propagation that updates only what changed
* Batch processing and scheduling of updates to minimize browser reflows
* Minimal abstraction layers between your code and the browser

### Developer Experience Without Compromise

UIElement is designed to be intuitive and easy to use. It's built with type safety in mind, ensuring that your code is correct and that you don't miss any potential bugs.

* **Type Safety**: Get early warnings when types don't match, improving code quality and reducing bugs.
* **Minimal Boilerplate**: Write less code to achieve the same result.
* **Declarative Syntax**: Define component behavior by composing small, reusable functions (attribute parsers and effects).
* **Customizable**: UIElement is designed to be easily customizable and extensible. You can create your own custom attribute parsers and effects to suit your specific needs.

</section>

<section>

## Why UIElement?

While there are many excellent JavaScript frameworks out there, UIElement embraces web standards without proprietary extensions. It deliberately eschews abstractions like HTML-in-JS (client-side rendering) or JS-in-HTML (logic in framework-specific attributes) in favor of directness. While it does state management and view updates the hard way internally, it provides the benefits of declarative reactivity with only a few functions to compose complex behavior for developers.

UIElement differentiates itself through:

* **Simplicity**: Few, clear concepts (components, signals, element selectors, effects) allow developers to quickly build interactive components.
* **Performance**: Fine-grained, direct DOM manipulation outperforms virtual DOM approaches with re-rendering.
* **Minimalism**: As a thin layer over native web standards, it has no dependencies and minimal footprint with tree-shakable functions.

UIElement shines when:

* You're working with server-rendered content that needs client-side enhancements
* Performance is critical, especially on lower-powered devices
* You want component reusability without framework lock-in
* You prefer working with future-proof standard web technologies
* You need to integrate with diverse tech stacks and existing codebases

</section>

<section>

## Next Steps

Now that you understand what UIElement is and its core philosophy, you're ready to:

* Move on to [Getting Started](getting-started.html) to install the library and build your first component
* Learn more about [Building Components](building-components.html) to create reusable UI patterns
* Explore [Data Flow](data-flow.html) to understand how to manage component communication

</section>

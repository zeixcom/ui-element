---
title: "Patterns & Techniques"
emoji: "💡"
description: "Composition, scheduling, best practices"
---

<section class="hero">

# 💡 Patterns & Techniques

<p class="lead">Get started with <strong>UIElement</strong> by including it directly in your HTML or installing it via npm. Follow the steps below to set up your environment and start building reactive Web Components.</p>
</section>

<section>

## Function Composition

To reuse functionality across multiple components, just save a function somewhere else. Here is an example of an `IntersectionObserver` that sets a `visible` signal based on whether or not the component is (at least partially) visible on screen.

```js
const VISIBILITY_STATE = 'visible'

export const visibilityObserver = host => {
    host.set(VISIBILITY_STATE, false)
    const observer = new IntersectionObserver(([entry]) => {
        host.set(VISIBILITY_STATE, entry.isIntersecting)
    }).observe(host)
    host.listeners.push(() => observer.disconnect())
}
```

Then, in a component, you can use it like this:

```js
import { visibilityObserver } from '../../functions/visibility-observer'

class MyAnimation extends UIElement {
    connectedCallback() {
        visibilityObserver(this)
        
        effect(() => {
            if (this.get('visible')) {
                // Start animation
            } else {
                // Stop animation
            }
        })
    }
}
```

</section>
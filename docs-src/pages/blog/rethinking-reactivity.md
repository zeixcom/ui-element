---
title: 'Rethinking Reactivity'
emoji: ''
description: 'Reactivity ensures that your user interface stays up to date automatically. It simplifies the code when we need multiple inputs, derived values, and complex state relationships.'
---

<section-hero>

# Rethinking Reactivity

<div>
  <p class="lead">In our previous post, we saw how components help organize frontend code into manageable, encapsulated pieces. But what happens when we need <strong>multiple inputs, derived values, and complex state relationships</strong>?</p>
  {{ toc }}
</div>
</section-hero>

<section>

## What Is Reactivity, and Why Should You Care?

At its core, reactivity is a programming model where the system keeps your user interface up to date automatically. You declare what should happen when state changes, and the system ensures that it does – consistently and efficiently.

Compared to imperative code, reactivity offers a few key benefits:

- **Declarative logic**: You describe relationships between state and output, not the steps to manually keep them in sync.
- **Consistency**: The system ensures derived values are always up to date.
- **Less wiring**: You don't need to write handlers for every possible source of change.

Let's illustrate this with a simple example.

We have:

- Two input fields: **First name** and **Last name**.
- A checkbox: **Use full name name as display name**.
- Two derived values:
  - `displayName`: first name or full name depending on checkbox.
  - `userName`: first initial + last name, lowercased.
- Two `<span>` elements that display these values.

```html
<greeting-config>
  <label>
    First name
    <input name="first" type="text" />
  </label>
  <label>
    Last name
    <input name="last" type="text" />
  </label>
  <label>
    <input name="full" type="checkbox" />
    Use full name as display name
  </label>
  <p>Display name: <span class="display-name"></span></p>
  <p>User name: <span class="user-name"></span></p>
</greeting-config>
```

Now try writing a Web Component that keeps all of that in sync manually. You'll need:

- Change event listeners on both fields.
- A change listener on the checkbox.
- A `#updateDisplay()` method that gets called from every handler.
- Manual DOM updates.
- Guards against inconsistent state during updates.

It gets surprisingly tricky – even though the logic is simple.

```js
class GreetingConfig extends HTMLElement {
  #first = ''
  #last = ''
  #full = false

  connectedCallback() {
    this.querySelector('input[name="first"]').addEventListener('change', e => {
      this.#first = e.target.value
      this.#updateDisplay()
    })

    this.querySelector('input[name="last"]').addEventListener('change', e => {
      this.#last = e.target.value
      this.#updateDisplay()
    })

    this.querySelector('input[name="full"]').addEventListener('change', e => {
      this.#full = e.target.checked
      this.#updateDisplay()
    })
  }

  #updateDisplay() {
    const displayName = this.#full
      ? `${this.#first} ${this.#last}`
      : this.#first
    const userName = `${this.#first[0] ?? ''}${this.#last}`.toLowerCase()

    const displayNameEl = this.querySelector('.display-name')
    if (displayNameEl) displayNameEl.textContent = displayName

    const userNameEl = this.querySelector('.user-name')
    if (userNameEl) userNameEl.textContent = userName
  }
}
customElements.define('greeting-config', GreetingConfig)
```

This imperative approach works, but notice the problems:

- **Repetitive event handling**: Every input needs its own listener
- **Manual DOM updates**: We have to remember to update the display everywhere
- **Coarse-grained updates**: `#updateDisplay()` recalculates everything, even when avoidable
- **State synchronization bugs**: It's easy to forget to call `#updateDisplay()` somewhere

As components grow, these issues compound. This is exactly the problem reactivity solves.

</section>

<section>

## Frameworks to the Rescue

Now that we've seen the manual approach, let's look at how frameworks address this. Frameworks like React and Vue were invented to solve this very problem. In both, you can express derived values directly:

- React uses `useState()` and `useMemo()`.
- Vue uses `ref()` and `computed()`.

Their underlying reactivity systems track dependencies, re-run derivations, and update the DOM efficiently. Here's what the example looks like in React or Vue:

```js
// React component
import React, { useState, useMemo } from 'react'

function GreetingConfig() {
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [full, setFull] = useState(false)

  const displayName = useMemo(() => {
    return full ? `${first} ${last}` : first
  }, [first, last, full])

  const userName = useMemo(() => {
    return `${first[0] ?? ''}${last}`.toLowerCase()
  }, [first, last])

  return (
    <div>
      <label>
        First name
        <input
          type="text"
          value={first}
          onChange={e => setFirst(e.target.value)}
        />
      </label>
      <label>
        Last name
        <input
          type="text"
          value={last}
          onChange={e => setLast(e.target.value)}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={full}
          onChange={e => setFull(e.target.checked)}
        />
        Use full name as display name
      </label>
      <p>
        Display name: <span>{displayName}</span>
      </p>
      <p>
        User name: <span>{userName}</span>
      </p>
    </div>
  )
}
```

```js
// Vue component
<template>
	<div>
		<label>
			First name
			<input v-model="first" type="text" />
		</label>
		<label>
			Last name
			<input v-model="last" type="text" />
		</label>
		<label>
			<input v-model="full" type="checkbox" />
			Use full name as display name
		</label>
		<p>Display name: <span>{{ displayName }}</span></p>
		<p>User name: <span>{{ userName }}</span></p>
	</div>
</template>

<script setup>
	import { ref, computed } from 'vue'

	const first = ref('')
	const last = ref('')
	const full = ref(false)

	const displayName = computed(() => {
		return full.value ? `${first.value} ${last.value}` : first.value
	})

	const userName = computed(() => {
		return `${first.value[0] ?? ''}${last.value}`.toLowerCase()
	})
</script>
```

These solutions work well and have powered countless applications. However, they come with trade-offs that may not fit every project:

- **Bundle size**: Framework code must be downloaded and parsed before your app starts.
- **Runtime overhead**: Client-side rendering (CSR) adds computational cost that delays interaction and may cause layout shifts.
- **Complexity**: Server-side rendering (SSR), hydration and build tooling add infrastructure complexity and imposes tighter coupling between frontend and backend.
- **Vendor lock-in**: Components written for one framework can't easily move to another.

For many applications, these trade-offs are worth it. But what if you could get the benefits of reactivity less costy?

</section>

<section>

## Reactivity Without a Framework

While frameworks solve the reactivity problem, they introduce new challenges. What if reactivity wasn't tied to a rendering model?

What if you could have:

- Fine-grained updates to the DOM,
- Automatic dependency tracking,
- Without needing a virtual DOM, compiler, or bundler?

That's possible – **with just a few functions**. We call these reactive primitives that track dependencies and trigger updates **signals**.

Here's what a minimal signal-based reactivity system might look like:

```js
import { state, computed, effect } from '@zeix/cause-effect'

// State signals
const first = state('Ada')
const last = state('Lovelace')
const full = state(false)

// Computed signals
const fullName = computed(() =>
  full.get() ? `${first.get()} ${last.get()}` : first.get(),
)
const userName = computed(() =>
  `${first.get()[0] ?? ''}${last.get()}`.toLowerCase(),
)

// Effects
effect(() => {
  console.log(fullName.get())
})
effect(() => {
  console.log(userName.get())
})
```

Notice:

- All necessary recalculations and DOM updates are performed automatically.
- Unnecessary updates are avoided:
  - When you change the last name, the effect that depends on `displayName` will only run if the checkbox is checked.
  - When you change the first name, the effect that depends on `userName` will only run if the the first letter of the first name changes.
  - When you toggle the full name checkbox, only the effect that depends on `fullName` will run.

This is **fine-grained reactivity** – the system tracks exactly what depends on what and updates only what's necessary.

This model:

- Works with server-rendered HTML.
- Hydration is done by the browser.
- Performs only minimal reconciliation in the signal graph.
- Keeps JavaScript optional for initial rendering.
- Makes each state update cheap and predictable.

And best of all – it's not hypothetical. This approach is already being standardized.

</section>

<section>

## Signals Are Going Native

The idea behind signals (a reactive primitive with `.get()` and `.set()` methods) is so powerful that it's making its way into the JavaScript language itself. The TC39 signals proposal is currently at Stage 1, meaning the syntax and API are still evolving. However, the core concepts are well-established and unlikely to change significantly.

Here's a preview of what native signals might look like:

```js
// State signals
const first = new Signal.State('Ada')
const last = new Signal.State('Lovelace')
const full = new Signal.State(false)

// Computed signals
const fullName = new Signal.Computed(() =>
  full.get() ? `${first.get()} ${last.get()}` : first.get(),
)
const userName = new Signal.Computed(() =>
  `${first.get()[0]}${last.get()}`.toLowerCase(),
)

// State updates
first.set('Betty')
```

This is the future of reactivity – minimal, composable, efficient, and framework-agnostic.

The native signals proposal focuses on the reactive primitives (`Signal.State` and `Signal.Computed`) but doesn't standardize effects. This is intentional – different frameworks and libraries can implement effects in ways that best fit their needs while sharing the same underlying signal system.

</section>

<section>

## A Thin Layer You Can Use Today

While native signals are still being standardized, you can use this model right now. Libraries like **Cause & Effect** (which powers Le Truc) implement the same contract with near-zero overhead and an almost identical API.

In the next article, we'll dive into **how Le Truc implements reactivity** – not with a big framework, but with a minimal toolkit that:

- Tracks dependencies,
- Updates only what changed,
- And integrates seamlessly into Web Components and HTML-first user interfaces.

Stay tuned – we'll revisit our example and show how reactivity becomes almost effortless with signals and effects.

</section>

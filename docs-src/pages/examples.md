---
title: 'Examples'
emoji: '🍽️'
description: 'Common use cases and demos'
---

<section-hero>

# 🍽️ Examples & Recipes

<div>
  <p class="lead">Discover practical examples and patterns for building reactive, modular components with UIElement. Each example focuses on showcasing a specific feature or best practice, guiding you through real-world use cases.</p>
  {{ toc }}
</div>
</section-hero>

<section>

## Counter

<module-demo>
  <div class="preview">
    <basic-counter>
     	<button type="button">💐 <span>5</span></button>
    </basic-counter>
  </div>
  <details>
		<summary>Source Code</summary>
		<module-lazy src="./examples/basic-counter.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
</module-demo>

</section>

<section>

## Carousel

<module-demo>
	<div class="preview">
		<module-carousel>
			<h2 class="visually-hidden">Slides</h2>
			<div class="slides">
				<div id="slide1" role="tabpanel" aria-current="true" style="background: var(--color-blue-20);">
					<h3>Slide 1</h3>
					<hello-world>
						<label>Your name<br>
							<input type="text">
						</label>
						<p>Hello, <span>World</span>!</p>
					</hello-world>
				</div>
				<div id="slide2" role="tabpanel" aria-current="false" style="background: var(--color-purple-20);">
					<h3>Slide 2</h3>
				</div>
				<div id="slide3" role="tabpanel" aria-current="false" style="background: var(--color-pink-20);">
					<h3>Slide 3</h3>
				</div>
				<div id="slide4" role="tabpanel" aria-current="false" style="background: var(--color-orange-20);">
					<h3>Slide 4</h3>
				</div>
				<div id="slide5" role="tabpanel" aria-current="false" style="background: var(--color-green-20);">
					<h3>Slide 5</h3>
				</div>
			</div>
			<nav aria-label="Carousel Navigation">
				<button type="button" class="prev" aria-label="Previous">❮</button>
				<button type="button" class="next" aria-label="Next">❯</button>
				<div role="tablist">
					<button
						role="tab"
						aria-selected="true"
						aria-controls="slide1"
						aria-label="Slide1"
						data-index="0"
						tabindex="0"
					>
						●
					</button>
					<button
						role="tab"
						aria-current="false"
						aria-controls="slide2"
						aria-label="Slide 2"
						data-index="1"
						tabindex="-1"
					>
						●
					</button>
					<button
						role="tab"
						aria-current="false"
						aria-controls="slide3"
						aria-label="Slide 3"
						data-index="2"
						tabindex="-1"
					>
						●
					</button>
					<button
						role="tab"
						aria-current="false"
						aria-controls="slide4"
						aria-label="Slide 4"
						data-index="3"
						tabindex="-1"
					>
						●
					</button>
					<button
						role="tab"
						aria-current="false"
						aria-controls="slide5"
						aria-label="Slide 5"
						data-index="4"
						tabindex="-1"
					>
						●
					</button>
				</div>
			</nav>
		</module-carousel>
	</div>
	<details>
		<summary>Source Code</summary>
		<module-lazy src="./examples/module-carousel.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
</module-demo>

</section>

<section>

## Combobox

<module-demo>
	<div class="preview">
		<form-combobox value="">
			<label for="city-input">Choose a city</label>
			<div class="input">
				<input
					id="city-input"
					type="text"
					role="combobox"
					aria-expanded="false"
					aria-controls="city-popup"
					aria-autocomplete="list"
					autocomplete="off"
					required
				/>
				<ol id="city-popup" role="listbox" hidden>
					<li role="option" tabindex="-1">Amsterdam</li>
					<li role="option" tabindex="-1">Berlin</li>
					<li role="option" tabindex="-1">Copenhagen</li>
					<li role="option" tabindex="-1">Dublin</li>
					<li role="option" tabindex="-1">Edinburgh</li>
					<li role="option" tabindex="-1">Frankfurt</li>
					<li role="option" tabindex="-1">Geneva</li>
					<li role="option" tabindex="-1">Helsinki</li>
					<li role="option" tabindex="-1">Istanbul</li>
					<li role="option" tabindex="-1">Jakarta</li>
					<li role="option" tabindex="-1">Kairo</li>
					<li role="option" tabindex="-1">London</li>
					<li role="option" tabindex="-1">Madrid</li>
					<li role="option" tabindex="-1">New York</li>
					<li role="option" tabindex="-1">Oslo</li>
					<li role="option" tabindex="-1">Paris</li>
					<li role="option" tabindex="-1">Qingdao</li>
					<li role="option" tabindex="-1">Rome</li>
					<li role="option" tabindex="-1">Stockholm</li>
					<li role="option" tabindex="-1">Tokyo</li>
					<li role="option" tabindex="-1">Ulan Bator</li>
					<li role="option" tabindex="-1">Vienna</li>
					<li role="option" tabindex="-1">Warsaw</li>
					<li role="option" tabindex="-1">Xi'an</li>
					<li role="option" tabindex="-1">Yokohama</li>
					<li role="option" tabindex="-1">Zurich</li>
				</ol>
				<button type="button" class="clear" aria-label="Clear input" hidden>
					✕
				</button>
			</div>
			<p class="error" aria-live="assertive" id="city-error"></p>
			<p class="description" aria-live="polite" id="city-description">Tell us where you live so we can set your timezone for our calendar and notification features.</p>
		</form-combobox>
	</div>
	<details>
		<summary>Source Code</summary>
		<module-lazy src="./examples/form-combobox.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
</module-demo>

</section>

<section>

## Todo App

<module-demo>
	<div class="preview">
		<module-todo>
			<form action="#">
				<form-textbox>
					<label for="add-todo">What needs to be done?</label>
					<div class="input">
						<input id="add-todo" type="text" value="" />
					</div>
				</form-textbox>
				<basic-button class="submit">
					<button type="submit" class="constructive" disabled>
						Add Todo
					</button>
				</basic-button>
			</form>
			<ol filter="all"></ol>
			<template>
				<li>
					<form-checkbox class="todo">
						<label>
							<input type="checkbox" class="visually-hidden" />
							<span class="label"><slot></slot></span>
						</label>
					</form-checkbox>
					<basic-button class="delete">
						<button type="button" class="destructive small">Delete</button>
					</basic-button>
				</li>
			</template>
			<footer>
				<div class="todo-count">
					<p class="all-done">Well done, all done!</p>
					<p class="remaining">
						<span class="count"></span>
						<span class="singular">task</span>
						<span class="plural">tasks</span>
						remaining
					</p>
				</div>
				<form-radiogroup value="all" class="split-button">
					<fieldset>
						<legend class="visually-hidden">Filter</legend>
						<label class="selected">
							<input
								type="radio"
								class="visually-hidden"
								name="filter"
								value="all"
								checked
							/>
							<span>All</span>
						</label>
						<label>
							<input
								type="radio"
								class="visually-hidden"
								name="filter"
								value="active"
							/>
							<span>Active</span>
						</label>
						<label>
							<input
								type="radio"
								class="visually-hidden"
								name="filter"
								value="completed"
							/>
							<span>Completed</span>
						</label>
					</fieldset>
				</form-radiogroup>
				<basic-button class="clear-completed">
					<button type="button" class="destructive">
						<span class="label">Clear Completed</span>
						<span class="badge"></span>
					</button>
				</basic-button>
			</footer>
		</module-todo>
	</div>
	<details>
		<summary>ModuleTodo Source Code</summary>
		<module-lazy src="./examples/module-todo.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
	<details>
		<summary>InputTextbox Source Code</summary>
		<module-lazy src="./examples/form-textbox.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
	<details>
		<summary>InputButton Source Code</summary>
		<module-lazy src="./examples/basic-button.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
	<details>
		<summary>InputCheckbox Source Code</summary>
		<module-lazy src="./examples/form-checkbox.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
	<details>
		<summary>InputRadiogroup Source Code</summary>
		<module-lazy src="./examples/form-radiogroup.html">
			<card-callout>
				<p class="loading" role="status">Loading...</p>
				<p class="error" role="alert" aria-live="polite"></p>
			</card-callout>
		</module-lazy>
	</details>
</module-demo>

</section>

<section>

## Lazy Loading

This example shows how to handle asynchronous data loading and error states.

**Features:**

- Lazy loading with intersection observer
- Loading states and error handling
- Content replacement patterns

```js
component(
  'module-lazy',
  {
    src: asString(),
    loaded: asBoolean(),
    loading: asBoolean(),
    error: asString(),
  },
  (el, { first }) => {
    let observer

    const loadContent = async () => {
      if (el.loaded || el.loading || !el.src) return

      el.loading = true
      el.error = ''

      try {
        const response = await fetch(el.src)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const content = await response.text()
        el.querySelector('.content').innerHTML = content
        el.loaded = true
      } catch (err) {
        el.error = err.message
      } finally {
        el.loading = false
      }
    }

    return [
      // Loading state
      first(
        '.loading',
        setStyle('display', () => (el.loading ? 'block' : 'none')),
      ),

      // Error state
      first(
        '.error',
        setText('error'),
        setStyle('display', () => (el.error ? 'block' : 'none')),
      ),

      // Content container
      first(
        '.content',
        setStyle('display', () => (el.loaded ? 'block' : 'none')),
      ),

      // Setup intersection observer
      () => {
        observer = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            loadContent()
            observer.disconnect()
          }
        })

        observer.observe(el)

        return () => observer?.disconnect()
      },
    ]
  },
)
```

```html
<module-lazy src="/api/user-profile">
  <div class="loading">Loading user profile...</div>
  <div class="error"></div>
  <div class="content"></div>
</module-lazy>
```

</section>

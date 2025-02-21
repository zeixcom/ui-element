---
title: "Examples & Recipes"
emoji: "🍽️"
description: "Common use cases and demos"
---

<section class="hero">

# 🍽️ Examples & Recipes

<p class="lead">Discover practical examples and patterns for building reactive, modular components with UIElement. Each example focuses on showcasing a specific feature or best practice, guiding you through real-world use cases.</p>
</section>

<section>

## What You'll Learn

This collection of examples demonstrates a range of scenarios, from simple state updates in a single component to managing complex interactions across multiple components. Here's an overview of what you'll find:

* **Basic Composition**: `TabList` and `AccordionPanel` - See how a parent component can control the visibility of multiple child components, showcasing state sharing and communication between components.
* **Syntax Highlighting**: - See how wrapping content in a `CodeBlock` component enables syntax highlighting on the client, demonstrating integration with third-party libraries.
* **Fetching Data Example**: `LazyLoad` - Learn how to fetch content only when needed, handling asynchronous operations and updating state reactively as data is loaded.
* **Form Validation Example**: `InputField` with Client-Side & Server-Side Validation - Validate input fields based on requirements passed from the server and dynamically check the validity of entries, such as checking the availability of usernames via server requests.
* **Context Example**: `MediaContext` - Discover how to share state globally across components using context, with practical use cases like adapting to media queries and responsive design.

Whether you're getting started with a basic component or building a full-featured application, these examples will help you understand how to use `UIElement` effectively to build reactive Web Components.

</section>

<section>

## TabList and AccordionPanel Example

<component-demo>
<div class="preview">
<tab-list>
<menu>
<li><button type="button" aria-pressed="true">Tab 1</button></li>
<li><button type="button">Tab 2</button></li>
<li><button type="button">Tab 3</button></li>
</menu>
<accordion-panel>
<details open aria-disabled="true">
<summary class="visually-hidden">
<div class="summary">Tab 1</div>
</summary>
Content for Tab 1
</details>
</accordion-panel>
<accordion-panel>
<details aria-disabled="true">
<summary class="visually-hidden">
<div class="summary">Tab 2</div>
</summary>
Content for Tab 2
</details>
</accordion-panel>
<accordion-panel>
<details aria-disabled="true">
<summary class="visually-hidden">
<div class="summary">Tab 3</div>
</summary>
Content for Tab 3
</details>
</accordion-panel>
</tab-list>
</div>
<accordion-panel collapsible>
<details>
<summary>TabList Source Code</summary>
<lazy-load src="./examples/tab-list.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
<accordion-panel collapsible>
<details>
<summary>AccordionPanel Source Code</summary>
<lazy-load src="./examples/accordion-panel.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
</component-demo>
</section>

<section>

## CodeBlock Example

<component-demo>
<div class="preview">
<code-block collapsed language="html" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
<p class="meta">
	<span class="file">code-block.html</span>
	<span class="language">html</span>
</p>
<pre class="language-html"><code>&lt;code-block collapsed language="html" copy-success="Copied!" copy-error="Error trying to copy to clipboard!"&gt;
	&lt;p class="meta"&gt;
		&lt;span class="file"&gt;code-block.html&lt;/span&gt;
		&lt;span class="language"&gt;html&lt;/span&gt;
	&lt;/p&gt;
	&lt;pre&gt;&lt;code class="language-html"&gt;&lt;code-block collapsed language="html" copy-success="Copied!" copy-error="Error trying to copy to clipboard!"&gt;
	&lt;p class="meta"&gt;
		&lt;span class="file"&gt;code-block.html&lt;/span&gt;
		&lt;span class="language"&gt;html&lt;/span&gt;
	&lt;/p&gt;
	&lt;pre&gt;&lt;code class="language-html"&gt;&lt;/code&gt;&lt;/pre&gt;
	&lt;input-button class="copy"&gt;
		&lt;button type="button" class="secondary small"&gt;Copy&lt;/button&gt;
	&lt;/input-button&gt;
	&lt;button type="button" class="overlay"&gt;Expand&lt;/button&gt;
&lt;/code-block&gt;&lt;/code&gt;&lt;/pre&gt;
	&lt;input-button class="copy"&gt;
		&lt;button type="button" class="secondary small"&gt;Copy&lt;/button&gt;
	&lt;/input-button&gt;
	&lt;button type="button" class="overlay"&gt;Expand&lt;/button&gt;
&lt;/code-block&gt;</code></pre>
<input-button class="copy">
<button type="button" class="secondary small">Copy</button>
</input-button>
<button type="button" class="overlay">Expand</button>
</code-block>
</div>
<accordion-panel collapsible>
<details>
<summary>CodeBlock Source Code</summary>
<lazy-load src="./examples/code-block.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
<accordion-panel collapsible>
<details>
<summary>InputButton Source Code</summary>
<lazy-load src="./examples/input-button.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
</component-demo>
</section>

<section>

## LazyLoad Example

<component-demo>
<div class="preview">
<lazy-load src="./examples/snippets/snippet.html">
<p class="loading">Loading...</p>
<p class="error"></p>
</lazy-load>
</div>
<accordion-panel collapsible>
<details>
<summary>LazyLoad Source Code</summary>
<lazy-load src="./examples/lazy-load.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
</component-demo>
</section>

<section>

## InputField Example

<component-demo>
<div class="preview">
<input-field>
<label for="name-input">Name</label>
<div class="row">
<div class="group auto">
<input type="text" id="name-input" name="name" autocomplete="name" required>
</div>
</div>
<p class="error" aria-live="assertive" id="name-error"></p>
</input-field>

<input-field integer>
<label for="bday-year-input">Birthday Year</label>
<div class="row">
<div class="group short">
<input type="number" id="bday-year-input" name="bday-year" autocomplete="bday-year" required minlength="4" maxlength="4" min="1900" max="2024" step="1">
</div>
<div class="spinbutton" data-step="1">
<button type="button" class="decrement" aria-label="Decrement">−</button>
<button type="button" class="increment" aria-label="Increment">+</button>
</div>
</div>
<p class="error" aria-live="assertive" id="bday-year-error"></p>
<p class="description" aria-live="polite" id="bday-year-description"></p>
</input-field>

<input-field validate="./examples/snippets/validate.html">
<label for="username-input">Username</label>
<div class="row">
<div class="group auto">
<input type="text" id="username-input" name="username" autocomplete="username" aria-describedby="username-description" required minlength="4" maxlength="20">
</div>
</div>
<p class="error" aria-live="assertive" id="username-error"></p>
<p class="description" aria-live="polite" id="username-description" data-remaining="${x} characters remaining">Max. 20 characters</p>
</input-field>
</div>
<accordion-panel collapsible>
<details>
<summary>InputField Source Code</summary>
<lazy-load src="./examples/input-field.html">
<p class="loading">Loading...</p>
</lazy-load>
</details>
</accordion-panel>
</component-demo>
</section>
			
<section>

## MediaContext Example
			  
The `MediaContext` component provides global state to any sub-components in its DOM tree by exposing context for responsive and adaptive features. It tracks the following:
			  
* **Media Motion** (`media-motion`): Indicates whether the user prefers reduced motion based on the `(prefers-reduced-motion)` media query.
* ***Media Theme** (`media-theme`): Provides the user's preferred color scheme, such as dark mode, based on the `(prefers-color-scheme)` media query.
* **Media Viewport** (`media-viewport`): Indicates the current viewport size and is classified into different sizes (e.g., `xs`, `sm`, `md`, `lg`, `xl`). Custom breakpoints can be configured by setting attributes on the `<media-context>` element.
* **Media Orientation** (`media-orientation`): Tracks the device's screen orientation, switching between `landscape` and `portrait`.

### Configuring Breakpoints

The viewport sizes can be customized by providing attributes on the `<media-context>` element:

* `sm`: Small screen breakpoint (default: `32em`).
* `md`: Medium screen breakpoint (default: `48em`).
* `lg`: Large screen breakpoint (default: `72em`).
* `xl`: Extra large screen breakpoint (default: `108em`).

For example, to set a small breakpoint at 40em and a medium breakpoint at 60em, use:

```html
<media-context sm="40em" md="60em"></media-context>
```

Source code:

```js
import { UIElement, maybe } from '@zeix/ui-element'

const VIEWPORT_XS = 'xs';
const VIEWPORT_SM = 'sm';
const VIEWPORT_MD = 'md';
const VIEWPORT_LG = 'lg';
const VIEWPORT_XL = 'xl';
const ORIENTATION_LANDSCAPE = 'landscape';
const ORIENTATION_PORTRAIT = 'portrait';

class MediaContext extends UIElement {
static providedContexts = ['media-motion', 'media-theme', 'media-viewport', 'media-orientation'];

connectedCallback() {
	const getBreakpoints = () => {
	const parseBreakpoint = (breakpoint) => {
		const attr = this.getAttribute(breakpoint)?.trim();
		if (!attr) return null;
		const unit = attr.match(/em$/) ? 'em' : 'px';
		const value = maybe(parseFloat(attr)).filter(Number.isFinite)[0];
		return value ? value + unit : null;
	};

	const sm = parseBreakpoint(VIEWPORT_SM) || '32em';
	const md = parseBreakpoint(VIEWPORT_MD) || '48em';
	const lg = parseBreakpoint(VIEWPORT_LG) || '72em';
	const xl = parseBreakpoint(VIEWPORT_XL) || '108em';
	return { sm, md, lg, xl };
	};
	
	const breakpoints = getBreakpoints();

	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
	const darkMode = matchMedia('(prefers-color-scheme: dark)');
	const screenSmall = matchMedia(`(min-width: ${breakpoints.sm})`);
	const screenMedium = matchMedia(`(min-width: ${breakpoints.md})`);
	const screenLarge = matchMedia(`(min-width: ${breakpoints.lg})`);
	const screenXLarge = matchMedia(`(min-width: ${breakpoints.xl})`);
	const screenOrientation = matchMedia('(orientation: landscape)');

	const getViewport = () => {
	if (screenXLarge.matches) return VIEWPORT_XL;
	if (screenLarge.matches) return VIEWPORT_LG;
	if (screenMedium.matches) return VIEWPORT_MD;
	if (screenSmall.matches) return VIEWPORT_SM;
	return VIEWPORT_XS;
	};

	this.set('media-motion', reducedMotion.matches);
	this.set('media-theme', darkMode.matches);
	this.set('media-viewport', getViewport());
	this.set('media-orientation', screenOrientation.matches ? ORIENTATION_LANDSCAPE : ORIENTATION_PORTRAIT);

	reducedMotion.onchange = (e) => this.set('media-motion', e.matches);
	darkMode.onchange = (e) => this.set('media-theme', e.matches);
	screenSmall.onchange = () => this.set('media-viewport', getViewport());
	screenMedium.onchange = () => this.set('media-viewport', getViewport());
	screenLarge.onchange = () => this.set('media-viewport', getViewport());
	screenXLarge.onchange = () => this.set('media-viewport', getViewport());
	screenOrientation.onchange = (e) => this.set('media-orientation', e.matches ? ORIENTATION_LANDSCAPE : ORIENTATION_PORTRAIT);
}
}

MediaContext.define('media-context');
```

</section>
			
<section>

## ThemedComponent Example
			  
<!-- Live component preview wrapped in media-context -->
<media-context>
<themed-component>
This component changes its background based on the theme!
</themed-component>
</media-context>

<!-- Source code with progressive disclosure -->
<details>
<summary>Source Code</summary>

<!-- Tabs for HTML, CSS, and JavaScript -->
<tab-list>
<!-- HTML Tab Panel -->
<tab-panel label="HTML">

### HTML

```html
<media-context>
	<themed-component>
		This component changes its background based on the theme!
	</themed-component>
</media-context>
```

</tab-panel>
			  
<!-- CSS Tab Panel -->
<tab-panel label="CSS">

### CSS

```css
themed-component {
	display: block;
	padding: 20px;
	color: white;
	transition: background-color 0.3s ease;

	&.dark {
		background-color: black;
	}

	&.light {
		background-color: lightgray;
	}
}
```

</tab-panel>
			  
<!-- JavaScript Tab Panel -->
<tab-panel label="JavaScript">

### JavaScript

```js
import { UIElement, toggleClass } from '@zeix/ui-element';

class ThemedComponent extends UIElement {
	static consumedContexts = ['media-theme'];

	connectedCallback() {
		// Toggle the class based on 'media-theme' signal
		this.self.sync(toggleClass('dark', () => this.get('media-theme')));
		this.self.sync(toggleClass('light', () => !this.get('media-theme')));
	}
}
ThemedComponent.define('themed-component');
```

</tab-panel>
</tab-list>
</details>
</section>
			
<section>

## AnimatedComponent Example
			  
<!-- Live component preview wrapped in media-context -->
<media-context>
<animated-component>
<div class="animated-box">Box 1</div>
<div class="animated-box">Box 2</div>
<div class="animated-box">Box 3</div>
</animated-component>
</media-context>
			  
<!-- Source code with progressive disclosure -->
<details>
<summary>Source Code</summary>
			  
<!-- Tabs for HTML, CSS, and JavaScript -->
<tab-list>
<!-- HTML Tab Panel -->
<tab-panel label="HTML">

### HTML

```html
<media-context>
	<animated-component>
		<div class="animated-box">Box 1</div>
		<div class="animated-box">Box 2</div>
		<div class="animated-box">Box 3</div>
	</animated-component>
</media-context>
```

</tab-panel>
			  
<!-- CSS Tab Panel -->
<tab-panel label="CSS">

### CSS

```css
animated-component {
	display: block;
	padding: 20px;
	overflow: hidden;

	.animated-box {
		width: 50px;
		height: 50px;
		margin: 10px;
		background-color: lightblue;
		text-align: center;
		line-height: 50px;
		font-weight: bold;
		color: white;
	}

	&.no-motion .animated-box {
		opacity: 0;
		transition: opacity 1s ease-in;
	}

	&.motion .animated-box {
		animation: moveAndFlash 2s infinite ease-in-out alternate;
	}

	@keyframes moveAndFlash {
		0% {
			transform: translateX(0);
			background-color: lightblue;
		}
		100% {
			transform: translateX(100px);
			background-color: lightcoral;
		}
	}
}
```

</tab-panel>
			  
<!-- JavaScript Tab Panel -->
<tab-panel label="JavaScript">

### JavaScript

```js
import { UIElement, toggleClass } from '@zeix/ui-element';

class AnimatedComponent extends UIElement {
	static consumedContexts = ['media-motion'];

	connectedCallback() {
		// Toggle classes based on 'media-motion' context
		this.self.sync(toggleClass('motion', () => !this.get('media-motion')));
		this.self.sync(toggleClass('no-motion', 'media-motion'));
	}
}

AnimatedComponent.define('animated-component');
```

</tab-panel>
</tab-list>
</details>
</section>

<section>

## Responsive TabList Example
			  
<!-- Live component preview wrapped in media-context -->
<media-context>
<tab-list>
<menu>
<button class="tab-button">Tab 1</button>
<button class="tab-button">Tab 2</button>
<button class="tab-button">Tab 3</button>
</menu>
<tab-panel>
<button class="panel-header">Tab 1</button>
<div class="panel-content">Content for Tab 1</div>
</tab-panel>
<tab-panel>
<button class="panel-header">Tab 2</button>
<div class="panel-content">Content for Tab 2</div>
</tab-panel>
<tab-panel>
<button class="panel-header">Tab 3</button>
<div class="panel-content">Content for Tab 3</div>
</tab-panel>
</tab-list>
</media-context>
			  
<!-- Source code with progressive disclosure -->
<details>
<summary>Source Code</summary>

<!-- Tabs for HTML, CSS, and JavaScript -->
<tab-list>
<!-- HTML Tab Panel -->
<tab-panel label="HTML">

### HTML

```html
<media-context>
	<tab-list>
		<menu>
			<button class="tab-button">Tab 1</button>
			<button class="tab-button">Tab 2</button>
			<button class="tab-button">Tab 3</button>
		</menu>
		<tab-panel>
			<button class="panel-header">Tab 1</button>
			<div class="panel-content">Content for Tab 1</div>
		</tab-panel>
		<tab-panel>
			<button class="panel-header">Tab 2</button>
			<div class="panel-content">Content for Tab 2</div>
		</tab-panel>
		<tab-panel>
			<button class="panel-header">Tab 3</button>
			<div class="panel-content">Content for Tab 3</div>
		</tab-panel>
	</tab-list>
</media-context>
```
</tab-panel>
			  
<!-- CSS Tab Panel -->
<tab-panel label="CSS">

### CSS

```css
			  tab-list {
				display: flex;
				flex-direction: column;
			  
				&.accordion .tab-button {
				  display: none; /* Hide tab buttons in accordion mode */
				}
			  
				.tab-button {
				  cursor: pointer;
				  padding: 10px;
				  border: none;
				  background: lightgray;
				  transition: background-color 0.2s ease;
				}
			  
				.tab-button.active {
				  background-color: gray;
				}
			  }
			  
			  tab-panel {
				display: none;
			  
				&.active {
				  display: block;
				}
			  
				&.collapsible {
				  .panel-header {
					cursor: pointer;
					padding: 10px;
					background-color: lightgray;
					border: none;
					outline: none;
				  }
			  
				  .panel-header:hover {
					background-color: darkgray;
				  }
			  
				  .panel-header.active {
					background-color: gray;
				  }
			  
				  .panel-content {
					display: none;
					padding: 10px;
				  }
			  
				  &.active .panel-content {
					display: block;
				  }
				}
			  }
```

</tab-panel>
			  
<!-- JavaScript Tab Panel -->
<tab-panel label="JavaScript">

### JavaScript

```js
import { UIElement, toggleClass } from '@zeix/ui-element';

// TabList Component
class TabList extends UIElement {
	static consumedContexts = ['media-viewport'];

	connectedCallback() {
		super.connectedCallback(); // Necessary to consume context

		// Set 'accordion' signal based on viewport size
		this.set('accordion', () => ['xs', 'sm'].includes(this.get('media-viewport')));

		// Toggle 'accordion' class based on the signal
		this.self.sync(toggleClass('accordion'));

		// Pass 'collapsible' state to tab-panels based on 'accordion' state
		this.all('tab-panel').pass({
			collapsible: 'accordion'
		});

		// Handle tab clicks in normal tabbed mode
		this.all('.tab-button').on('click', () => this.set('activeIndex', index))

		// Set active tab-panel based on 'activeIndex'
		this.all('tab-panel').sync((host, target, index) =>
		this.self.sync(toggleClass('active', () => index === this.get('activeIndex'))(host, target))
		);
	}
}
TabList.define('tab-list');

// TabPanel Component
class TabPanel extends UIElement {
	static observedAttributes = ['collapsible'];

	connectedCallback() {
		super.connectedCallback(); // Ensure correct setup with context

		// Handle expanding/collapsing if 'collapsible' is true
		this.self.sync(toggleClass('collapsible', 'collapsible'));

		if (this.get('collapsible')) {
		const header = this.querySelector('.panel-header');
		header.addEventListener('click', () => {
			this.set('expanded', !this.get('expanded'));
		});

		this.self.sync(toggleClass('active', 'expanded'));
		}
	}
}
TabPanel.define('tab-panel');
```

</tab-panel>
</tab-list>
</details>
</section>

<section>

## Responsive Image Gallery Example
			  
<!-- Live component preview wrapped in media-context -->
<media-context>
	<responsive-image-gallery>
	<img src="image1.jpg" alt="Image 1">
	<img src="image2.jpg" alt="Image 2">
	<img src="image3.jpg" alt="Image 3">
	<img src="image4.jpg" alt="Image 4">
	<img src="image5.jpg" alt="Image 5">
	</responsive-image-gallery>
</media-context>

<!-- Source code with progressive disclosure -->
<details>
<summary>Source Code</summary>

<!-- Tabs for HTML, CSS, and JavaScript -->
<tab-list>
<!-- HTML Tab Panel -->
<tab-panel label="HTML">

### HTML

```html
<media-context>
	<responsive-image-gallery>
	<img src="image1.jpg" alt="Image 1">
	<img src="image2.jpg" alt="Image 2">
	<img src="image3.jpg" alt="Image 3">
	<img src="image4.jpg" alt="Image 4">
	<img src="image5.jpg" alt="Image 5">
	</responsive-image-gallery>
</media-context>
```

</tab-panel>
	
<!-- CSS Tab Panel -->
<tab-panel label="CSS">

### CSS

```css
responsive-image-gallery {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	padding: 10px;
	transition: all 0.3s ease;
	
	&.landscape {
		flex-direction: row;
		justify-content: space-between;
	}
	
	&.portrait {
		flex-direction: column;
	}
	
	img {
		flex: 1 1 calc(20% - 10px); /* Creates a grid with up to 5 images per row */
		max-width: calc(20% - 10px);
		height: auto;
		border: 2px solid transparent;
		border-radius: 5px;
		cursor: pointer;
	}
	
	&.portrait img {
		flex: 0 0 100%; /* Each image takes full width in slider mode */
		max-width: 100%;
		margin-bottom: 10px;
	}
}
```

</tab-panel>
	
<!-- JavaScript Tab Panel -->
<tab-panel label="JavaScript">

### JavaScript

```js
import { UIElement, toggleClass, effect, enqueue } from '@zeix/ui-element';
import { MySlider } from './my-slider.js'; // Assume this is the existing MySlider component

class ResponsiveImageGallery extends UIElement {
static consumedContexts = ['media-orientation'];

	connectedCallback() {
		super.connectedCallback(); // Ensure correct setup with context

		// Toggle classes based on orientation
		this.self.sync(toggleClass('landscape', () => this.get('media-orientation') === 'landscape'));
		this.self.sync(toggleClass('portrait', () => this.get('media-orientation') === 'portrait'));

		// Dynamically wrap images in <my-slider> for portrait mode
		effect(() => {
			if (this.get('media-orientation') === 'portrait') {
				if (!this.slider) {
					this.slider = document.createElement('my-slider');
					while (this.firstChild) {
						this.slider.appendChild(this.firstChild);
					}
					enqueue(() => this.appendChild(this.slider), [this, 'add-slider']);
				}
			} else {
				// Remove <my-slider> and display images as a grid in landscape mode
				if (this.slider) enqueue(() => this.slider.remove(), [this.slider, 'remove-slider']);
			}
		});
	}
}
ResponsiveImageGallery.define('responsive-image-gallery');
```

</tab-panel>
</tab-list>
</details>
</section>
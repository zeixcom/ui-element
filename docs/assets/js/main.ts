import {
	UIElement, effect, enqueue,
	asBoolean, asInteger,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass
} from '@zeix/ui-element'
import Prism from './prism.js'

class MyCounter extends UIElement {
	static observedAttributes = ['count']
	static states = {
        count: asInteger
    }

	connectedCallback() {
		this.set('parity', () => this.get('count') as number % 2 ? 'odd' : 'even')
        this.first('.increment').on('click', () => this.set('count', v => ++v))
        this.first('.decrement').on('click', () => this.set('count', v => --v))
		this.first('.count').sync(setText('count'))
		this.first('.parity').sync(setText('parity'))
    }
}
MyCounter.define('my-counter')

class HelloWorld extends UIElement {
	connectedCallback() {
        this.first('span').sync(setText('name'))
		this.first('input').on('input', e => this.set('name', e.target.value || undefined))
	}
}
HelloWorld.define('hello-world')

class MySlider extends UIElement {
	connectedCallback() {
	
		// Initialize state for the active slide index
		this.set('active', 0)
	
		// Event listeners for navigation
		const total = this.querySelectorAll('.slide').length
		const getNewIndex = (prev: number, direction: number) => (prev + direction + total) % total
		this.first('.prev').on('click', () => this.set('active', v => getNewIndex(v, -1)))
		this.first('.next').on('click', () => this.set('active', v => getNewIndex(v, 1)))
	
		// Auto-effects for updating slides and dots
		this.all('.slide').sync((host, target, index) => toggleClass(
			'active',
			() => index === this.get('active')
		)(host, target))
		this.all('.dots span').sync((host, target, index) => toggleClass(
			'active',
			() => index === this.get('active')
		)(host, target))
	}
}
MySlider.define('my-slider')

class CodeBlock extends UIElement {
	static observedAttributes = ['collapsed']
	static states = {
		collapsed: asBoolean
	}

  	connectedCallback() {

		// Enhance code block with Prism.js
		const language = this.getAttribute('language') || 'html'
		const content = this.querySelector('code')
		if (content) {
			this.set('code', content.textContent?.trim(), false)
			effect(() => {
				// Apply syntax highlighting while preserving Lit's marker nodes in Storybook
				const code = document.createElement('code')
				code.innerHTML = Prism.highlight(this.get('code'), Prism.languages[language], language)
				enqueue(() => {
					Array.from(code.childNodes)
						.filter(node => node.nodeType !== Node.COMMENT_NODE)
						.forEach(node => node.remove())
					Array.from(code.childNodes)
						.forEach(node => code.appendChild(node))
				}, [code, 'h'])
			})

			// Copy to clipboard
			this.first('.copy').on('click', async e => {
				const copyButton = e.target
				const label = copyButton.textContent
				let status = 'success'
				try {
					await navigator.clipboard.writeText(content.textContent ?? '')
				} catch (err) {
					console.error('Error when trying to use navigator.clipboard.writeText()', err)
					status = 'error'
				}
				copyButton.set('disabled', true)
				copyButton.set('label', this.getAttribute(`copy-${status}`))
				setTimeout(() => {
					copyButton.set('disabled', false)
					copyButton.set('label', label)
				}, status === 'success' ? 1000 : 3000)
			})

			// Expand
			this.first('.overlay').on('click', () => this.set('collapsed', false))
			this.self.sync(toggleAttribute('collapsed'))
		}
	}
}
CodeBlock.define('code-block')

class TabList extends UIElement {
	static observedAttributes = ['accordion']
	static states = {
        accordion: asBoolean
    }
	static consumedContexts = ['media-viewport']

	connectedCallback() {
		super.connectedCallback()
		this.set('active', 0, false) // initial active tab

		// Dynamically adjust accordion based on viewport size
		setTimeout(() => {
			if (this.get('media-viewport'))
				this.set('accordion', () => ['xs', 'sm'].includes(String(this.get('media-viewport'))))
		}, 0)

		// Reflect accordion attribute (may be used for styling)
		this.self.sync(toggleAttribute('accordion'))

		// Hide accordion tab navigation when in accordion mode
		this.first('menu').sync(setProperty('ariaHidden', 'accordion'))

		// Update active tab state and bind click handlers
		this.all('menu button')
			.on('click', (_target, index) => () => this.set('active', index))
			.sync((host, target, index) => setProperty(
				'ariaPressed',
				() => this.get('active') === index
			)(host, target))

		// Pass open and collapsible states to accordion panels
		this.all('accordion-panel').pass({
			open: (_target, index) => () => this.get('active') === index,
			collapsible: 'accordion'
		})
	}
}
TabList.define('tab-list')

class AccordionPanel extends UIElement {
	connectedCallback() {

		// Set defaults from attributes
		this.set('open', this.hasAttribute('open'), false)
		this.set('collapsible', this.hasAttribute('collapsible'), false)

		// Handle open and collapsible state changes
		this.self.sync(
			toggleAttribute('open'),
			toggleAttribute('collapsible'),
			setProperty('ariaHidden', () => !this.get('open') && !this.get('collapsible'))
		)

		// Control inner details panel
		this.first('details').sync(
			setProperty('open'),
			setProperty('ariaDisabled', () => !this.get('collapsible'))
		)
	}
}
AccordionPanel.define('accordion-panel')

class InputButton extends UIElement {
	static observedAttributes = ['disabled']
	static states = {
		disabled: asBoolean
	}

	connectedCallback() {
		this.first('button').sync(
			setText('label'),
			setProperty('disabled')
		)
	}
}
InputButton.define('input-button')

const isNumber = (num: any) => typeof num === 'number'
const parseNumber = (v: any, int = false) => int ? parseInt(v, 10) : parseFloat(v)

class InputField extends UIElement {
	static observedAttributes = ['value', 'description']
	static states = {
		value: value => this.isNumber
			? value.map(v => parseNumber(v, this.isInteger)).filter(Number.isFinite)
			: value
	}

	connectedCallback() {
		this.input = this.querySelector('input')
		this.isNumber = this.input && this.input.type === 'number'
		this.isInteger = this.hasAttribute('integer')

		// Set default states
		this.set('value', this.isNumber ? this.input.valueAsNumber : this.input.value, false)
		this.set('length', this.input.value.length)
		
		// Derived states
		this.set('empty', () => !this.get('length'))

		// Setup sub elements
		this.#setupErrorMessage()
		this.#setupDescription()
		this.#setupSpinButton()
		this.#setupClearButton()

		// Handle input changes
		this.input.onchange = () => this.#triggerChange(this.isNumber ? this.input.valueAsNumber : this.input.value)
		this.input.oninput = () => this.set('length', this.input.value.length)

		// Update value
		effect(async () => {
			const value = this.get('value')
			const validate = this.getAttribute('validate')
			if (value && validate) {

				// Validate input value against a server-side endpoint
				await fetch(`${validate}?name=${this.input.name}value=${this.input.value}`)
					.then(async response => {
						const text = await response.text()
						this.input.setCustomValidity(text)
						this.set('error', text)
					})
					.catch(err => this.set('error', err.message))
			}
			if (this.isNumber && !isNumber(value)) // ensure value is a number if it is not already a number
				return this.set('value', parseNumber(value, this.isInteger)) // effect will be called again with numeric value
			if (this.isNumber && !Number.isNaN(value)) // change value only if it is a valid number
				this.input.value = value
		})
 	}

	// Clear the input field
	clear() {
		this.input.value = ''
		this.set('value', '')
		this.set('length', 0)
		this.input.focus()
	}

	// Trigger value-change event to commit the value change
	#triggerChange = value => {
		this.set('value', value)
		this.set('error', this.input.validationMessage)
		if (typeof value === 'function')
			value = this.get('value')
		if (this.input.value !== String(value))
			this.dispatchEvent(new CustomEvent('value-change', {
				detail: value,
				bubbles: true
			}))
	}

	// Setup error message
	#setupErrorMessage() {
		const error = this.first('.error')

		// Derived states
		this.set('ariaInvalid', () => String(Boolean(this.get('error'))))
		this.set('aria-errormessage', () => this.get('error') ? this.querySelector('.error')?.id : undefined)

		// Effects
		this.first('.error').sync(setText('error'))
		this.first('input').sync(
			setProperty('ariaInvalid'),
			setAttribute('aria-errormessage')
		)
	}

	// Setup description
	#setupDescription() {
		const description = this.first('.description')
		if (!description[0])
			return // no description, so skip
		
		// derived states
		const input = this.first('input')
		const maxLength = this.input.maxLength
		const remainingMessage = maxLength && description[0].target.dataset.remaining
		const defaultDescription = description[0].target.textContent
		this.set('description', remainingMessage
			? () => {
				const length = this.get('length')
				return length > 0
					? remainingMessage.replace('${x}', maxLength - length)
					: defaultDescription
			}
			: defaultDescription
		)
		this.set('aria-describedby', () => this.get('description')
			? description[0].target.id
			: undefined
		)

		// Effects
		description.sync(setText('description'))
		input.sync(setAttribute('aria-describedby'))
	}

	// Setup spin button
	#setupSpinButton() {
		const spinButton = this.querySelector('.spinbutton')
		if (!this.isNumber || !spinButton)
			return // no spin button, so skip

		const getNumber = attr => maybe(parseNumber(this.input[attr], this.isInteger)).filter(Number.isFinite)[0]
		const tempStep = parseNumber(spinButton.dataset.step, this.isInteger)
		const [step, min, max] = Number.isFinite(tempStep)
			? [tempStep, getNumber('min'), getNumber('max')]
			: []

		// Bring value to nearest step
		const nearestStep = v => {
			const steps = Math.round((max - min) / step)
			let zerone = Math.round((v - min) * steps / (max - min)) / steps // bring to 0-1 range
			zerone = Math.min(Math.max(zerone, 0), 1) // keep in range in case value is off limits
			const value = zerone * (max - min) + min
			return this.isInteger ? Math.round(value) : value
		}

		// Step down
		this.stepDown = (stepDecrement = step) => this.#triggerChange(v => nearestStep(v - stepDecrement))

		// Step up
		this.stepUp = (stepIncrement = step) => this.#triggerChange(v => nearestStep(v + stepIncrement))

		// derived states
		this.set('decrement-disabled', () => isNumber(min) && (this.get('value') - step < min))
		this.set('increment-disabled', () => isNumber(max) && (this.get('value') + step > max))

		// Handle spin button clicks and update their disabled state
		this.first('.decrement').on(
			'click',
			e => this.stepDown(e.shiftKey ? step * 10 : step)
		).sync(
			setProperty('disabled', 'decrement-disabled')
		)
		this.first('.increment').on(
			'click',
			e => this.stepUp(e.shiftKey ? step * 10 : step)
		).sync(
			setProperty('disabled', 'increment-disabled')
		)

		// Handle arrow key events
		this.input.onkeydown = e => {
			if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
				e.stopPropagation()
				e.preventDefault()
				if (e.key === 'ArrowDown')
					this.stepDown(e.shiftKey ? step * 10 : step)
				if (e.key === 'ArrowUp')
					this.stepUp(e.shiftKey ? step * 10 : step)
			}
		}
	}

	// Setup clear button
	#setupClearButton() {
		this.first('.clear')
			.on('click', () => {
				this.clear()
				this.input.focus()
			})
			.sync(toggleClass('hidden', 'empty'))
	}

}
InputField.define('input-field')

class InputCheckbox extends UIElement {
	static observedAttributes = ['checked']
	static states = {
		checked: asBoolean
	}

	connectedCallback() {
		this.first('input')
			.on('change', e => this.set('checked', Boolean(e.target.checked)))
			.sync(setProperty('checked'))
		this.self.sync(toggleAttribute('checked'))
	}
}
InputCheckbox.define('input-checkbox')

export class InputRadiogroup extends UIElement {
	static observedAttributes = ['value']

	connectedCallback() {
		this.self.sync(setAttribute('value'))
        this.all('input').on('change', e => this.set('value', e.target.value))
		this.all('label').sync((host, target) => toggleClass(
			'selected',
			() => host.get('value') === target.querySelector('input')?.value
		)(host, target))
    }
}
InputRadiogroup.define('input-radiogroup')

class LazyLoad extends UIElement {
	static observedAttributes = ['src']
	static states = {
		src: v => v.map(src => {
				let url = ''
				try {
					url = new URL(src, location.href) // ensure 'src' attribute is a valid URL
					if (url.origin !== location.origin) { // sanity check for cross-origin URLs
						throw new TypeError('Invalid URL origin')
					}
				} catch (error) {
					console.error(error, url)
					url = ''
				}
				return url.toString()
			})
	}

	connectedCallback() {

		// Show / hide loading message
		this.first('.loading')
			.sync(setProperty('ariaHidden', () => !!this.get('error')))

		// Set and show / hide error message
		this.first('.error').sync(
			setText('error')),
			setProperty('ariaHidden', () => !this.get('error')
		)

		// Load content from provided URL
		effect(() => {
			const src = this.get('src')
			if (!src) return // silently fail if no valid URL is provided
			fetch(src)
				.then(async response => {
					if (response.ok) {
						const content = await response.text()
						enqueue(() => {
							// UNSAFE!, use only trusted sources in 'src' attribute
							this.root.innerHTML = content
							this.root.querySelectorAll('script').forEach(script => {
								const newScript = document.createElement('script')
								newScript.appendChild(document.createTextNode(script.textContent ?? ''))
								this.root.appendChild(newScript)
								script.remove()
							}, [this.root, 'h'])
						})
						this.set('error', '')
					} else {
						this.set('error', response.status + ':'+ response.statusText)
					}
				})
				.catch(error => this.set('error', error))
		})
	}
}
LazyLoad.define('lazy-load')

const MEDIA_MOTION = 'media-motion'
const MEDIA_THEME = 'media-theme'
const MEDIA_VIEWPORT = 'media-viewport'
const MEDIA_ORIENTATION = 'media-orientation'

class MediaContext extends UIElement {
	static providedContexts = [MEDIA_MOTION, MEDIA_THEME, MEDIA_VIEWPORT, MEDIA_ORIENTATION]

	connectedCallback() {
		super.connectedCallback()

		const THEME_LIGHT = 'light'
		const THEME_DARK = 'dark'
		const VIEWPORT_XS = 'xs'
		const VIEWPORT_SM = 'sm'
		const VIEWPORT_MD = 'md'
		const VIEWPORT_LG = 'lg'
		const VIEWPORT_XL = 'xl'
		const ORIENTATION_LANDSCAPE = 'landscape'
		const ORIENTATION_PORTRAIT = 'portrait'

		const getBreakpoints = () => {
			const parseBreakpoint = breakpoint => {
				const attr = this.getAttribute(breakpoint)?.trim()
				if (!attr) return null
				const unit = attr.match(/em$/) ? 'em' : 'px'
				const value = maybe(parseFloat(attr)).filter(Number.isFinite)[0]
				return value ? value + unit : null
			}
			const sm = parseBreakpoint(VIEWPORT_SM) || '32em'
			const md = parseBreakpoint(VIEWPORT_MD) || '48em'
			const lg = parseBreakpoint(VIEWPORT_LG) || '72em'
			const xl = parseBreakpoint(VIEWPORT_XL) || '108em'
			return { sm, md, lg, xl }
		}
		const breakpoints = getBreakpoints()

		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
		const colorScheme = matchMedia('(prefers-color-scheme: dark)')
		const screenSmall = matchMedia(`(min-width: ${breakpoints.sm})`)
		const screenMedium = matchMedia(`(min-width: ${breakpoints.md})`)
		const screenLarge = matchMedia(`(min-width: ${breakpoints.lg})`)
		const screenXLarge = matchMedia(`(min-width: ${breakpoints.xl})`)
		const screenOrientation = matchMedia('(orientation: landscape)')

		const getViewport = () => {
			if (screenXLarge.matches) return VIEWPORT_XL
            if (screenLarge.matches) return VIEWPORT_LG
            if (screenMedium.matches) return VIEWPORT_MD
            if (screenSmall.matches) return VIEWPORT_SM
            return VIEWPORT_XS
		}

		// set initial values
		this.set(MEDIA_MOTION, reducedMotion.matches)
		this.set(MEDIA_THEME, colorScheme.matches ? THEME_DARK : THEME_LIGHT)
		this.set(MEDIA_VIEWPORT, getViewport())
		this.set(MEDIA_ORIENTATION, screenOrientation.matches ? ORIENTATION_LANDSCAPE : ORIENTATION_PORTRAIT)

		// event listeners
		reducedMotion.addEventListener(
			'change',
			e => this.set(MEDIA_MOTION, e.matches)
		)
		colorScheme.addEventListener(
			'change',
			e => this.set(MEDIA_THEME, e.matches ? THEME_DARK : THEME_LIGHT)
		)
		screenSmall.addEventListener('change', () => this.set(MEDIA_VIEWPORT, getViewport()))
		screenMedium.addEventListener('change', () => this.set(MEDIA_VIEWPORT, getViewport()))
		screenLarge.addEventListener('change', () => this.set(MEDIA_VIEWPORT, getViewport()))
		screenXLarge.addEventListener('change', () => this.set(MEDIA_VIEWPORT, getViewport()))
		screenOrientation.addEventListener('change', e => {
			this.set(MEDIA_THEME, e.matches ? ORIENTATION_LANDSCAPE : ORIENTATION_PORTRAIT)
		})
	}
}
MediaContext.define('media-context')

type TodoCountObject = {
	active: number
	completed: number
	total: number
}

class TodoList extends UIElement {
	static states = {
		tasks: [],
		filter: 'all'
	}

	connectedCallback() {
		this.#updateList()

		// Event listener and attribute on own element
		this.self
			.on('click', e => {
				if (e.target.localName === 'button') this.removeItem(e.target)
			})
			.sync(setAttribute('filter'))

		// Update count on each change
		this.set('count', () => {
			const tasks = (this.get('tasks') as InputCheckbox[]).map(el => el.signals.get('checked'))
			const completed = tasks.filter(fn => fn?.get()).length
			const total = tasks.length
			return {
				active: total - completed,
				completed,
				total
			} as TodoCountObject
		})
	}

	addItem = (task: string) => {
		const template = this.querySelector('template')?.content.cloneNode(true) as HTMLElement
		if (template && template.querySelector('span')) {
			template.querySelector('span')!.textContent = task
			this.querySelector('ol')?.appendChild(template)
			this.#updateList()
		}
	}

	removeItem = (element: HTMLElement) => {
		element.closest('li')?.remove()
		this.#updateList()
	}

	clearCompleted = () => {
		(this.get('tasks') as InputCheckbox[])
			.filter(el => el.get('checked'))
			.forEach(el => el.parentElement?.remove())
		this.#updateList()
	}

	#updateList() {
		this.set('tasks', Array.from(this.querySelectorAll('input-checkbox')))
	}

}
TodoList.define('todo-list')

class TodoApp extends UIElement {
	connectedCallback() {
		const todoList: TodoList | null = this.querySelector('todo-list') as TodoList
		const todoFilter: InputRadiogroup | null = this.querySelector('input-radiogroup') as InputRadiogroup

		// Event listener on own element
		this.self.on('add-todo', e => todoList?.addItem(e.detail))
		
		// Coordinate todo-count
		this.first('todo-count').pass({
			active: () => (todoList?.get('count') as TodoCountObject).active
		})

		// Coordinate todo-list
		this.first('todo-list').pass({
			filter: () => todoFilter?.get('value')
		})

		// Coordinate .clear-completed button
		this.first('.clear-completed')
			.on('click', () => todoList?.clearCompleted())
			.pass({
				disabled: () => !(todoList?.get('count') as TodoCountObject).completed
			})
	}
}
TodoApp.define('todo-app')

class TodoCount extends UIElement {
	static states = {
		active: 0
	}

	connectedCallback() {
		this.first('.count').sync(setText('active'))
		this.first('.singular').sync(setProperty('ariaHidden', () => this.get('active') as number > 1))
		this.first('.plural').sync(setProperty('ariaHidden', () => this.get('active') === 1))
		this.first('.remaining').sync(setProperty('ariaHidden', () => !this.get('active')))
		this.first('.all-done').sync(setProperty('ariaHidden', () => !!this.get('active')))
	}
}
TodoCount.define('todo-count')

class TodoForm extends UIElement {
	connectedCallback() {
		const inputField: InputField | null = this.querySelector('input-field')

        this.first('form').on('submit', e => {
			e.preventDefault()
			setTimeout(() => {
				this.dispatchEvent(new CustomEvent('add-todo', {
					bubbles: true,
					detail: inputField?.get('value')
				}))
				inputField?.clear()
			}, 0)
		})
	
		this.first('input-button').pass({
			disabled: () => inputField?.get('empty')
		})
    }
}
TodoForm.define('todo-form')

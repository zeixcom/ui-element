import { effect, setAttribute, setProperty, setText, toggleClass, UIElement } from "@zeix/ui-element"

/* === Pure functions === */

// Check if value is a number
const isNumber = (num: any) => typeof num === 'number'

// Parse a value as a number with optional integer flag and fallback value
const parseNumber = (v: any, int = false, fallback = 0): number => {
	const temp = int ? parseInt(v, 10) : parseFloat(v)
	return Number.isFinite(temp) ? temp : fallback
}

// Round a value to the nearest step
const nearestStep = (
	v: number,
	min: number,
    max: number,
    step: number,
	int: boolean = false
) => {
	const steps = Math.round((max - min) / step)
	// Bring to 0-1 range
	let zerone = Math.round((v - min) * steps / (max - min)) / steps
	// Keep in range in case value is off limits
	zerone = Math.min(Math.max(zerone, 0), 1)
	const value = zerone * (max - min) + min
	return int ? Math.round(value) : value
}

/* === Class definition === */

export class InputField extends UIElement {
	static observedAttributes = ['value', 'description']
	static states = {
		value: (v: string, el: InputField) =>
			el.isNumber ? parseNumber(v, el.isInteger, 0) : v
	}
	isNumber?: boolean
	isInteger?: boolean
	input: HTMLInputElement | null = null
	step: number = 1
	min: number | undefined
	max: number | undefined

	connectedCallback() {

		// Set properties
		this.input = this.querySelector('input')
		this.isNumber = (this.input && this.input.type === 'number') ?? false
		this.isInteger = this.hasAttribute('integer')
		if (this.input && this.isNumber) {
			this.step = parseNumber(this.input.step, this.isInteger, 1)
			this.min = parseNumber(this.input.min, this.isInteger, 0)
			this.max = parseNumber(this.input.max, this.isInteger, 0)
		}

		// Set default states
		this.set('value', this.isNumber ? this.input?.valueAsNumber : this.input?.value, false)
		this.set('length', this.input?.value.length)
		
		// Derived states
		this.set('empty', () => !this.get('length'))

		// Handle input changes
		this.first('input')
			.on('change', () => {
				this.#triggerChange(this.isNumber ? this.input?.valueAsNumber : this.input?.value)
			})
			.on('input', () => {
				this.set('length', this.input?.value.length)
			})

		// Handle arrow key events to increment / decrement value
		if (this.isNumber) {
			this.first('input').on('keydown', (e: Event) => {
				const evt = e as KeyboardEvent
				if (['ArrowUp', 'ArrowDown'].includes(evt.key)) {
					e.stopPropagation()
					e.preventDefault()
					if (evt.key === 'ArrowDown')
						this.stepDown(evt.shiftKey ? this.step * 10 : this.step)
					if (evt.key === 'ArrowUp')
						this.stepUp(evt.shiftKey ? this.step * 10 : this.step)
				}
			})
		}

		// Setup error message
		this.set('ariaInvalid', () => String(Boolean(this.get('error'))))
		this.set('aria-errormessage', () => this.get('error') ? this.querySelector('.error')?.id : undefined)
		this.first('.error').sync(setText('error'))
		this.first('input').sync(
			setProperty('ariaInvalid'),
			setAttribute('aria-errormessage')
		)

		// Setup description
		const description = this.querySelector('.description') as HTMLElement | null
		if (description) {
			
			// Derived states
			const maxLength = this.input?.maxLength
			const remainingMessage = maxLength && description.dataset.remaining
			const defaultDescription = description.textContent
			this.set('description', remainingMessage
				? () => {
					const length = this.get<number>('length') ?? 0
					return length > 0
						? remainingMessage.replace('${x}', String(maxLength - length))
						: defaultDescription
				}
				: defaultDescription
			)
			this.set('aria-describedby', () => this.get('description') ? description.id : undefined)

			// Effects
			this.first('.description').sync(setText('description'))
			this.first('input').sync(setAttribute('aria-describedby'))
		}

		// Handle spin button clicks and update their disabled state
		const spinButton = this.querySelector('.spinbutton') as HTMLElement | null
		if (!this.isNumber || !spinButton) {
			this.first('.decrement')
				.on('click', (e: Event) => {
					this.stepDown((e as MouseEvent).shiftKey ? this.step * 10 : this.step)
				}).sync(setProperty(
					'disabled',
					() => isNumber(this.min) && (this.get('value') ?? 0 - this.step < this.min)
				))
			this.first('.increment')
				.on('click', (e: Event) => {
					this.stepUp((e as MouseEvent).shiftKey ? this.step * 10 : this.step)
				})
				.sync(setProperty(
					'disabled',
					() => isNumber(this.max) && (this.get('value') ?? 0 + this.step > this.max)
				))
		}

		// Setup clear button
		this.first('.clear')
			.on('click', () => {
				this.clear()
				this.input?.focus()
			})
			.sync(toggleClass('hidden', 'empty'))

		// Update value
		effect(() => {
			const value = this.get('value')
			const validate = this.getAttribute('validate')
			if (value && validate) {

				// Validate input value against a server-side endpoint
				fetch(`${validate}?name=${this.input?.name}value=${this.input?.value}`)
					.then(async response => {
						const text = await response.text()
						this.input?.setCustomValidity(text)
						this.set('error', text)
					})
					.catch(err => this.set('error', err.message))
			}

			// Ensure value is a number if it is not already a number
			if (this.isNumber && !isNumber(value))
				// Effect will be called again with numeric value
				return this.set('value', parseNumber(value, this.isInteger, 0))

			// Change value only if it is a valid number
			if (this.input && this.isNumber && Number.isFinite(value))
				this.input.value = String(value)
		})
 	}

	// Clear the input field
	clear() {
		this.set('value', '')
		this.set('length', 0)
		if (this.input) {
			this.input.value = ''
			this.input.focus()
		}
	}

	stepUp(stepIncrement: number = this.step) {
		if (this.isNumber) this.#triggerChange(v => nearestStep(
			v + stepIncrement,
			this.min ?? 0,
			this.max ?? 100,
			this.step,
			this.isInteger
		))
	}

	stepDown(stepDecrement: number = this.step) {
		if (this.isNumber) this.#triggerChange(v => nearestStep(
			v - stepDecrement,
			this.min ?? 0,
			this.max ?? 100,
			this.step,
			this.isInteger
		))
    }

	// Trigger value-change event to commit the value change
	#triggerChange = (value: string | number | ((v: any) => string | number) | undefined)  => {
		this.set('value', value)
		this.set('error', this.input?.validationMessage)
		if (typeof value === 'function')
			value = this.get('value')
		if (this.input?.value !== String(value))
			this.self.emit('value-change', value)
	}

}
InputField.define('input-field')
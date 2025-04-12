import {
	type Component, type Parser, type SignalProducer,
	component, effect, emit, on, setAttribute, setProperty, setText, UNSET
} from '../../../'

/* === Type === */

export type InputFieldProps = {
	value: string | number,
	length: number,
	empty: boolean,
	error: string,
	ariaInvalid: "true" | "false",
	'aria-errormessage': string,
    description: string,
	'aria-describedby': string
}

/* === Pure Functions === */

// Check if value is a number
const isNumber = (num: any) => typeof num === 'number'

// Convert any value to a boolean string
const toBooleanString = (value: any): "true" | "false" =>
	!value || value === "false" ? "false" : "true"

// Parse a value as a number with optional integer flag and fallback value
const parseNumber = (v: any, int = false, fallback = 0): number => {
	const temp = int ? parseInt(v, 10) : parseFloat(v)
	return Number.isFinite(temp) ? temp : fallback
}

/* === Attribute Parsers === */

const asNumberOrString: Parser<string | number, Component<InputFieldProps>> = (el, v) => {
	const input = el.querySelector('input')
	return input && input.type === 'number' ? parseNumber(v, el.hasAttribute('integer'), 0) : (v ?? '')
}

/* === Signal Producers === */

const createEmpty: SignalProducer<boolean, HTMLElement & { length: number }> = el =>
	() => el.length === 0

const createAriaInvalid: SignalProducer<"true" | "false", HTMLElement & { error: string }> = el =>
	() => toBooleanString(el.error)

const createAriaErrorMessage: SignalProducer<string, HTMLElement & { error: string }> = el =>
	() => el.error? el.querySelector('.error')?.id : UNSET

const createAriaDescribedBy: SignalProducer<string, HTMLElement & { description: string }> = el =>
	() => el.description? el.querySelector('.description')?.id : UNSET

/* === Component === */

const InputField = component('input-field', {
	value: asNumberOrString,
	length: 0,
	empty: createEmpty,
	error: '',
	ariaInvalid: createAriaInvalid,
	'aria-errormessage': createAriaErrorMessage,
	description: '',
	'aria-describedby': createAriaDescribedBy
}, el => {
	const input = el.querySelector('input')
	const typeNumber = input && input.type === 'number'
	const integer = el.hasAttribute('integer')
	const step = parseNumber(input?.step, integer, 1)
	const min = parseNumber(input?.min, integer, 0)
	const max = parseNumber(input?.max, integer, 100)

	// Trigger value-change event to commit the value change
	const triggerChange = (value: string | number | ((v: any) => string | number))  => {
		el.value = typeof value === 'function' ? value(el.value) : value
		el.error = input?.validationMessage ?? ''
		if (input?.value !== String(value))
		el.self(emit('value-change', value))
	}

	// Round a value to the nearest step
	const nearestStep = (v: number) => {
		const steps = Math.round((max - min) / step)
		// Bring to 0-1 range
		let zerone = Math.round((v - min) * steps / (max - min)) / steps
		// Keep in range in case value is off limits
		zerone = Math.min(Math.max(zerone, 0), 1)
		const value = zerone * (max - min) + min
		return integer ? Math.round(value) : value
	}
	
	// Handle input changes
	el.first('input',
		on('change', () => {
			triggerChange(typeNumber ? input?.valueAsNumber ?? 0 : input?.value ?? '')
		}),
		on('input', () => {
			el.length = input?.value.length ?? 0
		})
	)

	// Validate and update value
	effect(() => {
		const value = el.value
		const validate = el.getAttribute('validate')
		if (value && validate) {

			// Validate input value against a server-side endpoint
			fetch(`${validate}?name=${input?.name}value=${input?.value}`)
				.then(async response => {
					const text = await response.text()
					input?.setCustomValidity(text)
					el.error = text
				})
				.catch(err => {
					el.error = err.message
				})
		}

		// Ensure value is a number if it is not already a number
		if (typeNumber && !isNumber(value)) {
			// Effect will be called again with numeric value
			el.value = parseNumber(value, integer, 0)
			return
		}

		// Change value only if it is a valid number
		if (input && typeNumber && Number.isFinite(value))
			input.value = String(value)
	})

	if (typeNumber) {

		// Handle arrow key events to increment / decrement value
		el.first('input', on('keydown', (e: Event) => {
			const evt = e as KeyboardEvent
			if (['ArrowUp', 'ArrowDown'].includes(evt.key)) {
				e.stopPropagation()
				e.preventDefault()
				if (evt.key === 'ArrowDown')
					triggerChange(v => nearestStep(v - (evt.shiftKey ? step * 10 : step)))
				if (evt.key === 'ArrowUp')
					triggerChange(v => nearestStep(v + (evt.shiftKey ? step * 10 : step)))
			}
		}))

		// Handle spin button clicks and update their disabled state
		const spinButton = el.querySelector('.spinbutton') as HTMLElement | null
		if (typeNumber && spinButton) {
			el.first<HTMLButtonElement>('.decrement',
				on('click', (e: Event) => {
					triggerChange(v => nearestStep(v - ((e as MouseEvent).shiftKey ? step * 10 : step)))
				}),
				setProperty('disabled',
					() => (isNumber(min) ? el.value as number : 0) - step < min
				)
			)
			el.first<HTMLButtonElement>('.increment',
				on('click', (e: Event) => {
					triggerChange(v => nearestStep(v + ((e as MouseEvent).shiftKey ? step * 10 : step)))
				}),
				setProperty('disabled',
					() => (isNumber(max) ? el.value as number : 0) - step > max
				)
			)
		}

	} else {

		// Setup clear button
		el.first<HTMLElement>('.clear',
			on('click', () => {
				el.value = ''
				el.length = 0
				input?.focus()
			}),
			setProperty('hidden', 'empty')
		)
	}

	// Setup error message
	el.first('.error', setText('error'))
	el.first('input',
		setProperty('ariaInvalid'),
		setAttribute('aria-errormessage')
	)

	// Setup description
	const description = el.querySelector<HTMLElement>('.description')
	if (description) {
		
		// Derived states
		const maxLength = input?.maxLength
		const remainingMessage = maxLength && description.dataset.remaining
		const defaultDescription = description.textContent ?? ''
		el.description = remainingMessage
			? el.length
				? remainingMessage.replace('${x}', String(maxLength - el.length))
				: defaultDescription
			: defaultDescription

		// Effects
		el.first('.description', setText('description'))
		el.first('input', setAttribute('aria-describedby'))
	}

})

declare global {
	interface HTMLElementTagNameMap {
		'input-field': typeof InputField
	}
}

export default InputField
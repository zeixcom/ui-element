import {
	type AttributeParser,
	Component,
	component, computed, effect, emit, first, FxFunction, on, setAttribute, setProperty, setText, UNSET
} from '../../../'

/* === Type === */

export type InputFieldProps = {
	value: string | number,
	length: number,
	error: string,
    description: string,
	clear(): void
}

/* === Pure Functions === */

// Check if value is a number
const isNumber = (num: any) => typeof num === 'number'

// Parse a value as a number with optional integer flag and fallback value
const parseNumber = (v: any, int = false, fallback = 0): number => {
	const temp = int ? parseInt(v, 10) : parseFloat(v)
	return Number.isFinite(temp) ? temp : fallback
}

/* === Attribute Parsers === */

const asNumberOrString: AttributeParser<HTMLElement, string | number> = (el, v) => {
	const input = el.querySelector('input')
	return input && input.type === 'number' ? parseNumber(v, el.hasAttribute('integer'), 0) : (v ?? '')
}

/* === Component === */

const InputField = component('input-field', {
	value: asNumberOrString,
	length: 0,
	error: '',
	description: '',
	clear: (host: HTMLElement & InputFieldProps) => {
		host.clear = () => {
			host.value = ''
			host.length = 0
			const input = host.querySelector('input')
			if (input) {
				input.value = ''
				input.focus()
			}
		}
	}
}, (el: Component<InputFieldProps>) => {
	const fns: FxFunction<InputFieldProps, Component<InputFieldProps>>[] = []
	const input = el.querySelector('input')
	if (!input)
		throw new Error('No input element found')
	const typeNumber = input.type === 'number'
	const integer = el.hasAttribute('integer')
	const step = parseNumber(input.step, integer, 1)
	const min = parseNumber(input.min, integer, 0)
	const max = parseNumber(input.max, integer, 100)

	// Trigger value-change event to commit the value change
	const triggerChange = (value: string | number | ((v: any) => string | number))  => {
		el.value = typeof value === 'function' ? value(el.value) : value
		el.error = input.validationMessage ?? ''
		if (input?.value !== String(value))
		emit('value-change', value)(el)
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
	const validationEndpoint = el.getAttribute('validate')
	fns.push(
		first('input',
			on('change', () => {
				triggerChange(typeNumber ? input.valueAsNumber ?? 0 : input.value ?? '')
			}),
			on('input', () => {
				el.length = input.value.length ?? 0
			})
		),

		// Validate and update value
		effect(() => {
			const value = el.value
			if (value && validationEndpoint) {

				// Validate input value against a server-side endpoint
				fetch(`${validationEndpoint}?name=${input.name}value=${input.value}`)
					.then(async response => {
						const text = await response.text()
						input.setCustomValidity(text)
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
	)

	if (typeNumber) {

		// Handle arrow key events to increment / decrement value
		fns.push(
			first('input',
				on('keydown', (e: Event) => {
					const { key, shiftKey } = e as KeyboardEvent
					if (['ArrowUp', 'ArrowDown'].includes(key)) {
						e.stopPropagation()
						e.preventDefault()
						if (key === 'ArrowDown')
							triggerChange(v => nearestStep(v - (shiftKey ? step * 10 : step)))
						if (key === 'ArrowUp')
							triggerChange(v => nearestStep(v + (shiftKey ? step * 10 : step)))
					}
				})
			)
		)

		// Handle spin button clicks and update their disabled state
		const spinButton = el.querySelector('.spinbutton') as HTMLElement | null
		if (spinButton) {
			fns.push(
				first<InputFieldProps, HTMLButtonElement>('.decrement',
					on('click', (e: Event) => {
						triggerChange(v => nearestStep(v - ((e as MouseEvent).shiftKey ? step * 10 : step)))
					}),
					setProperty('disabled',
						() => (isNumber(min) ? el.value as number : 0) - step < min
					)
				),
				first<InputFieldProps, HTMLButtonElement>('.increment',
					on('click', (e: Event) => {
						triggerChange(v => nearestStep(v + ((e as MouseEvent).shiftKey ? step * 10 : step)))
					}),
					setProperty('disabled',
						() => (isNumber(max) ? el.value as number : 0) - step > max
					)
				)
			)
		}

	} else {

		// Setup clear button and method
		fns.push(
			first<InputFieldProps, HTMLButtonElement>('.clear',
				on('click', () => {
					el.clear()
				}),
				setProperty('hidden', () => !el.length)
			)
		)
	}

	// Setup error message
	const errorId = el.querySelector('.error')?.id
	fns.push(
		first('.error', setText('error')),
		first('input',
			setProperty('ariaInvalid', () => el.error ? 'true' : 'false'),
			setAttribute('aria-errormessage',
				() => el.error && errorId ? errorId : UNSET
			)
		)
	)

	// Setup description
	const description = el.querySelector<HTMLElement>('.description')
	if (description) {
		
		// Derived state
		const maxLength = input.maxLength
		const remainingMessage = maxLength && description.dataset.remaining
		if (remainingMessage) {
			el.setSignal('description',
				computed(() => remainingMessage.replace('${x}', String(maxLength - el.length)))
			)
		}

		// Effects
		fns.push(
			first('.description', setText('description')),
			first('input', setAttribute('aria-describedby',
				() => el.description && description.id ? description.id : UNSET
			))
		)
	}

	return fns
})

declare global {
	interface HTMLElementTagNameMap {
		'input-field': typeof InputField
	}
}

export default InputField
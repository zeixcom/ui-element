import {
	type AttributeParser, type Component, type FxFunction,
	component, computed, emit, first, on, setAttribute, setProperty, setText, UNSET
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
const isNumber = (num: unknown) => typeof num === 'number'

// Parse a value as a number with optional integer flag and fallback value
const parseNumber = (v: string | null, int = false, fallback = 0): number => {
	if (!v) return fallback
	const temp = int ? parseInt(v, 10) : parseFloat(v)
	return Number.isFinite(temp) ? temp : fallback
}

// Count decimal places in a number
const countDecimals = (value: number): number => {
	if (Math.floor(value) === value || String(value).indexOf('.') === -1) return 0;
	return String(value).split('.')[1].length || 0;
}

/* === Attribute Parsers === */

const asNumberOrString: AttributeParser<HTMLElement, string | number> = (el, v) => {
	const input = el.querySelector('input')
	return input && input.type === 'number' ? parseNumber(v, el.hasAttribute('integer'), 0) : (v ?? '')
}

/* === Component === */

export default component('input-field', {
	value: asNumberOrString,
	length: 0,
	error: '',
	description: '',
	clear: (host: Component<InputFieldProps>) => {
		host.clear = () => {
			host.value = ''
			host.length = 0
			const input = host.querySelector('input')
			if (input) {
				input.value = ''
				input.checkValidity()
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
	const validationEndpoint = el.getAttribute('validate')

	// Trigger value-change event to commit the value change
	const triggerChange = (value: string | number | ((v: any) => string | number))  => {
		const newValue = typeof value === 'function' ? value(el.value)
			: typeNumber && !isNumber(value) ? parseNumber(value, integer, 0)
			: value
		if (Object.is(el.value, newValue)) return

		// Validate input value against a server-side endpoint
		if (newValue !== null && validationEndpoint) {
			fetch(`${validationEndpoint}?name=${input.name}value=${newValue}`)
				.then(async response => {
					const text = await response.text()
					input.setCustomValidity(text)
					el.error = text
				})
				.catch(err => {
					el.error = err.message
				})
		}
		input.checkValidity()
		el.value = newValue
		el.error = input.validationMessage ?? ''
		if (input?.value !== String(value))
		emit('value-change', value)(el)
	}
	
	// Handle input changes
	fns.push(
		first<InputFieldProps, HTMLInputElement>('input',
			setProperty('value', () => String(el.value)),
			on('change', () => {
				triggerChange(typeNumber ? input.valueAsNumber ?? 0 : input.value ?? '')
			}),
			on('input', () => {
				el.length = input.value.length ?? 0
			})
		)
	)

	if (typeNumber) {
		const spinButton = el.querySelector('.spinbutton') as HTMLElement | null
		const step = parseNumber(spinButton?.dataset['step'] || input.step, integer, 1)
		const min = parseNumber(input.min, integer, 0)
		const max = parseNumber(input.max, integer, 100)

		// Round a value to the nearest step
		const nearestStep = (v: number) => {
			if (!Number.isFinite(v) || v < min) return min
			if (v > max) return max
			const value = min + Math.round((v - min) / step) * step
			return integer
				? Math.round(value)
				: parseFloat(value.toFixed(countDecimals(step)))
		}

		// Handle arrow key events to increment / decrement value
		fns.push(
			first('input',
				on('keydown', (e: Event) => {
					const { key, shiftKey } = e as KeyboardEvent
					if (['ArrowUp', 'ArrowDown'].includes(key)) {
						e.stopPropagation()
						e.preventDefault()
						const n = (shiftKey ? step * 10 : step)
						const newValue = nearestStep(input.valueAsNumber + (key === 'ArrowUp' ? n : -n))
						input.value = String(newValue)
						triggerChange(newValue)
					}
				})
			)
		)

		// Handle spin button clicks and update their disabled state
		if (spinButton) {
			fns.push(
				first<InputFieldProps, HTMLButtonElement>('.decrement',
					on('click', (e: Event) => {
						const n = ((e as MouseEvent).shiftKey ? step * 10 : step)
						const newValue = nearestStep(input.valueAsNumber - n)
						input.value = String(newValue)
						triggerChange(newValue)
					}),
					setProperty('disabled',
						() => (isNumber(min) ? el.value as number : 0) - step < min
					)
				),
				first<InputFieldProps, HTMLButtonElement>('.increment',
					on('click', (e: Event) => {
						const n = ((e as MouseEvent).shiftKey ? step * 10 : step)
						const newValue = nearestStep(input.valueAsNumber + n)
						input.value = String(newValue)
						triggerChange(newValue)
					}),
					setProperty('disabled',
						() => (isNumber(max) ? el.value as number : 0) + step > max
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
					triggerChange('')
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
		'input-field': Component<InputFieldProps>
	}
}

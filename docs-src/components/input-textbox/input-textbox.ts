import {
	type Component,
	asString,
	batch,
	component,
	computed,
	on,
	RESET,
	setAttribute,
	setProperty,
	setText,
	UNSET,
} from '../../..'

export type InputTextboxProps = {
	value: string
	length: number
	error: string
	description: string
}

export default component(
	'input-textbox',
	{
		value: asString(),
		length: 0,
		error: '',
		description: RESET,
	},
	(el, { first }) => {
		const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(
			'input, textarea',
		)
		if (!input) throw new Error('No Input or textarea element found')
		const errorId = el.querySelector('.error')?.id

		// If there's a description with data-remaining attribute we set a computed signal to update the description text
		const description = el.querySelector<HTMLElement>('.description')
		const descriptionId = description?.id
		if (description?.dataset.remaining && input.maxLength) {
			el.setSignal(
				'description',
				computed(() =>
					description.dataset.remaining!.replace(
						'${n}',
						String(input.maxLength - el.length),
					),
				),
			)
		}

		return [
			// Effects and event listeners on component
			setAttribute('value'),

			// Effect on description - has to come first so we can set the el.description using RESET
			first('.description', setText('description')),

			// Effects and event listeners on input / textarea
			first<HTMLInputElement | HTMLTextAreaElement>(
				'input, textarea',
				setProperty('value'),
				setProperty('ariaInvalid', () => (el.error ? 'true' : 'false')),
				setAttribute('aria-errormessage', () =>
					el.error && errorId ? errorId : UNSET,
				),
				setAttribute('aria-describedby', () =>
					el.description && descriptionId ? descriptionId : UNSET,
				),
				on('input', () => (el.length = input.value.length)),
				on('change', () =>
					batch(() => {
						el.value = input.value
						el.error = input.validationMessage ?? ''
					}),
				),
			),

			// Effects and event listeners on clear button
			first<HTMLButtonElement>(
				'.clear',
				setProperty('hidden', () => !el.length),
				on('click', () => {
					input.value = ''
					batch(() => {
						el.value = ''
						el.error = input.validationMessage ?? ''
						el.length = 0
					})
				}),
			),

			// Effect on error message
			first('.error', setText('error')),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'input-combobox': Component<InputTextboxProps>
	}
}

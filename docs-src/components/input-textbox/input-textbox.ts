import {
	type Component,
	RESET,
	UNSET,
	component,
	computed,
	on,
	setAttribute,
	setProperty,
	setText,
	show,
} from '../../..'
import { createClearFunction } from '../../functions/shared/clear-input'

export type InputTextboxProps = {
	value: string
	length: number
	error: string
	description: string
	clear(): void
}

export default component<InputTextboxProps>(
	'input-textbox',
	{
		value: '',
		length: 0,
		error: RESET,
		description: RESET,
		clear() {},
	},
	(el, { first }) => {
		const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(
			'input, textarea',
		)
		if (!input) throw new Error('No Input or textarea element found')

		// Add clear method to component using shared functionality
		el.clear = createClearFunction(input)

		// Set initial error state (browsers don't show validation errors until first interaction)
		el.error = ''

		// If there's a description with data-remaining attribute we set a computed signal to update the description text
		const description = el.querySelector<HTMLElement>('.description')
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
		const errorId = el.querySelector('.error')?.id
		const descriptionId = description?.id

		return [
			// Effects and event listeners on component
			setAttribute('value'),

			// Effects on error and description
			// Have to come first so we can set the el.description using RESET
			first('.error', setText('error')),
			first('.description', setText('description')),

			// Effects and event listeners on input / textarea
			first(
				'input, textarea',
				setProperty('ariaInvalid', () => String(!!el.error)),
				setAttribute('aria-errormessage', () =>
					el.error && errorId ? errorId : UNSET,
				),
				setAttribute('aria-describedby', () =>
					el.description && descriptionId ? descriptionId : UNSET,
				),
				on('input', () => {
					el.length = input.value.length
				}),
				on('change', () => {
					input.checkValidity()
					el.value = input.value
					el.error = input.validationMessage ?? ''
				}),
			),

			// Effects and event listeners on clear button
			first(
				'.clear',
				show(() => !!el.length),
				on('click', () => el.clear()),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'input-textbox': Component<InputTextboxProps>
	}
}

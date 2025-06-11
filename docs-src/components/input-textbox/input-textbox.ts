import {
	type Component,
	asString,
	component,
	computed,
	on,
	RESET,
	setAttribute,
	setText,
} from '../../..'
import {
	createClearFunction,
	standardClearEffects,
	standardClearUpdate,
} from '../../functions/shared/clear-input'
import { standardInputEffects } from '../../functions/shared/input-effects'

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
		value: asString(),
		length: 0,
		error: '',
		description: RESET,
		clear() {},
	},
	(el, { first }) => {
		const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(
			'input, textarea',
		)
		if (!input) throw new Error('No Input or textarea element found')

		// Add clear method to component using shared functionality
		el.clear = createClearFunction(input, standardClearUpdate(el, input))

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

		return [
			// Effects and event listeners on component
			setAttribute('value'),

			// Effect on description - has to come first so we can set the el.description using RESET
			first('.description', setText('description')),

			// Effects and event listeners on input / textarea
			first<HTMLInputElement | HTMLTextAreaElement>(
				'input, textarea',
				...standardInputEffects(
					el,
					input,
					el.querySelector('.error')?.id,
					description?.id,
				),
				on('input', () => (el.length = input.value.length)),
			),

			// Effects and event listeners on clear button
			first<HTMLButtonElement>('.clear', ...standardClearEffects(el)),

			// Effect on error message
			first('.error', setText('error')),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'input-textbox': Component<InputTextboxProps>
	}
}

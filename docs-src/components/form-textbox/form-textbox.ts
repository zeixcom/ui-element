import {
	type Component,
	batch,
	component,
	computed,
	on,
	setAttribute,
	setProperty,
	setText,
	show,
	useElement,
} from '../../..'
import { createClearFunction } from '../../functions/shared/clear-input'

export type FormTextboxProps = {
	value: string
	length: number
	error: string
	description: string
	clear(): void
}

export default component<FormTextboxProps>(
	'form-textbox',
	{
		value: '',
		length: 0,
		error: '',
		description: '',
		clear() {},
	},
	(el, { first }) => {
		const input = useElement<HTMLInputElement | HTMLTextAreaElement>(
			el,
			'input, textarea',
			'Native input or textarea element needed.',
		)

		// Add clear method to component using shared functionality
		el.clear = createClearFunction(input)

		// Initialize description with existing content or set up computed signal for remaining characters
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
		} else if (description?.textContent) {
			el.description = description.textContent.trim()
		}
		const errorId = el.querySelector('.error')?.id
		const descriptionId = description?.id

		return [
			setAttribute('value'),

			// Effects on input / textarea
			first('input, textarea', [
				setProperty('ariaInvalid', () => String(!!el.error)),
				setAttribute('aria-errormessage', () =>
					el.error && errorId ? errorId : null,
				),
				setAttribute('aria-describedby', () =>
					el.description && descriptionId ? descriptionId : null,
				),
				on('change', () => {
					input.checkValidity()
					batch(() => {
						el.value = input.value
						el.error = input.validationMessage ?? ''
					})
				}),
				on('input', () => {
					el.length = input.value.length
				}),
			]),

			// Effects and event listeners on clear button
			first('.clear', [
				show(() => !!el.length),
				on('click', () => {
					el.clear()
				}),
			]),

			// Effects on error and description
			first('.error', setText('error')),
			first('.description', setText('description')),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-textbox': Component<FormTextboxProps>
	}
}

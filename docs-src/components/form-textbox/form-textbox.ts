import {
	type Component,
	component,
	computed,
	fromEvents,
	on,
	requireElement,
	setAttribute,
	setProperty,
	setText,
	show,
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
		value: fromEvents<
			string,
			HTMLInputElement | HTMLTextAreaElement,
			HTMLElement & { error: string }
		>('', 'input, textarea', {
			change: ({ host, target }) => {
				target.checkValidity()
				host.error = target.validationMessage
				return target.value
			},
		}),
		length: fromEvents<number, HTMLInputElement | HTMLTextAreaElement>(
			0,
			'input, textarea',
			{
				input: ({ target }) => target.value.length,
			},
		),
		error: '',
		description: '',
		clear() {},
	},
	(el, { first }) => {
		const input = requireElement<HTMLInputElement | HTMLTextAreaElement>(
			el,
			'input, textarea',
			'Native input or textarea element needed.',
		)

		// Add clear method to component using shared functionality
		el.clear = createClearFunction(input)

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
				/* on({
					input: () => {
						el.length = input.value.length
					},
					change: () => {
						input.checkValidity()
						batch(() => {
							el.value = input.value
							el.error = input.validationMessage ?? ''
						})
					},
				}), */
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

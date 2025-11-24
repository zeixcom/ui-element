import {
	batch,
	type Component,
	component,
	on,
	setAttribute,
	setProperty,
	setText,
} from '../../..'
import { clearEffects, clearMethod } from '../_shared/clear'

export type FormTextboxProps = {
	value: string
	length: number
	error: string
	description: string
	readonly clear: () => void
}

export default component<FormTextboxProps>(
	'form-textbox',
	{
		value: '',
		length: 0,
		error: '',
		description: (el: HTMLElement & { length: number }) => {
			const description = el.querySelector<HTMLElement>('.description')
			if (description) {
				const input = el.querySelector<
					HTMLInputElement | HTMLTextAreaElement
				>('input, textarea')
				if (input && input.maxLength && description.dataset.remaining) {
					return () =>
						description.dataset.remaining!.replace(
							'${n}',
							String(input.maxLength - el.length),
						)
				}
				return description.textContent?.trim() ?? ''
			} else {
				return ''
			}
		},
		clear: clearMethod<HTMLInputElement | HTMLTextAreaElement>(
			'input, textarea',
		),
	},
	(el, { first, useElement }) => {
		const input = useElement<HTMLInputElement | HTMLTextAreaElement>(
			'input, textarea',
			'Native input or textarea needed.',
		)

		const errorId = el.querySelector('.error')?.id
		const descriptionId = el.querySelector('.description')?.id

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
			first('.clear', clearEffects(el)),

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

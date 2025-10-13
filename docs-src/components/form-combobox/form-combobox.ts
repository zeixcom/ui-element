import {
	batch,
	type Component,
	component,
	computed,
	fromDOM,
	getText,
	on,
	pass,
	setAttribute,
	setProperty,
	setText,
	show,
	state,
} from '../../..'
import { clearEffects, clearMethod } from '../../functions/shared/clearInput'

export type FormComboboxProps = {
	value: string
	length: number
	error: string
	description: string
	clear(): void
}

export default component<FormComboboxProps>(
	'form-combobox',
	{
		value: '',
		length: 0,
		error: fromDOM({ '.error': getText() }, ''),
		description: fromDOM({ '.description': getText() }, ''),
		clear: clearMethod(),
	},
	(el, { first, useElement }) => {
		const input = useElement('input', 'Needed to enter value.')
		const errorId = useElement('.error')?.id
		const descriptionId = useElement('.description')?.id
		const listbox = useElement('form-listbox', 'Needed to display options.')

		const showPopup = state(false)
		const isExpanded = computed(
			() => showPopup.get() && listbox.options.length > 0,
		)

		return [
			// Effects and event listeners on component
			setAttribute('value'),
			on('keyup', ({ event }) => {
				const { key } = event
				if (key === 'Escape') showPopup.set(false)
				if (key === 'Delete') el.clear()
			}),
			on('form-listbox.change', ({ event }) => {
				if (event.detail) {
					el.value = event.detail
					input.value = event.detail
					input.checkValidity()
					el.length = input.value.length
					el.error = input.validationMessage ?? ''
					showPopup.set(false)
				}
			}),

			// Effects on error and description
			first('.error', setText('error')),
			first('.description', setText('description')),

			// Effects and event listeners on input
			first('input', [
				setProperty('ariaInvalid', () => String(!!el.error)),
				setAttribute('aria-errormessage', () =>
					el.error && errorId ? errorId : null,
				),
				setAttribute('aria-describedby', () =>
					el.description && descriptionId ? descriptionId : null,
				),
				setProperty('ariaExpanded', () => String(isExpanded.get())),
				on('input', () => {
					batch(() => {
						input.checkValidity()
						showPopup.set(true)
						el.value = input.value
						el.length = input.value.length
						el.error = input.validationMessage ?? ''
					})
				}),
				on('keydown', ({ event }) => {
					const { key, altKey } = event
					if (key === 'ArrowDown') {
						if (altKey) showPopup.set(true)
						if (isExpanded.get()) listbox.options[0]?.focus()
					}
				}),
			]),

			// Effects and event listeners on clear button
			first('.clear', clearEffects(el)),

			// Effect on listbox
			first('form-listbox', [
				show(() => isExpanded.get()),
				pass({
					filter: () => el.value,
				}),
			]),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-combobox': Component<FormComboboxProps>
	}
}

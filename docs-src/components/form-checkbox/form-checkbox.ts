import {
	type Component,
	RESET,
	asString,
	component,
	fromEvents,
	requireElement,
	setText,
	toggleAttribute,
} from '../../..'

export type FormCheckboxProps = {
	checked: boolean
	label: string
}

export default component(
	'form-checkbox',
	{
		checked: fromEvents(el => el.querySelector('input')?.checked, 'input', {
			change: ({ target }) => target.checked,
		}),
		label: asString(RESET),
	},
	(el, { first }) => {
		requireElement(el, 'input[type="checkbox"]')
		requireElement(el, '.label')

		return [toggleAttribute('checked'), first('.label', setText('label'))]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-checkbox': Component<FormCheckboxProps>
	}
}

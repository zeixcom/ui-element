import {
	type Component,
	RESET,
	asString,
	component,
	fromEvents,
	requireDescendant,
	setText,
	toggleAttribute,
} from '../../..'

export type FormCheckboxProps = {
	readonly checked: boolean
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
		requireDescendant(el, 'input[type="checkbox"]')
		requireDescendant(el, '.label')

		return [toggleAttribute('checked'), first('.label', setText('label'))]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-checkbox': Component<FormCheckboxProps>
	}
}

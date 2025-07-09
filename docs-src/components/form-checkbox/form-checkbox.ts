import {
	type Component,
	RESET,
	component,
	fromEvents,
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
		label: RESET,
	},
	(_, { first }) => [
		toggleAttribute('checked'),
		first('.label', setText('label')),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'form-checkbox': Component<FormCheckboxProps>
	}
}

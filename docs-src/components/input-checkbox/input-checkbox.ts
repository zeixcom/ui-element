import {
	type Component,
	RESET,
	asBoolean,
	asString,
	component,
	on,
	setProperty,
	setText,
	toggleAttribute,
} from '../../../'

export type InputCheckboxProps = {
	checked: boolean
	label: string
}

export default component(
	'input-checkbox',
	{
		checked: asBoolean,
		label: asString(RESET),
	},
	(el, { first }) => [
		toggleAttribute('checked'),
		first(
			'input',
			setProperty('checked'),
			on('change', (e: Event) => {
				el.checked = (e.target as HTMLInputElement)?.checked
			}),
		),
		first('.label', setText('label')),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'input-checkbox': Component<InputCheckboxProps>
	}
}

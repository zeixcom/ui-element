import {
	type Component,
	RESET,
	asBoolean,
	asString,
	component,
	setProperty,
	setText,
} from '../../../'

export type BasicButtonProps = {
	disabled: boolean
	label: string
	badge: string
}

export default component(
	'basic-button',
	{
		disabled: asBoolean,
		label: asString(RESET),
		badge: asString(RESET),
	},
	(_, { first }) => [
		first('button', setProperty('disabled')),
		first('.label', setText('label')),
		first('.badge', setText('badge')),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'basic-button': Component<BasicButtonProps>
	}
}

import {
	asBoolean,
	asString,
	type Component,
	component,
	fromDOM,
	getLabel,
	getText,
	setProperty,
	setText,
} from '../../..'

export type BasicButtonProps = {
	disabled: boolean
	label: string
	badge: string
}

export default component(
	'basic-button',
	{
		disabled: asBoolean(),
		label: asString(getLabel('button')),
		badge: asString(fromDOM({ '.badge': getText() }, '')),
	},
	(_, { first }) => [
		first(
			'button',
			setProperty('disabled'),
			'Add native <button> as descendant.',
		),
		first('.label', setText('label')),
		first('.badge', setText('badge')),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'basic-button': Component<BasicButtonProps>
	}
}

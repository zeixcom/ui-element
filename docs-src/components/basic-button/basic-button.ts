import {
	type Component,
	asBoolean,
	asString,
	component,
	fromDOM,
	requireElement,
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
		label: asString(fromDOM('.label', target => target.textContent, '')),
		badge: asString(),
	},
	(el, { first }) => {
		requireElement(el, 'button')

		return [
			first('button', setProperty('disabled')),
			first('.label', setText('label')),
			first('.badge', setText('badge')),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'basic-button': Component<BasicButtonProps>
	}
}

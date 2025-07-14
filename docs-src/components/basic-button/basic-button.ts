import {
	type Component,
	asBoolean,
	asString,
	component,
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
		label: asString(
			el =>
				el.querySelector('.label')?.textContent ??
				(Array.from(el.childNodes)
					.filter(node => node.nodeType === Node.TEXT_NODE)
					.join() ||
					el.getAttribute('aria-label') ||
					''),
		),
		badge: asString(el => el.querySelector('.badge')?.textContent ?? ''),
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

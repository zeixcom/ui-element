import { type Component, component, setText, show } from '../../..'

export type BasicPluralizeProps = {
	count: number
}

component('basic-pluralize', { count: 0 }, (el, { first }) => [
	first('.count', [setText(() => String(el.count))]),
	first('.none', [show(() => el.count === 0)]),
	first('.some', [show(() => el.count > 0)]),
	first('.singular', [show(() => el.count === 1)]),
	first('.plural', [show(() => el.count > 1)]),
])

declare global {
	interface HTMLElementTagNameMap {
		'basic-pluralize': Component<BasicPluralizeProps>
	}
}

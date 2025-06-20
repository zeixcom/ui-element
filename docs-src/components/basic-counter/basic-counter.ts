import { type Component, asInteger, component, on, setText } from '../../..'

export type BasicCounterProps = {
	count: number
}

export default component(
	'basic-counter',
	{
		count: asInteger(),
	},
	(el, { first }) => [
		first('span', setText('count')),
		first(
			'button',
			on('click', () => {
				el.count++
			}),
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'basic-counter': Component<BasicCounterProps>
	}
}

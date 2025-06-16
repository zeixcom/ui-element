import {
	type Component,
	RESET,
	asInteger,
	component,
	on,
	setText,
} from '../../..'

export type MyCounterProps = {
	count: number
}

export default component(
	'my-counter',
	{
		count: asInteger(RESET),
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
		'my-counter': Component<MyCounterProps>
	}
}

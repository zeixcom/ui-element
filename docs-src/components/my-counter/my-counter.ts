import { type Component, asInteger, component, on, setText } from '../../../'

export type MyCounterProps = {
	count: number
}

export default component(
	'my-counter',
	{
		count: asInteger(),
	},
	(el, { first }) => [
		first('.count', setText('count')),
		first(
			'.parity',
			setText(() => (el.count % 2 ? 'odd' : 'even')),
		),
		first(
			'.increment',
			on('click', () => {
				el.count++
			}),
		),
		first(
			'.decrement',
			on('click', () => {
				el.count--
			}),
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'my-counter': Component<MyCounterProps>
	}
}

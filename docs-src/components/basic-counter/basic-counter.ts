import {
	type Component,
	asInteger,
	component,
	fromDOM,
	fromEvents,
	getText,
	setText,
} from '../../..'

export type BasicCounterProps = {
	count: number
}

export default component(
	'basic-counter',
	{
		count: fromEvents(fromDOM('span', getText(asInteger())), 'button', {
			click: ({ value }) => ++value,
		}),
	},
	(_, { first }) => [first('span', setText('count'))],
)

declare global {
	interface HTMLElementTagNameMap {
		'basic-counter': Component<BasicCounterProps>
	}
}

import {
	asInteger,
	type Component,
	component,
	fromDOM,
	fromEvents,
	getText,
	setText,
} from '../../..'

export type BasicCounterProps = {
	readonly count: number
}

export default component(
	'basic-counter',
	{
		count: fromEvents(fromDOM(asInteger(), { span: getText() }), 'button', {
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

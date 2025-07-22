import {
	type Component,
	asInteger,
	component,
	fromEvents,
	setText,
} from '../../..'

export type BasicCounterProps = {
	readonly count: number
}

export default component(
	'basic-counter',
	{
		count: fromEvents(
			el => asInteger()(el, el.querySelector('span')?.textContent),
			'button',
			{
				click: ({ value }) => ++value,
			},
		),
	},
	(_, { first }) => [first('span', setText('count'))],
)

declare global {
	interface HTMLElementTagNameMap {
		'basic-counter': Component<BasicCounterProps>
	}
}

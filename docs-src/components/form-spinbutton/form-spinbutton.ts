import {
	asInteger,
	type Component,
	component,
	fromDOM,
	fromEvents,
	getText,
	setProperty,
	setText,
	show,
} from '../../..'

export type FormSpinbuttonProps = {
	readonly value: number
}

export default component<FormSpinbuttonProps>(
	'form-spinbutton',
	{
		value: fromEvents<number>(
			'button',
			{
				click: ({ target, value }) =>
					value + (target.classList.contains('decrement') ? -1 : 1),
				keydown: ({ event, value }) => {
					const { key } = event as KeyboardEvent
					if (['ArrowUp', 'ArrowDown', '-', '+'].includes(key)) {
						event.stopPropagation()
						event.preventDefault()
						return (
							value +
							(key === 'ArrowDown' || key === '-' ? -1 : 1)
						)
					}
				},
			},
			fromDOM({ '.value': getText() }, asInteger()),
		),
	},
	(el, { first }) => {
		const zeroLabel = el.getAttribute('zero-label') || 'Add to Cart'
		const incrementLabel = el.getAttribute('increment-label') || 'Increment'
		const max = asInteger(9)(el, el.getAttribute('max'))
		const nonZero = () => el.value !== 0

		return [
			first('.value', [setText('value'), show(nonZero)]),
			first('.decrement', show(nonZero)),
			first('button.increment', [
				setText(() => (nonZero() ? '+' : zeroLabel)),
				setProperty('ariaLabel', () =>
					nonZero() ? incrementLabel : zeroLabel,
				),
				setProperty('disabled', () => el.value >= max),
			]),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-spinbutton': Component<FormSpinbuttonProps>
	}
}

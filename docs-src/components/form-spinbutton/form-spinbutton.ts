import {
	type Component,
	asInteger,
	component,
	fromDOM,
	fromEvents,
	getText,
	setProperty,
	setText,
	show,
} from '../../..'

export type FormSpinbuttonProps = {
	value: number
}

const clickHandler = ({ target, value }) =>
	value + (target.classList.contains('decrement') ? -1 : 1)

const keydownHandler = ({ event, value }) => {
	const { key } = event as KeyboardEvent
	if (['ArrowUp', 'ArrowDown', '-', '+'].includes(key)) {
		event.stopPropagation()
		event.preventDefault()
		return value + (key === 'ArrowDown' || key === '-' ? -1 : 1)
	}
}

export default component(
	'form-spinbutton',
	{
		value: fromEvents(
			fromDOM(asInteger(), { '.value': getText() }),
			'button',
			{
				click: clickHandler,
				keydown: keydownHandler,
			},
		),
	},
	(el, { first }) => {
		const zeroLabel = el.getAttribute('zero-label') || 'Add to Cart'
		const incrementLabel = el.getAttribute('increment-label') || 'Increment'
		const max = asInteger(9)(el, el.getAttribute('max'))
		const nonZero = () => el.value !== 0

		return [
			first('.value', setText('value'), show(nonZero)),
			first('.decrement', show(nonZero)),
			first<HTMLButtonElement>(
				'.increment',
				setText(() => (nonZero() ? '+' : zeroLabel)),
				setProperty('ariaLabel', () =>
					nonZero() ? incrementLabel : zeroLabel,
				),
				setProperty('disabled', () => el.value >= max),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-spinbutton': Component<FormSpinbuttonProps>
	}
}

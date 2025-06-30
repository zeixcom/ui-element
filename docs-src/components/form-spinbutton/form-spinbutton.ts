import {
	type Component,
	asInteger,
	component,
	on,
	setProperty,
	setText,
	show,
} from '../../../'

export type FormSpinbuttonProps = {
	value: number
}

export default component(
	'form-spinbutton',
	{
		value: asInteger(),
	},
	(el, { all, first }) => {
		const zeroLabel = el.getAttribute('zero-label') || 'Add to Cart'
		const incrementLabel = el.getAttribute('increment-label') || 'Increment'
		const max = asInteger(9)(el, el.getAttribute('max'))
		const nonZero = () => el.value !== 0

		return [
			first<HTMLButtonElement>('.value', setText('value'), show(nonZero)),
			first<HTMLButtonElement>(
				'.decrement',
				show(nonZero),
				on('click', () => {
					el.value--
				}),
			),
			first<HTMLButtonElement>(
				'.increment',
				setText(() => (nonZero() ? '+' : zeroLabel)),
				setProperty('ariaLabel', () =>
					nonZero() ? incrementLabel : zeroLabel,
				),
				setProperty('disabled', () => el.value >= max),
				on('click', () => {
					el.value++
				}),
			),
			all(
				'button',
				on('keydown', (e: Event) => {
					const { key } = e as KeyboardEvent
					if (['ArrowUp', 'ArrowDown', '-', '+'].includes(key)) {
						e.stopPropagation()
						e.preventDefault()
						if (key === 'ArrowDown' || key === '-') el.value--
						if (key === 'ArrowUp' || key === '+') el.value++
					}
				}),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-spinbutton': Component<FormSpinbuttonProps>
	}
}

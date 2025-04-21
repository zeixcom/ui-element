import { asInteger, component, first, on, setProperty, setText, toggleAttribute } from '../../../'

export type SpinButtonProps = {
	value: number
}

const SpinButton = component('spin-button', {
	value: asInteger(),
}, el => {
	const zeroLabel = el.getAttribute('zero-label') || 'Add to Cart'
	const incrementLabel = el.getAttribute('increment-label') || 'Increment'
	const max = asInteger(9)(el, el.getAttribute('max'))
	const isZero = el.getSignal('value').map(v => v === 0)
	return [
		first<HTMLElement, SpinButtonProps>('.value',
			setText('value'),
			setProperty('hidden', isZero)
		),
		first<HTMLElement, SpinButtonProps>('.decrement',
			setProperty('hidden', isZero),
			on('click', () => { el.value-- })
		),
		first('.increment',
			setText(isZero.map(v => v ? zeroLabel : '+')),
			setProperty('ariaLabel', isZero.map(v => v ? zeroLabel : incrementLabel)),
			toggleAttribute('disabled', () => el.value >= max),
			on('click', () => { el.value++ })
		)
	]
})

declare global {
	interface HTMLElementTagNameMap {
		'spin-button': typeof SpinButton
	}
}

export default SpinButton
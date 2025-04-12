import { type SignalProducer, asInteger, component, on, setProperty, setText, toggleAttribute } from '../../../'

export type SpinButtonProps = {
	value: number
	zero: boolean
}

const SpinButton = component('spin-button', {
	value: asInteger(),
	zero: (el => () => el.value === 0) as SignalProducer<boolean, typeof SpinButton>,
}, el => {
	const zeroLabel = el.getAttribute('zero-label') || 'Add to Cart'
	const incrementLabel = el.getAttribute('increment-label') || 'Increment'
	const max = asInteger(9)(el, el.getAttribute('max'))
	el.first<HTMLElement>('.value',
		setText('value'),
		setProperty('hidden', 'zero')
	)
	el.first<HTMLElement>('.decrement',
		setProperty('hidden', 'zero'),
		on('click', () => { el.value-- })
	)
	el.first('.increment',
		setText(() => el.zero ? zeroLabel : '+'),
		setProperty('ariaLabel', () => el.zero ? zeroLabel : incrementLabel),
		toggleAttribute('disabled', () => el.value >= max),
		on('click', () => { el.value++ })
	)
})

declare global {
	interface HTMLElementTagNameMap {
		'spin-button': typeof SpinButton
	}
}

export default SpinButton
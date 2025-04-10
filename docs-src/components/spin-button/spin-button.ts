import { asInteger, component, on, setProperty, setText, toggleAttribute } from '../../../'

export default component('spin-button', {
	value: asInteger(),
	zero: el => () => el.value === 0
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

import { asInteger, asIntegerWithDefault, component, computed, setProperty, setText, toggleAttribute } from "../../../index"

export const SpinButton = component('spin-button', {
	count: asInteger,
}, (host, { count }) => {
	const isZero = computed(() => count.get() === 0)
	const zeroLabel = host.getAttribute('zero-label') || 'Add to Cart'
	const incrementLabel = host.getAttribute('increment-label') || 'Increment'
	const max = asIntegerWithDefault(9)(host.getAttribute('max'))

	host.first('.count').sync(
		setText(String(count)),
		toggleAttribute('hidden', isZero)
	)

	host.first('.decrement')
		.on('click', () => { count.update(v => --v) })
		.sync(toggleAttribute('hidden', isZero))

	host.first('.increment')
		.on('click', () => { count.update(v => ++v) })
		.sync(
			setText(() => isZero.get() ? zeroLabel : '+'),
			setProperty('ariaLabel', () => isZero.get() ? zeroLabel : incrementLabel),
			toggleAttribute('disabled', () => count.get() >= max)
		)
})

export type SpinButtonStates = typeof SpinButton
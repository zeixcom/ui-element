import { type Provider, all, component, first, on, state, toggleClass } from '../../../'


const MySlider = component('my-slider', {}, el => {
	const active = state(0)
	const total = el.querySelectorAll('.slide').length
	const isActiveProvider: Provider<boolean> = (_, index) => active.get() === index
	return [
		first('.prev', on('click', () => {
			active.update(v => (v - 1 + total) % total)
		})),
		first('.next', on('click', () => {
			active.update(v => (v + 1 + total) % total)
		})),
		all('.slide', toggleClass('active', isActiveProvider)),
		all('.dots span', toggleClass('active', isActiveProvider))
	]
})

declare global {
	interface HTMLElementTagNameMap {
		'my-slider': typeof MySlider
	}
}

export default MySlider
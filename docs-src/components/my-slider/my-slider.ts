import { all, component, first, on, State, toggleClass } from '../../../'

export type MySliderProps = {
	active: number
}

const MySlider = component('my-slider', {
	active: 0
}, el => {
	const total = el.querySelectorAll('.slide').length
	return [
		first('.prev', on('click', () => {
			(el.getSignal('active') as State<number>).update(v => (v - 1 + total) % total)
		})),
		first('.next', on('click', () => {
			(el.getSignal('active') as State<number>).update(v => (v + 1 + total) % total)
		})),
		all('.slide', toggleClass('active', (_, index) => el.active === index)),
		all('.dots span', toggleClass('active', (_, index) => el.active === index))
	]
})

declare global {
	interface HTMLElementTagNameMap {
		'my-slider': typeof MySlider
	}
}

export default MySlider
import { component, on, State, toggleClass } from '../../../'

export type MySliderProps = {
	active: number
}

const MySlider = component('my-slider', {
	active: 0
}, el => {
	const total = el.querySelectorAll('.slide').length
	el.first('.prev', on('click', () => {
		(el.get('active') as State<number>).update(v => (v - 1 + total) % total)
	}))
	el.first('.next', on('click', () => {
		(el.get('active') as State<number>).update(v => (v + 1 + total) % total)
	}))
	el.all('.slide', toggleClass('active', (_, index) => el.active === index))
	el.all('.dots span', toggleClass('active', (_, index) => el.active === index))
})

declare global {
	interface HTMLElementTagNameMap {
		'my-slider': typeof MySlider
	}
}

export default MySlider
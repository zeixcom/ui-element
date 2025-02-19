import { component, toggleClass, UIElement } from "../../../"

export const MySlider = component('my-slider', {
	active: 0, // Initialize state for the active slide index
}, (host, { active }) => {

	// Event listeners for navigation
	const total = host.querySelectorAll('.slide').length
	const setNextSlide = (direction: number) => () => {
		active.update(v => (v + direction + total) % total)
	}
	host.first('.prev').on('click', setNextSlide(-1))
	host.first('.next').on('click', setNextSlide(1))

	// Effects for updating slides and dots
	const toggleActiveClass = (
		host: UIElement,
		target: Element,
		index: number
	) => toggleClass('active', () => active.get() === index)(host, target)
	host.all('.slide').sync(toggleActiveClass)
	host.all('.dots span').sync(toggleActiveClass)
})
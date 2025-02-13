import { toggleClass, UIElement } from "@zeix/ui-element"

export class MySlider extends UIElement {
	static states = {
		active: 0, // Initialize state for the active slide index
	}

	connectedCallback() {
		super.connectedCallback()

		// Event listeners for navigation
		const total = this.querySelectorAll('.slide').length
		const setNextSlide = (direction: number) => () => {
			this.set('active', (v: number = 0) => (v + direction + total) % total)
		}
		this.first('.prev').on('click', setNextSlide(-1))
		this.first('.next').on('click', setNextSlide(1))
	
		// Effects for updating slides and dots
		const toggleActiveClass = (host: UIElement, target: Element, index: number) =>
			toggleClass('active', () => this.get('active') === index)(host, target)
		this.all('.slide').sync(toggleActiveClass)
		this.all('.dots span').sync(toggleActiveClass)
	}
}
MySlider.define('my-slider')
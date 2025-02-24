import { toggleClass, UIElement } from "../../../"

export class MySlider extends UIElement<{ active: number }> {
	static localName ='my-slider'

	states = {
        active: 0,
    }

	connectedCallback() {
		super.connectedCallback()

        // Event listeners for navigation
		const total = this.querySelectorAll('.slide').length
		const setNextSlide = (direction: number) => () => {
			this.set('active', v => (v + direction + total) % total)
		}
		this.first('.prev').on('click', setNextSlide(-1))
		this.first('.next').on('click', setNextSlide(1))

		// Effects for updating slides and dots
		const toggleActiveClass = (
			host: UIElement,
			target: Element,
			index: number
		) => toggleClass('active', () => this.get('active') === index)(host, target)
		this.all('.slide').sync(toggleActiveClass)
		this.all('.dots span').sync(toggleActiveClass)
	}
}
MySlider.define()
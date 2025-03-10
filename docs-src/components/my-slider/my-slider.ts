import { type SignalValueProvider, toggleClass, UIElement } from "../../../"

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
		const getActiveByIndex: SignalValueProvider<boolean> = (_, index) =>
			this.get('active') === index
		this.all('.slide').sync(toggleClass('active', getActiveByIndex))
		this.all('.dots span').sync(toggleClass('active', getActiveByIndex))
	}
}
MySlider.define()
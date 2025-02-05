import { toggleClass, UIElement } from "@zeix/ui-element"

// Pure functions
const getNewIndex = (prev: number = 0, direction: number, total: number) =>
	(prev + direction + total) % total

export class MySlider extends UIElement {
	connectedCallback() {

		// Initialize state for the active slide index
		this.set('active', 0)

		// Event listeners for navigation
		const total = this.querySelectorAll('.slide').length
		this.first('.prev').on('click', () => {
			this.set('active', (v?: number) => getNewIndex(v, -1, total))
		})
		this.first('.next').on('click', () => {
			this.set('active', (v?: number) => getNewIndex(v, 1, total))
		})
	
		// Auto-effects for updating slides and dots
		this.all('.slide').sync((host, target, index) => toggleClass(
			'active',
			() => index === this.get('active')
		)(host, target))
		this.all('.dots span').sync((host, target, index) => toggleClass(
			'active',
			() => index === this.get('active')
		)(host, target))
	}
}
MySlider.define('my-slider')
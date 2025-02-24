import { asInteger, setAttribute, setText, UIElement } from "../../..";

export class RatingStars extends UIElement<{ value: number }> {
	static localName = 'rating-stars'
	static observedAttributes = ['value']

	states = {
        value: asInteger,
    }

	connectedCallback() {
        super.connectedCallback()

		this.all('input')
			.sync((host, target, index) => {
				const label = target.nextElementSibling
				if (label) setText(
					() => index < this.get('value') ? '★' : '☆'
				)(host, label)
				setAttribute(
					'checked',
					() => String(this.get('value') === index + 1)
				)(host, target)
			})
			.on('change', (_target, index) => (e: Event) => {
				e.stopPropagation()
				this.set('value', index + 1)
				this.self.emit('change-rating', index + 1)
			})
    }
}
RatingStars.define()
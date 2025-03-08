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
			.on('change', (_, index) => (e: Event) => {
				e.stopPropagation()
				this.set('value', index + 1)
				this.self.emit('change-rating', index + 1)
			})
			.sync(setAttribute('checked', (_, index) => String(this.get('value') === index + 1)))
		
		this.all('.label')
			.sync(setText((_, index) => index < this.get('value') ? '★' : '☆'))
    }
}
RatingStars.define()
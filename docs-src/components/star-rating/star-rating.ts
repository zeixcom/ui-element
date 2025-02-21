import { asInteger, setProperty, UIElement } from "../../..";

export class StarRating extends UIElement<{ value: number }> {
	static localName = 'star-rating'
	static observedAttributes = ['value']

	states = {
        value: asInteger,
    }

	connectedCallback() {
        super.connectedCallback()

		this.all('button')
			.sync((host, target, index) =>
				setProperty('ariaPressed', () => String(this.get('value') > index)
			)(host, target))
			.on('click', (_target, index) => () => {
				this.set('value', index + 1)
				this.self.emit('change-rating', index + 1)
			})
    }
}
StarRating.define()
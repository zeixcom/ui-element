import { asInteger, asIntegerWithDefault, setProperty, setText, toggleAttribute, UIElement } from '../../../'

export class SpinButton extends UIElement<{
	value: number,
	zero: boolean,
}> {
	static localName ='spin-button'
	static observedAttributes = ['value']

	states = {
        value: asInteger,
		zero: () => this.get('value') === 0
    }

	connectedCallback() {
        super.connectedCallback()

		const zeroLabel = this.getAttribute('zero-label') || 'Add to Cart'
		const incrementLabel = this.getAttribute('increment-label') || 'Increment'
		const max = asIntegerWithDefault(9)(this.getAttribute('max'))

		// Event handlers
		const changeValue = (direction: number = 1) => () => {
			this.set('value', v => v + direction)
		}

		// Effects
		this.first('.value')
			.sync(setText('value'), setProperty('hidden', 'zero'))
		this.first('.decrement')
			.on('click', changeValue(-1))
			.sync(setProperty('hidden', 'zero'))
		this.first('.increment')
			.on('click', changeValue())
			.sync(
				setText(() => this.get('zero') ? zeroLabel : '+'),
				setProperty('ariaLabel', () => this.get('zero') ? zeroLabel : incrementLabel),
				toggleAttribute('disabled', () => this.get('value') >= max)
			)
    }
}
SpinButton.define()

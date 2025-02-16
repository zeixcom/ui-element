import { asInteger, setProperty, setText, toggleAttribute, UIElement } from "../../../index";

export class SpinButton extends UIElement {
	static observedAttributes = ['count'];
	static states = {
		count: asInteger,
	}

	connectedCallback(): void {
		super.connectedCallback()
		
		const zeroLabel = this.getAttribute('zero-label') || 'Add to Cart'
		const incrementLabel = this.getAttribute('increment-label') || 'Increment'
		const max = this.getAttribute('max') ? parseInt(this.getAttribute('max')!) : 9
		this.set('isZero', () => this.get('count') === 0)

		this.first('.count').sync(
			setText('count'),
			toggleAttribute('hidden', 'isZero')
		)

		this.first('.decrement')
		    .on('click', () => {
                this.set('count', (v?: number) => null != v && v > 0 ? --v : 0)
            })
			.sync(toggleAttribute('hidden', 'isZero'))

		this.first('.increment')
		    .on('click', () => {
                this.set('count', (v?: number) => null != v ? ++v : 1)
            })
			.sync(
				setText(() => this.get('isZero') ? zeroLabel : '+'),
				setProperty('ariaLabel', () => this.get('isZero') ? zeroLabel : incrementLabel),
				toggleAttribute('disabled', () => this.get<number>('count') >= max)
			)

	}
}
SpinButton.define('spin-button')
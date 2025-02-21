import { asInteger, setText, UIElement } from '../../../'

export class MyCounter extends UIElement<{ count: number }> {
	static localName ='my-counter'
	static observedAttributes = ['count']

	states = {
        count: asInteger,
    }

	connectedCallback() {
        super.connectedCallback()

		// Event handlers
		this.first('.increment').on('click', () => {
			this.set('count', v => ++v)
		})
		this.first('.decrement').on('click', () => {
			this.set('count', v => --v)
		})

		// Effects
		this.first('.count').sync(setText('count'))
		this.first('.parity').sync(setText(() => this.get('count') % 2 ? 'odd' : 'even'))
    }
}
MyCounter.define()
import { asInteger, InferSignalType, setText, UIElement } from "../../../index"

export class MyCounter extends UIElement {
	static observedAttributes = ['count']
	static states = {
		count: asInteger
	}

	connectedCallback() {
		super.connectedCallback()

		const a: InferSignalType<typeof this.signals.count> = 3

		this.set('parity', () => this.get<number>('count') % 2 ? 'odd' : 'even')
		this.first('.increment').on('click', () => {
			this.set('count', (v?: number) => null != v ? ++v : 1)
		})
		this.first('.decrement').on('click', () => {
			this.set('count', (v?: number) => null != v ? --v : 0)
		})
		this.first('.count').sync(setText('count'))
		this.first('.parity').sync(setText('parity'))
	}
}
MyCounter.define('my-counter')
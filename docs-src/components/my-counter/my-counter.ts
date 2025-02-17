import { asInteger, setText, UIElement } from "../../../index"

export class MyCounter extends UIElement {
	static observedAttributes = ['count']
	static states = {
		value: 42,
		count: asInteger
	} as const

	connectedCallback() {
		super.connectedCallback()
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
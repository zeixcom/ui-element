import { asInteger, setText, UIElement } from "@zeix/ui-element"

export class MyCounter extends UIElement {
	static observedAttributes = ['count']
	static states = {
		count: asInteger
	}

	connectedCallback() {
		this.set('parity', () => (this.get<number>('count') ?? 0) % 2 ? 'odd' : 'even')
		const setCount = (direction: number, fallback: number = 0) => () => {
			this.set('count', (v?: number) => (null != v ? v + direction : fallback))
		}
		this.first('.increment').on('click', setCount(1, 1))
		this.first('.decrement').on('click', setCount(-1))
		this.first('.count').sync(setText('count'))
		this.first('.parity').sync(setText('parity'))
	}
}
MyCounter.define('my-counter')
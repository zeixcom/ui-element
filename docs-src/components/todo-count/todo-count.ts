import { setProperty, setText, UIElement } from "@zeix/ui-element"

export class TodoCount extends UIElement {
	static states = {
		active: 0
	}

	connectedCallback() {
		super.connectedCallback()
		this.first('.count').sync(setText('active'))
		const setAriaHidden = (fn: (n: number) => boolean) =>
			setProperty('ariaHidden', () => fn(this.get('active') as number))
		this.first('.singular').sync(setAriaHidden(n => n > 1))
		this.first('.plural').sync(setAriaHidden(n => n === 1))
		this.first('.remaining').sync(setAriaHidden(n => !n))
		this.first('.all-done').sync(setAriaHidden(n => !!n))
	}
}
TodoCount.define('todo-count')

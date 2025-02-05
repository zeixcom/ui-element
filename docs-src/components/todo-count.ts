import { setProperty, setText, UIElement } from "@zeix/ui-element"

export class TodoCount extends UIElement {
	static states = {
		active: 0
	}

	connectedCallback() {
		this.first('.count').sync(setText('active'))
		this.first('.singular').sync(setProperty('ariaHidden', () => this.get('active') as number > 1))
		this.first('.plural').sync(setProperty('ariaHidden', () => this.get('active') === 1))
		this.first('.remaining').sync(setProperty('ariaHidden', () => !this.get('active')))
		this.first('.all-done').sync(setProperty('ariaHidden', () => !!this.get('active')))
	}
}
TodoCount.define('todo-count')

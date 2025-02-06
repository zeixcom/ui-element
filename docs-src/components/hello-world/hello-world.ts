import { setText, UIElement } from "@zeix/ui-element"

export class HelloWorld extends UIElement {
	connectedCallback() {
		this.first('span').sync(setText('name'))
		this.first('input').on('input', (e: Event) => {
			this.set('name', (e.target as HTMLInputElement)?.value || undefined)
		})
	}
}
HelloWorld.define('hello-world')
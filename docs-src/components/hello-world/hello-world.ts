import { setText, UIElement, RESET } from "../../../"

export class HelloWorld extends UIElement {
	static localName = 'hello-world'

	connectedCallback() {
        this.first('span').sync(setText('name'))
		this.first('input').on('input', (e: Event) => {
			this.set('name', (e.target as HTMLInputElement)?.value || RESET)
		})
	}
}
HelloWorld.define()
import { asBoolean, setProperty, setText, UIElement } from "../../../index"

export class InputButton extends UIElement {
	static observedAttributes = ['disabled']
	static states = {
		disabled: asBoolean
	}

	connectedCallback() {
		this.first('button').sync(
			setText('label'),
			setProperty('disabled')
		)
	}
}
InputButton.define('input-button')

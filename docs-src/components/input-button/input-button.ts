import { UIElement, asBoolean, setProperty, setText } from "../../../"

export class InputButton extends UIElement<{ disabled: boolean }> {
	static localName = 'input-button'
	static observedAttributes = ['disabled']

	init = {
        disabled: asBoolean,
    }

	connectedCallback() {
        super.connectedCallback()

		this.first<HTMLButtonElement>('button').sync(setProperty('disabled'))
		this.first('.label').sync(setText('label'))
		this.first('.badge').sync(setText('badge'))
    }
}
InputButton.define()
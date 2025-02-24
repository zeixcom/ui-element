import { asBoolean, setProperty, setText, UIElement } from "../../../"

export class InputButton extends UIElement<{
    disabled: boolean,
	label?: string,
    badge?: string,
}> {
	static localName = 'input-button'
	static observedAttributes = ['disabled']

	states = {
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
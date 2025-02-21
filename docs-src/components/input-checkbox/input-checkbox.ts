import { UIElement, asBoolean, setProperty, toggleAttribute } from "../../../"

export class InputCheckbox extends UIElement<{ checked: boolean }> {
	static localName = 'input-checkbox'
	static observedAttributes = ['checked']

	states = {
		checked: asBoolean
	}

	connectedCallback() {
		super.connectedCallback()

		this.first<HTMLInputElement>('input')
			.sync(setProperty('checked'))
			.on('change', (e: Event) => {
				this.set('checked', (e.target as HTMLInputElement)?.checked)
			})
		this.self.sync(toggleAttribute('checked'))
	}
}
InputCheckbox.define()
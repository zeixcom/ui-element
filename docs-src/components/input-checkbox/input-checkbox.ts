import { asBoolean, setProperty, toggleAttribute, UIElement } from "@zeix/ui-element"

export class InputCheckbox extends UIElement {
	static observedAttributes = ['checked']
	static states = {
		checked: asBoolean
	}

	connectedCallback() {
		this.first('input')
			.on('change', (e: Event) => {
				this.set('checked', Boolean((e.target as HTMLInputElement)?.checked))
			})
			.sync(setProperty('checked'))
		this.self.sync(toggleAttribute('checked'))
	}
}
InputCheckbox.define('input-checkbox')
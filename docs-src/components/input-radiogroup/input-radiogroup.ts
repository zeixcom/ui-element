import { asString, setAttribute, toggleClass, UIElement } from "../../../"

export class InputRadiogroup extends UIElement<{ value: string }> {
	static localName = 'input-radiogroup'
	static observedAttributes = ['value']

	states = {
        value: asString
    }

	connectedCallback() {
        super.connectedCallback()

		this.self.sync(setAttribute('value'))
		this.all('input').on('change', (e: Event) => {
			this.set('value', (e.target as HTMLInputElement)?.value)
		})
		this.all('label').sync((host, target) => {
			toggleClass(
				'selected',
				() => this.get('value') === target.querySelector('input')?.value
			)(host, target)
		})
    }
}
InputRadiogroup.define()
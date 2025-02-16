import { setAttribute, toggleClass, UIElement } from "../../../index"

export class InputRadiogroup extends UIElement {
	static observedAttributes = ['value']

	connectedCallback() {
		this.self.sync(setAttribute('value'))
		this.all('input').on('change', (e: Event) => {
			this.set('value', (e.target as HTMLInputElement)?.value)
		})
		this.all('label').sync((host, target) => toggleClass(
			'selected',
			() => host.get('value') === target.querySelector('input')?.value
		)(host, target))
	}
}
InputRadiogroup.define('input-radiogroup')

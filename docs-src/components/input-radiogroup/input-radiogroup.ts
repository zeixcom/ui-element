import {
	type SignalValueProvider,
	asString, setAttribute, toggleClass, UIElement
} from '../../../'

export class InputRadiogroup extends UIElement<{ value: string }> {
	static localName = 'input-radiogroup'
	static observedAttributes = ['value']

	states = {
        value: asString()
    }

	connectedCallback() {
        super.connectedCallback()

		this.self.sync(setAttribute('value'))
		this.all('input').on('change', (e: Event) => {
			this.set('value', (e.target as HTMLInputElement)?.value)
		})
		const getSelectedByElement: SignalValueProvider<boolean> =
			target => this.get('value') === target.querySelector('input')?.value
		this.all('label')
			.sync(toggleClass('selected', getSelectedByElement))
    }
}
InputRadiogroup.define()
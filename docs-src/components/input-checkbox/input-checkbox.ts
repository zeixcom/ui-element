import { asBoolean, component, setProperty, toggleAttribute } from "../../../index"

export const InputCheckbox = component('input-checkbox', {
	checked: asBoolean
}, host => {
	host.first('input')
		.on('change', (e: Event) => {
			host.set('checked', (e.target as HTMLInputElement)?.checked)
		})
		.sync(setProperty('checked'))
	host.self.sync(toggleAttribute('checked'))
})
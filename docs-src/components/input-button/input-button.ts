import { asBoolean, component, setProperty, setText } from "../../../index"

export const InputButton = component('input-button', {
	disabled: asBoolean
}, host => {
	host.first('button').sync(
		setText('label'),
		setProperty('disabled')
	)
})

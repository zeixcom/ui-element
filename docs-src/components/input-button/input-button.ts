import { asBoolean, asString, component, RESET, setProperty, setText } from '../../../'

export default component('input-button', {
	disabled: asBoolean,
	label: asString(RESET),
	badge: asString(RESET)
}, el => {
	el.first<HTMLButtonElement>('button', setProperty('disabled'))
	el.first('.label', setText('label'))
	el.first('.badge', setText('badge'))
})
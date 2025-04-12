import { asBoolean, asString, component, RESET, setProperty, setText } from '../../../'

export type InputButtonProps = {
	disabled: boolean
	label: string
	badge: string
}

const InputButton = component('input-button', {
	disabled: asBoolean,
	label: asString(RESET),
	badge: asString(RESET)
}, el => {
	el.first<HTMLButtonElement>('button', setProperty('disabled'))
	el.first('.label', setText('label'))
	el.first('.badge', setText('badge'))
})

declare global {
	interface HTMLElementTagNameMap {
		'input-button': typeof InputButton
	}
}

export default InputButton
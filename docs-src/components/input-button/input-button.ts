import { asBoolean, asString, component, first, RESET, setProperty, setText } from '../../../'

export type InputButtonProps = {
	disabled: boolean
	label: string
	badge: string
}

const InputButton = component('input-button', {
	disabled: asBoolean,
	label: asString(RESET),
	badge: asString(RESET)
}, () => [
	first<HTMLButtonElement, InputButtonProps>('button', setProperty('disabled')),
	first('.label', setText('label')),
	first('.badge', setText('badge'))
])

declare global {
	interface HTMLElementTagNameMap {
		'input-button': typeof InputButton
	}
}

export default InputButton
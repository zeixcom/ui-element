import { asBoolean, asString, component, first, RESET, setProperty, setText } from '../../../'

type InputButtonProps = {
	disabled: boolean,
	label: string,
	badge: string
}

export const InputButton = component<InputButtonProps>('input-button', {
	disabled: asBoolean,
	label: asString(RESET),
	badge: asString(RESET)
}, () => [
	first<HTMLButtonElement, InputButtonProps>('button', setProperty('disabled')),
	first('.label', setText('label')),
	first('.badge', setText('badge'))
])
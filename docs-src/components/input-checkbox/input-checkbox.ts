import { asBoolean, asString, component, first, on, RESET, setProperty, setText, toggleAttribute } from '../../../'

export type InputCheckboxProps = {
	checked: boolean,
	label: string
}

const InputCheckbox = component('input-checkbox', {
	checked: asBoolean,
	label: asString(RESET)
}, el => [
	toggleAttribute('checked'),
	first('input',
		setProperty('checked'),
		on('change', (e: Event) => {
			el.checked = (e.target as HTMLInputElement)?.checked
		})
	),
	first('.label', setText('label'))
])

declare global {
	interface HTMLElementTagNameMap {
		'input-checkbox': typeof InputCheckbox
	}
}

export default InputCheckbox
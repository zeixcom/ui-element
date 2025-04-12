import { asBoolean, component, on, setProperty, toggleAttribute } from '../../../'

export type InputCheckboxProps = {
	checked: boolean
}

const InputCheckbox = component('input-checkbox', {
	checked: asBoolean
}, el => {
	el.self(toggleAttribute('checked'))
	el.first<HTMLInputElement>('input',
		setProperty('checked'),
		on('change', (e: Event) => {
			el.checked = (e.target as HTMLInputElement)?.checked
		})
	)
})

declare global {
	interface HTMLElementTagNameMap {
		'input-checkbox': typeof InputCheckbox
	}
}

export default InputCheckbox
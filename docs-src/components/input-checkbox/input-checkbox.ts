import { asBoolean, component, first, on, setProperty, toggleAttribute } from "../../../"

type InputCheckboxProps = {
	checked: boolean
}

component('input-checkbox', {
	checked: asBoolean
}, host => [
	toggleAttribute('checked'),
	first<HTMLInputElement, InputCheckboxProps>('input',
		setProperty('checked'),
		on('change', (e: Event) => {
			host.checked = (e.target as HTMLInputElement)?.checked
		})
	)
])
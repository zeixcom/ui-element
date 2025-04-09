import { all, asString, component, on, setAttribute, toggleClass } from '../../../'

component('input-radiogroup', {
	value: asString()
}, host => [
	setAttribute('value'),
	all('input', on('change', (e: Event) => {
		host.value = (e.target as HTMLInputElement)?.value
	})),
	all('label',
		toggleClass('selected',
			target => host.value === target.querySelector('input')?.value
		)
	)
])
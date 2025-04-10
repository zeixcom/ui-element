import { asString, component, on, setAttribute, toggleClass } from '../../../'

export default component('input-radiogroup', {
	value: asString()
}, el => {
	el.self(setAttribute('value'))
	el.all('input', on('change', (e: Event) => {
		el.value = (e.target as HTMLInputElement)?.value
	}))
	el.all('label',
		toggleClass('selected',
			target => el.value === target.querySelector('input')?.value
		)
	)
})
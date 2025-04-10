import { asInteger, component, emit, on, setProperty, setText } from '../../../'

export default component('rating-stars',{
	value: asInteger(),
}, el => {
	el.all<HTMLInputElement>('input',
		setProperty('checked', (_, index) => el.value === index + 1),
		on('change', (_, index) => (e: Event) => {
			e.stopPropagation()
			el.value = index + 1
			emit('change-rating', index + 1)(el)
		})
	)
	el.all('.label', setText((_, index) => index < el.value ? '★' : '☆'))
})
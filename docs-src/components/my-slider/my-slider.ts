import { type Provider, component, on, State, toggleClass } from '../../../'

export default component('my-slider', {
	active: 0
}, el => {
	const total = el.querySelectorAll('.slide').length
	const getActiveByIndex: Provider<boolean> = (_, index) => el.active === index
	el.first('.prev', on('click', () => {
		(el.get('active') as State<number>).update(v => (v - 1 + total) % total)
	}))
	el.first('.next', on('click', () => {
		(el.get('active') as State<number>).update(v => (v + 1 + total) % total)
	}))
	el.all('.slide', toggleClass('active', getActiveByIndex))
	el.all('.dots span', toggleClass('active', getActiveByIndex))
})
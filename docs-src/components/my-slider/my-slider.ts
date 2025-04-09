import { type Provider, all, component, first, on, State, toggleClass } from "../../../"

component('my-slider', {
	active: 0
}, host => {
	const total = host.querySelectorAll('.slide').length
	const getActiveByIndex: Provider<boolean> = (_, index) => host.active === index
	return [
		first('.prev', on('click', () => {
			(host.get('active') as State<number>).update(v => (v - 1 + total) % total)
		})),
		first('.next', on('click', () => {
			(host.get('active') as State<number>).update(v => (v + 1 + total) % total)
		})),
		all('.slide', toggleClass('active', getActiveByIndex)),
		all('.dots span', toggleClass('active', getActiveByIndex))
	]
})
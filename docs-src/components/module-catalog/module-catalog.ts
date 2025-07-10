import { component, pass, reduced } from '../../..'

export default component('module-catalog', {}, (el, { first }) => {
	const total = reduced(
		el,
		'form-spinbutton',
		(sum, item) => sum + item.value,
		0,
	)

	return [
		first(
			'basic-button',
			pass({
				badge: () => (total.get() > 0 ? String(total.get()) : ''),
				disabled: () => !total.get(),
			}),
		),
	]
})

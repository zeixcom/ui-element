import { component, computed, pass } from '../../..'

export default component('module-catalog', {}, (_, { first, useElements }) => {
	const total = computed(() =>
		useElements(
			'form-spinbutton',
			'Add <form-spinbutton> components to calculate sum from.',
		).reduce((sum, item) => sum + item.value, 0),
	)
	return [
		first(
			'basic-button',
			pass({
				disabled: () => !total.get(),
				badge: () => (total.get() > 0 ? String(total.get()) : ''),
			}),
		),
	]
})

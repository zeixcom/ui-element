import { component, computed, pass } from '../../..'

import '../form-spinbutton/form-spinbutton'

export default component('module-catalog', {}, (_, { first, useElements }) => {
	const total = computed(() =>
		Array.from(useElements('form-spinbutton')).reduce(
			(sum, item) => sum + item.value,
			0,
		),
	)
	return [
		first('basic-button', [
			pass({
				disabled: () => !total.get(),
				badge: () => (total.get() > 0 ? String(total.get()) : ''),
			}),
		]),
	]
})

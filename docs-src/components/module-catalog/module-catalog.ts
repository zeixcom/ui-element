import { component, computed, setProperty } from '../../..'

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
			setProperty('disabled', () => !total.get()),
			setProperty('badge', () =>
				total.get() > 0 ? String(total.get()) : '',
			),
		]),
	]
})

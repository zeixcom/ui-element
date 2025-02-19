import { component, asInteger, setText } from "../../../index"

component('my-counter', {
	count: asInteger,
}, (host, { count }) => {

	// Event handlers
	host.first('.increment').on('click', () => {
		count.update(v => ++v)
	})
	host.first('.decrement').on('click', () => {
		count.update(v => --v)
	})

	// Effects
	host.first('.count').sync(setText(String(count)))
	host.first('.parity').sync(setText(() => count.get() % 2 ? 'odd' : 'even'))
})

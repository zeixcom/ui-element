import { asInteger, component, first, on, setText } from '../../../'

export type MyCounterProps = {
	count: number
}

const MyCounter = component('my-counter', {
	count: asInteger()
}, el => [
	first('.count', setText('count')),
	first('.parity', setText(() => el.count % 2 ? 'odd' : 'even')),
	first('.increment', on('click', () => { el.count++ })),
    first('.decrement', on('click', () => { el.count-- }))
])

declare global {
	interface HTMLElementTagNameMap {
		'my-counter': typeof MyCounter
	}
}

export default MyCounter
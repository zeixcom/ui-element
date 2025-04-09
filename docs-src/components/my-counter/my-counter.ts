import { asInteger, component, first, on, setText } from '../../../'

component('my-counter', {
	count: asInteger(),
}, host => [
	first('.count', setText('count')),
	first('.parity', setText(() => host.count % 2 ? 'odd' : 'even')),
	first('.increment', on('click', () => { host.count++ })),
    first('.decrement', on('click', () => { host.count-- }))
])
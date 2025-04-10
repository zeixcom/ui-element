import { asInteger, component, on, setText } from '../../../'

export default component('my-counter', {
	count: asInteger()
}, el => {
	el.first('.count', setText('count'))
	el.first('.parity', setText(() => el.count % 2 ? 'odd' : 'even'))
	el.first('.increment', on('click', () => { el.count++ }))
    el.first('.decrement', on('click', () => { el.count-- }))
})
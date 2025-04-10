import { component, on, RESET, setText } from '../../../'

export default component('hello-world', {
	name: RESET
}, el => {
	el.first('span', setText('name'))
	el.first('input', on('input', (e: Event) => {
		el.name = (e.target as HTMLInputElement)?.value || RESET
	}))
})
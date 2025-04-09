import { setText, RESET, component, first, on } from "../../../"

component('hello-world', {
	name: RESET
}, host => [
	first('span', setText('name')),
	first('input', on('input', (e: Event) => {
		host.name = (e.target as HTMLInputElement)?.value || RESET
	}))
])
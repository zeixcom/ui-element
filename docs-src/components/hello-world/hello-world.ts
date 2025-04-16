import { component, first, on, RESET, setText } from '../../../'

export type HelloWorldProps = {
	name: string
}

const HelloWorld = component('hello-world', {
	name: RESET
}, el => [
	first('span', setText('name')),
	first('input', on('input', (e: Event) => {
		el.name = (e.target as HTMLInputElement)?.value || RESET
	}))
])

declare global {
	interface HTMLElementTagNameMap {
		'hello-world': typeof HelloWorld
	}
}

export default HelloWorld
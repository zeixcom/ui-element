import { component, on, RESET, setText } from '../../../'

export type HelloWorldProps = {
	name: string
}

const HelloWorld = component('hello-world', {
	name: RESET
}, el => {
	el.first('span', setText('name'))
	el.first('input', on('input', (e: Event) => {
		el.name = (e.target as HTMLInputElement)?.value || RESET
	}))
})

declare global {
	interface HTMLElementTagNameMap {
		'hello-world': typeof HelloWorld
	}
}

export default HelloWorld
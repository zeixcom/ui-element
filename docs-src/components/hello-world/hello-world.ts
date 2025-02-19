import { component, setText } from "../../../index"

export const HelloWorld = component('hello-world', {
	name: 'World'
}, (host, { name }) => {
	host.first('span').sync(setText(name))
	host.first('input').on('input', (e: Event) => {
		host.set('name', (e.target as HTMLInputElement)?.value)
	})
})

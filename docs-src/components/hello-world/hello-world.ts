import { type Component, RESET, component, on, setText } from '../../../'

export type HelloWorldProps = {
	name: string
}

export default component(
	'hello-world',
	{
		name: RESET,
	},
	(el, { first }) => [
		first('span', setText('name')),
		first(
			'input',
			on({
				input: (e: Event) => {
					el.name = (e.target as HTMLInputElement)?.value || RESET
				},
			}),
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'hello-world': Component<HelloWorldProps>
	}
}

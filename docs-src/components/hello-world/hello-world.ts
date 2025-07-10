import {
	type Component,
	RESET,
	asString,
	component,
	on,
	requireDescendant,
	setText,
} from '../../..'

export type HelloWorldProps = {
	name: string
}

export default component(
	'hello-world',
	{
		name: asString(RESET),
	},
	(el, { first }) => {
		requireDescendant(el, 'span')

		return [
			first(
				'input',
				on('input', e => {
					el.name = (e.target as HTMLInputElement).value || RESET
				}),
			),
			first('span', setText('name')),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'hello-world': Component<HelloWorldProps>
	}
}

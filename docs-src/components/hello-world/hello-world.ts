import {
	type Component,
	RESET,
	asString,
	component,
	on,
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
	(_, { first }) => [
		first(
			'input',
			on('input', ({ target }) => ({ name: target.value || RESET })),
			'Needed to input the name.',
		),
		first('span', setText('name'), 'Needed to display the name.'),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'hello-world': Component<HelloWorldProps>
	}
}

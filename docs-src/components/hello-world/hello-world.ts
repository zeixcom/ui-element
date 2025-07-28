import {
	type Component,
	asString,
	component,
	fromDOM,
	getText,
	on,
	setText,
} from '../../..'

export type HelloWorldProps = {
	name: string
}

export default component(
	'hello-world',
	{
		name: asString(fromDOM('World', { span: getText() })),
	},
	(_, { first }) => [
		first(
			'input',
			on('input', ({ target }) => ({ name: target.value })),
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

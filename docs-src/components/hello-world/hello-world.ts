import {
	type Component,
	RESET,
	asString,
	component,
	fromDOM,
	getText,
	on,
	requireElement,
	setText,
} from '../../..'

export type HelloWorldProps = {
	name: string
}

export default component(
	'hello-world',
	{
		name: asString(fromDOM('span', getText())),
	},
	(el, { first }) => {
		requireElement(el, 'span')

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

import {
	type Component,
	asString,
	component,
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
		name: asString(),
	},
	(el, { first }) => {
		const span = requireElement(el, 'span')
		const initial = span.textContent || ''
		if (initial && !el.name) el.name = initial

		return [
			first(
				'input',
				on('input', e => {
					el.name = (e.target as HTMLInputElement).value || initial
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

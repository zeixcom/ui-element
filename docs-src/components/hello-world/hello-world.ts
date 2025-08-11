import { asString, type Component, component, on, setText } from '../../..'

export type HelloWorldProps = {
	name: string
}

export default component(
	'hello-world',
	{
		name: asString(
			el => el.querySelector('span')?.textContent?.trim() ?? '',
		),
	},
	(el, { first }) => {
		const fallback = el.name
		return [
			first(
				'input',
				on('input', ({ target }) => ({
					name: target.value || fallback,
				})),
				'Needed to input the name.',
			),
			first('span', setText('name'), 'Needed to display the name.'),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'hello-world': Component<HelloWorldProps>
	}
}

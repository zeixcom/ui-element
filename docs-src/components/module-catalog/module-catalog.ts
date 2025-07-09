import {
	type Component,
	type SignalProducer,
	component,
	pass,
	reduced,
} from '../../..'

export type ModuleCatalogProps = {
	total: number
}

export default component(
	'module-catalog',
	{
		total: (el =>
			reduced(
				el,
				'form-spinbutton',
				(sum, item) => sum + item.value,
				0,
			)) as SignalProducer<number>,
	},
	(el, { first }) => [
		first(
			'basic-button',
			pass({
				badge: () => (el.total > 0 ? String(el.total) : ''),
				disabled: () => !el.total,
			}),
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'module-catalog': Component<ModuleCatalogProps>
	}
}

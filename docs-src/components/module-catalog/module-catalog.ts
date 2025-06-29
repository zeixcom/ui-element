import { type Component, component, fromDescendants, pass } from '../../..'

export type ModuleCatalogProps = {
	total: number
}

export default component(
	'product-catalog',
	{
		total: fromDescendants<number, HTMLElement & { value: number }>(
			'form-spinbutton',
			(sum, item) => sum + item.value,
			0,
		),
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
		'product-catalog': Component<ModuleCatalogProps>
	}
}

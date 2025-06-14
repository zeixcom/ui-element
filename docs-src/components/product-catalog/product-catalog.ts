import { type Component, component, fromChildren, pass } from '../../..'

export type ProductCatalogProps = {
	total: number
}

export default component(
	'product-catalog',
	{
		total: fromChildren<number, HTMLElement & { value: number }>(
			'spin-button',
			(sum, item) => sum + item.value,
			0,
		),
	},
	(el, { first }) => [
		first(
			'input-button',
			pass({
				badge: () => (el.total > 0 ? String(el.total) : ''),
				disabled: () => !el.total,
			}),
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'product-catalog': Component<ProductCatalogProps>
	}
}

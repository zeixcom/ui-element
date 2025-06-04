import { type Component, component, pass } from '../../../'
import { sumValues } from '../../functions/signal-producer/sum-values'

export type ProductCatalogProps = {
	total: number
}

export default component(
	'product-catalog',
	{
		total: sumValues('spin-button'),
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

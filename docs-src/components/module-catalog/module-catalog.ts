import { type Component, component, fromDescendants, pass } from '../../..'
import { BasicButtonProps } from '../basic-button/basic-button'

export type ModuleCatalogProps = {
	total: number
}

export default component(
	'module-catalog',
	{
		total: fromDescendants(
			'form-spinbutton',
			(sum, item) => sum + item.value,
			0,
		),
	},
	(el, { first }) => [
		first(
			'basic-button',
			pass<ModuleCatalogProps, Component<BasicButtonProps>>({
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

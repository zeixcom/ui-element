import { UIElement } from "@zeix/ui-element"
import { type SpinButton } from "../spin-button/spin-button"

class ProductCatalog extends UIElement {
	connectedCallback() {

		// Derive the total count of items in the shopping cart
		this.set('total', () =>
			Array.from(this.querySelectorAll('spin-button') as NodeListOf<SpinButton>)
				.reduce((sum, item) => sum + (item.get<number>('count') ?? 0), 0))

		// Pass the total to the badge button for display
		this.first('badge-button').pass({ badge: () => {
			const total = this.get('total')
			return typeof total === 'number' && total > 0 ? String(total) : ''
		}})
	}
}
ProductCatalog.define('product-catalog')
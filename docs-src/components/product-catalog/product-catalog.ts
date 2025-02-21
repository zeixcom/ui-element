import { UIElement } from "../../../"
import type { SpinButton } from "../spin-button/spin-button"

export class ProductCatalog extends UIElement {
	static localName = 'product-catalog'

	connectedCallback() {
        
		// Pass the total to the badge button for display
		this.first('input-button').pass({
			badge: () => {
				// Derive the total count of items in the shopping cart
				const total = this.all<SpinButton>('spin-button').targets
					.reduce((sum, item) => sum + item.get('value'), 0)
				return typeof total === 'number' && total > 0 ? String(total) : ''
			}
		})
	}
}
ProductCatalog.define()
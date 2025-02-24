import { UIElement } from "../../../"
import type { SpinButton } from "../spin-button/spin-button"

const asPositiveIntegerString = (value: unknown): string =>
	typeof value ==='number' && Number.isInteger(value) && value > 0
		? String(value)
		: ''

export class ProductCatalog extends UIElement {
	static localName = 'product-catalog'

	connectedCallback() {
        
		// Pass the total to the badge button for display
		this.first('input-button').pass({
			badge: () => asPositiveIntegerString(
				this.all<SpinButton>('spin-button').targets
					.reduce((sum, item) => sum + item.get('value'), 0)
			)
		})
	}
}
ProductCatalog.define()
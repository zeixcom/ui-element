import { component } from "../../../index"
import { SpinButton } from "../spin-button/spin-button"

export const ProductCatalog = component('product-catalog', {}, host => {

	// Pass the total to the badge button for display
	host.first('badge-button').pass({
		badge: () => {
			// Derive the total count of items in the shopping cart
			const total = (host.all('spin-button').targets as typeof SpinButton[])
				.reduce((sum, item) => sum + item.get('count'), 0)
			return typeof total === 'number' && total > 0 ? String(total) : ''
		}
	})
})
import { type SignalProducer, component, first, pass } from '../../../'
import SpinButton from '../spin-button/spin-button'
import { InputButtonProps } from '../input-button/input-button'

export type ProductCatalogProps = {
	total: number
}

const calcTotal: SignalProducer<number, HTMLElement> = el =>
	() => Array.from(el.querySelectorAll<typeof SpinButton>('spin-button'))
		.reduce((sum, item) => sum + item.value, 0)

const ProductCatalog = component('product-catalog', {
	total: calcTotal
}, el => [
	first('input-button', pass<ProductCatalogProps, InputButtonProps>({
		badge: () => el.total > 0 ? String(el.total) : ''
	}))
])

declare global {
	interface HTMLElementTagNameMap {
		'product-catalog': typeof ProductCatalog
	}
}

export default ProductCatalog
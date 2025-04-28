import {
	type Component, type SignalProducer,
	component, first, pass
} from '../../../'
import { InputButtonProps } from '../input-button/input-button'
import { SpinButtonProps } from '../spin-button/spin-button'

export type ProductCatalogProps = {
	total: number
}

const calcTotal: SignalProducer<HTMLElement, number> = el =>
	() => Array.from(el.querySelectorAll<Component<SpinButtonProps>>('spin-button'))
		.reduce((sum, item) => sum + item.value, 0)

export default component('product-catalog', {
	total: calcTotal
}, el => [
	first('input-button', pass<ProductCatalogProps, InputButtonProps>({
		badge: () => el.total > 0 ? String(el.total) : ''
	}))
])

declare global {
	interface HTMLElementTagNameMap {
		'product-catalog': Component<ProductCatalogProps>
	}
}

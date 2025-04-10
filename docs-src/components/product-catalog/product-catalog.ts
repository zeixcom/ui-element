import { component, pass } from '../../../'
import SpinButton from '../spin-button/spin-button'

export default component('product-catalog', {}, el => {
	el.first('input-button', pass({
		badge: () => {
			const total = Array.from(el.querySelectorAll<typeof SpinButton>('spin-button'))
				.reduce((sum, item) => sum + item.value, 0)
			return total === 'number' && Number.isInteger(total) && total > 0 ? String(total) : ''
		}
	}))
})
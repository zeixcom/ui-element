import { asBoolean, component, first, on, toggleAttribute } from '../../../'

import { InputButton } from '../input-button/input-button'

component('code-block',{
	collapsed: asBoolean
}, host => [
	toggleAttribute('collapsed'),
	first('.overlay', on('click', () => { host.collapsed = false })),
	first('.copy', on('click', async (e: Event) => {
		const copyButton = e.currentTarget as typeof InputButton
		const label = copyButton.textContent?.trim() ?? ''
		let status = 'success'
		try {
			await navigator.clipboard.writeText(host.querySelector('code')?.textContent?.trim() ?? '')
		} catch (err) {
			console.error('Error when trying to use navigator.clipboard.writeText()', err)
			status = 'error'
		}
		copyButton.disabled = true
		copyButton.label = host.getAttribute(`copy-${status}`) ?? label
		setTimeout(() => {
			copyButton.disabled = false
			copyButton.label = label
		}, status === 'success' ? 1000 : 3000)
	}))
])
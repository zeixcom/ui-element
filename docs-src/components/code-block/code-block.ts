import { asBoolean, component, first, on, toggleAttribute } from '../../../'

import InputButton from '../input-button/input-button'

export type CodeBlockProps = {
    collapsed: boolean
}

const CodeBlock = component('code-block',{
	collapsed: asBoolean
}, el => {
	const code = el.querySelector('code')
	return [
		toggleAttribute('collapsed'),
		first('.overlay', on('click', () => { el.collapsed = false })),
		first('.copy', on('click', async (e: Event) => {
			const copyButton = e.currentTarget as typeof InputButton
			const label = copyButton.textContent?.trim() ?? ''
			let status = 'success'
			try {
				await navigator.clipboard.writeText(code?.textContent?.trim() ?? '')
			} catch (err) {
				console.error('Error when trying to use navigator.clipboard.writeText()', err)
				status = 'error'
			}
			copyButton.disabled = true
			copyButton.label = el.getAttribute(`copy-${status}`) ?? label
			setTimeout(() => {
				copyButton.disabled = false
				copyButton.label = label
			}, status === 'success' ? 1000 : 3000)
		}))
	]
	
})

declare global {
	interface HTMLElementTagNameMap {
		'code-block': typeof CodeBlock
	}
}

export default CodeBlock
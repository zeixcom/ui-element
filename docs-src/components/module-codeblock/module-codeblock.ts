import {
	type Component,
	asBoolean,
	component,
	on,
	toggleAttribute,
} from '../../..'

import type { BasicButtonProps } from '../basic-button/basic-button'

export type ModuleCodeblockProps = {
	collapsed: boolean
}

export default component(
	'module-codeblock',
	{
		collapsed: asBoolean,
	},
	(el, { first }) => {
		const code = el.querySelector('code')
		return [
			toggleAttribute('collapsed'),
			first(
				'.overlay',
				on('click', () => {
					el.collapsed = false
				}),
			),
			first(
				'.copy',
				on('click', async (e: Event) => {
					const copyButton =
						e.currentTarget as Component<BasicButtonProps>
					const label = copyButton.textContent?.trim() ?? ''
					let status = 'success'
					try {
						await navigator.clipboard.writeText(
							code?.textContent?.trim() ?? '',
						)
					} catch (err) {
						console.error(
							'Error while trying to use navigator.clipboard.writeText()',
							err,
						)
						status = 'error'
					}
					copyButton.disabled = true
					copyButton.label =
						el.getAttribute(`copy-${status}`) ?? label
					setTimeout(
						() => {
							copyButton.disabled = false
							copyButton.label = label
						},
						status === 'success' ? 1000 : 3000,
					)
				}),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-codeblock': Component<ModuleCodeblockProps>
	}
}

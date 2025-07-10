import { type Component, type ComponentProps, type Effect, on } from '../../..'

import { BasicButtonProps } from '../../components/basic-button/basic-button'

type CopyStatus = 'success' | 'error'

const COPY_SUCCESS = 'success'
const COPY_ERROR = 'error'

export const copyToClipboard =
	(
		container: HTMLElement,
		messages: { [COPY_ERROR]?: string; [COPY_SUCCESS]?: string },
	): Effect<ComponentProps, Component<BasicButtonProps>> =>
	(host, button) =>
		on('click', async () => {
			const label = button.textContent?.trim() ?? ''
			let status: CopyStatus = COPY_SUCCESS
			try {
				await navigator.clipboard.writeText(
					container.textContent?.trim() ?? '',
				)
			} catch (err) {
				console.error(
					'Error while trying to use navigator.clipboard.writeText()',
					err,
				)
				status = COPY_ERROR
			}
			button.disabled = true
			button.label = messages[status] ?? label
			setTimeout(
				() => {
					button.disabled = false
					button.label = label
				},
				status === COPY_SUCCESS ? 1000 : 3000,
			)
		})(host, button)

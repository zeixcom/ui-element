import { type Component, component, effect, on } from '../../..'

export type ModuleDialogProps = {
	open: boolean
}

const SCROLL_LOCK_CLASS = 'scroll-lock'

export default component(
	'module-dialog',
	{
		open: false,
	},
	(el, { first, useElement }) => {
		const dialog = useElement(
			'dialog',
			'Native dialog needed as container for modal content.',
		)
		let scrollTop = 0

		return [
			first(
				'button.open',
				on('click', () => {
					el.open = true
				}),
				'Native button to open dialog needed.',
			),
			first('dialog', [
				on('click', ({ event }) => {
					if (event.target === dialog) el.open = false
				}),
				on('keydown', ({ event }) => {
					if (event.key === 'Escape') el.open = false
				}),
			]),
			first(
				'dialog .close',
				on('click', () => {
					el.open = false
				}),
			),
			() =>
				effect(() => {
					if (el.open) {
						dialog.showModal()
						scrollTop = document.documentElement.scrollTop
						document.body.classList.add(SCROLL_LOCK_CLASS)
						document.body.style.top = `-${scrollTop}px`
					} else {
						document.body.classList.remove(SCROLL_LOCK_CLASS)
						window.scrollTo({
							top: scrollTop,
							left: 0,
							behavior: 'instant',
						})
						document.body.style.removeProperty('top')
						dialog.close()
					}
					return () => {
						el.open = false
					}
				}),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-dialog': Component<ModuleDialogProps>
	}
}

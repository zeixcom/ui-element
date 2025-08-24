import { batch, type Component, component, on, toggleClass } from '../../..'

export type ModuleScrollareaProps = {
	readonly overflowStart: boolean
	readonly overflowEnd: boolean
}

export default component(
	'module-scrollarea',
	{
		overflowStart: false,
		overflowEnd: false,
	},
	el => {
		const isHorizontal = el.getAttribute('orientation') === 'horizontal'
		const hasOverflow = () => el.overflowStart || el.overflowEnd
		let scrolling: number | null = null

		return [
			() => {
				const child = el.firstElementChild
				if (!child) return
				const observer = new IntersectionObserver(
					([entry]) => {
						if (
							entry.intersectionRatio > 0 &&
							entry.intersectionRatio < 0.999 // ignore rounding errors of fraction pixels
						) {
							el.overflowEnd = true
						} else {
							batch(() => {
								el.overflowStart = false
								el.overflowEnd = false
							})
						}
					},
					{
						root: el,
						threshold: [0, 0.999],
					},
				)
				observer.observe(child)
				return () => {
					observer.disconnect()
				}
			},
			toggleClass('overflow', hasOverflow),
			toggleClass('overflow-start', 'overflowStart'),
			toggleClass('overflow-end', 'overflowEnd'),
			on('scroll', () => {
				if (!hasOverflow()) return
				if (scrolling) cancelAnimationFrame(scrolling)
				scrolling = requestAnimationFrame(() => {
					scrolling = null
					el.overflowStart = isHorizontal
						? el.scrollLeft > 0
						: el.scrollTop > 0
					el.overflowEnd = isHorizontal
						? el.scrollLeft < el.scrollWidth - el.offsetWidth
						: el.scrollTop < el.scrollHeight - el.offsetHeight
				})
			}),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-scrollarea': Component<ModuleScrollareaProps>
	}
}

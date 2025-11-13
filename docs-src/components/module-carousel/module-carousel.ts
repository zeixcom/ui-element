import {
	asInteger,
	type Component,
	component,
	fromSelector,
	on,
	setProperty,
} from '../../..'

export type ModuleCarouselProps = {
	readonly slides: HTMLElement[]
	index: number
}

const wrapAround = (index: number, total: number) => (index + total) % total

export default component<ModuleCarouselProps>(
	'module-carousel',
	{
		slides: fromSelector('[role="tabpanel"]'),
		index: asInteger((host: HTMLElement & { slides: HTMLElement[] }) =>
			Math.max(
				host.slides.findIndex(slide => slide.ariaCurrent === 'true'),
				0,
			),
		),
	},
	(el, { all }) => {
		const isCurrentDot = (target: HTMLElement) =>
			target.dataset.index === String(el.index)
		const scrollToCurrentSlide = () => {
			el.slides[el.index].scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			})
		}

		return [
			// Register IntersectionObserver to update index based on scroll position
			() => {
				const observer = new IntersectionObserver(
					entries => {
						for (const entry of entries) {
							if (entry.isIntersecting) {
								el.index = el.slides.findIndex(
									slide => slide === entry.target,
								)
								break
							}
						}
					},
					{
						root: el,
						threshold: 0.5,
					},
				)
				el.slides.forEach(slide => {
					observer.observe(slide)
				})
				return () => {
					observer.disconnect()
				}
			},

			// Handle navigation button click and keyup events
			all('nav button', [
				on('click', ({ host, target }) => {
					const total = host.slides.length
					const nextIndex = target.classList.contains('prev')
						? el.index - 1
						: target.classList.contains('next')
							? el.index + 1
							: parseInt(target.dataset.index || '0')
					el.index = Number.isInteger(nextIndex)
						? wrapAround(nextIndex, total)
						: 0
					scrollToCurrentSlide()
				}),
				on('keyup', ({ event, host }) => {
					const key = event.key
					if (
						['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)
					) {
						event.preventDefault()
						event.stopPropagation()
						const total = host.slides.length
						const nextIndex =
							key === 'Home'
								? 0
								: key === 'End'
									? total - 1
									: wrapAround(
											el.index +
												(key === 'ArrowLeft' ? -1 : 1),
											total,
										)
						host.slides[nextIndex].focus()
						el.index = nextIndex
						scrollToCurrentSlide()
					}
				}),
			]),

			// Set the active slide in the navigation
			all('[role="tab"]', [
				setProperty('ariaSelected', target =>
					String(isCurrentDot(target)),
				),
				setProperty('tabIndex', target =>
					isCurrentDot(target) ? 0 : -1,
				),
			]),

			// Set the active slide in the slides
			all('[role="tabpanel"]', [
				setProperty('ariaCurrent', target =>
					String(target.id === el.slides[el.index].id),
				),
			]),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-carousel': Component<ModuleCarouselProps>
	}
}

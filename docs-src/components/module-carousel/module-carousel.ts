import {
	type Component,
	component,
	fromEvents,
	fromSelector,
	setProperty,
} from '../../..'

export type ModuleCarouselProps = {
	readonly slides: HTMLElement[]
	readonly index: number
}

const wrapAround = (index: number, total: number) => (index + total) % total

export default component(
	'module-carousel',
	{
		slides: fromSelector('[role="tabpanel"]'),
		index: fromEvents(
			(host: HTMLElement & { slides: HTMLElement[] }) =>
				Math.max(
					host.slides.findIndex(
						slide => slide.ariaCurrent === 'true',
					),
					0,
				),
			'nav button',
			{
				click: ({ host, target, value }) => {
					const total = host.slides.length
					const nextIndex = target.classList.contains('prev')
						? value - 1
						: target.classList.contains('next')
							? value + 1
							: parseInt(target.dataset.index || '0')
					return Number.isInteger(nextIndex)
						? wrapAround(nextIndex, total)
						: 0
				},
				keyup: ({ event, host, value }) => {
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
											value +
												(key === 'ArrowLeft' ? -1 : 1),
											total,
										)
						host.slides[nextIndex].focus()
						return nextIndex
					}
				},
			},
		),
	},
	(el, { all }) => {
		const isCurrentDot = (target: HTMLElement) =>
			target.dataset.index === String(el.index)

		return [
			all('[role="tab"]', [
				setProperty('ariaSelected', target =>
					String(isCurrentDot(target)),
				),
				setProperty('tabIndex', target =>
					isCurrentDot(target) ? 0 : -1,
				),
			]),
			all(
				'[role="tabpanel"]',
				setProperty('ariaCurrent', target =>
					String(target.id === el.slides[el.index].id),
				),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-carousel': Component<ModuleCarouselProps>
	}
}

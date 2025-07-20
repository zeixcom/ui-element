import { type ComponentProps, type Effect, on, state } from '../../..'

const HANDLED_KEYS = [
	'ArrowLeft',
	'ArrowRight',
	'ArrowUp',
	'ArrowDown',
	'Home',
	'End',
]

export const manageFocusOnKeydown = <E extends HTMLElement = HTMLElement>(
	elements: E[],
	getSelected: (elements: E[]) => number,
): Effect<ComponentProps, E>[] => {
	const index = state(getSelected(elements))
	return [
		on('change', () => {
			index.set(getSelected(elements))
		}),
		on('keydown', ({ event }) => {
			const { key } = event
			if (HANDLED_KEYS.includes(key)) {
				event.preventDefault()
				event.stopPropagation()
				if (key === 'Home') index.set(0)
				else if (key === 'End') index.set(elements.length - 1)
				else
					index.update(v =>
						Math.min(
							Math.max(
								v +
									(key === 'ArrowRight' || key === 'ArrowDown'
										? 1
										: -1),
								0,
							),
							elements.length - 1,
						),
					)
				if (elements[index.get()]) elements[index.get()].focus()
			}
		}),
	]
}

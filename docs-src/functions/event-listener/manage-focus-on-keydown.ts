import { on, state } from '../../..'

const HANDLED_KEYS = [
	'ArrowLeft',
	'ArrowRight',
	'ArrowUp',
	'ArrowDown',
	'Home',
	'End',
]

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max)

export const manageFocusOnKeydown = <E extends HTMLElement = HTMLElement>(
	elements: E[],
	getSelected: (elements: E[]) => number,
) => {
	const index = state(getSelected(elements))
	return on({
		change: () => {
			index.set(getSelected(elements))
		},
		keydown: (e: Event) => {
			const { key } = e as KeyboardEvent
			if (HANDLED_KEYS.includes(key)) {
				e.preventDefault()
				e.stopPropagation()
				if (key === 'Home') index.set(0)
				else if (key === 'End') index.set(elements.length - 1)
				else
					index.update(v =>
						clamp(
							v +
								(key === 'ArrowRight' || key === 'ArrowDown'
									? 1
									: -1),
							0,
							elements.length - 1,
						),
					)
				if (elements[index.get()]) elements[index.get()].focus()
			}
		},
	})
}

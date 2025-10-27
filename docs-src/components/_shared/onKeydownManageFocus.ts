import { type ComponentProps, type Effect, on } from '../../..'

const DECREMENT_KEYS = ['ArrowLeft', 'ArrowUp']
const INCREMENT_KEYS = ['ArrowRight', 'ArrowDown']
const FIRST_KEY = 'Home'
const LAST_KEY = 'End'
const HANDLED_KEYS = [...DECREMENT_KEYS, ...INCREMENT_KEYS, FIRST_KEY, LAST_KEY]

export const onKeydownManageFocus = <E extends HTMLElement = HTMLElement>(
	elements: E[],
	getSelected: (elements: E[]) => number,
): Effect<ComponentProps, E>[] => {
	let index = getSelected(elements)
	return [
		on('change', () => {
			index = getSelected(elements)
		}),
		on('keydown', ({ event }) => {
			const { key } = event
			if (!HANDLED_KEYS.includes(key)) return
			event.preventDefault()
			event.stopPropagation()
			if (key === FIRST_KEY) index = 0
			else if (key === LAST_KEY) index = elements.length - 1
			else
				index = Math.min(
					Math.max(
						index + (INCREMENT_KEYS.includes(key) ? 1 : -1),
						0,
					),
					elements.length - 1,
				)
			if (elements[index]) elements[index].focus()
		}),
	]
}

import { State, on } from '../../..'

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

export const manageFocusOnKeydown = (
	elements: HTMLElement[],
	index: State<number>,
) =>
	on('keydown', (e: KeyboardEvent) => {
		if (HANDLED_KEYS.includes(e.key)) {
			e.preventDefault()
			e.stopPropagation()
			if (e.key === 'Home') index.set(0)
			else if (e.key === 'End') index.set(elements.length - 1)
			else
				index.update(v =>
					clamp(
						v +
							(e.key === 'ArrowRight' || e.key === 'ArrowDown' ?
								1
							:	-1),
						0,
						elements.length - 1,
					),
				)
			if (elements[index.get()]) elements[index.get()].focus()
		}
	})

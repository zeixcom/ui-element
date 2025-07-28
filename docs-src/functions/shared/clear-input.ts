import { type Component, type Effect, on, show } from '../../..'

/**
 * Creates a clear function for input components that properly handles
 * clearing the native input, custom validity, and dispatching events
 * to trigger sensor-based property updates
 *
 * @param {HTMLInputElement | HTMLTextAreaElement} selector - The native input or textarea element
 */
export const createClearMethod =
	<E extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement>(
		selector: string = 'input',
	) =>
	(
		host: HTMLElement & {
			value: string | number
			length: number
			clear: () => void
		},
	) => {
		host.clear = () => {
			host.value = ''
			host.length = 0
			const input = host.querySelector<E>(selector)
			if (input) {
				input.value = ''
				input.checkValidity()
				input.focus()
			}
		}
	}

/**
 * Standard effects for clearing input components on button elements
 *
 * @param {Component<P>} host - The component instance with clear, length properties
 * @returns {Effect<P, HTMLButtonElement>[]} - Effects for clearing the input component
 */
export const standardClearEffects = <
	P extends { clear: () => void; length: number },
>(
	host: Component<P>,
): Effect<P, HTMLButtonElement>[] => [
	show(() => !!host.length),
	on('click', () => {
		host.clear()
	}),
]

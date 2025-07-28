import { type Component, type Effect, on, show } from '../../..'

/**
 * Creates a clear function for input components that properly handles
 * clearing the native input, custom validity, and dispatching events
 * to trigger sensor-based property updates
 *
 * @param {HTMLInputElement | HTMLTextAreaElement} selector - The native input or textarea element
 */
export const clearMethod =
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
				input.setCustomValidity('')
				input.checkValidity()
				input.dispatchEvent(new Event('input', { bubbles: true }))
				input.dispatchEvent(new Event('change', { bubbles: true }))
				input.focus()
			}
		}
	}

/**
 * Standard effects for clearing input components on button elements
 *
 * @param {Component<P>} host - The component instance with clear, length properties
 * @returns {Effect<P, HTMLElement>[]} - Effects for clearing the input component
 */
export const clearEffects = <P extends { clear: () => void; length: number }>(
	host: Component<P>,
): Effect<P, HTMLElement>[] => [
	show(() => !!host.length),
	on('click', () => {
		host.clear()
	}),
]

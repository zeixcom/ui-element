import { type Component, type Effect, on, show } from '../../..'

/**
 * Creates a clear function for input components that properly handles
 * clearing the native input, custom validity, and dispatching events
 * to trigger sensor-based property updates
 *
 * @param {HTMLInputElement | HTMLTextAreaElement} input - The native input or textarea element
 * @returns {() => void} Clear function that can be assigned to component.clear
 */
export const createClearFunction =
	(input: HTMLInputElement | HTMLTextAreaElement): (() => void) =>
	() => {
		// Clear native input value
		input.value = ''

		// Clear any custom validity messages
		input.setCustomValidity('')

		// Force validation state update
		input.checkValidity()

		// Dispatch events to trigger sensor-based property updates
		// Use both 'input' and 'change' events to ensure all sensors are updated
		input.dispatchEvent(new Event('input', { bubbles: true }))
		input.dispatchEvent(new Event('change', { bubbles: true }))
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

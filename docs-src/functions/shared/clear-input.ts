import { type Component, type FxFunction, batch, on, show } from '../../..'

/**
 * Creates a clear function for input components that properly handles
 * clearing the native input, custom validity, and component state
 *
 * @param {HTMLInputElement | HTMLTextAreaElement} input - The native input or textarea element
 * @param {() => void} update - Function to update component reactive properties
 * @returns {() => void} Clear function that can be assigned to component.clear
 */
export const createClearFunction =
	(
		input: HTMLInputElement | HTMLTextAreaElement,
		update: () => void,
	): (() => void) =>
	() => {
		// Clear native input value
		input.value = ''

		// Clear any custom validity messages
		input.setCustomValidity('')

		// Force validation state update
		input.checkValidity()

		// Update component reactive properties
		update()
	}

/**
 * Standard component state update for clearing basic input components
 *
 * @param {Component<P>} host - The component instance with value, length, error properties
 * @param {HTMLInputElement | HTMLTextAreaElement} input - The native input element for getting validation message
 * @returns {() => void} Function to clear the component state
 */
export const standardClearUpdate =
	<P extends { value: string; length: number; error: string }>(
		host: Component<P>,
		input: HTMLInputElement | HTMLTextAreaElement,
	): (() => void) =>
	() => {
		batch(() => {
			host.value = ''
			host.length = 0
			host.error = input.validationMessage ?? ''
		})
	}

/**
 * Standard effects for clearing input components on button elements
 *
 * @param {Component<P>} host - The component instance with clear, length properties
 * @returns {FxFunction<P, HTMLButtonElement>[]} - Effects for clearing the input component
 */
export const standardClearEffects = <
	P extends { clear: () => void; length: number },
>(
	host: Component<P>,
): FxFunction<P, HTMLButtonElement>[] => [
	show(() => !!host.length),
	on('click', () => host.clear()),
]

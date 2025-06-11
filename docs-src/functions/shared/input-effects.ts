import {
	type Component,
	type FxFunction,
	batch,
	on,
	setAttribute,
	setProperty,
	UNSET,
} from '../../..'

/**
 * Standard effects for setting value, error, and description related properties on input elements
 *
 * @param {Component<P>} host - The component instance with value, error, description properties
 * @param {HTMLInputElement | HTMLTextAreaElement} input - The input element act on
 * @param {string | undefined} errorId - The ID of the error element
 * @param {string | undefined} descriptionId - The ID of the description element
 * @returns {FxFunction<P, HTMLButtonElement>[]} - Effects for clearing the input component
 */
export const standardInputEffects = <
	P extends { value: string; error: string; description: string },
>(
	host: Component<P>,
	input: HTMLInputElement | HTMLTextAreaElement,
	errorId: string | undefined,
	descriptionId: string | undefined,
): FxFunction<P, HTMLInputElement | HTMLTextAreaElement>[] => [
	// setProperty('value'),
	setProperty('ariaInvalid', () => String(!!host.error)),
	setAttribute('aria-errormessage', () =>
		host.error && errorId ? errorId : UNSET,
	),
	setAttribute('aria-describedby', () =>
		host.description && descriptionId ? descriptionId : UNSET,
	),
	on('change', () =>
		batch(() => {
			host.value = input.value
			host.error = input.validationMessage ?? ''
		}),
	),
]

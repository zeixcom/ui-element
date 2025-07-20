/**
 * Error thrown when a circular dependency is detected in a selection signal
 *
 * @since 0.14.0
 */
declare class CircularMutationError extends Error {
	/**
	 * @param {HTMLElement} host - Host component
	 * @param {string} selector - Selector used to find the elements
	 */
	constructor(host: HTMLElement, selector: string)
}
/**
 * Error thrown when component name violates rules for custom element names
 *
 * @since 0.14.0
 */
declare class InvalidComponentNameError extends Error {
	/**
	 * @param {string} component - Component name
	 */
	constructor(component: string)
}
/**
 * Error thrown when passed element is not a custom element
 */
declare class InvalidCustomElementError extends Error {
	/**
	 * @param {HTMLElement} host - Host component
	 * @param {Element} target - Target element
	 * @param {string} required - Explanation why the element is required
	 */
	constructor(host: HTMLElement, target: Element, required?: string)
}
/**
 * Error thrown when trying to assign a property name that conflicts with reserved words or inherited HTMLElement properties
 *
 * @since 0.14.0
 */
declare class InvalidPropertyNameError extends Error {
	/**
	 * @param {string} component - Component name
	 * @param {string} prop - Property name
	 * @param {string} reason - Explanation why the property is invalid
	 */
	constructor(component: string, prop: string, reason: string)
}
/**
 * Error thrown when setup function does not return effects
 *
 * @since 0.14.0
 */
declare class InvalidSetupFunctionError extends Error {
	/**
	 * @param {HTMLElement} host - Host component
	 */
	constructor(host: HTMLElement)
}
/**
 * Error thrown when setSignal on component is called with a non-signal value
 *
 * @since 0.14.0
 */
declare class InvalidSignalError extends Error {
	constructor(host: HTMLElement, prop: string)
}
/**
 * Error thrown when a required desacendent element does not exist in a component's DOM subtree
 *
 * @since 0.14.0
 */
declare class MissingElementError extends Error {
	/**
	 * @param {HTMLElement} host - Host component
	 * @param {string} selector - Selector used to find the elements
	 * @param {string} required - Explanation why the element is required
	 */
	constructor(host: HTMLElement, selector: string, required: string)
}
export {
	CircularMutationError,
	InvalidComponentNameError,
	InvalidCustomElementError,
	InvalidPropertyNameError,
	InvalidSetupFunctionError,
	InvalidSignalError,
	MissingElementError,
}

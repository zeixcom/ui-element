import { elementName } from './util'

/* === Error Classes === */

/**
 * Error thrown when a circular dependency is detected in a selection signal
 *
 * @since 0.14.0
 */
class CircularMutationError extends Error {
	/**
	 * @param {HTMLElement} host - Host component
	 * @param {string} selector - Selector used to find the elements
	 */
	constructor(host: HTMLElement, selector: string) {
		super(
			`Circular dependency detected in selection signal for component ${elementName(host)} with selector "${selector}"`,
		)
		this.name = 'CircularMutationError'
	}
}

/**
 * Error thrown when component name violates rules for custom element names
 *
 * @since 0.14.0
 */
class InvalidComponentNameError extends Error {
	/**
	 * @param {string} component - Component name
	 */
	constructor(component: string) {
		super(
			`Invalid component name "${component}". Custom element names must contain a hyphen, start with a lowercase letter, and contain only lowercase letters, numbers, and hyphens.`,
		)
		this.name = 'InvalidComponentNameError'
	}
}

/**
 * Error thrown when trying to assign a property name that conflicts with reserved words or inherited HTMLElement properties
 *
 * @since 0.14.0
 */
class InvalidPropertyNameError extends Error {
	/**
	 * @param {string} component - Component name
	 * @param {string} prop - Property name
	 * @param {string} reason - Explanation why the property is invalid
	 */
	constructor(component: string, prop: string, reason: string) {
		super(
			`Invalid property name "${prop}" for component <${component}>. ${reason}`,
		)
		this.name = 'InvalidPropertyNameError'
	}
}

/**
 * Error thrown when setup function does not return effects
 *
 * @since 0.14.0
 */
class InvalidEffectsError extends Error {
	/**
	 * @param {HTMLElement} host - Host component
	 * @param {Error} cause - Error that caused the invalid effects
	 */
	constructor(host: HTMLElement, cause?: Error) {
		super(
			`Invalid effects in component ${elementName(host)}. Effects must be an array of effects, a single effect function, or a Promise that resolves to effects.`,
		)
		this.name = 'InvalidEffectsError'
		if (cause) this.cause = cause
	}
}
/**
 * Error thrown when setSignal on component is called with a non-signal value
 *
 * @since 0.14.0
 */
class InvalidSignalError extends Error {
	constructor(host: HTMLElement, prop: string) {
		super(
			`Expected signal as value for property "${String(prop)}" in component ${elementName(host)}.`,
		)
		this.name = 'InvalidSignalError'
	}
}

/**
 * Error thrown when a required desacendent element does not exist in a component's DOM subtree
 *
 * @since 0.14.0
 */
class MissingElementError extends Error {
	/**
	 * @param {HTMLElement} host - Host component
	 * @param {string} selector - Selector used to find the elements
	 * @param {string} required - Explanation why the element is required
	 */
	constructor(host: HTMLElement, selector: string, required: string) {
		super(
			`Missing required element <${selector}> in component ${elementName(host)}. ${required}`,
		)
		this.name = 'MissingElementError'
	}
}

/**
 * Error when a component's dependencies are not met within a specified timeout
 *
 * @since 0.14.0
 */
class DependencyTimeoutError extends Error {
	constructor(host: HTMLElement, missing: string[]) {
		super(
			`Timeout waiting for: [${missing.join(', ')}] in component ${elementName(host)}.`,
		)
		this.name = 'DependencyTimeoutError'
	}
}

export {
	CircularMutationError,
	DependencyTimeoutError,
	InvalidComponentNameError,
	InvalidPropertyNameError,
	InvalidEffectsError,
	InvalidSignalError,
	MissingElementError,
}

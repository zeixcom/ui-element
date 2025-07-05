type LogLevel = 'debug' | 'info' | 'warn' | 'error'
declare const DEV_MODE: string | undefined
declare const LOG_DEBUG: LogLevel
declare const LOG_INFO: LogLevel
declare const LOG_WARN: LogLevel
declare const LOG_ERROR: LogLevel
declare const isDefinedObject: (
	value: unknown,
) => value is Record<string, unknown>
declare const isString: (value: unknown) => value is string
declare const hasMethod: <T extends object, K extends PropertyKey, R>(
	obj: T,
	methodName: K,
) => obj is T & Record<K, (...args: any[]) => R>
/**
 * Check if a node is an Element
 *
 * @param {Node} node - node to check
 * @returns {boolean} - `true` if node is an element node, otherwise `false`
 */
declare const isElement: (node: Node) => node is Element
/**
 * Check whether an element is a custom element
 *
 * @param {E} element - Element to check
 * @returns {boolean} - True if the element is a custom element
 */
declare const isCustomElement: <E extends Element>(element: E) => boolean
/**
 * Check whether a custom element is upgraded or a regular element
 *
 * @param {E} element - Element to check
 * @returns {boolean} - True if the element is an upgraded custom element or a regular element
 */
declare const isUpgradedComponent: <E extends Element>(element: E) => boolean
/**
 * Return a string representation of the Element instance
 *
 * @since 0.7.0
 * @param {Element | undefined | null} el
 * @returns {string}
 */
declare const elementName: (el: Element | undefined | null) => string
/**
 * Return a string representation of a JavaScript variable
 *
 * @since 0.7.0
 * @param {unknown} value
 * @returns {string}
 */
declare const valueString: (value: unknown) => string
/**
 * Return a detailed type of a JavaScript variable
 *
 * @since 0.11.0
 * @param {unknown} value
 * @returns {string}
 */
declare const typeString: (value: unknown) => string
/**
 * Log a message to the console with the specified level
 *
 * @since 0.7.0
 * @param {T} value - value to inspect
 * @param {string} msg - message to log
 * @param {LogLevel} level - log level
 * @returns {T} - value passed through
 */
declare const log: <T>(value: T, msg: string, level?: LogLevel) => T
export {
	type LogLevel,
	hasMethod,
	isString,
	isDefinedObject,
	isElement,
	isCustomElement,
	isUpgradedComponent,
	log,
	elementName,
	valueString,
	typeString,
	DEV_MODE,
	LOG_DEBUG,
	LOG_INFO,
	LOG_WARN,
	LOG_ERROR,
}

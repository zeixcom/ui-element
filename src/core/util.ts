import { isFunction, isString } from '@zeix/cause-effect'

/* === Types === */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/* === Constants === */

const DEV_MODE = process.env.DEV_MODE

const LOG_DEBUG: LogLevel = 'debug'
const LOG_INFO: LogLevel = 'info'
const LOG_WARN: LogLevel = 'warn'
const LOG_ERROR: LogLevel = 'error'

/* === Internal Functions === */

/**
 * Return selector string for the id of the element
 *
 * @since 0.7.0
 * @param {string | undefined | null} id
 * @returns {string} - id string for the element with '#' prefix
 */
const idString = (id: string | undefined | null): string => (id ? `#${id}` : '')

/**
 * Return a selector string for classes of the element
 *
 * @since 0.7.0
 * @param {DOMTokenList | undefined | null} classList - DOMTokenList to convert to a string
 * @returns {string} - class string for the DOMTokenList with '.' prefix if any
 */
const classString = (classList: DOMTokenList | undefined | null): string =>
	classList?.length ? `.${Array.from(classList).join('.')}` : ''

/* === Exported Functions === */

const hasMethod = /*#__PURE__*/ <T extends object, K extends PropertyKey, R>(
	obj: T,
	methodName: K,
): obj is T & Record<K, (...args: any[]) => R> =>
	isString(methodName) &&
	methodName in obj &&
	isFunction<R>((obj as any)[methodName])

/**
 * Check if a node is an Element
 *
 * @param {Node} node - node to check
 * @returns {boolean} - `true` if node is an element node, otherwise `false`
 */
const isElement = /*#__PURE__*/ (node: Node): node is Element =>
	node.nodeType === Node.ELEMENT_NODE

/**
 * Check whether an element is a custom element
 *
 * @param {E} element - Element to check
 * @returns {boolean} - True if the element is a custom element
 */
const isCustomElement = /*#__PURE__*/ <E extends Element>(
	element: E,
): boolean => element.localName.includes('-')

/**
 * Check whether a custom element is upgraded or a regular element
 *
 * @param {E} element - Element to check
 * @returns {boolean} - True if the element is an upgraded custom element or a regular element
 */
const isUpgradedComponent = <E extends Element>(element: E): boolean => {
	if (!isCustomElement(element)) return true
	const ctor = customElements.get(element.localName)
	return !!ctor && element instanceof ctor
}

/**
 * Return a string representation of the Element instance
 *
 * @since 0.7.0
 * @param {Element | undefined | null} el
 * @returns {string}
 */
const elementName = /*#__PURE__*/ (el: Element | undefined | null): string =>
	el
		? `<${el.localName}${idString(el.id)}${classString(el.classList)}>`
		: '<unknown>'

/**
 * Return a string representation of a JavaScript variable
 *
 * @since 0.7.0
 * @param {unknown} value
 * @returns {string}
 */
const valueString = /*#__PURE__*/ (value: unknown): string =>
	isString(value)
		? `"${value}"`
		: !!value && typeof value === 'object'
			? JSON.stringify(value)
			: String(value)

/**
 * Return a detailed type of a JavaScript variable
 *
 * @since 0.11.0
 * @param {unknown} value
 * @returns {string}
 */
const typeString = /*#__PURE__*/ (value: unknown): string => {
	if (value === null) return 'null'
	if (typeof value !== 'object') return typeof value
	if (Array.isArray(value)) return 'Array'

	// Check for Symbol.toStringTag
	if (Symbol.toStringTag in Object(value)) {
		return (value as any)[Symbol.toStringTag]
	}

	// For other objects, return the constructor name if available
	return value.constructor?.name || 'Object'
}

/**
 * Log a message to the console with the specified level
 *
 * @since 0.7.0
 * @param {T} value - value to inspect
 * @param {string} msg - message to log
 * @param {LogLevel} level - log level
 * @returns {T} - value passed through
 */
const log = <T>(value: T, msg: string, level: LogLevel = LOG_DEBUG): T => {
	if (DEV_MODE || ([LOG_ERROR, LOG_WARN] as LogLevel[]).includes(level))
		console[level](msg, value)
	return value
}

export {
	type LogLevel,
	hasMethod,
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

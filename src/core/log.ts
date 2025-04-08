import { isDefinedObject, isString } from "./util"

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
 * @param {string} id 
 * @returns {string} - id string for the element with '#' prefix
 */
const idString = (id: string): string => id ? `#${id}` : '';

/**
 * Return a selector string for classes of the element
 * 
 * @since 0.7.0
 * @param {DOMTokenList} classList - DOMTokenList to convert to a string
 * @returns {string} - class string for the DOMTokenList with '.' prefix if any
 */
const classString = (classList: DOMTokenList): string =>
	classList.length ? `.${Array.from(classList).join('.')}` : ''

/* === Exported Functions === */

/**
 * Return a HyperScript string representation of the Element instance
 * 
 * @since 0.7.0
 * @param {Element} el 
 * @returns {string}
 */
const elementName = (el: Element): string =>
	`<${el.localName}${idString(el.id)}${classString(el.classList)}>`

/**
 * Return a string representation of a JavaScript variable
 * 
 * @since 0.7.0
 * @param {unknown} value 
 * @returns {string}
 */
const valueString = (value: unknown): string =>
	isString(value) ? `"${value}"`
		: isDefinedObject(value) ? JSON.stringify(value)
		: String(value)


/**
 * Return a detailed type of a JavaScript variable
 * 
 * @since 0.11.0
 * @param {unknown} value
 * @returns {string}
 */
const typeString = (value: unknown): string => {
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

const assert = (assertion: boolean, msg: string, ...rest: unknown[]): boolean => {
	console.assert(assertion, msg, ...rest)
	return assertion
}

export {
	type LogLevel,
	log, assert, elementName, valueString, typeString,
	DEV_MODE, LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR
}
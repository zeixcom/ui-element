import { isFunction } from './util'
import type { AttributeParser, StateInitializer, UIElement } from '../ui-element'
import { log, LOG_ERROR } from './log'

/* === Internal Function === */

const parseNumber = (parseFn: (v: string) => number, value?: string): number | undefined => {
	if (value == null) return
	const parsed = parseFn(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

/* === Exported Functions === */

/**
 * Parse according to static states
 * 
 * @since 0.8.4
 * @param {UIElement} host - host UIElement
 * @param {StateInitializer<T>} initializer - attribute parser or initial value
 * @param {string | undefined} value - attribute value
 * @param {string | undefined} [old=undefined] - old attribute value
 * @returns {T | string | undefined}
 */
const parse = <T>(
	host: UIElement,
	initializer?: StateInitializer<T>,
	value?: string,
	old?: string
): T | string | undefined => {
	const isAttributeParser = (value?: StateInitializer<T>): value is AttributeParser<T> =>
		isFunction(value) && !!value.length
	return (isAttributeParser(initializer) ? initializer(value, host, old) : value) ?? initializer as T
}

/**
 * Parse a boolean attribute as an actual boolean value
 * 
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {boolean}
 */
const asBoolean = (value?: string): boolean =>
	value !== 'false' && value != null

/**
 * Parse an attribute as a number forced to integer
 * 
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {number | undefined}
 */
const asInteger = (value?: string): number | undefined =>
	// maybe(value).map<number>(parseInt).filter(Number.isFinite).get()
	parseNumber(parseInt, value)


/**
 * Parse an attribute as a number
 * 
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {number | undefined}
 */
const asNumber = (value?: string): number | undefined =>
	// maybe(value).map<number>(parseFloat).filter(Number.isFinite).get()
    parseNumber(parseFloat, value)


/**
 * Parse an attribute as a string
 * 
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {string}
 */
const asString = (value?: string): string | undefined => value

/**
 * Parse an attribute as a tri-state value (true, false, mixed)
 * 
 * @since 0.9.0
 * @param {string[]} valid - array of valid values
 */
const asEnum = (valid: string[]) =>
	(value?: string): string | undefined => {
		// maybe(value).filter(v => valid.includes(v.toLowerCase())).get()
		if (value == null) return
		return valid.includes(value.toLowerCase()) ? value : undefined
	}

/**
 * Parse an attribute as a JSON serialized object
 * 
 * @since 0.7.2
 * @param {string} value - maybe string value
 * @returns {unknown}
 */
const asJSON = (value?: string): unknown => {
    if (value == null) return
    try {
        return JSON.parse(value)
    } catch (error) {
        log(error, 'Failed to parse JSON', LOG_ERROR)
        return
    }
}

export { parse, asBoolean, asInteger, asNumber, asString, asEnum, asJSON }
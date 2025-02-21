import { log, LOG_ERROR } from '../core/log'

/* === Internal Function === */

const parseNumber = (parseFn: (v: string) => number, value: string | null): number | undefined => {
	if (value == null) return
	const parsed = parseFn(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

const getFallback = <T extends {}>(value: T | [T, ...T[]]): T =>
	(Array.isArray(value) && value[0]) ? value[0] as T : value as T

/* === Exported Functions === */

/**
 * Parse a boolean attribute as an actual boolean value
 * 
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {boolean}
 */
const asBoolean = (value: string | null): boolean =>
	value !== 'false' && value != null

/**
 * Parse an attribute as as number forced to integer with a fallback
 * 
 * @since 0.10.1
 * @param {number} [fallback=0] - fallback value
 * @returns {(value: string | null) => number} - parser function
 */
const asIntegerWithDefault = (fallback: number = 0) =>
	(value: string | null): number =>
		parseNumber(parseInt, value) ?? fallback

/**
 * Parse an attribute as a number forced to integer
 * 
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {number}
 */
const asInteger = asIntegerWithDefault()

/**
 * Parse an attribute as as number with a fallback
 * 
 * @since 0.10.1
 * @param {number} [fallback=0] - fallback value
 * @returns {(value: string | null) => number} - parser function
 */
const asNumberWithDefault = (fallback: number = 0) =>
	(value: string | null): number =>
		parseNumber(parseFloat, value) ?? fallback

/**
 * Parse an attribute as a number
 * 
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {number}
 */
const asNumber = asNumberWithDefault()

/**
 * Parse an attribute as a string with a fallback
 * 
 * @since 0.10.1
 * @param {string} [fallback=''] - fallback value
 * @returns {(value: string | null) => string} - parser function
 */
const asStringWithDefault = (fallback: string = '') =>
	(value: string | null): string =>
		value ?? fallback

/**
 * Parse an attribute as a string
 * 
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {string}
 */
const asString = asStringWithDefault()

/**
 * Parse an attribute as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 * 
 * @since 0.9.0
 * @param {string[]} valid - array of valid values
 * @returns {(value: string | null) => string} - parser function
 */
const asEnum = (valid: [string, ...string[]]) =>
	(value: string | null): string =>
		(value != null && valid.includes(value.toLowerCase()))
			? value
			: getFallback<string>(valid)

/**
 * Parse an attribute as a JSON serialized object with a fallback
 * 
 * @since 0.10.1
 * @param {T} fallback - fallback value
 * @returns {(value: string | null) => T} - parser function
 */
const asJSONWithDefault = <T extends {}>(fallback: T) =>
	(value: string | null): T => {
		if (value == null) return fallback
		let result: T | undefined
		try {
			result = JSON.parse(value)
		} catch (error) {
			log(error, 'Failed to parse JSON', LOG_ERROR)
		}
		return result ?? fallback
	}

/**
 * Parse an attribute as a JSON serialized object
 * 
 * @since 0.7.2
 * @param {string | null} value - maybe string value
 * @returns {T}
 */
const asJSON = asJSONWithDefault({})

export {
	asBoolean,
	asIntegerWithDefault, asInteger, asNumberWithDefault, asNumber,
	asStringWithDefault, asString, asEnum,
	asJSONWithDefault, asJSON
}
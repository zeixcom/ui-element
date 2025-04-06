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
 * @param {C} _ - host element
 * @param {string} value - maybe string value
 * @returns {boolean}
 */
const asBoolean = <C extends HTMLElement>(_: C, value: string | null): boolean =>
	value !== 'false' && value != null

/**
 * Parse an attribute as as number forced to integer with a fallback
 * 
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {(host: C, value: string | null) => number} - parser function
 */
const asInteger = (fallback: number = 0) =>
	<C extends HTMLElement>(_: C, value: string | null): number =>
		parseNumber(parseInt, value) ?? fallback

/**
 * Parse an attribute as as number with a fallback
 * 
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {(host: C, value: string | null) => number} - parser function
 */
const asNumber = (fallback: number = 0) =>
	<C extends HTMLElement>(_: C, value: string | null): number =>
		parseNumber(parseFloat, value) ?? fallback

/**
 * Parse an attribute as a string with a fallback
 * 
 * @since 0.11.0
 * @param {string} [fallback=''] - fallback value
 * @returns {(host: C, value: string | null) => string} - parser function
 */
const asString = (fallback: string = '') =>
	<C extends HTMLElement>(_: C, value: string | null): string =>
		value ?? fallback

/**
 * Parse an attribute as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 * 
 * @since 0.9.0
 * @param {string[]} valid - array of valid values
 * @returns {(host: C, value: string | null) => string} - parser function
 */
const asEnum = (valid: [string, ...string[]]) =>
	<C extends HTMLElement>(_: C, value: string | null): string =>
		(value != null && valid.includes(value.toLowerCase()))
			? value
			: getFallback<string>(valid)

/**
 * Parse an attribute as a JSON serialized object with a fallback
 * 
 * @since 0.11.0
 * @param {T} fallback - fallback value
 * @returns {(host: C, value: string | null) => T} - parser function
 */
const asJSON = <T extends {}>(fallback: T) =>
	<C extends HTMLElement>(_: C, value: string | null): T => {
		if (value == null) return fallback
		let result: T | undefined
		try {
			result = JSON.parse(value)
		} catch (error) {
			log(error, 'Failed to parse JSON', LOG_ERROR)
		}
		return result ?? fallback
	}

export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON }
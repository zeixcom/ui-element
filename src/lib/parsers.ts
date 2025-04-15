import type { AttributeParser } from '../component'

/* === Internal Function === */

const parseNumber = (parseFn: (v: string) => number, value: string | null): number | undefined => {
	if (value == null) return
	const parsed = parseFn(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

/* === Exported Functions === */

/**
 * Parse a boolean attribute as an actual boolean value
 * 
 * @since 0.7.0
 * @param {C} _ - host element
 * @param {string} value - maybe string value
 * @returns {boolean}
 */
const asBoolean: AttributeParser<boolean, HTMLElement> = (_: HTMLElement, value: string | null): boolean =>
	value !== 'false' && value != null

/**
 * Parse an attribute as as number forced to integer with a fallback
 * 
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {Parser<number, HTMLElement>} - parser function
 */
const asInteger = (fallback: number = 0): AttributeParser<number, HTMLElement> =>
	(_: HTMLElement, value: string | null): number =>
		parseNumber(parseInt, value) ?? fallback

/**
 * Parse an attribute as as number with a fallback
 * 
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {Parser<number, HTMLElement>} - parser function
 */
const asNumber = (fallback: number = 0): AttributeParser<number, HTMLElement> =>
	(_: HTMLElement, value: string | null): number =>
		parseNumber(parseFloat, value) ?? fallback

/**
 * Parse an attribute as a string with a fallback
 * 
 * @since 0.11.0
 * @param {string} [fallback=''] - fallback value
 * @returns {Parser<string, HTMLElement>} - parser function
 */
const asString = (fallback: string = ''): AttributeParser<string, HTMLElement> =>
	(_: HTMLElement, value: string | null): string =>
		value ?? fallback

/**
 * Parse an attribute as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 * 
 * @since 0.9.0
 * @param {string[]} valid - array of valid values
 * @returns {Parser<string, HTMLElement>} - parser function
 */
const asEnum = (valid: [string, ...string[]]): AttributeParser<string, HTMLElement> =>
	(_: HTMLElement, value: string | null): string =>
		(value != null && valid.includes(value.toLowerCase()))
			? value
			: valid[0]

/**
 * Parse an attribute as a JSON serialized object with a fallback
 * 
 * @since 0.11.0
 * @param {T} fallback - fallback value
 * @returns {Parser<T, HTMLElement>} - parser function
 * @throws {ReferenceError} - if the value and fallback are both null or undefined
 * @throws {SyntaxError} - if the value is not a valid JSON object
 */
const asJSON = <T extends {}>(fallback: T): AttributeParser<T, HTMLElement> =>
	(_: HTMLElement, value: string | null): T => {
		if ((value ?? fallback) == null) throw new ReferenceError('Value and fallback are both null or undefined')
		if (value == null) return fallback
		if (value === '') throw new SyntaxError('Empty string is not valid JSON')
		let result: T | undefined
		try {
			result = JSON.parse(value)
		} catch (error) {
			throw new SyntaxError(`Failed to parse JSON: ${String(error)}`, { cause: error })
		}
		return result ?? fallback
	}

export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON }
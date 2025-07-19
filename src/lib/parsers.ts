import { type Fallback, type Parser, getFallback } from '../core/dom'

/* === Internal Function === */

const parseNumber = (
	parseFn: (v: string) => number,
	value: string | null | undefined,
) => {
	if (value == null) return
	const parsed = parseFn(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

/* === Exported Functions === */

/**
 * Parse a boolean attribute as an actual boolean value
 *
 * @since 0.13.1
 * @returns {Parser<boolean>}
 */
const asBoolean =
	(): Parser<boolean> => (_: HTMLElement, value: string | null | undefined) =>
		value != null && value !== 'false'

/**
 * Parse a string as a number forced to integer with a fallback
 *
 * Supports hexadecimal and scientific notation
 *
 * @since 0.11.0
 * @param {Fallback<number, E>} [fallback=0] - Fallback value or extractor function
 * @returns {Parser<number, E>} Parser function
 */
const asInteger =
	<E extends Element = HTMLElement>(
		fallback: Fallback<number, E> = 0,
	): Parser<number, E> =>
	(element: E, value: string | null | undefined) => {
		if (value == null) return getFallback(element, fallback)

		// Handle hexadecimal notation
		const trimmed = value.trim()
		if (trimmed.toLowerCase().startsWith('0x'))
			return (
				parseNumber(v => parseInt(v, 16), trimmed) ??
				getFallback(element, fallback)
			)

		// Handle other formats (including scientific notation)
		const parsed = parseNumber(parseFloat, value)
		return parsed != null
			? Math.trunc(parsed)
			: getFallback(element, fallback)
	}

/**
 * Parse a string as a number with a fallback
 *
 * @since 0.11.0
 * @param {Fallback<number, E>} [fallback=0] - Fallback value or extractor function
 * @returns {Parser<number, E>} Parser function
 */
const asNumber =
	<E extends Element = HTMLElement>(
		fallback: Fallback<number, E> = 0,
	): Parser<number, E> =>
	(element: E, value: string | null | undefined) =>
		parseNumber(parseFloat, value) ?? getFallback(element, fallback)

/**
 * Parse a string as a string with a fallback
 *
 * @since 0.11.0
 * @param {Fallback<string, E>} [fallback=''] - Fallback value or extractor function
 * @returns {Parser<string, E>} Parser function
 */
const asString =
	<E extends Element = HTMLElement>(
		fallback: Fallback<string, E> = '',
	): Parser<string, E> =>
	(element: E, value: string | null | undefined) =>
		value ?? getFallback(element, fallback)

/**
 * Parse a string as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 *
 * @since 0.9.0
 * @param {[string, ...string[]]} valid - Array of valid values
 * @returns {Parser<string>} Parser function
 */
const asEnum =
	(valid: [string, ...string[]]): Parser<string> =>
	(_: Element, value: string | null | undefined) => {
		if (value == null) return valid[0]
		const lowerValue = value.toLowerCase()
		const matchingValid = valid.find(v => v.toLowerCase() === lowerValue)
		return matchingValid ? value : valid[0]
	}

/**
 * Parse a string as a JSON serialized object with a fallback
 *
 * @since 0.11.0
 * @param {Fallback<T, E>} fallback - Fallback value or extractor function
 * @returns {Parser<T, E>} Parser function
 * @throws {TypeError} If the value and fallback are both null or undefined
 * @throws {SyntaxError} If value is not a valid JSON string
 */
const asJSON =
	<T extends {}, E extends Element = HTMLElement>(
		fallback: Fallback<T, E>,
	): Parser<T, E> =>
	(element: E, value: string | null | undefined) => {
		if ((value ?? fallback) == null)
			throw new TypeError(
				'asJSON: Value and fallback are both null or undefined',
			)
		if (value == null) return getFallback(element, fallback)
		if (value === '') throw new TypeError('Empty string is not valid JSON')
		let result: T | undefined
		try {
			result = JSON.parse(value)
		} catch (error) {
			throw new SyntaxError(`Failed to parse JSON: ${String(error)}`, {
				cause: error,
			})
		}
		return result ?? getFallback(element, fallback)
	}

export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON }

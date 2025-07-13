import {
	type OptionalStringParser,
	type StringParser,
	type ValueOrExtractor,
	extractValue,
} from '../core/dom'

/* === Internal Function === */

const parseNumber = (
	parseFn: (v: string) => number,
	value: string | null | undefined,
): number | undefined => {
	if (value == null) return
	const parsed = parseFn(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

/* === Exported Functions === */

/**
 * Parse a boolean attribute as an actual boolean value
 *
 * @since 0.13.1
 * @returns {StringParser<boolean>}
 */
const asBoolean =
	(): StringParser<boolean> =>
	(_: HTMLElement, value: string | null | undefined): boolean =>
		value != null && value !== 'false'

/**
 * Parse a string as a number forced to integer with a fallback
 *
 * Supports hexadecimal and scientific notation
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<number, E>} [fallback=0] - Fallback value or extractor function
 * @returns {StringParser<number, E>} Parser function
 */
const asInteger = <E extends Element = HTMLElement>(
	fallback: ValueOrExtractor<number, E> = 0,
): StringParser<number, E> => {
	const parser = (element: E, value: string | null | undefined): number => {
		if (value == null) return extractValue(fallback, element, parser)

		// Handle hexadecimal notation
		const trimmed = value.trim()
		if (trimmed.toLowerCase().startsWith('0x'))
			return (
				parseNumber(v => parseInt(v, 16), trimmed) ??
				extractValue(fallback, element, parser)
			)

		// Handle other formats (including scientific notation)
		const parsed = parseNumber(parseFloat, value)
		return parsed != null
			? Math.trunc(parsed)
			: extractValue(fallback, element, parser)
	}
	return parser
}

/**
 * Parse a string as a number with a fallback
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<number, E>} [fallback=0] - Fallback value or extractor function
 * @returns {StringParser<number, E>} Parser function
 */
const asNumber = <E extends Element = HTMLElement>(
	fallback: ValueOrExtractor<number, E> = 0,
): StringParser<number, E> => {
	const parser = (element: E, value: string | null | undefined): number =>
		parseNumber(parseFloat, value) ??
		extractValue(fallback, element, parser)
	return parser
}

/**
 * Parse a string as a string with a fallback
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<string, E>} [fallback=''] - Fallback value or extractor function
 * @returns {StringParser<string, E>} Parser function
 */
const asString =
	<E extends Element = HTMLElement>(
		fallback: ValueOrExtractor<string, E> = '',
	): StringParser<string, E> =>
	(element: E, value: string | null | undefined): string =>
		value ?? extractValue(fallback, element, undefined)

/**
 * Parse a string as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 *
 * @since 0.9.0
 * @param {[string, ...string[]]} valid - Array of valid values
 * @returns {StringParser<string>} Parser function
 */
const asEnum =
	(valid: [string, ...string[]]): StringParser<string> =>
	(_: Element, value: string | null | undefined): string => {
		if (value == null) return valid[0]
		const lowerValue = value.toLowerCase()
		const matchingValid = valid.find(v => v.toLowerCase() === lowerValue)
		return matchingValid ? value : valid[0]
	}

/**
 * Parse a string as a JSON serialized object with a fallback
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<T, E>} fallback - Fallback value or extractor function
 * @returns {StringParser<T, E>} Parser function
 * @throws {TypeError} If the value and fallback are both null or undefined
 * @throws {SyntaxError} If value is not a valid JSON string
 */
const asJSON = <T extends {}, E extends Element = HTMLElement>(
	fallback: ValueOrExtractor<T, E>,
): StringParser<T, E> => {
	const parser = (element: E, value: string | null | undefined): T => {
		if ((value ?? fallback) == null)
			throw new TypeError(
				'asJSON: Value and fallback are both null or undefined',
			)
		if (value == null)
			return extractValue(
				fallback,
				element,
				parser as OptionalStringParser<T, E>,
			)
		if (value === '') throw new TypeError('Empty string is not valid JSON')
		let result: T | undefined
		try {
			result = JSON.parse(value)
		} catch (error) {
			throw new SyntaxError(`Failed to parse JSON: ${String(error)}`, {
				cause: error,
			})
		}
		return (
			result ??
			extractValue(
				fallback,
				element,
				parser as OptionalStringParser<T, E>,
			)
		)
	}
	return parser
}

export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON }

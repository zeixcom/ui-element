import { type StringParser, type ValueOrExtractor } from '../core/dom'
/**
 * Parse a boolean attribute as an actual boolean value
 *
 * @since 0.13.1
 * @returns {StringParser<boolean>}
 */
declare const asBoolean: () => StringParser<boolean>
/**
 * Parse a string as a number forced to integer with a fallback
 *
 * Supports hexadecimal and scientific notation
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<number, E>} [fallback=0] - Fallback value or extractor function
 * @returns {StringParser<number, E>} Parser function
 */
declare const asInteger: <E extends Element = HTMLElement>(
	fallback?: ValueOrExtractor<number, E>,
) => StringParser<number, E>
/**
 * Parse a string as a number with a fallback
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<number, E>} [fallback=0] - Fallback value or extractor function
 * @returns {StringParser<number, E>} Parser function
 */
declare const asNumber: <E extends Element = HTMLElement>(
	fallback?: ValueOrExtractor<number, E>,
) => StringParser<number, E>
/**
 * Parse a string as a string with a fallback
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<string, E>} [fallback=''] - Fallback value or extractor function
 * @returns {StringParser<string, E>} Parser function
 */
declare const asString: <E extends Element = HTMLElement>(
	fallback?: ValueOrExtractor<string, E>,
) => StringParser<string, E>
/**
 * Parse a string as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 *
 * @since 0.9.0
 * @param {[string, ...string[]]} valid - Array of valid values
 * @returns {StringParser<string>} Parser function
 */
declare const asEnum: (valid: [string, ...string[]]) => StringParser<string>
/**
 * Parse a string as a JSON serialized object with a fallback
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<T, E>} fallback - Fallback value or extractor function
 * @returns {StringParser<T, E>} Parser function
 * @throws {TypeError} If the value and fallback are both null or undefined
 * @throws {SyntaxError} If value is not a valid JSON string
 */
declare const asJSON: <T extends {}, E extends Element = HTMLElement>(
	fallback: ValueOrExtractor<T, E>,
) => StringParser<T, E>
export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON }

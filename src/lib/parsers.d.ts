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
 * @param {ValueOrExtractor<number>} [fallback=0] - Fallback value or extractor function
 * @returns {StringParser<number>} Parser function
 */
declare const asInteger: (
	fallback?: ValueOrExtractor<number>,
) => StringParser<number>
/**
 * Parse a string as a number with a fallback
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<number>} [fallback=0] - Fallback value or extractor function
 * @returns {AttributeParser<number>} Parser function
 */
declare const asNumber: (
	fallback?: ValueOrExtractor<number>,
) => StringParser<number>
/**
 * Parse a string as a string with a fallback
 *
 * @since 0.11.0
 * @param {ValueOrExtractor<string>} [fallback=''] - Fallback value or extractor function
 * @returns {StringParser<string>} Parser function
 */
declare const asString: (
	fallback?: ValueOrExtractor<string>,
) => StringParser<string>
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
 * @param {ValueOrExtractor<T>} fallback - Fallback value or extractor function
 * @returns {StringParser<T>} Parser function
 * @throws {TypeError} If the value and fallback are both null or undefined or value is not a valid JSON string
 */
declare const asJSON: <T extends {}>(
	fallback: ValueOrExtractor<T>,
) => StringParser<T>
export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON }

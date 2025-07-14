import { type Fallback, type Parser } from '../core/dom'
/**
 * Parse a boolean attribute as an actual boolean value
 *
 * @since 0.13.1
 * @returns {Parser<boolean>}
 */
declare const asBoolean: () => Parser<boolean>
/**
 * Parse a string as a number forced to integer with a fallback
 *
 * Supports hexadecimal and scientific notation
 *
 * @since 0.11.0
 * @param {Fallback<number, E>} [fallback=0] - Fallback value or extractor function
 * @returns {Parser<number, E>} Parser function
 */
declare const asInteger: <E extends Element = HTMLElement>(
	fallback?: Fallback<number, E>,
) => Parser<number, E>
/**
 * Parse a string as a number with a fallback
 *
 * @since 0.11.0
 * @param {Fallback<number, E>} [fallback=0] - Fallback value or extractor function
 * @returns {Parser<number, E>} Parser function
 */
declare const asNumber: <E extends Element = HTMLElement>(
	fallback?: Fallback<number, E>,
) => Parser<number, E>
/**
 * Parse a string as a string with a fallback
 *
 * @since 0.11.0
 * @param {Fallback<string, E>} [fallback=''] - Fallback value or extractor function
 * @returns {Parser<string, E>} Parser function
 */
declare const asString: <E extends Element = HTMLElement>(
	fallback?: Fallback<string, E>,
) => Parser<string, E>
/**
 * Parse a string as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 *
 * @since 0.9.0
 * @param {[string, ...string[]]} valid - Array of valid values
 * @returns {Parser<string>} Parser function
 */
declare const asEnum: (valid: [string, ...string[]]) => Parser<string>
/**
 * Parse a string as a JSON serialized object with a fallback
 *
 * @since 0.11.0
 * @param {Fallback<T, E>} fallback - Fallback value or extractor function
 * @returns {Parser<T, E>} Parser function
 * @throws {TypeError} If the value and fallback are both null or undefined
 * @throws {SyntaxError} If value is not a valid JSON string
 */
declare const asJSON: <T extends {}, E extends Element = HTMLElement>(
	fallback: Fallback<T, E>,
) => Parser<T, E>
export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON }

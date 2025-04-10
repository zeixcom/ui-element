import type { Parser } from '../component';
/**
 * Parse a boolean attribute as an actual boolean value
 *
 * @since 0.7.0
 * @param {C} _ - host element
 * @param {string} value - maybe string value
 * @returns {boolean}
 */
declare const asBoolean: Parser<boolean, HTMLElement>;
/**
 * Parse an attribute as as number forced to integer with a fallback
 *
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {Parser<number, HTMLElement>} - parser function
 */
declare const asInteger: (fallback?: number) => Parser<number, HTMLElement>;
/**
 * Parse an attribute as as number with a fallback
 *
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {Parser<number, HTMLElement>} - parser function
 */
declare const asNumber: (fallback?: number) => Parser<number, HTMLElement>;
/**
 * Parse an attribute as a string with a fallback
 *
 * @since 0.11.0
 * @param {string} [fallback=''] - fallback value
 * @returns {Parser<string, HTMLElement>} - parser function
 */
declare const asString: (fallback?: string) => Parser<string, HTMLElement>;
/**
 * Parse an attribute as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 *
 * @since 0.9.0
 * @param {string[]} valid - array of valid values
 * @returns {Parser<string, HTMLElement>} - parser function
 */
declare const asEnum: (valid: [string, ...string[]]) => Parser<string, HTMLElement>;
/**
 * Parse an attribute as a JSON serialized object with a fallback
 *
 * @since 0.11.0
 * @param {T} fallback - fallback value
 * @returns {Parser<T, HTMLElement>} - parser function
 */
declare const asJSON: <T extends {}>(fallback: T) => Parser<T, HTMLElement>;
export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON };

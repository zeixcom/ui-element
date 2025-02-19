/**
 * Parse a boolean attribute as an actual boolean value
 *
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {boolean}
 */
declare const asBoolean: (value: string | null) => boolean;
/**
 * Parse an attribute as as number forced to integer with a fallback
 *
 * @since 0.10.1
 * @param {number} [fallback=0] - fallback value
 * @returns {(value: string | null) => number} - parser function
 */
declare const asIntegerWithDefault: (fallback?: number) => (value: string | null) => number;
/**
 * Parse an attribute as a number forced to integer
 *
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {number}
 */
declare const asInteger: (value: string | null) => number;
/**
 * Parse an attribute as as number with a fallback
 *
 * @since 0.10.1
 * @param {number} [fallback=0] - fallback value
 * @returns {(value: string | null) => number} - parser function
 */
declare const asNumberWithDefault: (fallback?: number) => (value: string | null) => number;
/**
 * Parse an attribute as a number
 *
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {number}
 */
declare const asNumber: (value: string | null) => number;
/**
 * Parse an attribute as a string with a fallback
 *
 * @since 0.10.1
 * @param {string} [fallback=''] - fallback value
 * @returns {(value: string | null) => string} - parser function
 */
declare const asStringWithDefault: (fallback?: string) => (value: string | null) => string;
/**
 * Parse an attribute as a string
 *
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {string}
 */
declare const asString: (value: string | null) => string;
/**
 * Parse an attribute as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 *
 * @since 0.9.0
 * @param {string[]} valid - array of valid values
 * @returns {(value: string | null) => string} - parser function
 */
declare const asEnum: (valid: [string, ...string[]]) => (value: string | null) => string;
/**
 * Parse an attribute as a JSON serialized object with a fallback
 *
 * @since 0.10.1
 * @param {T} fallback - fallback value
 * @returns {(value: string | null) => T} - parser function
 */
declare const asJSONWithDefault: <T extends {}>(fallback: T) => (value: string | null) => T;
/**
 * Parse an attribute as a JSON serialized object
 *
 * @since 0.7.2
 * @param {string | null} value - maybe string value
 * @returns {T}
 */
declare const asJSON: (value: string | null) => {};
export { asBoolean, asIntegerWithDefault, asInteger, asNumberWithDefault, asNumber, asStringWithDefault, asString, asEnum, asJSONWithDefault, asJSON };

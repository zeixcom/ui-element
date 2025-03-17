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
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {(value: string | null) => number} - parser function
 */
declare const asInteger: (fallback?: number) => (value: string | null) => number;
/**
 * Parse an attribute as as number with a fallback
 *
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {(value: string | null) => number} - parser function
 */
declare const asNumber: (fallback?: number) => (value: string | null) => number;
/**
 * Parse an attribute as a string with a fallback
 *
 * @since 0.11.0
 * @param {string} [fallback=''] - fallback value
 * @returns {(value: string | null) => string} - parser function
 */
declare const asString: (fallback?: string) => (value: string | null) => string;
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
 * @since 0.11.0
 * @param {T} fallback - fallback value
 * @returns {(value: string | null) => T} - parser function
 */
declare const asJSON: <T extends {}>(fallback: T) => (value: string | null) => T;
export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON };

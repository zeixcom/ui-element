import type { UIElement } from '../ui-element';
/**
 * Parse according to static states
 *
 * @since 0.8.4
 * @param {UIElement} host - host UIElement
 * @param {string} name - attribute name
 * @param {string | undefined} value - attribute value
 * @param {string | undefined} [old=undefined] - old attribute value
 * @returns {unknown}
 */
declare const parse: (host: UIElement, name: string, value: string | undefined, old?: string | undefined) => unknown;
/**
 * Parse a boolean attribute as an actual boolean value
 *
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {boolean}
 */
declare const asBoolean: (value?: string) => boolean;
/**
 * Parse an attribute as a number forced to integer
 *
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {number | undefined}
 */
declare const asInteger: (value?: string) => number | undefined;
/**
 * Parse an attribute as a number
 *
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {number | undefined}
 */
declare const asNumber: (value?: string) => number | undefined;
/**
 * Parse an attribute as a string
 *
 * @since 0.7.0
 * @param {string} value - maybe string value
 * @returns {string}
 */
declare const asString: (value?: string) => string | undefined;
/**
 * Parse an attribute as a tri-state value (true, false, mixed)
 *
 * @since 0.9.0
 * @param {string[]} valid - array of valid values
 */
declare const asEnum: (valid: string[]) => (value?: string) => string | undefined;
/**
 * Parse an attribute as a JSON serialized object
 *
 * @since 0.7.2
 * @param {string} value - maybe string value
 * @returns {unknown}
 */
declare const asJSON: (value?: string) => unknown;
export { parse, asBoolean, asInteger, asNumber, asString, asEnum, asJSON };

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
declare const DEV_MODE: string | undefined;
declare const LOG_DEBUG: LogLevel;
declare const LOG_INFO: LogLevel;
declare const LOG_WARN: LogLevel;
declare const LOG_ERROR: LogLevel;
declare const isDefinedObject: (value: unknown) => value is Record<string, unknown>;
declare const isString: (value: unknown) => value is string;
/**
 * Return a HyperScript string representation of the Element instance
 *
 * @since 0.7.0
 * @param {Element} el
 * @returns {string}
 */
declare const elementName: (el: Element) => string;
/**
 * Return a string representation of a JavaScript variable
 *
 * @since 0.7.0
 * @param {unknown} value
 * @returns {string}
 */
declare const valueString: (value: unknown) => string;
/**
 * Return a detailed type of a JavaScript variable
 *
 * @since 0.11.0
 * @param {unknown} value
 * @returns {string}
 */
declare const typeString: (value: unknown) => string;
/**
 * Log a message to the console with the specified level
 *
 * @since 0.7.0
 * @param {T} value - value to inspect
 * @param {string} msg - message to log
 * @param {LogLevel} level - log level
 * @returns {T} - value passed through
 */
declare const log: <T>(value: T, msg: string, level?: LogLevel) => T;
declare const assert: (assertion: boolean, msg: string, ...rest: unknown[]) => boolean;
export { type LogLevel, isString, isDefinedObject, log, assert, elementName, valueString, typeString, DEV_MODE, LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR, };

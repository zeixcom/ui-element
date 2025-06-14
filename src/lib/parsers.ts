import type { AttributeParser } from '../component'

/* === Internal Function === */

const parseNumber = (
	parseFn: (v: string) => number,
	value: string | null,
): number | undefined => {
	if (value == null) return
	const parsed = parseFn(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

/* === Exported Functions === */

/**
 * Parse a boolean attribute as an actual boolean value
 *
 * @since 0.7.0
 * @param {HTMLElement} _ - host element
 * @param {string} value - maybe string value
 * @returns {boolean}
 */
const asBoolean: AttributeParser<boolean> = (
	_: HTMLElement,
	value: string | null,
): boolean => value !== 'false' && value != null

/**
 * Parse an attribute as as number forced to integer with a fallback
 *
 * Supports hexadecimal and scientific notation
 *
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {AttributeParser<number>} parser function
 */
const asInteger =
	(fallback: number = 0): AttributeParser<number> =>
	(_: HTMLElement, value: string | null): number => {
		if (value == null) return fallback
		const trimmed = value.trim()
		if (trimmed === '') return fallback

		// Handle hexadecimal notation
		if (trimmed.toLowerCase().startsWith('0x')) {
			const parsed = parseInt(trimmed, 16)
			return Number.isFinite(parsed) ? parsed : fallback
		}

		// Handle other formats (including scientific notation)
		const parsed = parseNumber(parseFloat, value)
		return parsed != null ? Math.trunc(parsed) : fallback
	}

/**
 * Parse an attribute as as number with a fallback
 *
 * @since 0.11.0
 * @param {number} [fallback=0] - fallback value
 * @returns {AttributeParser<number>} parser function
 */
const asNumber =
	(fallback: number = 0): AttributeParser<number> =>
	(_: HTMLElement, value: string | null): number =>
		parseNumber(parseFloat, value) ?? fallback

/**
 * Parse an attribute as a string with a fallback
 *
 * @since 0.11.0
 * @param {string} [fallback=''] - fallback value
 * @returns {AttributeParser<string>} parser function
 */
const asString =
	(fallback: string = ''): AttributeParser<string> =>
	(_: HTMLElement, value: string | null): string =>
		value ?? fallback

/**
 * Parse an attribute as a multi-state value (for examnple: true, false, mixed), defaulting to the first valid option
 *
 * @since 0.9.0
 * @param {string[]} valid - array of valid values
 * @returns {AttributeParser<string>} parser function
 */
const asEnum =
	(valid: [string, ...string[]]): AttributeParser<string> =>
	(_: HTMLElement, value: string | null): string => {
		if (value == null) return valid[0]
		const lowerValue = value.toLowerCase()
		const matchingValid = valid.find(v => v.toLowerCase() === lowerValue)
		return matchingValid ? value : valid[0]
	}

/**
 * Parse an attribute as a JSON serialized object with a fallback
 *
 * @since 0.11.0
 * @param {T} fallback - fallback value
 * @returns {AttributeParser<T>} parser function
 * @throws {ReferenceError} if the value and fallback are both null or undefined
 * @throws {SyntaxError} if the value is not a valid JSON object
 */
const asJSON =
	<T extends {}>(fallback: T): AttributeParser<T> =>
	(_: HTMLElement, value: string | null): T => {
		if ((value ?? fallback) == null)
			throw new ReferenceError(
				'Value and fallback are both null or undefined',
			)
		if (value == null) return fallback
		if (value === '')
			throw new SyntaxError('Empty string is not valid JSON')
		let result: T | undefined
		try {
			result = JSON.parse(value)
		} catch (error) {
			throw new SyntaxError(`Failed to parse JSON: ${String(error)}`, {
				cause: error,
			})
		}
		return result ?? fallback
	}

export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON }

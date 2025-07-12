import { type Computed } from '@zeix/cause-effect'
import type { SignalProducer } from '../component'
type ElementFromSelector<
	K extends string,
	E extends Element = HTMLElement,
> = K extends keyof HTMLElementTagNameMap
	? HTMLElementTagNameMap[K]
	: K extends keyof SVGElementTagNameMap
		? SVGElementTagNameMap[K]
		: K extends keyof MathMLElementTagNameMap
			? MathMLElementTagNameMap[K]
			: E
type StringParser<T extends {}, E extends Element = HTMLElement> = (
	host: E,
	value: string | null | undefined,
	old?: string | null,
) => T
type ValueOrExtractor<T extends {}, E extends Element = HTMLElement> =
	| T
	| ((element: E) => T)
type Extractor<
	T,
	E extends Element = HTMLElement,
	S extends string = string,
> = (element: ElementFromSelector<S, E>) => T | string
/**
 * Check if a value is a string parser
 *
 * @since 0.13.4
 * @param {unknown} value - Value to check if it is a string parser
 * @returns {boolean} True if the value is a string parser, false otherwise
 */
declare const isStringParser: <
	T extends {},
	C extends HTMLElement = HTMLElement,
>(
	value: unknown,
) => value is StringParser<T, C>
/**
 * Get a value from an extractor function or a value
 *
 * @since 0.13.4
 * @param {ValueOrExtractor<T, E>} extractor - Value or extractor function
 * @param {E} element - Element to pass to extractor function
 * @param {StringParser<T, E>} parser - String parser function
 * @returns {T} Non-nullable value
 */
declare const extractValue: <T extends {}, E extends Element = HTMLElement>(
	extractor: ValueOrExtractor<T, E>,
	element: E,
	parser?: StringParser<T, E>,
) => T
/**
 * Observe a DOM subtree with a mutation observer
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node
 * @param {string} selector - selector for matching elements to observe
 * @param {MutationCallback} callback - mutation callback
 * @returns {MutationObserver} - the created mutation observer
 */
declare const observeSubtree: (
	parent: ParentNode,
	selector: string,
	callback: MutationCallback,
) => MutationObserver
/**
 * Produce a computed signal of an array of elements matching a selector
 *
 * @since 0.13.1
 * @param {K} selector - CSS selector for descendant elements
 * @returns {(host: C) => Computed<ElementFromSelector<S, E>[]>} Signal producer for descendant element collection from a selector
 */
declare const fromSelector: <
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	selector: S,
) => SignalProducer<ElementFromSelector<S, E>[], C>
/**
 * Reduced properties of descendant elements
 *
 * @since 0.13.3
 * @param {C} host - Host element for computed property
 * @param {S} selector - CSS selector for descendant elements
 * @param {(accumulator: T, currentElement: ElementFromSelector<S, E>, currentIndex: number, array: ElementFromSelector<S, E>[]) => T} reducer - Function to reduce values
 * @param {T} initialValue - Initial value function for reduction
 * @returns {Computed<T>} Computed signal of reduced values of descendant elements
 */
declare const reduced: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	host: C,
	selector: S,
	reducer: (
		accumulator: T,
		currentElement: ElementFromSelector<S, E>,
		currentIndex: number,
		array: ElementFromSelector<S, E>[],
	) => T,
	initialValue: T,
) => Computed<T>
/**
 * Read from a descendant element and map the result
 *
 * @since 0.13.3
 * @param {C} host - Host element
 * @param {S} selector - CSS selector for descendant element
 * @param {(element: ElementFromSelector<S, E> | null, isUpgraded: boolean) => T} map - Function to map over the element
 * @returns {T} The mapped result from the descendant element
 */
declare const read: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	host: C,
	selector: S,
	map: (element: ElementFromSelector<S, E> | null, isUpgraded: boolean) => T,
) => T
/**
 * Assert that an element contains an expected descendant element
 *
 * @since 0.13.4
 * @param {HTMLElement} host - Host element
 * @param {S} selector - Selector for element to check for
 * @returns {ElementFromSelector<S, E>} First found descendant element
 * @throws {Error} If the element does not contain the required descendant element
 */
declare const requireElement: <
	S extends string = string,
	E extends Element = HTMLElement,
>(
	host: HTMLElement,
	selector: S,
) => ElementFromSelector<S, E>
/**
 * Get an initial value from multiple element selectors with optional parser and fallback
 *
 * @since 0.13.4
 * @param {S} selector - Selector for element to check for
 * @param {Extractor<T, ElementFromSelector<string, E>>} extractor - Extractor function
 * @param {StringParser<T>} [parser] - Optional parser for string values
 * @param {ValueOrExtractor<T>} [fallback] - Optional fallback value or extractor
 * @returns {(host: C) => T} Function to retrieve value from host element
 * @throws {Error} If no element matches any selector and no fallback is provided
 */
declare const fromDOM: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	selector: S,
	extractor: Extractor<T, ElementFromSelector<S, E>>,
	parser?: StringParser<T>,
	fallback?: ValueOrExtractor<T>,
) => (host: C) => T
declare const fromComponent: <
	T,
	S extends string = string,
	E extends Element = HTMLElement,
>(
	selector: S,
	fn: (target: ElementFromSelector<S, E>) => T,
	fallback: ValueOrExtractor<NonNullable<T>>,
) => <C extends HTMLElement>(host: C) => Computed<NonNullable<T>>
export {
	type ElementFromSelector,
	type StringParser,
	type ValueOrExtractor,
	extractValue,
	fromComponent,
	fromDOM,
	fromSelector,
	isStringParser,
	reduced,
	read,
	observeSubtree,
	requireElement,
}

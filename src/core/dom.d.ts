import { type Computed } from '@zeix/cause-effect'
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
type Extractor<T extends {}, E extends Element = HTMLElement> = (
	element: E,
) => T
type LooseExtractor<T, E extends Element = HTMLElement> = (element: E) => T
type ValueOrExtractor<T extends {}, E extends Element = HTMLElement> =
	| T
	| Extractor<T, E>
type StringParser<T extends {}, E extends Element = HTMLElement> = (
	host: E,
	value: string | null | undefined,
	old?: string | null,
) => T
type OptionalStringParser<
	T extends {},
	E extends Element = HTMLElement,
> = T extends string ? undefined : StringParser<T, E>
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
 * Parse a value using a string parser
 *
 * @since 0.13.4
 * @param {string | null | undefined} value - Value to parse
 * @param {E} element - Element to pass to parser function
 * @param {OptionalStringParser<T, E>} parser - String parser function
 * @returns {T} Parsed value
 */
declare const parseValue: <T extends {}, E extends Element = HTMLElement>(
	value: string | null | undefined,
	element: E,
	parser: OptionalStringParser<T, E>,
) => T
/**
 * Get a value from an extractor function or a value
 *
 * @since 0.13.4
 * @param {ValueOrExtractor<T | string, E>} extractor - Value or extractor function
 * @param {E} element - Element to pass to extractor function
 * @param {StringParser<T, E>} parser - String parser function
 * @returns {T} Non-nullable value
 */
declare const extractValue: <T extends {}, E extends Element = HTMLElement>(
	extractor: ValueOrExtractor<T | string, E>,
	element: E,
	parser?: OptionalStringParser<T, E>,
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
 * @returns {Extractor<Computed<ElementFromSelector<S, E>[]>, C>} Signal producer for descendant element collection from a selector
 */
declare const fromSelector: <
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	selector: S,
) => Extractor<Computed<ElementFromSelector<S, E>[]>, C>
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
 * @param {ValueOrExtractor<T>} [fallback] - Optional fallback value or extractor
 * @param {StringParser<T>} [parser] - Optional parser for string values
 * @returns {Extractor<T, C>} Extractor function to retrieve value from host element
 * @throws {Error} If no element matches any selector and no fallback is provided
 */
declare const fromDOM: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	selector: S,
	extractor: LooseExtractor<
		T | string | null | undefined,
		ElementFromSelector<S, E>
	>,
	fallback: ValueOrExtractor<T, C>,
	parser?: OptionalStringParser<T, C>,
) => Extractor<T, C>
declare const fromComponent: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	selector: S,
	extractor: Extractor<T, ElementFromSelector<S, E>>,
	fallback: ValueOrExtractor<T>,
	parser?: OptionalStringParser<T>,
) => Extractor<Computed<T>, C>
export {
	type ElementFromSelector,
	type Extractor,
	type LooseExtractor,
	type OptionalStringParser,
	type StringParser,
	type ValueOrExtractor,
	extractValue,
	fromComponent,
	fromDOM,
	fromSelector,
	isStringParser,
	parseValue,
	reduced,
	read,
	observeSubtree,
	requireElement,
}

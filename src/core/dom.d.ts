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
type LooseExtractor<T, E extends Element = HTMLElement> = (
	element: E,
) => T | null | undefined
type Parser<T extends {}, E extends Element = HTMLElement> = (
	element: E,
	value: string | null | undefined,
	old?: string | null,
) => T
type Fallback<T extends {}, E extends Element = HTMLElement> =
	| T
	| Extractor<T, E>
type ParserOrFallback<T extends {}, E extends Element = HTMLElement> =
	| Parser<T, E>
	| Fallback<T, E>
/**
 * Check if a value is a string parser
 *
 * @since 0.13.4
 * @param {unknown} value - Value to check if it is a string parser
 * @returns {boolean} True if the value is a string parser, false otherwise
 */
declare const isParser: <T extends {}, E extends Element = HTMLElement>(
	value: unknown,
) => value is Parser<T, E>
/**
 * Get a fallback value for an element
 *
 * @since 0.13.4
 * @param {E} element - Element to get fallback value for
 * @param {ParserOrFallback<T, E>} fallback - Fallback value or parser function
 * @returns {T} Fallback value or parsed value
 */
declare const getFallback: <T extends {}, E extends Element = HTMLElement>(
	element: E,
	fallback: ParserOrFallback<T, E>,
) => T
/**
 * Get a value from the first element matching a selector
 *
 * @since 0.13.4
 * @param {string} selector - Selector to match
 * @param {LooseExtractor<T | string | null | undefined, ElementFromSelector<S, E>>[]} extractors - Extractor functions to apply to the element
 * @returns {LooseExtractor<T | string | null | undefined, C>} Loose extractor function to apply to the host element
 */
declare const fromFirst: <
	T,
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	selector: S,
	...extractors: LooseExtractor<T | string, ElementFromSelector<S, E>>[]
) => LooseExtractor<T | string, C>
declare const fromDOM: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends {
		[K in keyof S & string]: LooseExtractor<
			T | string,
			ElementFromSelector<K, E>
		>
	} = {},
>(
	fallback: ParserOrFallback<T, C>,
	selectors: S,
) => Extractor<T, C>
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
	assertCustomElement?: boolean,
) => ElementFromSelector<S, E>
declare const fromComponent: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	selector: S,
	extractor: Extractor<T, ElementFromSelector<S, E>>,
	fallback: Fallback<T>,
) => Extractor<Computed<T>, C>
export {
	type ElementFromSelector,
	type Extractor,
	type Fallback,
	type LooseExtractor,
	type Parser,
	type ParserOrFallback,
	fromComponent,
	fromDOM,
	fromFirst,
	fromSelector,
	getFallback,
	isParser,
	reduced,
	read,
	observeSubtree,
	requireElement,
}

import { type Computed } from '@zeix/cause-effect'
import type { Component, ComponentProps } from '../component'
type ElementFromSelector<K extends string> =
	K extends keyof HTMLElementTagNameMap
		? HTMLElementTagNameMap[K]
		: K extends keyof SVGElementTagNameMap
			? SVGElementTagNameMap[K]
			: K extends keyof MathMLElementTagNameMap
				? MathMLElementTagNameMap[K]
				: HTMLElement
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
 * @since 0.14.0
 * @param {unknown} value - Value to check if it is a string parser
 * @returns {boolean} True if the value is a string parser, false otherwise
 */
declare const isParser: <T extends {}, E extends Element = HTMLElement>(
	value: unknown,
) => value is Parser<T, E>
/**
 * Get a fallback value for an element
 *
 * @since 0.14.0
 * @param {E} element - Element to get fallback value for
 * @param {ParserOrFallback<T, E>} fallback - Fallback value or parser function
 * @returns {T} Fallback value or parsed value
 */
declare const getFallback: <T extends {}, E extends Element = HTMLElement>(
	element: E,
	fallback: ParserOrFallback<T, E>,
) => T
/**
 * Get a value from elements in the DOM
 *
 * @since 0.14.0
 * @param {ParserOrFallback<T, E>} fallback - Fallback value or parser function
 * @param {S} extractors - An object of extractor functions for selectors as keys to get a value from
 * @param {LooseExtractor<T | string | null | undefined, ElementFromSelector<S>>[]} extractors - Extractor functions to apply to the element
 * @returns {LooseExtractor<T | string | null | undefined, C>} Loose extractor function to apply to the host element
 */
declare const fromDOM: <
	T extends {},
	C extends HTMLElement = HTMLElement,
	S extends {
		[K in keyof S & string]: LooseExtractor<
			T | string,
			ElementFromSelector<K>
		>
	} = {},
>(
	fallback: ParserOrFallback<T, C>,
	extractors: S,
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
 * @returns {Extractor<Computed<ElementFromSelector<S>[]>, C>} Signal producer for descendant element collection from a selector
 * @throws {CircularMutationError} If observed mutations would trigger infinite mutation cycles
 */
declare function fromSelector<
	S extends string,
	C extends HTMLElement = HTMLElement,
>(selector: S): Extractor<Computed<ElementFromSelector<S>[]>, C>
declare function fromSelector<
	E extends Element,
	C extends HTMLElement = HTMLElement,
>(selector: string): Extractor<Computed<E[]>, C>
/**
 * Reduced properties of descendant elements
 *
 * @since 0.13.3
 * @param {C} host - Host element for computed property
 * @param {S} selector - CSS selector for descendant elements
 * @param {(accumulator: T, currentElement: ElementFromSelector<S>, currentIndex: number, array: ElementFromSelector<S>[]) => T} reducer - Function to reduce values
 * @param {T} initialValue - Initial value function for reduction
 * @returns {Computed<T>} Computed signal of reduced values of descendant elements
 */
declare const reduced: <
	T extends {},
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	host: C,
	selector: S,
	reducer: (
		accumulator: T,
		currentElement: ElementFromSelector<S>,
		currentIndex: number,
		array: ElementFromSelector<S>[],
	) => T,
	initialValue: T,
) => Computed<T>
/**
 * Read a signal property from a custom element safely after it's defined
 *
 * @since 0.13.1
 * @param {Component<Q> | null} target - Taget descendant element
 * @param {K} prop - Property name to get signal for
 * @param {Q[K]} fallback - Fallback value to use until component is ready
 * @returns {() => Q[K]} Function that returns signal value or fallback
 */
declare const read: <Q extends ComponentProps, K extends keyof Q & string>(
	target: Component<Q> | null,
	prop: K,
	fallback: Q[K],
) => () => Q[K]
/**
 * Get the first descendant element matching a selector
 *
 * @since 0.14.0
 * @param {HTMLElement} host - Host element
 * @param {S} selector - Selector for element to check for
 * @param {string} required - Reason for the assertion
 * @param {boolean} assertCustomElement - Whether to assert that the element is a custom element
 * @returns {ElementFromSelector<S>} First matching descendant element
 * @throws {MissingElementError} If the element does not contain the required descendant element
 * @throws {InvalidCustomElementError} If assertCustomElement is true and the element is not a custom element
 */
declare function requireElement<S extends string>(
	host: HTMLElement,
	selector: S,
	required: string,
	assertCustomElement?: boolean,
): ElementFromSelector<S>
declare function requireElement<E extends Element>(
	host: HTMLElement,
	selector: string,
	required: string,
	assertCustomElement?: boolean,
): E
/**
 * Create a computed signal from a required descendant component's property
 *
 * @since 0.14.0
 * @param {S} selector - Selector for the required descendant element
 * @param {Extractor<T, ElementFromSelector<S>>} extractor - Function to extract the value from the element
 * @param {string} required - Explanation why the element is required
 * @returns {Extractor<Computed<T>, C>} Extractor that returns a computed signal that computes the value from the element
 * @throws {MissingElementError} If the element does not contain the required descendant element
 * @throws {InvalidCustomElementError} If the element is not a custom element
 */
declare function fromComponent<
	T extends {},
	S extends string,
	C extends HTMLElement = HTMLElement,
>(
	selector: S,
	extractor: Extractor<T, ElementFromSelector<S>>,
	required: string,
): Extractor<Computed<T>, C>
declare function fromComponent<
	T extends {},
	E extends Element,
	C extends HTMLElement = HTMLElement,
>(
	selector: string,
	extractor: Extractor<T, E>,
	required: string,
): Extractor<Computed<T>, C>
export {
	type ElementFromSelector,
	type Extractor,
	type Fallback,
	type LooseExtractor,
	type Parser,
	type ParserOrFallback,
	fromComponent,
	fromDOM,
	fromSelector,
	getFallback,
	isParser,
	reduced,
	read,
	observeSubtree,
	requireElement,
}

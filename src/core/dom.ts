import {
	type Computed,
	TYPE_COMPUTED,
	UNSET,
	type Watcher,
	computed,
	isFunction,
	notify,
	subscribe,
} from '@zeix/cause-effect'

import {
	elementName,
	isCustomElement,
	isString,
	isUpgradedComponent,
} from './util'

/* === Types === */

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

/* === Error Class === */

/**
 * Error thrown when a circular dependency is detected in a selection signal
 */
class CircularMutationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'CircularMutationError'
	}
}

/* === Internal === */

/**
 * Extract attribute names from a CSS selector
 * Handles various attribute selector formats: .class, #id, [attr], [attr=value], [attr^=value], etc.
 *
 * @param {string} selector - CSS selector to parse
 * @returns {string[]} - Array of attribute names found in the selector
 */
const extractAttributes = (selector: string): string[] => {
	const attributes = new Set<string>()
	if (selector.includes('.')) attributes.add('class')
	if (selector.includes('#')) attributes.add('id')
	if (selector.includes('[')) {
		const parts = selector.split('[')
		for (let i = 1; i < parts.length; i++) {
			const part = parts[i]
			if (!part.includes(']')) continue
			const attrName = part
				.split('=')[0]
				.trim()
				.replace(/[^a-zA-Z0-9_-]/g, '')
			if (attrName) attributes.add(attrName)
		}
	}
	return [...attributes]
}

/**
 * Compare two arrays of elements to determine if they contain the same elements
 *
 * @param {E[]} arr1 - First array of elements to compare
 * @param {E[]} arr2 - Second array of elements to compare
 * @returns {boolean} - True if arrays contain the same elements, false otherwise
 */
const areElementArraysEqual = <E extends Element>(
	arr1: E[],
	arr2: E[],
): boolean => {
	if (arr1.length !== arr2.length) return false
	const set1 = new Set(arr1)
	for (const el of arr2) {
		if (!set1.has(el)) return false
	}
	return true
}

/* === Exported Functions === */

/**
 * Check if a value is a string parser
 *
 * @since 0.13.4
 * @param {unknown} value - Value to check if it is a string parser
 * @returns {boolean} True if the value is a string parser, false otherwise
 */
const isParser = <T extends {}, E extends Element = HTMLElement>(
	value: unknown,
): value is Parser<T, E> => isFunction(value) && value.length >= 2

/**
 * Get a fallback value for an element
 *
 * @since 0.13.4
 * @param {E} element - Element to get fallback value for
 * @param {ParserOrFallback<T, E>} fallback - Fallback value or parser function
 * @returns {T} Fallback value or parsed value
 */
const getFallback = <T extends {}, E extends Element = HTMLElement>(
	element: E,
	fallback: ParserOrFallback<T, E>,
): T => (isFunction(fallback) ? fallback(element) : fallback) as T

/**
 * Get a value from the first element matching a selector
 *
 * @since 0.13.4
 * @param {string} selector - Selector to match
 * @param {LooseExtractor<T | string | null | undefined, ElementFromSelector<S, E>>[]} extractors - Extractor functions to apply to the element
 * @returns {LooseExtractor<T | string | null | undefined, C>} Loose extractor function to apply to the host element
 */
const fromFirst =
	<
		T,
		E extends Element = HTMLElement,
		C extends HTMLElement = HTMLElement,
		S extends string = string,
	>(
		selector: S,
		...extractors: LooseExtractor<T | string, ElementFromSelector<S, E>>[]
	): LooseExtractor<T | string, C> =>
	(host: C) => {
		const target = host.querySelector<ElementFromSelector<S, E>>(selector)
		if (!target) return
		for (const extractor of extractors) {
			const value = extractor(target)
			if (value !== undefined) return value
		}
	}

const fromDOM =
	<
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
	): Extractor<T, C> =>
	(host: C): T => {
		const fromFirst = <K extends keyof S & string>(
			selector: K,
			extractor: LooseExtractor<T | string, ElementFromSelector<K, E>>,
		) => {
			const target =
				host.querySelector<ElementFromSelector<K, E>>(selector)
			if (!target) return
			// for (const extractor of extractors) {
			const value = extractor(target)
			if (value != null) return value
			// }
		}

		let value: T | string | null | undefined = undefined
		for (const [selector, extractor] of Object.entries(selectors)) {
			value = fromFirst(
				selector as keyof S & string,
				extractor as LooseExtractor<
					T,
					ElementFromSelector<keyof S & string, E>
				>,
			)
			if (value != null) break
		}
		return isString(value) && isParser<T, C>(fallback)
			? fallback(host, value)
			: ((value as T) ?? getFallback(host, fallback))
	}

/**
 * Observe a DOM subtree with a mutation observer
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node
 * @param {string} selector - selector for matching elements to observe
 * @param {MutationCallback} callback - mutation callback
 * @returns {MutationObserver} - the created mutation observer
 */
const observeSubtree = (
	parent: ParentNode,
	selector: string,
	callback: MutationCallback,
): MutationObserver => {
	const observer = new MutationObserver(callback)
	const observerConfig: MutationObserverInit = {
		childList: true,
		subtree: true,
	}
	const observedAttributes = extractAttributes(selector)
	if (observedAttributes.length) {
		observerConfig.attributes = true
		observerConfig.attributeFilter = observedAttributes
	}
	observer.observe(parent, observerConfig)
	return observer
}

/**
 * Produce a computed signal of an array of elements matching a selector
 *
 * @since 0.13.1
 * @param {K} selector - CSS selector for descendant elements
 * @returns {Extractor<Computed<ElementFromSelector<S, E>[]>, C>} Signal producer for descendant element collection from a selector
 */
const fromSelector =
	<
		E extends Element = HTMLElement,
		C extends HTMLElement = HTMLElement,
		S extends string = string,
	>(
		selector: S,
	): Extractor<Computed<ElementFromSelector<S, E>[]>, C> =>
	(host: C): Computed<ElementFromSelector<S, E>[]> => {
		const watchers: Set<Watcher> = new Set()
		const select = () =>
			Array.from(
				host.querySelectorAll<ElementFromSelector<S, E>>(selector),
			)
		let value: ElementFromSelector<S, E>[] = UNSET
		let observer: MutationObserver | undefined
		let mutationDepth = 0
		const MAX_MUTATION_DEPTH = 2 // Consider a depth > 1 as circular

		const observe = () => {
			value = select()
			observer = observeSubtree(host, selector, () => {
				// If we have no watchers, just disconnect
				if (!watchers.size) {
					observer?.disconnect()
					observer = undefined
					return
				}

				mutationDepth++
				if (mutationDepth > MAX_MUTATION_DEPTH) {
					observer?.disconnect()
					observer = undefined
					mutationDepth = 0
					throw new CircularMutationError(
						'Circular mutation in element selection detected',
					)
				}

				try {
					const newElements = select()
					if (!areElementArraysEqual(value, newElements)) {
						value = newElements
						notify(watchers)
					}
				} finally {
					mutationDepth--
				}
			})
		}

		return {
			[Symbol.toStringTag]: TYPE_COMPUTED,

			get(): ElementFromSelector<S, E>[] {
				subscribe(watchers)
				if (!watchers.size) value = select()
				else if (!observer) observe()
				return value
			},
		}
	}

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
const reduced = <
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
): Computed<T> =>
	computed(() =>
		(
			fromSelector<ElementFromSelector<S, E>>(selector)(host) as Computed<
				ElementFromSelector<S, E>[]
			>
		)
			.get()
			.reduce(reducer, initialValue),
	)

/**
 * Read from a descendant element and map the result
 *
 * @since 0.13.3
 * @param {C} host - Host element
 * @param {S} selector - CSS selector for descendant element
 * @param {(element: ElementFromSelector<S, E> | null, isUpgraded: boolean) => T} map - Function to map over the element
 * @returns {T} The mapped result from the descendant element
 */
const read = <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	host: C,
	selector: S,
	map: (element: ElementFromSelector<S, E> | null, isUpgraded: boolean) => T,
): T => {
	const source = host.querySelector<ElementFromSelector<S, E>>(selector)
	return map(source, source ? isUpgradedComponent(source) : false)
}

/**
 * Assert that an element contains an expected descendant element
 *
 * @since 0.13.4
 * @param {HTMLElement} host - Host element
 * @param {S} selector - Selector for element to check for
 * @returns {ElementFromSelector<S, E>} First found descendant element
 * @throws {Error} If the element does not contain the required descendant element
 */
const requireElement = <
	S extends string = string,
	E extends Element = HTMLElement,
>(
	host: HTMLElement,
	selector: S,
	assertCustomElement = false,
): ElementFromSelector<S, E> => {
	const target = host.querySelector<ElementFromSelector<S, E>>(selector)
	if (target) {
		if (assertCustomElement && !isCustomElement(target))
			throw new Error(`Element ${selector} is not a custom element`)
		return target
	}
	throw new Error(
		`Component ${elementName(host)} does not contain required <${selector}> element`,
	)
}

const fromComponent =
	<
		T extends {},
		E extends Element = HTMLElement,
		C extends HTMLElement = HTMLElement,
		S extends string = string,
	>(
		selector: S,
		extractor: Extractor<T, ElementFromSelector<S, E>>,
		fallback: Fallback<T>,
	): Extractor<Computed<T>, C> =>
	(host: C): Computed<T> => {
		const target = requireElement<S, E>(host, selector, true)
		return computed(async () => {
			await customElements.whenDefined(target.localName)
			return extractor(target) ?? getFallback(host, fallback)
		})
	}

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

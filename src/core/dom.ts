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

type LooseExtractor<T, E extends Element = HTMLElement> = (element: E) => T

type ValueOrExtractor<T extends {}, E extends Element = HTMLElement> =
	| T
	| Extractor<T, E>

type StringParser<T extends {}, E extends Element = HTMLElement> = (
	element: E,
	value: string | null | undefined,
	old?: string | null,
) => T

type OptionalStringParser<
	T extends {},
	E extends Element = HTMLElement,
> = T extends string ? undefined : StringParser<T, E>

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
const isStringParser = <T extends {}, C extends HTMLElement = HTMLElement>(
	value: unknown,
): value is StringParser<T, C> => isFunction(value) && value.length >= 2

/**
 * Parse a value using a string parser
 *
 * @since 0.13.4
 * @param {string | null | undefined} value - Value to parse
 * @param {E} element - Element to pass to parser function
 * @param {StringParser<T, E>} parser - String parser function
 * @returns {T} Parsed value
 */
const parseValue = <T extends {}, E extends Element = HTMLElement>(
	value: string | null | undefined,
	element: E,
	parser: StringParser<T, E>,
): T => (parser ? parser(element, value) : (value ?? '')) as T

/**
 * Get a value from an extractor function or a value
 *
 * @since 0.13.4
 * @param {ValueOrExtractor<T | string, E>} fallback - Value or extractor function
 * @param {E} element - Element to pass to extractor function
 * @param {StringParser<T, E>} parser - String parser function
 * @returns {T} Non-nullable value
 */
const extractValue = <T extends {}, E extends Element = HTMLElement>(
	fallback: ValueOrExtractor<T | string, E>,
	element: E,
	parser?: StringParser<T, E>,
): T => {
	if (isFunction(fallback)) {
		const value = fallback(element)
		return isString(value) && parser
			? parseValue<T, E>(value, element, parser)
			: (value as T)
	} else {
		return fallback as T
	}
}

const fromFirst =
	<
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
		parser?: StringParser<T>,
	): Extractor<T, C> =>
	(host: C) => {
		const target = host.querySelector<ElementFromSelector<S, E>>(selector)
		if (!target) return extractValue(fallback, host, parser)
		const value = extractor(target)
		return isString(value) && parser
			? parseValue<T, ElementFromSelector<S, E>>(
					value,
					target,
					parser as StringParser<T, ElementFromSelector<S, E>>,
				)
			: (value as T)
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
): ElementFromSelector<S, E> => {
	const target = host.querySelector<ElementFromSelector<S, E>>(selector)
	if (!target) {
		throw new Error(
			`Component ${elementName(host)} does not contain required <${selector}> element`,
		)
	}
	return target
}

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
const fromDOM =
	<
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
		parser?: StringParser<T, C>,
	): Extractor<T, C> =>
	(host: C): T => {
		const target = host.querySelector<ElementFromSelector<S, E>>(selector)
		if (target) {
			const value = extractor(target)
			if (value != null) return extractValue(value, host, parser)
		}
		if (fallback != null) return extractValue(fallback, host, parser)
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
		fallback: ValueOrExtractor<T>,
		parser?: OptionalStringParser<T>,
	): Extractor<Computed<T>, C> =>
	(host: C): Computed<T> => {
		const target = requireElement<S, E>(host, selector)
		if (!isCustomElement(target))
			throw new Error(`Element ${selector} is not a custom element`)
		return computed(async () => {
			await customElements.whenDefined(target.localName)
			return extractor(target) ?? extractValue(fallback, host, parser)
		})
	}

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
	fromFirst,
	fromSelector,
	isStringParser,
	parseValue,
	reduced,
	read,
	observeSubtree,
	requireElement,
}

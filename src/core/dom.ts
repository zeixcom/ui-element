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

import type { Component, ComponentProps } from '../component'
import {
	CircularMutationError,
	InvalidCustomElementError,
	MissingElementError,
} from './errors'
import { isCustomElement, isString } from './util'

/* === Types === */

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

/* === Internal Functions === */

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
 * @since 0.14.0
 * @param {unknown} value - Value to check if it is a string parser
 * @returns {boolean} True if the value is a string parser, false otherwise
 */
const isParser = <T extends {}, E extends Element = HTMLElement>(
	value: unknown,
): value is Parser<T, E> => isFunction(value) && value.length >= 2

/**
 * Get a fallback value for an element
 *
 * @since 0.14.0
 * @param {E} element - Element to get fallback value for
 * @param {ParserOrFallback<T, E>} fallback - Fallback value or parser function
 * @returns {T} Fallback value or parsed value
 */
const getFallback = <T extends {}, E extends Element = HTMLElement>(
	element: E,
	fallback: ParserOrFallback<T, E>,
): T => (isFunction(fallback) ? fallback(element) : fallback) as T

/**
 * Get a value from elements in the DOM
 *
 * @since 0.14.0
 * @param {ParserOrFallback<T, E>} fallback - Fallback value or parser function
 * @param {S} extractors - An object of extractor functions for selectors as keys to get a value from
 * @param {LooseExtractor<T | string | null | undefined, ElementFromSelector<S>>[]} extractors - Extractor functions to apply to the element
 * @returns {LooseExtractor<T | string | null | undefined, C>} Loose extractor function to apply to the host element
 */
const fromDOM =
	<
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
	): Extractor<T, C> =>
	(host: C): T => {
		const root = host.shadowRoot ?? host

		const fromFirst = <K extends keyof S & string>(
			selector: K,
			extractor: LooseExtractor<T | string, ElementFromSelector<K>>,
		) => {
			const target = root.querySelector<ElementFromSelector<K>>(selector)
			if (!target) return
			// for (const extractor of extractors) {
			const value = extractor(target)
			if (value != null) return value
			// }
		}

		let value: T | string | null | undefined = undefined
		for (const [selector, extractor] of Object.entries(extractors)) {
			value = fromFirst(
				selector as keyof S & string,
				extractor as LooseExtractor<
					T,
					ElementFromSelector<keyof S & string>
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
 * @returns {Extractor<Computed<ElementFromSelector<S>[]>, C>} Signal producer for descendant element collection from a selector
 * @throws {CircularMutationError} If observed mutations would trigger infinite mutation cycles
 */
function fromSelector<S extends string, C extends HTMLElement = HTMLElement>(
	selector: S,
): Extractor<Computed<ElementFromSelector<S>[]>, C>
function fromSelector<E extends Element, C extends HTMLElement = HTMLElement>(
	selector: string,
): Extractor<Computed<E[]>, C>
function fromSelector<C extends HTMLElement = HTMLElement>(
	selector: string,
): Extractor<Computed<any[]>, C> {
	return (host: C): Computed<any[]> => {
		const watchers: Set<Watcher> = new Set()
		const select = () =>
			Array.from((host.shadowRoot ?? host).querySelectorAll(selector))
		let value: any[] = UNSET
		let observer: MutationObserver | undefined
		let mutationDepth = 0
		const MAX_MUTATION_DEPTH = 2 // Consider a depth > 2 as circular

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
					throw new CircularMutationError(host, selector)
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

			get(): any[] {
				subscribe(watchers)
				if (!watchers.size) value = select()
				else if (!observer) observe()
				return value
			},
		}
	}
}

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
const reduced = <
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
): Computed<T> =>
	computed(() =>
		(
			fromSelector<S, C>(selector)(host) as Computed<
				ElementFromSelector<S>[]
			>
		)
			.get()
			.reduce(reducer, initialValue),
	)

/**
 * Read a signal property from a custom element safely after it's defined
 *
 * @since 0.13.1
 * @param {Component<Q> | null} target - Taget descendant element
 * @param {K} prop - Property name to get signal for
 * @param {Q[K]} fallback - Fallback value to use until component is ready
 * @returns {() => Q[K]} Function that returns signal value or fallback
 */
const read = <Q extends ComponentProps, K extends keyof Q & string>(
	target: Component<Q> | null,
	prop: K,
	fallback: Q[K],
): (() => Q[K]) => {
	if (!target) return () => fallback
	if (!isCustomElement(target))
		throw new TypeError(`Target element must be a custom element`)

	const awaited = computed(async () => {
		await customElements.whenDefined(target.localName)
		return target.getSignal(prop)
	})

	return () => {
		const value = awaited.get()
		return value === UNSET ? fallback : (value.get() as Q[K])
	}
}

/**
 * Get the first descendant element matching a selector
 *
 * @since 0.14.0
 * @param {HTMLElement} host - Host element
 * @param {S} selector - Selector for element to check for
 * @param {string} [required] - Optional reason for the assertion; if provided, throws on missing element
 * @returns {ElementFromSelector<S> | null} First matching descendant element, or null if not found and not required
 * @throws {MissingElementError} If the element does not contain the required descendant element and required is specified
 */
function useElement<S extends string>(
	host: HTMLElement,
	selector: S,
	required: string,
): ElementFromSelector<S>
function useElement<S extends string>(
	host: HTMLElement,
	selector: S,
): ElementFromSelector<S> | null
function useElement<E extends Element>(
	host: HTMLElement,
	selector: string,
	required: string,
): E
function useElement<E extends Element>(
	host: HTMLElement,
	selector: string,
): E | null
function useElement(
	host: HTMLElement,
	selector: string,
	required?: string,
): any {
	const target = (host.shadowRoot || host).querySelector(selector)
	if (required && !target)
		throw new MissingElementError(host, selector, required)
	return target
}

/**
 * Get a descendant custom element matching a selector awaited to be defined
 *
 * @since 0.14.0
 * @param {HTMLElement} host - Host element
 * @param {S} selector - Selector for the descendant element
 * @param {string} [required] - Optional explanation why the element is required; if provided, throws on missing element
 * @returns {Promise<ElementFromSelector<S> | null>} The element or null if not found and not required
 * @throws {MissingElementError} If the element does not contain the required descendant element and required is specified
 * @throws {InvalidCustomElementError} If the element is not a custom element
 */
async function useComponent<S extends string>(
	host: HTMLElement,
	selector: S,
	required: string,
): Promise<ElementFromSelector<S>>
async function useComponent<S extends string>(
	host: HTMLElement,
	selector: S,
): Promise<ElementFromSelector<S> | null>
async function useComponent<E extends Element>(
	host: HTMLElement,
	selector: string,
	required: string,
): Promise<E>
async function useComponent<E extends Element>(
	host: HTMLElement,
	selector: string,
): Promise<E | null>
async function useComponent(
	host: HTMLElement,
	selector: string,
	required?: string,
): Promise<Element | null> {
	const target = isString(required)
		? useElement(host, selector, required)
		: useElement(host, selector)
	if (target) {
		if (isCustomElement(target)) {
			await customElements.whenDefined(target.localName)
			return target
		} else {
			throw new InvalidCustomElementError(host, target)
		}
	}
	return null
}

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
 * /
function fromComponent<
	T extends {},
	S extends string,
	C extends HTMLElement = HTMLElement,
>(
	selector: S,
	extractor: Extractor<T, ElementFromSelector<S>>,
	required: string,
): Extractor<Computed<T>, C>
function fromComponent<
	T extends {},
	E extends Element,
	C extends HTMLElement = HTMLElement,
>(
	selector: string,
	extractor: Extractor<T, E>,
	required: string,
): Extractor<Computed<T>, C>
function fromComponent<T extends {}, C extends HTMLElement = HTMLElement>(
	selector: string,
	extractor: Extractor<T, any>,
	required: string,
): Extractor<Computed<T>, C> {
	return (host: C): Computed<T> => {
		const target = requireElement(host, selector, required, true)
		return computed(async () => {
			await customElements.whenDefined(target.localName)
			return extractor(target)
		})
	}
} */

export {
	type ElementFromSelector,
	type Extractor,
	type Fallback,
	type LooseExtractor,
	type Parser,
	type ParserOrFallback,
	fromDOM,
	fromSelector,
	getFallback,
	isParser,
	reduced,
	read,
	observeSubtree,
	useElement,
	useComponent,
}

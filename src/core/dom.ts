import {
	type Cleanup,
	type Computed,
	TYPE_COMPUTED,
	UNSET,
	type Watcher,
	isFunction,
	notify,
	subscribe,
} from '@zeix/cause-effect'

import type { Component, ComponentProps } from '../component'
import { CircularMutationError, MissingElementError } from './errors'
import { type Effects, runEffects } from './reactive'
import { isCustomElement, isElement, isString } from './util'

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

type ElementUsage = {
	<S extends string>(selector: S, required: string): ElementFromSelector<S>
	<S extends string>(selector: S): ElementFromSelector<S> | null
	<E extends Element>(selector: string, required: string): E
	<E extends Element>(selector: string): E | null
}

type ElementsUsage = {
	<S extends string>(
		selector: S,
		required?: string,
	): NodeListOf<ElementFromSelector<S>>
	<E extends Element>(selector: string, required?: string): NodeListOf<E>
}

type ElementEffects<P extends ComponentProps> = {
	<S extends string>(
		selector: S,
		effects: Effects<P, ElementFromSelector<S>>,
		required?: string,
	): () => Cleanup | void
	<E extends Element>(
		selector: string,
		effects: Effects<P, E>,
		required?: string,
	): () => Cleanup | void
}

type Helpers<P extends ComponentProps> = {
	useElement: ElementUsage
	useElements: ElementsUsage
	first: ElementEffects<P>
	all: ElementEffects<P>
}

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
 * Create partially applied helper functions to get descendants and run effects on them
 *
 * @since 0.14.0
 * @param {Component<P>} host - Host component
 * @returns {ElementSelectors<P>} - Helper functions for selecting descendants
 */
const getHelpers = <P extends ComponentProps>(
	host: Component<P>,
): [Helpers<P>, () => string[]] => {
	const root = host.shadowRoot ?? host
	const dependencies: Set<string> = new Set()

	/**
	 * Get the first descendant element matching a selector
	 * If the element is a custom elements it will be added to dependencies
	 *
	 * @since 0.14.0
	 * @param {S} selector - Selector for element to check for
	 * @param {string} [required] - Optional reason for the assertion; if provided, throws on missing element
	 * @returns {ElementFromSelector<S> | null} First matching descendant element, or null if not found and not required
	 * @throws {MissingElementError} - Thrown when the element is required but not found
	 */
	function useElement<S extends string>(
		selector: S,
		required: string,
	): ElementFromSelector<S>
	function useElement<S extends string>(
		selector: S,
	): ElementFromSelector<S> | null
	function useElement<E extends Element>(
		selector: string,
		required: string,
	): E
	function useElement<E extends Element>(selector: string): E | null
	function useElement<S extends string>(
		selector: S,
		required?: string,
	): ElementFromSelector<S> | null {
		const target = root.querySelector<ElementFromSelector<S>>(selector)
		if (required != null && !target)
			throw new MissingElementError(host, selector, required)
		if (target && isCustomElement(target))
			dependencies.add(target.localName)
		return target
	}

	/**
	 * Get all descendant elements matching a selector
	 * If any element is a custom element it will be added to dependencies
	 *
	 * @since 0.14.0
	 * @param {S} selector - Selector for elements to check for
	 * @param {string} [required] - Optional reason for the assertion; if provided, throws on missing elements
	 * @returns {NodeListOf<ElementFromSelector<S>>} All matching descendant elements
	 * @throws {MissingElementError} - Thrown when elements are required but not found
	 */
	function useElements<S extends string>(
		selector: S,
		required?: string,
	): NodeListOf<ElementFromSelector<S>>
	function useElements<E extends Element>(
		selector: string,
		required?: string,
	): NodeListOf<E>
	function useElements<S extends string>(
		selector: S,
		required?: string,
	): NodeListOf<ElementFromSelector<S>> {
		const targets = root.querySelectorAll<ElementFromSelector<S>>(selector)
		if (required != null && !targets.length)
			throw new MissingElementError(host, selector, required)
		if (targets.length)
			targets.forEach(target => {
				if (isCustomElement(target)) dependencies.add(target.localName)
			})
		return targets
	}

	/**
	 * Apply effect functions to a first matching descendant within the custom element
	 * If the target element is a custom element, waits for it to be defined before running effects
	 *
	 * @since 0.14.0
	 * @param {S} selector - Selector to match descendant
	 * @param {Effects<P, E>} effects - Effect functions to apply
	 * @param {string} [required] - Optional reason for the assertion; if provided, throws on missing element
	 * @throws {MissingElementError} - Thrown when the element is required but not found
	 */
	const first = <
		S extends string,
		E extends Element = ElementFromSelector<S>,
	>(
		selector: S,
		effects: Effects<P, E>,
		required?: string,
	) => {
		const target =
			required != null
				? useElement(selector, required)
				: useElement(selector)
		return () => {
			if (target) return runEffects(effects, host, target as unknown as E)
		}
	}

	/**
	 * Apply effect functions to all matching descendant elements within the custom element
	 * If any target element is a custom element, waits for it to be defined before running effects
	 *
	 * @since 0.14.0
	 * @param {S} selector - Selector to match descendants
	 * @param {Effects<P, ElementFromSelector<S>>} effects - Effect functions to apply
	 * @param {string} [required] - Optional reason for the assertion; if provided, throws on missing element
	 * @throws {MissingElementError} - Thrown when the element is required but not found
	 */
	const all = <S extends string, E extends Element = ElementFromSelector<S>>(
		selector: S,
		effects: Effects<P, E>,
		required?: string,
	) => {
		const targets =
			required != null
				? useElements(selector, required)
				: useElements(selector)

		return () => {
			const cleanups = new Map<E, Cleanup>()

			const attach = (target: E) => {
				const cleanup = runEffects(effects, host, target)
				if (cleanup && !cleanups.has(target))
					cleanups.set(target, cleanup)
			}

			const detach = (target: E) => {
				const cleanup = cleanups.get(target)
				if (cleanup) cleanup()
				cleanups.delete(target)
			}

			const applyToMatching =
				(fn: (target: E) => void) => (node: Node) => {
					if (isElement(node)) {
						if (node.matches(selector)) fn(node as E)
						node.querySelectorAll<E>(selector).forEach(fn)
					}
				}

			const observer = observeSubtree(root, selector, mutations => {
				for (const mutation of mutations) {
					mutation.addedNodes.forEach(applyToMatching(attach))
					mutation.removedNodes.forEach(applyToMatching(detach))
				}
			})

			if (targets.length)
				(targets as unknown as NodeListOf<E>).forEach(attach)

			return () => {
				observer.disconnect()
				cleanups.forEach(cleanup => cleanup())
				cleanups.clear()
			}
		}
	}

	return [
		{ useElement, useElements, first, all },
		() => Array.from(dependencies),
	]
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

export {
	type ElementFromSelector,
	type Extractor,
	type Fallback,
	type LooseExtractor,
	type Parser,
	type ParserOrFallback,
	type ElementUsage,
	type ElementsUsage,
	type ElementEffects,
	type Helpers,
	fromDOM,
	fromSelector,
	getFallback,
	getHelpers,
	isParser,
	observeSubtree,
}

import {
	type Cleanup,
	type Computed,
	TYPE_COMPUTED,
	UNSET,
	type Watcher,
	computed,
	isFunction,
	notify,
	subscribe,
} from '@zeix/cause-effect'

import type { ElementFromSelector, SignalProducer } from '../component'
import { elementName, isCustomElement } from './util'

/* === Types === */

type EventType<K extends string> = K extends keyof HTMLElementEventMap
	? HTMLElementEventMap[K]
	: Event

type EventTransformerContext<
	T extends {},
	E extends Element,
	C extends HTMLElement,
	Evt extends Event,
> = {
	event: Evt
	host: C
	target: E
	value: T
}

type EventTransformer<
	T extends {},
	E extends Element,
	C extends HTMLElement,
	Evt extends Event,
> = (context: EventTransformerContext<T, E, C, Evt>) => T | void

type EventTransformers<
	T extends {},
	E extends Element,
	C extends HTMLElement,
> = {
	[K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>>
}

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
 * Produce a computed signal from transformed event data
 *
 * @since 0.13.3
 * @param {T | ((host: C) => T)} initialize - Initial value or initialize function
 * @param {S} selector - CSS selector for the source element
 * @param {EventTransformers<T, ElementFromSelector<S, E>, C>} events - Transformation functions for events
 * @returns {(host: C) => Computed<T>} Signal producer for value from event
 */
const fromEvents =
	<
		T extends {},
		E extends Element = HTMLElement,
		C extends HTMLElement = HTMLElement,
		S extends string = string,
	>(
		initialize: T | ((host: C) => T),
		selector: S,
		events: EventTransformers<T, ElementFromSelector<S, E>, C>,
	): SignalProducer<T, C> =>
	(host: C) => {
		const watchers: Set<Watcher> = new Set()
		let value: T = isFunction<T>(initialize)
			? initialize(host)
			: (initialize as T)
		const eventMap = new Map<string, EventListener>()
		let cleanup: Cleanup | undefined

		const listen = () => {
			for (const [type, transform] of Object.entries(events)) {
				const listener = ((e: Event) => {
					const target = e.target as Element
					if (!target) return

					const source = target.closest(
						selector,
					) as ElementFromSelector<S, E> | null
					if (!source || !host.contains(source)) return
					e.stopPropagation()

					try {
						const newValue = transform({
							event: e as any,
							host,
							target: source,
							value,
						})
						if (newValue == null) return
						if (!Object.is(newValue, value)) {
							value = newValue
							if (watchers.size > 0) notify(watchers)
							else if (cleanup) cleanup()
						}
					} catch (error) {
						e.stopImmediatePropagation()
						throw error
					}
				}) as EventListener
				eventMap.set(type, listener)
				host.addEventListener(type, listener)
			}
			cleanup = () => {
				if (eventMap.size) {
					for (const [type, listener] of eventMap) {
						host.removeEventListener(type, listener)
					}
					eventMap.clear()
				}
				cleanup = undefined
			}
		}

		return {
			[Symbol.toStringTag]: TYPE_COMPUTED,

			get(): T {
				subscribe(watchers)
				if (watchers.size && !eventMap.size) listen()
				return value
			},
		}
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
 * @returns {(host: C) => Computed<ElementFromSelector<S, E>[]>} Signal producer for descendant element collection from a selector
 */
const fromSelector =
	<
		E extends Element = HTMLElement,
		C extends HTMLElement = HTMLElement,
		S extends string = string,
	>(
		selector: S,
	): SignalProducer<ElementFromSelector<S, E>[], C> =>
	(host: C) => {
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
 * @since 0.13.4
 * @param {C} host - Host element
 * @param {S} selector - CSS selector for descendant element
 * @param {(element: ElementFromSelector<S, E> | null) => T} fn - Function to map over the element
 * @returns {Computed<T>} A computed signal of the mapped result from the descendant element
 */
const read = <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	host: C,
	selector: S,
	fn: (element: ElementFromSelector<S, E> | null) => T,
): Computed<T> =>
	computed(async () => {
		const target = host.querySelector<ElementFromSelector<S, E>>(selector)
		if (target && isCustomElement(target))
			await customElements.whenDefined(target.localName)
		return fn(target)
	})

/**
 * Assert that an element contains an expected descendant element
 *
 * @since 0.13.3
 * @param {HTMLElement} host - Host element
 * @param {S} selector - Descendant element to check for
 * @returns {ElementFromSelector<S, E>} First found descendant element
 * @throws {Error} If the element does not contain the required descendant element
 */
const requireDescendant = <
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

export {
	type EventType,
	type EventTransformer,
	type EventTransformers,
	type EventTransformerContext,
	fromEvents,
	fromSelector,
	reduced,
	read,
	observeSubtree,
	requireDescendant,
}

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

import type {
	Component,
	ComponentProps,
	Effect,
	SignalProducer,
} from '../component'
import { elementName, isUpgradedComponent } from './util'

/* === Types === */

// Map common element types to their typical events
type ElementEventMap<E extends Element> = E extends
	| HTMLInputElement
	| HTMLTextAreaElement
	| HTMLSelectElement
	? Pick<
			HTMLElementEventMap,
			| 'input'
			| 'change'
			| 'focus'
			| 'blur'
			| 'invalid'
			| 'keydown'
			| 'keyup'
			| 'keypress'
			| 'click'
			| 'mousedown'
			| 'mouseup'
			| 'paste'
			| 'cut'
			| 'copy'
		>
	: E extends HTMLFormElement
		? Pick<HTMLElementEventMap, 'submit' | 'reset' | 'formdata'>
		: E extends HTMLButtonElement
			? Pick<
					HTMLElementEventMap,
					| 'click'
					| 'focus'
					| 'blur'
					| 'keydown'
					| 'keyup'
					| 'keypress'
				>
			: E extends HTMLAnchorElement
				? Pick<HTMLElementEventMap, 'click' | 'focus' | 'blur'>
				: E extends HTMLDetailsElement
					? Pick<HTMLElementEventMap, 'toggle'>
					: E extends HTMLDialogElement
						? Pick<HTMLElementEventMap, 'close' | 'cancel'>
						: E extends HTMLMediaElement
							? Pick<
									HTMLElementEventMap,
									| 'loadstart'
									| 'loadeddata'
									| 'canplay'
									| 'play'
									| 'pause'
									| 'ended'
									| 'volumechange'
								>
							: E extends HTMLImageElement
								? Pick<HTMLElementEventMap, 'load' | 'error'>
								: HTMLElementEventMap // fallback to all events

// Helper type to get event type from element and event name
type ElementEventType<
	E extends Element,
	K extends string,
> = K extends keyof ElementEventMap<E> ? ElementEventMap<E>[K] : Event

// Helper type to constrain event names to element-appropriate ones
type ValidEventName<E extends Element> = keyof ElementEventMap<E> & string

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
 * Observe a DOM subtree with a mutation observer
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node
 * @param {string} selectors - selector for matching elements to observe
 * @param {MutationCallback} callback - mutation callback
 * @returns {MutationObserver} - the created mutation observer
 */
const observeSubtree = (
	parent: ParentNode,
	selectors: string,
	callback: MutationCallback,
): MutationObserver => {
	const observer = new MutationObserver(callback)
	const observedAttributes = extractAttributes(selectors)
	const observerConfig: MutationObserverInit = {
		childList: true,
		subtree: true,
	}
	if (observedAttributes.length) {
		observerConfig.attributes = true
		observerConfig.attributeFilter = observedAttributes
	}
	observer.observe(parent, observerConfig)
	return observer
}

/**
 * Create a element selection signal from a query selector
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node to query
 * @param {string} selectors - query selector
 * @returns {Computed<E[]>} Element selection signal
 */
const selection = <E extends Element>(
	parent: ParentNode,
	selectors: string,
): Computed<E[]> => {
	const watchers: Set<Watcher> = new Set()
	const select = () => Array.from(parent.querySelectorAll<E>(selectors))
	let value: E[] = UNSET
	let observer: MutationObserver | undefined
	let mutationDepth = 0
	const MAX_MUTATION_DEPTH = 2 // Consider a depth > 1 as circular

	const observe = () => {
		value = select()
		observer = observeSubtree(parent, selectors, () => {
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

		get: (): E[] => {
			subscribe(watchers)
			if (!watchers.size) value = select()
			else if (!observer) observe()
			return value
		},
	}
}

/**
 * Produce a selection signal from a selector
 *
 * @since 0.13.1
 * @param {string} selectors - CSS selector for descendant elements
 * @returns {SignalProducer<HTMLElement, E[]>} signal producer for descendant element collection from a selector
 */
const fromSelector =
	<E extends Element>(selectors: string): SignalProducer<E[]> =>
	(host: HTMLElement) =>
		selection<E>(host, selectors)

/**
 * Produce a computed signal from reduced properties of descendant elements
 *
 * @since 0.13.1
 * @param {string} selectors - CSS selector for descendant elements
 * @param {(accumulator: T, currentElement: E, currentIndex: number, array: E[]) => T} reducer - function to reduce values
 * @param {T} initialValue - initial value for reduction
 * @returns {SignalProducer<T>} signal producer that emits reduced value
 */
const fromDescendants =
	<T extends {}, E extends Element = HTMLElement>(
		selectors: string,
		reducer: (
			accumulator: T,
			currentElement: E,
			currentIndex: number,
			array: E[],
		) => T,
		initialValue: T,
	): SignalProducer<T> =>
	(host: HTMLElement) =>
	() =>
		selection<E>(host, selectors).get().reduce(reducer, initialValue)

/**
 * Attach an event listener to an element
 *
 * @since 0.12.0
 * @param {K} type - event type to listen for (type-safe based on element type)
 * @param {(event: ElementEventType<E, K>) => void} listener - event listener
 * @param {boolean | AddEventListenerOptions} options - event listener options
 * @throws {TypeError} - if the provided handler is not an event listener or a provider function
 */
const on =
	<E extends Element, K extends ValidEventName<E>>(
		type: K,
		listener: (event: ElementEventType<E, K>) => void,
		options: boolean | AddEventListenerOptions = false,
	): Effect<ComponentProps, E> =>
	<P extends ComponentProps>(
		host: Component<P>,
		target: E = host as unknown as E,
	): Cleanup => {
		if (!isFunction(listener))
			throw new TypeError(
				`Invalid event listener provided for "${type} event on element ${elementName(target)}`,
			)
		target.addEventListener(type, listener, options)
		return () => target.removeEventListener(type, listener)
	}

/**
 * Create a computed signal that listens to an event on an element
 *
 * This function creates a reactive signal that updates when the specified event fires.
 * Event listeners are automatically managed - they are added when the signal has watchers
 * and removed when no watchers remain to prevent memory leaks.
 *
 * @since 0.13.1
 * @param {C} host - host element (used as context in transform function)
 * @param {E} source - element to attach event listener to
 * @param {K} type - event type to listen for (type-safe based on element type)
 * @param {(host: C, source: E, event: ElementEventType<E, K>, oldValue: T) => T} transform - transformation function in event listener
 * @param {T} initialValue - initial value of the signal
 * @param {boolean | AddEventListenerOptions} options - event listener options
 * @returns {Computed<T>} computed signal that automatically manages event listener lifecycle
 */
const sensor = <
	T extends {},
	E extends Element,
	K extends ValidEventName<E>,
	C extends HTMLElement = HTMLElement,
>(
	host: C,
	source: E,
	type: K,
	transform: (
		host: C,
		source: E,
		event: ElementEventType<E, K>,
		oldValue: T,
	) => T,
	initialValue: T,
	options: boolean | AddEventListenerOptions = false,
): Computed<T> => {
	const watchers: Set<Watcher> = new Set()
	let value: T = initialValue
	let listener: EventListener | undefined
	let cleanup: Cleanup | undefined

	const listen = () => {
		listener = ((event: ElementEventType<E, K>) => {
			const newValue = transform(
				host,
				source,
				event as ElementEventType<E, K>,
				value,
			)
			if (!Object.is(newValue, value)) {
				value = newValue
				if (watchers.size > 0) notify(watchers)
				else if (cleanup) cleanup()
			}
		}) as EventListener

		source.addEventListener(type, listener, options)
		cleanup = () => {
			if (listener) {
				source.removeEventListener(type, listener)
				listener = undefined
			}
			cleanup = undefined
		}
	}

	return {
		[Symbol.toStringTag]: TYPE_COMPUTED,

		get: (): T => {
			subscribe(watchers)
			if (watchers.size && !listener) listen()
			return value
		},
	}
}

/**
 * Produce a computed signal from transformed event data
 *
 * @since 0.13.1
 * @param {string} selector - CSS selector for the source element
 * @param {K} type - event type to listen for
 * @param {(host: C, source: E, event: ElementEventType<E, K>, oldValue: T) => T} transform - transformation function for the event
 * @param {T | ((host: C, source: E) => T)} initializer - initial value or initializer function
 * @returns {SignalProducer<T, C>} signal producer for value from event
 */
const fromEvent =
	<
		T extends {},
		E extends HTMLElement,
		K extends ValidEventName<E>,
		C extends HTMLElement = HTMLElement,
	>(
		selector: string,
		type: K,
		transform: (
			host: C,
			source: E,
			event: ElementEventType<E, K>,
			oldValue: T,
		) => T,
		initializer: T | ((host: C, source: E) => T),
	): SignalProducer<T, C> =>
	(host: C) => {
		const source = host.querySelector<E>(selector)
		if (!source) {
			throw new Error(
				`Element not found for selector "${selector}" in ${elementName(host)}`,
			)
		}
		const initialValue = isFunction<T>(initializer)
			? initializer(host, source)
			: (initializer as T)
		return sensor(host, source, type, transform, initialValue)
	}

/**
 * Read a signal property from a custom element safely after it's defined
 * Returns a function that provides the signal value with fallback until component is ready
 *
 * @since 0.13.1
 * @param {E} source - Source custom element to read reactive property from
 * @param {K} prop - Property name to get
 * @param {E[K]} fallback - Fallback value to use until component is upgraded
 * @returns {() => E[K]} Function that returns current value or fallback
 */
const read =
	<E extends Element, K extends keyof E>(
		source: E | null,
		prop: K,
		fallback: NonNullable<E[K]>,
	): (() => NonNullable<E[K]>) =>
	() => {
		if (!source || !isUpgradedComponent(source)) return fallback
		const value = prop in source ? source[prop] : fallback
		return value == null || value === UNSET ? fallback : value
	}

/**
 * Produce a computed signal for projected reactive property from a descendant component
 *
 * @since 0.13.1
 * @param {string} selector - CSS selector for descendant element
 * @param {K} prop - property name to get signal for
 * @param {Q[K]} fallback - fallback value to use until component is ready
 * @returns {SignalProducer<Q[K]>} signal producer that emits value from descendant component
 */
const fromDescendant =
	<E extends Element, K extends keyof E>(
		selector: string,
		prop: K,
		fallback: NonNullable<E[K]>,
	): SignalProducer<NonNullable<E[K]>> =>
	(host: HTMLElement) =>
		read(host.querySelector<E>(selector), prop, fallback)

export {
	type ElementEventMap,
	type ElementEventType,
	type ValidEventName,
	fromDescendant,
	fromDescendants,
	fromEvent,
	fromSelector,
	observeSubtree,
	on,
	read,
	selection,
	sensor,
}

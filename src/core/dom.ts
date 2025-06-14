import {
	type Cleanup,
	type Computed,
	type MaybeSignal,
	type Signal,
	type Watcher,
	computed,
	isFunction,
	notify,
	subscribe,
	toSignal,
	TYPE_COMPUTED,
	UNSET,
} from '@zeix/cause-effect'

import type { Component, ComponentProps, SignalProducer } from '../component'
import { elementName, isDefinedObject, isString } from './util'

/* === Types === */

// Map common element types to their typical events
type ElementEventMap<E extends Element> = E extends
	| HTMLInputElement
	| HTMLTextAreaElement
	| HTMLSelectElement
	? Pick<
			HTMLElementEventMap,
			'input' | 'change' | 'focus' | 'blur' | 'invalid'
		>
	: E extends HTMLFormElement
		? Pick<HTMLElementEventMap, 'submit' | 'reset' | 'formdata'>
		: E extends HTMLButtonElement
			? Pick<HTMLElementEventMap, 'click' | 'focus' | 'blur'>
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

type PassedSignals<P extends ComponentProps, Q extends ComponentProps> = {
	[K in keyof Q]?: Signal<Q[K]> | ((element: Component<Q>) => Q[K]) | keyof P
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

/* === Internal Function === */

/**
 * Check if a value is a Component
 *
 * @param {unknown} value - value to check
 * @returns {boolean} - `true` if value is a valid custom element, otherwise `false`
 */
const isComponent = (value: unknown): value is Component<ComponentProps> =>
	value instanceof HTMLElement && value.localName.includes('-')

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

	const s: Computed<E[]> = {
		[Symbol.toStringTag]: TYPE_COMPUTED,

		get: (): E[] => {
			subscribe(watchers)
			if (!watchers.size) value = select()
			else if (!observer) observe()
			return value
		},
	}
	return s
}

/**
 * Produce a selection signal from a selector
 *
 * @since 0.13.1
 * @param {string} selectors - CSS selector for child elements
 * @returns {SignalProducer<HTMLElement, E[]>} signal producer for child element collection from a selector
 */
const fromSelector =
	<E extends Element>(selectors: string): SignalProducer<E[]> =>
	(host: HTMLElement) =>
		selection<E>(host, selectors)

/**
 * Produce a computed signal from reduced properties of child elements
 *
 * @since 0.13.1
 * @param {string} selectors - CSS selector for child elements
 * @param {(accumulator: T, currentElement: E, currentIndex: number, array: E[]) => T} reducer - function to reduce values
 * @param {T} initialValue - initial value for reduction
 * @returns {SignalProducer<T>} signal producer that emits reduced value
 */
const fromChildren =
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
		computed(() =>
			selection<E>(host, selectors).get().reduce(reducer, initialValue),
		)

/**
 * Attach an event listener to an element
 *
 * @since 0.12.0
 * @param {string} type - event type to listen for
 * @param {(event: Evt) => void} listener - event listener
 * @param {boolean | AddEventListenerOptions} options - event listener options
 * @throws {TypeError} - if the provided handler is not an event listener or a provider function
 */
const on =
	<Evt extends Event>(
		type: string,
		listener: (event: Evt) => void,
		options: boolean | AddEventListenerOptions = false,
	) =>
	<P extends ComponentProps>(
		host: Component<P>,
		target: Element = host,
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

	const s: Computed<T> = {
		[Symbol.toStringTag]: TYPE_COMPUTED,

		get: (): T => {
			subscribe(watchers)
			if (watchers.size && !listener) listen()
			return value
		},
	}
	return s
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
				`Element not found for selector "${selector}" in ${host.localName || 'component'}`,
			)
		}
		const initialValue = isFunction<T>(initializer)
			? initializer(host, source)
			: (initializer as T)
		return sensor(host, source, type, transform, initialValue)
	}

/**
 * Emit a custom event with the given detail
 *
 * @since 0.12.0
 * @param {string} type - event type to emit
 * @param {T | ((element: Element) => T)} detail - event detail or provider function
 */
const emit =
	<T>(type: string, detail: T | ((element: Element) => T)) =>
	<P extends ComponentProps>(
		host: Component<P>,
		target: Element = host,
	): void => {
		target.dispatchEvent(
			new CustomEvent(type, {
				detail: isFunction(detail) ? detail(target) : detail,
				bubbles: true,
			}),
		)
	}

/**
 * Pass signals to a custom element
 *
 * @since 0.12.0
 * @param {PassedSignals<P, Q> | ((target: Component<Q>) => PassedSignals<P, Q>)} signals - signals to be passed to the custom element
 * @throws {TypeError} - if the target element is not a custom element
 * @throws {TypeError} - if the provided signals are not an object or a provider function
 * @throws {Error} - if it fails to pass signals to the target element
 */
const pass =
	<P extends ComponentProps, Q extends ComponentProps>(
		signals:
			| PassedSignals<P, Q>
			| ((target: Component<Q>) => PassedSignals<P, Q>),
	) =>
	<E extends Element>(host: Component<P>, target: E): void => {
		if (!isComponent(target))
			throw new TypeError(`Target element must be a custom element`)
		const sources = isFunction(signals) ? signals(target) : signals
		if (!isDefinedObject(sources))
			throw new TypeError(
				`Passed signals must be an object or a provider function`,
			)
		customElements
			.whenDefined(target.localName)
			.then(() => {
				for (const [prop, source] of Object.entries(sources)) {
					const signal = isString(source)
						? host.getSignal(prop)
						: toSignal(source as MaybeSignal<Q[keyof Q]>)
					target.setSignal(prop, signal)
				}
			})
			.catch(error => {
				throw new Error(
					`Failed to pass signals to ${elementName(target)}`,
					{ cause: error },
				)
			})
	}

/**
 * Read a signal property from a custom element safely after it's defined
 * Returns a function that provides the signal value with fallback until component is ready
 *
 * @since 0.13.1
 * @param {Component<Q>} source - source custom element to read signal from
 * @param {K} prop - property name to get signal for
 * @param {Q[K]} fallback - fallback value to use until component is ready
 * @returns {() => Q[K]} function that returns signal value or fallback
 */
const read = <Q extends ComponentProps, K extends keyof Q>(
	source: Component<Q> | null,
	prop: K,
	fallback: Q[K],
): (() => Q[K]) => {
	if (!source) return () => fallback
	if (!isComponent(source))
		throw new TypeError(`Target element must be a custom element`)

	const awaited = computed(async () => {
		await customElements.whenDefined(source.localName)
		return source.getSignal(prop)
	})

	return () => {
		const value = awaited.get()
		return value === UNSET ? fallback : (value.get() as Q[K])
	}
}

/**
 * Produce a computed signal for projected reactive property from child component
 *
 * @since 0.13.1
 * @param {string} selector - CSS selector for child element
 * @param {K} prop - property name to get signal for
 * @param {Q[K]} fallback - fallback value to use until component is ready
 * @returns {SignalProducer<Q[K]>} signal producer that emits value from child component
 */
const fromChild =
	<Q extends ComponentProps, K extends keyof Q>(
		selector: string,
		prop: K,
		fallback: Q[K],
	): SignalProducer<Q[K]> =>
	(host: HTMLElement) => {
		const element = host.querySelector<Component<Q>>(selector)
		return computed(read(element, prop, fallback))
	}

export {
	type ElementEventMap,
	type ElementEventType,
	type ValidEventName,
	type PassedSignals,
	emit,
	fromChild,
	fromChildren,
	fromEvent,
	fromSelector,
	observeSubtree,
	on,
	pass,
	read,
	selection,
	sensor,
}

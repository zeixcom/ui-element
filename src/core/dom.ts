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

import type { ElementFromSelector, SignalProducer } from '../component'
import { isUpgradedComponent } from './util'

/* === Types === */

// Helper type to get event type from HTMLElementEventMap
type HTMLElementEventType<K extends string> =
	K extends keyof HTMLElementEventMap ? HTMLElementEventMap[K] : Event

// Helper type to support both standard HTML events and custom events
type ValidEventName = keyof HTMLElementEventMap | string

// Helper type to get event type - use mapped type for known events, Event for custom events
type EventType<K extends string> = K extends keyof HTMLElementEventMap
	? HTMLElementEventMap[K]
	: Event

// Transformer context interface for fromEvent
interface TransformerContext<
	T extends {},
	E extends HTMLElement,
	K extends string,
> {
	event: EventType<K>
	host: HTMLElement
	source: E
	value: T
}

// Event transformer function type
type EventTransformer<T extends {}, E extends HTMLElement, K extends string> = (
	context: TransformerContext<T, E, K>,
) => T

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
 * Produce a selection signal from a selector with automatic type inference
 *
 * @since 0.13.1
 * @param {K} selectors - CSS selector for descendant elements
 * @returns {(host: HTMLElement) => Computed<ElementFromSelector<K, E>[]} Signal producer for descendant element collection from a selector
 *
 * @example
 * // TypeScript automatically infers HTMLInputElement[] for 'input' selector
 * const inputs = fromSelector('input')(host).get()
 * inputs[0].value // TypeScript knows this is valid
 *
 * @example
 * // Works with custom UIElement components when declared in HTMLElementTagNameMap
 * // declare global { interface HTMLElementTagNameMap { 'my-button': Component<MyButtonProps> } }
 * const buttons = fromSelector('my-button')(host).get()
 * buttons[0].getSignal('disabled').get() // Access UIElement component methods
 */
const fromSelector =
	<E extends Element = HTMLElement, K extends string = string>(
		selectors: K,
	): SignalProducer<ElementFromSelector<K, E>[]> =>
	(host: HTMLElement) => {
		const watchers: Set<Watcher> = new Set()
		const select = () =>
			Array.from(
				host.querySelectorAll<ElementFromSelector<K, E>>(selectors),
			)
		let value: ElementFromSelector<K, E>[] = UNSET
		let observer: MutationObserver | undefined
		let mutationDepth = 0
		const MAX_MUTATION_DEPTH = 2 // Consider a depth > 1 as circular

		const observe = () => {
			value = select()
			observer = observeSubtree(host, selectors, () => {
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

			get: (): ElementFromSelector<K, E>[] => {
				subscribe(watchers)
				if (!watchers.size) value = select()
				else if (!observer) observe()
				return value
			},
		}
	}

/**
 * Produce a computed signal from reduced properties of descendant elements with type safety
 *
 * @since 0.13.1
 * @param {K} selectors - CSS selector for descendant elements
 * @param {(accumulator: T, currentElement: ElementFromSelector<K, E>, currentIndex: number, array: ElementFromSelector<K, E>[]) => T} reducer - function to reduce values
 * @param {T} init - initial value for reduction
 * @returns {(host: HTMLElement) => () => T} signal producer that emits reduced value
 *
 * @example
 * // TypeScript knows each 'input' is HTMLInputElement
 * fromDescendants('input', (total, input) => total + input.value.length, 0)
 *
 * @example
 * // Works with UIElement components when properly declared
 * // declare global { interface HTMLElementTagNameMap { 'form-spinbutton': Component<FormSpinbuttonProps> } }
 * fromDescendants('form-spinbutton', (sum, item) => {
 *   // TypeScript knows item is Component<FormSpinbuttonProps>
 *   return sum + item.value // Access reactive property
 * }, 0)
 */
const fromDescendants =
	<T extends {}, E extends Element = HTMLElement, K extends string = string>(
		selectors: K,
		reducer: (
			accumulator: T,
			currentElement: ElementFromSelector<K, E>,
			currentIndex: number,
			array: ElementFromSelector<K, E>[],
		) => T,
		init: T | ((host: HTMLElement) => T),
	): SignalProducer<T> =>
	(host: HTMLElement) =>
	() =>
		(
			fromSelector<ElementFromSelector<K, E>>(selectors)(
				host,
			) as Computed<ElementFromSelector<K, E>[]>
		)
			.get()
			.reduce(reducer, isFunction<T>(init) ? init(host) : (init as T))

/**
 * Produce a computed signal from transformed event data
 *
 * @since 0.13.2
 * @param {S} selector - CSS selector for the source element
 * @param {K} type - Event type to listen for
 * @param {EventTransformer<T, ElementFromSelector<S, E>, K>} transformer - Transformation function for the event
 * @param {T | ((host: C) => T)} init - Initial value or initializer function
 * @returns {(host: C) => Computed<T>} Signal producer for value from event
 *
 * @example
 * // Simple input value extraction
 * fromEvent('input', 'input', ({ source }) => source.value, '')
 *
 * @example
 * // Click counter using previous value
 * fromEvent('button', 'click', ({ value }) => value + 1, 0)
 *
 * @example
 * // Form submission with event handling
 * fromEvent('form', 'submit', ({ event, source }) => {
 *   event.preventDefault()
 *   return new FormData(source)
 * }, null)
 *
 * @example
 * // Complex logic using multiple context values
 * fromEvent('input', 'input', ({ event, source, value, host }) => {
 *   if (event.inputType === 'deleteContentBackward') {
 *     host.dispatchEvent(new CustomEvent('deletion'))
 *   }
 *   return source.value.length > value ? source.value : value
 * }, '')
 *
 * @example
 * // TypeScript automatically infers element types from selectors
 * fromEvent('input', 'input', ({ source }) => {
 *   return source.value.length // TypeScript knows source is HTMLInputElement
 * }, 0)
 *
 * @example
 * // Custom event handling with TypeScript declarations
 * // First, declare your custom events and components globally:
 * // declare global {
 * //   interface HTMLElementTagNameMap {
 * //     'my-component': Component<MyComponentProps>
 * //   }
 * //   interface HTMLElementEventMap {
 * //     itemAdded: CustomEvent<{ id: string; quantity: number }>
 * //   }
 * // }
 * fromEvent('my-component', 'itemAdded', ({ event, source }) => {
 *   // TypeScript knows source is Component<MyComponentProps> with UIElement methods
 *   const currentValue = source.getSignal('someProperty').get()
 *   return {
 *     id: source.dataset.id,
 *     quantity: event.detail.quantity, // TypeScript knows this is a number
 *     currentValue,
 *     timestamp: Date.now()
 *   }
 * }, null)
 */
const fromEvent =
	<
		T extends {},
		E extends HTMLElement = HTMLElement,
		K extends string = string,
		C extends HTMLElement = HTMLElement,
		S extends string = string,
	>(
		selector: S,
		type: K,
		transformer: EventTransformer<T, ElementFromSelector<S, E>, K>,
		init: T | ((host: C) => T),
		options: boolean | AddEventListenerOptions = false,
	): ((host: C) => Computed<T>) =>
	(host: C) => {
		const watchers: Set<Watcher> = new Set()
		let value: T = isFunction<T>(init) ? init(host) : (init as T)
		let listener: EventListener | undefined
		let cleanup: Cleanup | undefined

		const listen = () => {
			listener = ((e: Event) => {
				const target = e.target as Element
				if (!target) return

				const source = target.closest(selector) as ElementFromSelector<
					S,
					E
				> | null
				if (!source || !host.contains(source)) return
				e.stopPropagation()

				try {
					const newValue = transformer({
						event: e as EventType<K>,
						host,
						source,
						value,
					})
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

			host.addEventListener(type, listener, options)
			cleanup = () => {
				if (listener) {
					host.removeEventListener(type, listener)
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
	} /**
 * Create a getter function for a reactive property from a descendant element with type safety
 *
 * @since 0.13.1
 * @param {S} selector - CSS selector for descendant element
 * @param {K} prop - Name of reactive property to get
 * @param {NonNullable<ElementFromSelector<S, E>[K]>} fallback - Fallback value to use until component is upgraded or if value is nullish
 * @returns {(host: HTMLElement) => () => NonNullable<ElementFromSelector<S, E>[K]>} Signal producer that gets the property value from descendant element
 * @example
 * // TypeScript knows 'value' exists on HTMLInputElement
 * fromDescendant('input', 'value', '')
 *
 * @example
 * // Access UIElement component properties with full type safety
 * // declare global { interface HTMLElementTagNameMap { 'my-counter': Component<{count: number}> } }
 * const counterValue = fromDescendant('my-counter', 'count', 0)
 *
 * @example
 * // Access UIElement component signals for advanced patterns
 * const getCounterSignal = fromDescendant('my-counter', 'getSignal', null)
 * if (getCounterSignal) {
 *   const signal = getCounterSignal('count')
 *   // Now you can work with the signal directly
 * }
 */
const fromDescendant =
	<
		E extends Element = HTMLElement,
		S extends string = string,
		K extends keyof ElementFromSelector<S, E> = keyof ElementFromSelector<
			S,
			E
		>,
	>(
		selector: S,
		prop: K,
		fallback: NonNullable<ElementFromSelector<S, E>[K]>,
	): ((
		host: HTMLElement,
	) => () => NonNullable<ElementFromSelector<S, E>[K]>) =>
	(host: HTMLElement) =>
	() => {
		const source = host.querySelector<ElementFromSelector<S, E>>(selector)
		if (!source || !isUpgradedComponent(source)) return fallback
		const value = prop in source ? source[prop] : fallback
		return value == null || value === UNSET ? fallback : value
	}

export {
	type HTMLElementEventType,
	type ValidEventName,
	type EventType,
	type TransformerContext,
	type EventTransformer,
	fromDescendant,
	fromDescendants,
	fromEvent,
	fromSelector,
	observeSubtree,
}

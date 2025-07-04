import { type Computed, type Signal } from '@zeix/cause-effect'
import type {
	Component,
	ComponentProps,
	Effect,
	SignalProducer,
} from '../component'
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
								: HTMLElementEventMap
type ElementEventType<
	E extends Element,
	K extends string,
> = K extends keyof ElementEventMap<E> ? ElementEventMap<E>[K] : Event
type ValidEventName<E extends Element> = keyof ElementEventMap<E> & string
type PassedSignals<P extends ComponentProps, Q extends ComponentProps> = {
	[K in keyof Q]?: Signal<Q[K]> | ((element: Component<Q>) => Q[K]) | keyof P
}
/**
 * Observe a DOM subtree with a mutation observer
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node
 * @param {string} selectors - selector for matching elements to observe
 * @param {MutationCallback} callback - mutation callback
 * @returns {MutationObserver} - the created mutation observer
 */
declare const observeSubtree: (
	parent: ParentNode,
	selectors: string,
	callback: MutationCallback,
) => MutationObserver
/**
 * Create a element selection signal from a query selector
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node to query
 * @param {string} selectors - query selector
 * @returns {Computed<E[]>} Element selection signal
 */
declare const selection: <E extends Element>(
	parent: ParentNode,
	selectors: string,
) => Computed<E[]>
/**
 * Produce a selection signal from a selector
 *
 * @since 0.13.1
 * @param {string} selectors - CSS selector for descendant elements
 * @returns {SignalProducer<HTMLElement, E[]>} signal producer for descendant element collection from a selector
 */
declare const fromSelector: <E extends Element>(
	selectors: string,
) => SignalProducer<E[]>
/**
 * Produce a computed signal from reduced properties of descendant elements
 *
 * @since 0.13.1
 * @param {string} selectors - CSS selector for descendant elements
 * @param {(accumulator: T, currentElement: E, currentIndex: number, array: E[]) => T} reducer - function to reduce values
 * @param {T} initialValue - initial value for reduction
 * @returns {SignalProducer<T>} signal producer that emits reduced value
 */
declare const fromDescendants: <T extends {}, E extends Element = HTMLElement>(
	selectors: string,
	reducer: (
		accumulator: T,
		currentElement: E,
		currentIndex: number,
		array: E[],
	) => T,
	initialValue: T,
) => SignalProducer<T>
/**
 * Attach an event listener to an element
 *
 * @since 0.12.0
 * @param {K} type - event type to listen for (type-safe based on element type)
 * @param {(event: ElementEventType<E, K>) => void} listener - event listener
 * @param {boolean | AddEventListenerOptions} options - event listener options
 * @throws {TypeError} - if the provided handler is not an event listener or a provider function
 */
declare const on: <E extends Element, K extends ValidEventName<E>>(
	type: K,
	listener: (event: ElementEventType<E, K>) => void,
	options?: boolean | AddEventListenerOptions,
) => Effect<ComponentProps, E>
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
declare const sensor: <
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
	options?: boolean | AddEventListenerOptions,
) => Computed<T>
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
declare const fromEvent: <
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
) => SignalProducer<T, C>
/**
 * Pass signals to a UIElement component
 *
 * @since 0.13.2
 * @param {PassedSignals<P, Q> | ((target: Component<Q>) => PassedSignals<P, Q>)} signals - Signals to be passed to descendent components
 * @returns {Effect<P, Component<Q>>} - Effect to be used in ancestor component
 * @throws {TypeError} if the provided signals are not an object or a provider function
 * @throws {TypeError} if the target component is not a UIElement component
 */
declare const pass: <P extends ComponentProps, Q extends ComponentProps>(
	signals:
		| PassedSignals<P, Q>
		| ((target: Component<Q>) => PassedSignals<P, Q>),
) => Effect<P, Component<Q>>
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
declare const read: <E extends Element, K extends keyof E>(
	source: E | null,
	prop: K,
	fallback: NonNullable<E[K]>,
) => () => NonNullable<E[K]>
/**
 * Produce a computed signal for projected reactive property from a descendant component
 *
 * @since 0.13.1
 * @param {string} selector - CSS selector for descendant element
 * @param {K} prop - property name to get signal for
 * @param {Q[K]} fallback - fallback value to use until component is ready
 * @returns {SignalProducer<Q[K]>} signal producer that emits value from descendant component
 */
declare const fromDescendant: <E extends Element, K extends keyof E>(
	selector: string,
	prop: K,
	fallback: NonNullable<E[K]>,
) => SignalProducer<NonNullable<E[K]>>
export {
	type ElementEventMap,
	type ElementEventType,
	type ValidEventName,
	type PassedSignals,
	fromDescendant,
	fromDescendants,
	fromEvent,
	fromSelector,
	observeSubtree,
	on,
	pass,
	read,
	selection,
	sensor,
}

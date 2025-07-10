import { type Computed } from '@zeix/cause-effect'
import type { ElementFromSelector, SignalProducer } from '../component'
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
/**
 * Produce a computed signal from transformed event data
 *
 * @since 0.13.3
 * @param {T | ((host: C) => T)} initialize - Initial value or initialize function
 * @param {S} selector - CSS selector for the source element
 * @param {EventTransformers<T, ElementFromSelector<S, E>, C>} events - Transformation functions for events
 * @returns {(host: C) => Computed<T>} Signal producer for value from event
 */
declare const fromEvents: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	initialize: T | ((host: C) => T),
	selector: S,
	events: EventTransformers<T, ElementFromSelector<S, E>, C>,
) => SignalProducer<T, C>
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
 * @returns {(host: C) => Computed<ElementFromSelector<S, E>[]>} Signal producer for descendant element collection from a selector
 */
declare const fromSelector: <
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	selector: S,
) => SignalProducer<ElementFromSelector<S, E>[], C>
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
declare const reduced: <
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
) => Computed<T>
/**
 * Read from a descendant element and map the result
 *
 * @since 0.13.3
 * @param {C} host - Host element
 * @param {S} selector - CSS selector for descendant element
 * @param {(element: ElementFromSelector<S, E> | null, isUpgraded: boolean) => T} map - Function to map over the element
 * @returns {T} The mapped result from the descendant element
 */
declare const read: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	host: C,
	selector: S,
	map: (element: ElementFromSelector<S, E> | null, isUpgraded: boolean) => T,
) => T
/**
 * Assert that an element contains an expected descendant element
 *
 * @since 0.13.3
 * @param {HTMLElement} host - Host element
 * @param {S} selector - Descendant element to check for
 * @returns {ElementFromSelector<S, E>} First found descendant element
 * @throws {Error} If the element does not contain the required descendant element
 */
declare const requireDescendant: <
	S extends string = string,
	E extends Element = HTMLElement,
>(
	host: HTMLElement,
	selector: S,
) => ElementFromSelector<S, E>
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

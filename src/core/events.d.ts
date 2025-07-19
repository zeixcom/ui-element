import { type Computed } from '@zeix/cause-effect'
import type { ComponentProps } from '../component'
import { type ElementFromSelector, type Extractor, type Fallback } from './dom'
import { type Effect, type Reactive } from './reactive'
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
 * @param {ValueOrExtractor<T>} initialize - Initial value or extractor function
 * @param {S} selector - CSS selector for the source element
 * @param {EventTransformers<T, ElementFromSelector<S, E>, C>} events - Transformation functions for events
 * @returns {Extractor<Computed<T>, C>} Extractor function for value from event
 */
declare const fromEvents: <
	T extends {},
	E extends Element = HTMLElement,
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	initialize: Fallback<T, C>,
	selector: S,
	events: EventTransformers<T, ElementFromSelector<S, E>, C>,
) => Extractor<Computed<T>, C>
/**
 * Effect for attaching an event listener to an element.
 * Provides proper cleanup when the effect is disposed.
 *
 * @since 0.12.0
 * @param {string} type - Event type
 * @param {(event: EventType<K>) => void} listener - Event listener function
 * @param {AddEventListenerOptions | boolean} options - Event listener options
 * @returns {Effect<ComponentProps, E>} Effect function that manages the event listener
 */
declare const on: <
	K extends keyof HTMLElementEventMap | string,
	E extends HTMLElement,
>(
	type: K,
	listener: (event: EventType<K>) => void,
	options?: AddEventListenerOptions | boolean,
) => Effect<ComponentProps, E>
/**
 * Effect for emitting custom events with reactive detail values.
 * Creates and dispatches CustomEvent instances with bubbling enabled by default.
 *
 * @since 0.13.3
 * @param {string} type - Event type to emit
 * @param {Reactive<T, P, E>} reactive - Reactive value bound to the event detail
 * @returns {Effect<P, E>} Effect function that emits custom events
 */
declare const emitEvent: <
	T,
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	type: string,
	reactive: Reactive<T, P, E>,
) => Effect<P, E>
export {
	type EventType,
	type EventTransformer,
	type EventTransformers,
	type EventTransformerContext,
	emitEvent,
	fromEvents,
	on,
}

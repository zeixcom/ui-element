import { type Computed } from '@zeix/cause-effect'
import type { Component, ComponentProps } from '../component'
import { type ElementFromSelector, type Extractor, type Fallback } from './dom'
import { type Effect, type Reactive } from './reactive'
type EventType<K extends string> = K extends keyof HTMLElementEventMap
	? HTMLElementEventMap[K]
	: Event
type EventTransformer<
	T extends {},
	E extends Element,
	C extends HTMLElement,
	Evt extends Event,
> = (context: {
	event: Evt
	host: C
	target: E
	value: T
}) => T | void
type EventTransformers<
	T extends {},
	E extends Element,
	C extends HTMLElement,
> = {
	[K in keyof HTMLElementEventMap]?: EventTransformer<T, E, C, EventType<K>>
}
type EventHandler<
	P extends ComponentProps,
	E extends Element,
	Evt extends Event,
> = (context: {
	event: Evt
	host: Component<P>
	target: E
}) =>
	| {
			[K in keyof P]?: P[K]
	  }
	| void
/**
 * Produce a computed signal from transformed event data
 *
 * @since 0.13.3
 * @param {ValueOrExtractor<T>} initialize - Initial value or extractor function
 * @param {S} selector - CSS selector for the source element
 * @param {EventTransformers<T, ElementFromSelector<S>, C>} events - Transformation functions for events
 * @returns {Extractor<Computed<T>, C>} Extractor function for value from event
 */
declare const fromEvents: <
	T extends {},
	C extends HTMLElement = HTMLElement,
	S extends string = string,
>(
	initialize: Fallback<T, C>,
	selector: S,
	events: EventTransformers<T, ElementFromSelector<S>, C>,
) => Extractor<Computed<T>, C>
/**
 * Effect for attaching an event listener to an element.
 * Provides proper cleanup when the effect is disposed.
 *
 * @since 0.14.0
 * @param {K} type - Event type
 * @param {EventHandler<P, E, EventType<K>>} handler - Event handler function
 * @param {AddEventListenerOptions | boolean} options - Event listener options
 * @returns {Effect<ComponentProps, E>} Effect function that manages the event listener
 */
declare const on: <
	K extends keyof HTMLElementEventMap | string,
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	type: K,
	handler: EventHandler<P, E, EventType<K>>,
	options?: AddEventListenerOptions | boolean,
) => Effect<P, E>
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
	type EventHandler,
	emitEvent,
	fromEvents,
	on,
}

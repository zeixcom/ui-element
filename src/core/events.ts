import {
	batch,
	type Cleanup,
	type Computed,
	effect,
	// isState,
	notify,
	subscribe,
	TYPE_COMPUTED,
	UNSET,
	type Watcher,
} from '@zeix/cause-effect'
import type { Component, ComponentProps } from '../component'
import {
	type ElementFromSelector,
	type Extractor,
	getFallback,
	type ParserOrFallback,
} from './dom'
import { type Effect, RESET, type Reactive, resolveReactive } from './reactive'
import { elementName, isDefinedObject, LOG_ERROR, log } from './util'

/* === Types === */

type EventType<K extends string> = K extends keyof HTMLElementEventMap
	? HTMLElementEventMap[K]
	: Event

type EventTransformer<
	T extends {},
	E extends Element,
	C extends HTMLElement,
	Evt extends Event,
> = (context: { event: Evt; host: C; target: E; value: T }) => T | void

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
}) => { [K in keyof P]?: P[K] } | void

/* === Exported Functions === */

/**
 * Produce a computed signal from transformed event data
 *
 * @since 0.14.0
 * @param {S} selector - CSS selector for the source element
 * @param {EventTransformers<T, ElementFromSelector<S>, C>} events - Transformation functions for events
 * @param {ParserOrFallback<T>} initialize - Initial value or extractor function
 * @returns {Extractor<Computed<T>, C>} Extractor function for value from event
 */
const fromEvents =
	<
		T extends {},
		C extends HTMLElement = HTMLElement,
		S extends string = string,
	>(
		selector: S,
		events: EventTransformers<T, ElementFromSelector<S>, C>,
		initialize: ParserOrFallback<T, C>,
	): Extractor<Computed<T>, C> =>
	(host: C) => {
		const watchers: Set<Watcher> = new Set()
		let value: T = getFallback(host, initialize)
		const eventMap = new Map<string, EventListener>()
		let cleanup: Cleanup | undefined

		const listen = () => {
			for (const [type, transform] of Object.entries(events)) {
				const listener = (e: Event) => {
					const target = e.target as Element
					if (!target) return

					const source = target.closest(
						selector,
					) as ElementFromSelector<S> | null
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
				}
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
 * Effect for attaching an event listener to an element.
 * Provides proper cleanup when the effect is disposed.
 *
 * @since 0.14.0
 * @param {K} type - Event type
 * @param {EventHandler<P, E, EventType<K>>} handler - Event handler function
 * @param {AddEventListenerOptions | boolean} options - Event listener options
 * @returns {Effect<ComponentProps, E>} Effect function that manages the event listener
 */
const on =
	<
		K extends keyof HTMLElementEventMap | string,
		P extends ComponentProps,
		E extends Element = HTMLElement,
	>(
		type: K,
		handler: EventHandler<P, E, EventType<K>>,
		options: AddEventListenerOptions | boolean = false,
	): Effect<P, E> =>
	(host, target): Cleanup => {
		const listener = (e: Event) => {
			const result = handler({ host, target, event: e as EventType<K> })
			if (!isDefinedObject(result)) return
			batch(() => {
				for (const [key, value] of Object.entries(result)) {
					try {
						host[key as keyof P] = value
					} catch (error) {
						log(
							error,
							`Reactive property "${key}" on ${elementName(host)} from event ${type} on ${elementName(target)} could not be set, because it is read-only.`,
							LOG_ERROR,
						)
					}
					/* const signal = host.getSignal(key)
					if (isState(signal)) signal.set(value)
					else
						log(
							value,
							`Reactive property "${key}" on ${elementName(host)} from event ${type} on ${elementName(target)} could not be set, because it is read-only.`,
							LOG_ERROR,
						) */
				}
			})
		}
		target.addEventListener(type, listener, options)
		return () => target.removeEventListener(type, listener)
	}

/**
 * Effect for emitting custom events with reactive detail values.
 * Creates and dispatches CustomEvent instances with bubbling enabled by default.
 *
 * @since 0.13.3
 * @param {string} type - Event type to emit
 * @param {Reactive<T, P, E>} reactive - Reactive value bound to the event detail
 * @returns {Effect<P, E>} Effect function that emits custom events
 */
const emitEvent =
	<T extends {}, P extends ComponentProps, E extends Element = HTMLElement>(
		type: string,
		reactive: Reactive<T, P, E>,
	): Effect<P, E> =>
	(host, target): Cleanup =>
		effect((): undefined => {
			const value = resolveReactive(
				reactive,
				host,
				target,
				`custom event "${type}" detail`,
			)
			if (value === RESET || value === UNSET) return
			target.dispatchEvent(
				new CustomEvent(type, {
					detail: value,
					bubbles: true,
				}),
			)
		})

/* === Exports === */

export {
	type EventType,
	type EventTransformer,
	type EventTransformers,
	type EventHandler,
	emitEvent,
	fromEvents,
	on,
}

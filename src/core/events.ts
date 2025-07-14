import {
	type Cleanup,
	type Computed,
	TYPE_COMPUTED,
	UNSET,
	type Watcher,
	effect,
	isFunction,
	notify,
	subscribe,
} from '@zeix/cause-effect'
import { type ComponentProps } from '../component'
import {
	type ElementFromSelector,
	type Extractor,
	type Fallback,
	extractValue,
} from './dom'
import { type Effect, RESET, type Reactive, resolveReactive } from './reactive'
import { elementName } from './util'

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

/* === Exported Functions === */

/**
 * Produce a computed signal from transformed event data
 *
 * @since 0.13.3
 * @param {ValueOrExtractor<T>} initialize - Initial value or extractor function
 * @param {S} selector - CSS selector for the source element
 * @param {EventTransformers<T, ElementFromSelector<S, E>, C>} events - Transformation functions for events
 * @returns {Extractor<Computed<T>, C>} Extractor function for value from event
 */
const fromEvents =
	<
		T extends {},
		E extends Element = HTMLElement,
		C extends HTMLElement = HTMLElement,
		S extends string = string,
	>(
		initialize: Fallback<T, C>,
		selector: S,
		events: EventTransformers<T, ElementFromSelector<S, E>, C>,
	): Extractor<Computed<T>, C> =>
	(host: C) => {
		const watchers: Set<Watcher> = new Set()
		let value: T = extractValue(initialize, host)
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
 * Effect for attaching an event listener to an element.
 * Provides proper cleanup when the effect is disposed.
 *
 * @since 0.12.0
 * @param {string} type - Event type
 * @param {(event: EventType<K>) => void} listener - Event listener function
 * @param {AddEventListenerOptions | boolean} options - Event listener options
 * @returns {Effect<ComponentProps, E>} Effect function that manages the event listener
 */
const on =
	<K extends keyof HTMLElementEventMap | string, E extends HTMLElement>(
		type: K,
		listener: (event: EventType<K>) => void,
		options: AddEventListenerOptions | boolean = false,
	): Effect<ComponentProps, E> =>
	(_, target): Cleanup => {
		if (!isFunction(listener))
			throw new TypeError(
				`Invalid event listener provided for "${type} event on element ${elementName(target)}`,
			)
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
	<T, P extends ComponentProps, E extends Element = HTMLElement>(
		type: string,
		reactive: Reactive<T, P, E>,
	): Effect<P, E> =>
	(host, target): Cleanup =>
		effect(() => {
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
	type EventTransformerContext,
	emitEvent,
	fromEvents,
	on,
}

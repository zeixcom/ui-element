import { toSignal, type MaybeSignal, type Signal } from "@zeix/cause-effect"

import type { Cleanup, Component, ComponentProps, FxFunction } from "../component"
import { elementName } from "./log"
import { isDefinedObject, isFunction, isString } from "./util"

/* === Types === */

type Provider<T> = <E extends Element>(
	element: E,
	index: number
) => T

type PassedSignals<P extends ComponentProps, Q extends ComponentProps> = {
	[K in keyof Q]?: Signal<Q[K]> | Provider<Q[K]> | (() => Q[K]) | keyof P
}

/* === Internal Function === */

const isProvider = <T>(value: unknown): value is Provider<T> =>
	isFunction(value) && value.length == 2

const isEventListener = (value: unknown): value is EventListenerOrEventListenerObject =>
	isFunction(value) || (isDefinedObject(value) && isFunction(value.handleEvent))

const isComponent = (value: unknown): value is Component<ComponentProps> =>
	value instanceof HTMLElement && value.localName.includes('-')

/* === Exported Functions === */

const run = <P extends ComponentProps, E extends Element>(
	fns: FxFunction<P, E>[],
	host: Component<P>,
	elements: E[]
): Cleanup => {
	const cleanups = elements.flatMap((target, index) =>
		fns.filter(isFunction).map(fn =>
			fn(host, target, index)
		)
	)
	return () => {
		cleanups.filter(isFunction).forEach(cleanup => cleanup())
		cleanups.length = 0
	}
}
	
/**
 * Apply effect functions to a first matching sub-element within the custom element
 * 
 * @since 0.12.0
 * @param {string} selector - selector to match sub-element
 */
const first = <P extends ComponentProps, E extends Element>(
	selector: string,
	...fns: FxFunction<P, E>[]
) => (host: Component<P>): Cleanup =>
	run(fns, host, [(host.shadowRoot || host).querySelector<E>(selector)].filter(v => v != null))

/**
 * Apply effect functions to all matching sub-elements within the custom element
 * 
 * @since 0.12.0
 * @param {string} selector - selector to match sub-elements
 */
const all = <P extends ComponentProps, E extends Element>(
	selector: string,
	...fns: FxFunction<P, E>[]
) => (host: Component<P>): Cleanup =>
	run(fns, host, Array.from((host.shadowRoot || host).querySelectorAll<E>(selector)))

/**
 * Attach an event listener to an element
 * 
 * @since 0.12.0
 * @param {string} type - event type to listen for
 * @param {EventListenerOrEventListenerObject | Provider<EventListenerOrEventListenerObject>} handler - event listener or provider function
 * @throws {TypeError} - if the provided handler is not an event listener or a provider function
 */
const on = (
	type: string,
	handler: EventListenerOrEventListenerObject | Provider<EventListenerOrEventListenerObject>,
) => <P extends ComponentProps>(
	host: Component<P>,
	target: Element = host,
	index = 0
): Cleanup => {
	const listener = isProvider(handler) ? handler(target, index) : handler
	if (!isEventListener(listener))
		throw new TypeError(`Invalid event listener provided for "${type} event on element ${elementName(target)}`)
	target.addEventListener(type, listener)
	return () => target.removeEventListener(type, listener)
}

/**
 * Emit a custom event with the given detail
 * 
 * @since 0.12.0
 * @param {string} type - event type to emit
 * @param {T | Provider<T>} detail - event detail or provider function
 */
const emit = <T>(
	type: string,
	detail: T | Provider<T>
) => <P extends ComponentProps>(
	host: Component<P>,
	target: Element = host,
	index = 0
): void => {
	target.dispatchEvent(new CustomEvent(type, {
		detail: isProvider(detail) ? detail(target, index) : detail,
		bubbles: true
	}))
}

/**
 * Pass signals to a custom element
 * 
 * @since 0.12.0
 * @param {PassedSignals<P, Q>} signals - signals to be passed to the custom element
 * @throws {TypeError} - if the target element is not a custom element
 * @throws {TypeError} - if the provided signals are not an object or a provider function
 * @throws {Error} - if it fails to pass signals to the target element
 */
const pass = <P extends ComponentProps, Q extends ComponentProps>(
	signals: PassedSignals<P, Q>
) => <E extends Element>(
	host: Component<P>,
	target: E,
	index = 0
): void => {
	const targetName = target.localName
	if (!isComponent(target))
		throw new TypeError(`Target element must be a custom element`)
	const sources = isProvider(signals)
		? signals(target, index) as PassedSignals<P, Q>
		: signals
	if (!isDefinedObject(sources))
		throw new TypeError(`Passed signals must be an object or a provider function`)
	customElements.whenDefined(targetName).then(() => {
		for (const [prop, source] of Object.entries(sources)) {
			const signal = isString(source)
				? host.getSignal(prop)
				: toSignal(source as MaybeSignal<Q[keyof Q]>)
			target.setSignal(prop, signal)
		}
	}).catch((error) => {
		throw new Error(`Failed to pass signals to ${elementName(target)}}`, { cause: error })
	})
}

export { type Provider, type PassedSignals, run, all, first, on, emit, pass }
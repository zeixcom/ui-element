import { toSignal, type MaybeSignal, type Signal } from "@zeix/cause-effect"

import type { Cleanup, Component, ComponentProps, FxFunction } from "../component"
import { elementName } from "./log"
import { isDefinedObject, isFunction, isString } from "./util"

/* === Types === */

type PassedSignals<P extends ComponentProps, Q extends ComponentProps> = {
	[K in keyof Q]?: Signal<Q[K]> | ((element: Component<Q>) => Q[K]) | keyof P
}

/* === Internal Function === */

const isElement = (node: Node): node is Element =>
	node.nodeType === Node.ELEMENT_NODE

const isComponent = (value: unknown): value is Component<ComponentProps> =>
	value instanceof HTMLElement && value.localName.includes('-')

/* === Exported Functions === */

const run = <P extends ComponentProps, E extends Element>(
	fns: FxFunction<P, E>[],
	host: Component<P>,
	element: E
): Cleanup => {
	const cleanups = fns.filter(isFunction).map(fn => fn(host, element))
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
) => (host: Component<P>): Cleanup | void => {
	const el = (host.shadowRoot || host).querySelector<E>(selector)
	if (el) run(fns, host, el)
}

/**
 * Apply effect functions to all matching sub-elements within the custom element
 * 
 * @since 0.12.0
 * @param {string} selector - selector to match sub-elements
 */
const all = <P extends ComponentProps, E extends Element>(
	selector: string,
	...fns: FxFunction<P, E>[]
) => (host: Component<P>): Cleanup => {
	const cleanups = new Map<E, Cleanup>()
	const root = host.shadowRoot || host

	const attach = (target: E) => {
		if (!cleanups.has(target)) cleanups.set(target, run(fns, host, target))
	}

	const detach = (target: E) => {
		const cleanup = cleanups.get(target)
		if (isFunction(cleanup)) cleanup()
		cleanups.delete(target)
	}

	const applyToMatching = (fn: (target: E) => void) => (node: Node) => {
		if (isElement(node)) {
			if (node.matches(selector)) fn(node as E)
			node.querySelectorAll<E>(selector).forEach(fn)
		}
	}

	const observer = new MutationObserver(mutations => {
		for (const mutation of mutations) {
			mutation.addedNodes.forEach(applyToMatching(attach))
			mutation.removedNodes.forEach(applyToMatching(detach))
		}
	})
	observer.observe(root, {
		childList: true,
		subtree: true
	})

	root.querySelectorAll<E>(selector).forEach(attach)

	return () => {
		observer.disconnect()
		cleanups.forEach(cleanup => cleanup())
		cleanups.clear()
	}
}

/**
 * Attach an event listener to an element
 * 
 * @since 0.12.0
 * @param {string} type - event type to listen for
 * @param {EventListenerOrEventListenerObject | Provider<EventListenerOrEventListenerObject>} listener - event listener or provider function
 * @throws {TypeError} - if the provided handler is not an event listener or a provider function
 */
const on = <E extends Event>(
	type: string,
	listener: (evt: E) => void,
) => <P extends ComponentProps>(
	host: Component<P>,
	target: Element = host
): Cleanup => {
	if (!isFunction(listener))
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
	detail: T | ((element: Element) => T),
) => <P extends ComponentProps>(
	host: Component<P>,
	target: Element = host
): void => {
	target.dispatchEvent(new CustomEvent(type, {
		detail: isFunction(detail) ? detail(target) : detail,
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
	target: E
): void => {
	const targetName = target.localName
	if (!isComponent(target))
		throw new TypeError(`Target element must be a custom element`)
	const sources = isFunction(signals) ? signals(target) : signals
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

export {
	type PassedSignals,
	run, all, first, on, emit, pass
}
import {
	type Computed,
	type MaybeSignal,
	type Signal,
	computed,
	effect,
	toSignal,
	UNSET,
} from '@zeix/cause-effect'
import { isFunction } from '@zeix/cause-effect/src/util'

import {
	type Watcher,
	notify,
	subscribe,
} from '@zeix/cause-effect/src/scheduler'
import type { EffectMatcher, TapMatcher } from '@zeix/cause-effect/src/effect'

import type {
	Cleanup,
	Component,
	ComponentProps,
	FxFunction,
} from '../component'
import { elementName, isDefinedObject, isString } from './util'

/* === Types === */

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
 * Check if a node is an Element
 *
 * @param {Node} node - node to check
 * @returns {boolean} - `true` if node is an element node, otherwise `false`
 */
const isElement = (node: Node): node is Element =>
	node.nodeType === Node.ELEMENT_NODE

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
 * @since 0.12.2
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

/* === Exported Functions === */

/**
 * Run one or more functions on a component's element
 *
 * @since 0.12.0
 * @param {FxFunction<P, E>[]} fns - functions to run
 * @param {Component<P>} host - component host element
 * @param {E} target - target element
 * @returns {Cleanup} - a cleanup function that runs collected cleanup functions
 */
const run = <P extends ComponentProps, E extends Element>(
	fns: FxFunction<P, E>[],
	host: Component<P>,
	target: E,
): Cleanup => {
	const cleanups = fns.filter(isFunction).map(fn => fn(host, target))
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
const first =
	<P extends ComponentProps, E extends Element>(
		selector: string,
		...fns: FxFunction<P, E>[]
	) =>
	(host: Component<P>): Cleanup | void => {
		const el = (host.shadowRoot || host).querySelector<E>(selector)
		if (el) run(fns, host, el)
	}

/**
 * Apply effect functions to all matching sub-elements within the custom element
 *
 * @since 0.12.0
 * @param {string} selector - selector to match sub-elements
 */
const all =
	<P extends ComponentProps, E extends Element>(
		selector: string,
		...fns: FxFunction<P, E>[]
	) =>
	(host: Component<P>): Cleanup => {
		const cleanups = new Map<E, Cleanup>()
		const root = host.shadowRoot || host

		const attach = (target: E) => {
			if (!cleanups.has(target))
				cleanups.set(target, run(fns, host, target))
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

		const observer = observeSubtree(root, selector, mutations => {
			for (const mutation of mutations) {
				mutation.addedNodes.forEach(applyToMatching(attach))
				mutation.removedNodes.forEach(applyToMatching(detach))
			}
		})

		root.querySelectorAll<E>(selector).forEach(attach)

		return () => {
			observer.disconnect()
			cleanups.forEach(cleanup => cleanup())
			cleanups.clear()
		}
	}

/**
 * Create a element selection signal from a query selector
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node to query
 * @param {string} selectors - query selector
 * @returns {Computed<T>} - Element selection signal
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
		[Symbol.toStringTag]: 'Computed',

		get: (): E[] => {
			subscribe(watchers)
			if (!watchers.size) value = select()
			else if (!observer) observe()
			return value
		},

		map: <U extends {}>(fn: (v: E[]) => U | Promise<U>): Computed<U> =>
			computed(() => fn(s.get())),

		tap: (
			matcher: TapMatcher<E[]> | ((v: E[]) => Cleanup | void),
		): Cleanup =>
			effect({
				signals: [s],
				...(isFunction(matcher) ? { ok: matcher } : matcher),
			} as EffectMatcher<[Computed<E[]>]>),
	}
	return s
}

/**
 * Attach an event listener to an element
 *
 * @since 0.12.0
 * @param {string} type - event type to listen for
 * @param {(evt: E) => void} listener - event listener
 * @throws {TypeError} - if the provided handler is not an event listener or a provider function
 */
const on =
	<E extends Event>(type: string, listener: (evt: E) => void) =>
	<P extends ComponentProps>(
		host: Component<P>,
		target: Element = host,
	): Cleanup => {
		if (!isFunction(listener))
			throw new TypeError(
				`Invalid event listener provided for "${type} event on element ${elementName(target)}`,
			)
		target.addEventListener(type, listener)
		return () => target.removeEventListener(type, listener)
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
		const targetName = target.localName
		if (!isComponent(target))
			throw new TypeError(`Target element must be a custom element`)
		const sources = isFunction(signals) ? signals(target) : signals
		if (!isDefinedObject(sources))
			throw new TypeError(
				`Passed signals must be an object or a provider function`,
			)
		customElements
			.whenDefined(targetName)
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
					`Failed to pass signals to ${elementName(target)}}`,
					{ cause: error },
				)
			})
	}

export { type PassedSignals, run, first, all, selection, on, emit, pass }

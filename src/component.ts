import {
	type MaybeSignal,
	type Signal,
	type Cleanup,
	UNSET,
	isFunction,
	isComputed,
	isSignal,
	isState,
	toSignal,
} from '@zeix/cause-effect'

import { DEV_MODE, isElement, elementName, log, typeString, valueString } from './core/util'
import { observeSubtree } from './core/dom'

/* === Types === */

type ReservedWords =
	| 'constructor'
	| 'prototype'
	| '__proto__'
	| 'toString'
	| 'valueOf'
	| 'hasOwnProperty'
	| 'isPrototypeOf'
	| 'propertyIsEnumerable'
	| 'toLocaleString'

type ValidPropertyKey<T> = T extends keyof HTMLElement | ReservedWords
	? never
	: T

type ComponentProps = { [K in string as ValidPropertyKey<K>]: {} }

type Component<P extends ComponentProps> = HTMLElement &
	P & {
		// Common Web Component lifecycle properties
		adoptedCallback?(): void
		attributeChangedCallback(
			name: string,
			oldValue: string | null,
			newValue: string | null,
		): void
		connectedCallback(): void
		disconnectedCallback(): void

		// Custom element properties
		debug?: boolean
		shadowRoot: ShadowRoot | null

		// Component-specific signal methods
		getSignal(prop: keyof P): Signal<P[keyof P]>
		setSignal(prop: keyof P, signal: Signal<P[keyof P]>): void
	}

type AttributeParser<C extends HTMLElement, T extends {}> = (
	host: C,
	value: string | null,
	old?: string | null,
) => T

type SignalProducer<C extends HTMLElement, T extends {}> = (
	host: C,
) => MaybeSignal<T>

type MethodProducer<C extends HTMLElement> = (host: C) => void

type Initializer<C extends HTMLElement, T extends {}> =
	| T
	| AttributeParser<C, T>
	| SignalProducer<C, T>
	| MethodProducer<C>

type FxFunction<P extends ComponentProps, E extends Element> = (
	host: Component<P>,
	element: E,
) => Cleanup | void

type SelectorFunctions<P extends ComponentProps> = {
	first: <E extends Element>(selector: string, ...fns: FxFunction<P, E>[])  => (host: Component<P>) => Cleanup | void
	all: <E extends Element>(selector: string, ...fns: FxFunction<P, E>[])  => (host: Component<P>) => Cleanup
}

/* === Constants === */

// Special value explicitly marked as any so it can be used as signal value of any type
const RESET: any = Symbol()

// HTMLElement property names to check against
const HTML_ELEMENT_PROPS = new Set(
	Object.getOwnPropertyNames(HTMLElement.prototype),
)
// Add additional reserved words
const RESERVED_WORDS = new Set([
	'constructor',
	'prototype',
	'__proto__',
	'toString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'toLocaleString',
])

/* === Internal Functions === */

const isAttributeParser = <C extends HTMLElement, T extends {}>(
	value: unknown,
): value is AttributeParser<C, T> => isFunction(value) && value.length >= 2

const validatePropertyName = (prop: string): boolean =>
	!(HTML_ELEMENT_PROPS.has(prop) || RESERVED_WORDS.has(prop))

/**
 * Run one or more functions on a component's element
 *
 * @since 0.12.0
 * @param {FxFunction<P, E>[]} fns - functions to run
 * @param {Component<P>} host - component host element
 * @param {E} target - target element
 * @returns {Cleanup} - a cleanup function that runs collected cleanup functions
 */
const run = <P extends ComponentProps, E extends Element = Component<P>>(
	fns: FxFunction<P, E>[],
	host: Component<P>,
	target: E = host as unknown as E,
): Cleanup => {
	const cleanups = fns.filter(isFunction).map(fn => fn(host, target))
	return () => {
		cleanups.filter(isFunction).forEach(cleanup => cleanup())
		cleanups.length = 0
	}
}

/**
 * Create partially applied helper functions to select sub-elements
 *
 * @since 0.13.0
 * @returns {UI<P>} - helper functions for selecting sub-elements
 */
const select = <P extends ComponentProps>(): SelectorFunctions<P> => ({

	/**
	 * Apply effect functions to a first matching sub-element within the custom element
	 *
	 * @since 0.12.0
	 * @param {string} selector - selector to match sub-element
	 */
	first:<E extends Element>(
		selector: string,
		...fns: FxFunction<P, E>[]
	) => (host: Component<P>): Cleanup | void => {
		const el = (host.shadowRoot || host).querySelector<E>(selector)
		if (el) run(fns, host, el)
	},

	/**
	 * Apply effect functions to all matching sub-elements within the custom element
	 *
	 * @since 0.12.0
	 * @param {string} selector - selector to match sub-elements
	 */
	all: <E extends Element>(
		selector: string,
		...fns: FxFunction<P, E>[]
	) => (host: Component<P>): Cleanup => {
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
	},
})

/* === Exported Function === */

/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.12.0
 * @param {string} name - name of the custom element
 * @param {{ [K in keyof S]: Initializer<S[K], Component<P>> }} init - signals of the component
 * @param {FxFunction<S>[]} setup - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof HTMLElement & P} - constructor function for the custom element
 */
const component = <P extends ComponentProps>(
	name: string,
	init: {
		[K in keyof P]: Initializer<Component<P>, P[K]>
	} = {} as {
		[K in keyof P]: Initializer<Component<P>, P[K]>
	},
	setup: (host: Component<P>, select: SelectorFunctions<P>) => FxFunction<P, Component<P>>[],
): Component<P> => {
	class CustomElement extends HTMLElement {
		debug?: boolean
		#signals: {
			[K in keyof P]: Signal<P[keyof P]>
		} = {} as {
			[K in keyof P]: Signal<P[keyof P]>
		}
		#cleanup: Cleanup | undefined

		static observedAttributes =
			Object.entries(init)
				?.filter(([, ini]) => isAttributeParser(ini))
				.map(([prop]) => prop) ?? []

		/**
		 * Constructor function for the custom element: initializes signals
		 */
		constructor() {
			super()
			for (const [prop, ini] of Object.entries(init)) {
				if (ini == null) continue
				const result = isAttributeParser<
					Component<P>,
					Signal<P[keyof P]>
				>(ini)
					? ini(this as unknown as Component<P>, null)
					: isFunction<Component<P>>(ini)
						? ini(this as unknown as Component<P>)
						: ini
				if (result != null) this.setSignal(prop, toSignal(result))
			}
		}

		/**
		 * Native callback function when the custom element is first connected to the document
		 */
		connectedCallback() {
			if (DEV_MODE) {
				this.debug = this.hasAttribute('debug')
				if (this.debug) log(this, 'Connected')
			}
			const fns = setup(this as unknown as Component<P>, select())
			if (!Array.isArray(fns))
				throw new TypeError(
					`Expected array of functions as return value of setup function in ${elementName(this)}`,
				)
			this.#cleanup = run(fns, this as unknown as Component<P>)
		}

		/**
		 * Native callback function when the custom element is disconnected from the document
		 */
		disconnectedCallback() {
			if (isFunction(this.#cleanup)) this.#cleanup()
			if (DEV_MODE && this.debug) log(this, 'Disconnected')
		}

		/**
		 * Native callback function when an observed attribute of the custom element changes
		 *
		 * @param {string} attr - name of the modified attribute
		 * @param {string | null} old - old value of the modified attribute
		 * @param {string | null} value - new value of the modified attribute
		 */
		attributeChangedCallback(
			attr: string,
			old: string | null,
			value: string | null,
		) {
			if (value === old || isComputed(this.#signals[attr])) return // unchanged or controlled by computed
			const parse = init[attr] as AttributeParser<
				Component<P>,
				P[keyof P]
			>
			if (!isAttributeParser(parse)) return
			const parsed = parse(this as unknown as Component<P>, value, old)
			if (DEV_MODE && this.debug)
				log(
					value,
					`Attribute "${attr}" of ${elementName(this)} changed from ${valueString(old)} to ${valueString(value)}, parsed as <${typeString(parsed)}> ${valueString(parsed)}`,
				)
			;(this as unknown as P)[attr as keyof P] = parsed
		}

		/**
		 * Get the the signal for a given key
		 *
		 * @since 0.12.0
		 * @param {K} key - key to get signal for
		 * @returns {S[K]} current value of signal; undefined if state does not exist
		 */
		getSignal(key: keyof P): Signal<P[keyof P]> {
			const signal = this.#signals[key]
			if (DEV_MODE && this.debug)
				log(
					signal,
					`Get ${typeString(signal)} "${String(key)}" in ${elementName(this)}`,
				)
			return signal
		}

		/**
		 * Set the signal for a given key
		 *
		 * @since 0.12.0
		 * @param {K} key - key to set signal for
		 * @param {Signal<P[keyof P]>} signal - signal to set value to
		 * @throws {TypeError} if key is not a valid property key
		 * @throws {TypeError} if signal is not a valid signal
		 * @returns {void}
		 */
		setSignal(key: keyof P, signal: Signal<P[keyof P]>): void {
			if (!validatePropertyName(String(key)))
				throw new TypeError(
					`Invalid property name "${String(key)}". Property names must be valid JavaScript identifiers and not conflict with inherited HTMLElement properties.`,
				)
			if (!isSignal(signal))
				throw new TypeError(
					`Expected signal as value for property "${String(key)}" on ${elementName(this)}.`,
				)
			const prev = this.#signals[key]
			const writable = isState(signal)
			this.#signals[key] = signal
			Object.defineProperty(this, key, {
				get: signal.get,
				set: writable ? signal.set : undefined,
				enumerable: true,
				configurable: writable,
			})
			if (prev && isState(prev)) prev.set(UNSET)
			if (DEV_MODE && this.debug)
				log(
					signal,
					`Set ${typeString(signal)} "${String(key)} in ${elementName(this)}`,
				)
		}
	}
	customElements.define(name, CustomElement)
	return CustomElement as unknown as Component<P>
}

export {
	type Component,
	type ComponentProps,
	type ValidPropertyKey,
	type ReservedWords,
	type Initializer,
	type AttributeParser,
	type SignalProducer,
	type MethodProducer,
	type FxFunction,
	type SelectorFunctions,
	RESET,
	component,
}

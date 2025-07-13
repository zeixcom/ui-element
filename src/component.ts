import {
	type Cleanup,
	type MaybeSignal,
	type Signal,
	UNSET,
	isComputed,
	isFunction,
	isSignal,
	isState,
	toSignal,
} from '@zeix/cause-effect'

import {
	type ElementFromSelector,
	type Extractor,
	type StringParser,
	isStringParser,
	observeSubtree,
} from './core/dom'
import type { Effect } from './core/reactive'
import {
	DEV_MODE,
	elementName,
	isElement,
	log,
	typeString,
	valueString,
} from './core/util'

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

type ValidateComponentProps<P> = {
	[K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K]
}

type ComponentProps = { [K in string as ValidPropertyKey<K>]: {} }

type Component<P extends ComponentProps> = HTMLElement &
	P & {
		// Common Web Component lifecycle hooks
		attributeChangedCallback<K extends keyof P & string>(
			name: K,
			oldValue: string | null,
			newValue: string | null,
		): void

		// Custom element properties
		debug?: boolean

		// Component-specific signal methods
		getSignal<K extends keyof P & string>(prop: K): Signal<P[K]>
		setSignal<K extends keyof P & string>(
			prop: K,
			signal: Signal<P[K]>,
		): void
	}

type SignalProducer<
	T extends {},
	C extends HTMLElement = HTMLElement,
> = Extractor<MaybeSignal<T>, C>

type MethodProducer<C extends HTMLElement> = (host: C) => void

type Initializer<T extends {}, C extends HTMLElement> =
	| T
	| StringParser<T, C>
	| SignalProducer<T, C>
	| MethodProducer<C>

type SelectorFunctions<P extends ComponentProps> = {
	first: <E extends Element = never, K extends string = string>(
		selector: K,
		...fns: Effect<P, ElementFromSelector<K, E>>[]
	) => (host: Component<P>) => Cleanup | void
	all: <E extends Element = never, K extends string = string>(
		selector: K,
		...fns: Effect<P, ElementFromSelector<K, E>>[]
	) => (host: Component<P>) => Cleanup
}

/* === Constants === */

// Reserved words that should never be used as property names
// These are fundamental JavaScript/Object properties that cause serious issues
const RESERVED_WORDS = new Set([
	'constructor',
	'prototype',
	// Expand this list based on user feedback for other reserved words like:
	// '__proto__', 'toString', 'valueOf', 'hasOwnProperty', etc.
])

// HTMLElement properties that commonly cause conflicts
// These are properties that exist on HTMLElement and cause confusion when overridden
// in our reactive components because we use the same name for both attributes and properties
const HTML_ELEMENT_PROPS = new Set([
	'id', // DOM selector conflicts
	'class', // CSS class management conflicts (note: property is 'className')
	'className', // CSS class management conflicts (note: HTML attribute is 'class')
	'title', // Conflicts with tooltip behavior
	'role', // ARIA/accessibility conflicts
	'style', // Conflicts with style object
	'dataset', // Conflicts with data-* attribute access
	'lang', // Language/i18n conflicts
	'dir', // Text direction conflicts
	'hidden', // Visibility control conflicts
	'children', // DOM manipulation conflicts
	'innerHTML', // DOM manipulation conflicts
	'outerHTML', // Full element HTML conflicts
	'textContent', // Text manipulation conflicts
	'innerText', // Text manipulation conflicts
	// TO EXPAND: Add properties based on user feedback and common mistakes
	// 'tabindex', 'tabIndex', 'slot', 'part', etc.
])

/* === Internal Functions === */

/**
 * Simple fail-fast validation that checks for specific problematic cases
 *
 * This validation prevents common mistakes where developers accidentally
 * use property names that conflict with native HTMLElement functionality.
 */
const validatePropertyName = (prop: string): string | null => {
	if (RESERVED_WORDS.has(prop))
		return `Property name "${prop}" is a reserved word`
	if (HTML_ELEMENT_PROPS.has(prop))
		return `Property name "${prop}" conflicts with inherited HTMLElement property`
	return null
}

/**
 * Run one or more functions on a component's element
 *
 * @since 0.12.0
 * @param {Effect<P, E>[]} fns - functions to run
 * @param {Component<P>} host - component host element
 * @param {E} target - target element
 * @returns {Cleanup} - a cleanup function that runs collected cleanup functions
 */
const run = <P extends ComponentProps, E extends Element = Component<P>>(
	fns: Effect<P, E>[],
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
	 * @param {K} selector - selector to match sub-element
	 */
	first:
		<E extends Element = never, K extends string = string>(
			selector: K,
			...fns: Effect<P, ElementFromSelector<K, E>>[]
		) =>
		(host: Component<P>): Cleanup | void => {
			const el = (host.shadowRoot || host).querySelector<
				ElementFromSelector<K, E>
			>(selector)
			if (el) run(fns, host, el)
		},

	/**
	 * Apply effect functions to all matching sub-elements within the custom element
	 *
	 * @since 0.12.0
	 * @param {S} selector - selector to match sub-elements
	 */
	all:
		<E extends Element = never, S extends string = string>(
			selector: S,
			...fns: Effect<P, ElementFromSelector<S, E>>[]
		) =>
		(host: Component<P>): Cleanup => {
			const cleanups = new Map<ElementFromSelector<S, E>, Cleanup>()
			const root = host.shadowRoot || host

			const attach = (target: ElementFromSelector<S, E>) => {
				if (!cleanups.has(target))
					cleanups.set(target, run(fns, host, target))
			}

			const detach = (target: ElementFromSelector<S, E>) => {
				const cleanup = cleanups.get(target)
				if (isFunction(cleanup)) cleanup()
				cleanups.delete(target)
			}

			const applyToMatching =
				(fn: (target: ElementFromSelector<S, E>) => void) =>
				(node: Node) => {
					if (isElement(node)) {
						if (node.matches(selector))
							fn(node as ElementFromSelector<S, E>)
						node.querySelectorAll<ElementFromSelector<S, E>>(
							selector,
						).forEach(fn)
					}
				}

			const observer = observeSubtree(root, selector, mutations => {
				for (const mutation of mutations) {
					mutation.addedNodes.forEach(applyToMatching(attach))
					mutation.removedNodes.forEach(applyToMatching(detach))
				}
			})

			root.querySelectorAll<ElementFromSelector<S, E>>(selector).forEach(
				attach,
			)

			return () => {
				observer.disconnect()
				cleanups.forEach(cleanup => cleanup())
				cleanups.clear()
			}
		},
})

/* === Exported Functions === */

/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.12.0
 * @param {string} name - Name of the custom element
 * @param {{ [K in keyof P]: Initializer<P[K], Component<P>> }} init - Signals of the component
 * @param {FxFunction<S>[]} setup - Setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns: void
 */
const component = <P extends ComponentProps & ValidateComponentProps<P>>(
	name: string,
	init: {
		[K in keyof P]: Initializer<P[K], Component<P>>
	} = {} as {
		[K in keyof P]: Initializer<P[K], Component<P>>
	},
	setup: (
		host: Component<P>,
		select: SelectorFunctions<P>,
	) => Effect<P, Component<P>>[],
): void => {
	for (const prop of Object.keys(init)) {
		const error = validatePropertyName(prop)
		if (error) throw new TypeError(`${error} in component "${name}".`)
	}

	class CustomElement extends HTMLElement {
		debug?: boolean
		#signals: {
			[K in keyof P & string]: Signal<P[K]>
		} = {} as {
			[K in keyof P & string]: Signal<P[K]>
		}
		#cleanup: Cleanup | undefined

		static observedAttributes =
			Object.entries(init)
				?.filter(([, initializer]) => isStringParser(initializer))
				.map(([prop]) => prop) ?? []

		/**
		 * Native callback function when the custom element is first connected to the document
		 */
		connectedCallback() {
			if (DEV_MODE) {
				this.debug = this.hasAttribute('debug')
				if (this.debug) log(this, 'Connected')
			}

			// Initialize signals
			for (const [prop, initializer] of Object.entries(init)) {
				if (initializer == null || prop in this) continue
				const result = isFunction(initializer)
					? initializer(this, null)
					: initializer
				if (result != null) this.setSignal(prop, toSignal(result))
			}

			// Run setup function
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
		 * @param {K} attr - name of the modified attribute
		 * @param {string | null} old - old value of the modified attribute
		 * @param {string | null} value - new value of the modified attribute
		 */
		attributeChangedCallback<K extends keyof P & string>(
			attr: K,
			old: string | null,
			value: string | null,
		) {
			if (value === old || isComputed(this.#signals[attr])) return // unchanged or controlled by computed
			const parser = init[attr]
			if (!isStringParser<P[K]>(parser)) return
			const parsed = parser(this, value, old)
			if (DEV_MODE && this.debug)
				log(
					value,
					`Attribute "${String(attr)}" of ${elementName(this)} changed from ${valueString(old)} to ${valueString(value)}, parsed as <${typeString(parsed)}> ${valueString(parsed)}`,
				)
			if (attr in this) (this as unknown as P)[attr] = parsed
			else this.setSignal(attr, toSignal(parsed))
		}

		/**
		 * Get the the signal for a given key
		 *
		 * @since 0.12.0
		 * @param {K} key - Key to get signal for
		 * @returns {P[K]} Current value of signal; undefined if state does not exist
		 */
		getSignal<K extends keyof P & string>(key: K): Signal<P[K]> {
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
		 * @param {K} key - Key to set signal for
		 * @param {Signal<P[keyof P]>} signal - signal to set value to
		 * @throws {TypeError} if key is not a valid property key
		 * @throws {TypeError} if signal is not a valid signal
		 * @returns {void}
		 */
		setSignal<K extends keyof P & string>(
			key: K,
			signal: Signal<P[K]>,
		): void {
			const error = validatePropertyName(String(key))
			if (error) throw new TypeError(`${error} on ${elementName(this)}.`)
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
	// return customElements.get(name) as unknown as Component<P>
}

export {
	type Component,
	type ComponentProps,
	type ReservedWords,
	type ValidPropertyKey,
	type ValidateComponentProps,
	type Initializer,
	type SignalProducer,
	type MethodProducer,
	type SelectorFunctions,
	component,
}

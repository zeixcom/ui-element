import {
	type MaybeSignal, type Signal,
	isComputed, isSignal, isState, toSignal, UNSET
} from "@zeix/cause-effect"

import { isFunction } from "./core/util"
import { DEV_MODE, elementName, log, typeString, valueString } from "./core/log"

/* === Types === */

type ReservedWords = 'constructor' | 'prototype' | '__proto__' | 'toString' | 'valueOf' | 
  'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' | 'toLocaleString'

type ValidPropertyKey<T> = T extends keyof HTMLElement | ReservedWords ? never : T

type ComponentProps = { [K in string as ValidPropertyKey<K>]: {} }

type Component<P extends ComponentProps> = HTMLElement & P & {
	debug?: boolean
	attributeChangedCallback(name: string, old: string | null, value: string | null): void
	getSignal(prop: string & keyof P): Signal<P[string & keyof P]>
	setSignal(prop: string & keyof P, signal: Signal<P[string & keyof P]>): void
	self(...fns: FxFunction<P, Component<P>>[]): void
	first<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void
	all<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void
}

type AttributeParser<T extends {}, C extends HTMLElement> = (
	host: C,
	value: string | null,
	old?: string | null
) => T

type SignalProducer<T extends {}, C extends HTMLElement> = (
	host: C
) => MaybeSignal<T>

type SignalInitializer<T extends {}, C extends HTMLElement> = T
	| AttributeParser<T, C>
	| SignalProducer<T, C>

type FxFunction<P extends ComponentProps, E extends Element> = (
	host: Component<P>,
	target: E,
	index?: number
) => void | (() => void) | (() => void)[]

/* === Constants === */

// Special value explicitly marked as any so it can be used as signal value of any type
const RESET: any = Symbol()

// HTMLElement property names to check against
const HTML_ELEMENT_PROPS = new Set(Object.getOwnPropertyNames(HTMLElement.prototype))
// Add additional reserved words
const RESERVED_WORDS = new Set(['constructor', 'prototype', '__proto__', 'toString', 'valueOf', 
  'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString'])

/* === Internal Functions === */

const run = <P extends ComponentProps, E extends Element>(
	fns: FxFunction<P, E>[],
	host: Component<P>,
	target: E,
    index: number = 0
): (() => void)[] =>
	fns.flatMap(fn => {
		const cleanup = isFunction(fn) ? fn(host, target, index) : []
		return Array.isArray(cleanup) ? cleanup.filter(isFunction)
			: isFunction(cleanup) ? [cleanup]
			: []
	})

const isParser = <T extends {}, C extends HTMLElement>(value: unknown): value is AttributeParser<T, C> =>
	isFunction(value) && value.length >= 2

const isSignalProducer = <T extends {}, C extends HTMLElement>(value: unknown): value is SignalProducer<T, C> =>
	isFunction(value) && value.length < 2

const validatePropertyName = (prop: string): boolean =>
	!((HTML_ELEMENT_PROPS.has(prop) || RESERVED_WORDS.has(prop)))

/* === Exported Functions === */

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
		[K in string & keyof P]: SignalInitializer<P[K], Component<P>>
	} = {} as {
		[K in string & keyof P]: SignalInitializer<P[K], Component<P>>
	},
	setup: (host: Component<P>) => void | (() => void),
): Component<P> => {
	class CustomElement extends HTMLElement {
		debug?: boolean
		#signals: {
			[K in string & keyof P]: Signal<P[K]>
		} = {} as {
			[K in string & keyof P]: Signal<P[K]>
		}
		#cleanup: (() => void)[] = []
	  
		static observedAttributes = Object.entries(init)
			?.filter(([, ini]) => isParser(ini))
			.map(([prop]) => prop)?? []
	  
		/**
		 * Constructor function for the custom element: initializes signals
		 */
		constructor() {
			super()
			for (const [prop, ini] of Object.entries(init)) {
				if (ini == null) continue
				const result = isParser<P[keyof P], Component<P>>(ini)
					? ini(this as unknown as Component<P>, null)
					: isSignalProducer<P[keyof P], Component<P>>(ini)
					? ini(this as unknown as Component<P>)
					: ini
				this.setSignal(prop, toSignal(result ?? RESET))
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
			const cleanup = setup(this as unknown as Component<P>)
			if (isFunction(cleanup)) this.#cleanup.push(cleanup)
		}
		
		/**
		 * Native callback function when the custom element is disconnected from the document
		 */
		disconnectedCallback() {
			for (const off of this.#cleanup) off()
			this.#cleanup.length = 0
			if (DEV_MODE && this.debug) log(this, 'Disconnected')
		}
		
		/**
		 * Native callback function when an observed attribute of the custom element changes
		 * 
		 * @param {string} attr - name of the modified attribute
		 * @param {string | null} old - old value of the modified attribute
		 * @param {string | null} value - new value of the modified attribute
		 */
		attributeChangedCallback(attr: string, old: string | null, value: string | null) {
			if (value === old || isComputed(this.#signals[attr])) return // unchanged or controlled by computed
			const parse = init[attr] as AttributeParser<P[keyof P], Component<P>>
			if (!isParser(parse)) return
			const parsed = parse(this as unknown as Component<P>, value, old)
			if (DEV_MODE && this.debug)
				log(value, `Attribute "${attr}" of ${elementName(this)} changed from ${valueString(old)} to ${valueString(value)}, parsed as <${typeString(parsed)}> ${valueString(parsed)}`);
			(this as unknown as P)[attr as keyof P] = parsed
		}

		/**
		 * Get the the signal for a given key
		 *
		 * @since 0.12.0
		 * @param {K} key - key to get signal for
		 * @returns {S[K]} current value of signal; undefined if state does not exist
		 */
		getSignal(key: string & keyof P): Signal<P[string & keyof P]> {
			const signal = this.#signals[key]
			if (DEV_MODE && this.debug)
				log(signal, `Get ${typeString(signal)} "${key}" in ${elementName(this)}`)
			return signal
		}

		/**
		 * Set the signal for a given key
		 * 
		 * @since 0.12.0
		 * @param {K} key - key to set signal for
		 * @param {Signal<P[string & keyof P]>} signal - signal to set value to
		 * @throws {TypeError} if key is not a valid property key
		 * @throws {TypeError} if signal is not a valid signal
		 * @returns {void}
		 */
		setSignal(key: string & keyof P, signal: Signal<P[string & keyof P]>): void {
			if (!validatePropertyName(key))
				throw new TypeError(`Invalid property name "${key}". Property names must be valid JavaScript identifiers and not conflict with inherited HTMLElement properties.`)
			if (!isSignal(signal))
				throw new TypeError(`Expected signal as value for property "${key}" on ${elementName(this)}.`)
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
				log(signal, `Set ${typeString(signal)} "${key} in ${elementName(this)}`)
		}

		/**
		 * Apply effect functions to the custom element itself
		 * 
		 * @since 0.8.1
		 * @property {UI<UIElement>} self - UI object for this element
		 */
		self(...fns: FxFunction<P, Component<P>>[]): void {
			this.#cleanup.push(...run(fns, this as unknown as Component<P>, this as unknown as Component<P>))
		}

		/**
		 * Apply effect functions to a first matching sub-element within the custom element
		 * 
		 * @since 0.8.1
		 * @param {string} selector - selector to match sub-element
		 * @returns {UI<Element>[]} - array of zero or one UI objects of matching sub-element
		 */
		first<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void {
			const target = (this.shadowRoot || this).querySelector<E>(selector)
			if (target) this.#cleanup.push(...run(fns, this as unknown as Component<P>, target))
		}
		
		/**
		 * Apply effect functions to all matching sub-elements within the custom element
		 * 
		 * @since 0.8.1
		 * @param {string} selector - selector to match sub-elements
		 * @returns {UI<Element>} - array of UI object of matching sub-elements
		 */
		all<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void {
			this.#cleanup.push(...Array.from((this.shadowRoot || this).querySelectorAll<E>(selector))
				.flatMap((target, index) => run(fns, this as unknown as Component<P>, target, index)))
		}
	}
	customElements.define(name, CustomElement)
	return CustomElement as unknown as Component<P>
}

export {
	type Component, type ComponentProps, type ValidPropertyKey, type ReservedWords,
	type SignalInitializer, type AttributeParser, type SignalProducer,
	type FxFunction,
	RESET, component
}
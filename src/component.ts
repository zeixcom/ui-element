import {
	type MaybeSignal, type Signal,
	isComputed, isSignal, isState, toSignal, UNSET
} from "@zeix/cause-effect"

import { isDefinedObject, isFunction, isString } from "./core/util"
import { elementName, log, LOG_ERROR, valueString } from "./core/log"

/* === Types === */

type ReservedWords = 'constructor' | 'prototype' | '__proto__' | 'toString' | 'valueOf' | 
  'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' | 'toLocaleString'

type ValidPropertyKey<T> = T extends keyof HTMLElement | ReservedWords ? never : T

type ComponentProps = { [K in string as ValidPropertyKey<K>]: {} }

type Component<P extends ComponentProps> = HTMLElement & P & {
	debug?: boolean
	attributeChangedCallback(name: string, old: string | null, value: string | null): void
	has(prop: string & keyof P): boolean
	get(prop: string & keyof P): Signal<P[string & keyof P]>
	set(prop: string & keyof P, signal: Signal<P[string & keyof P]>): void
	self(...fns: FxFunction<P, Component<P>>[]): void
	first<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void
	all<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void
}

type Parser<T extends {}, C extends HTMLElement> = (
	host: C,
	value: string | null,
	old?: string | null
) => T

type SignalProducer<T extends {}, C extends HTMLElement> = (
	host: C
) => MaybeSignal<T>

type Initializer<T extends {}, C extends HTMLElement> = T
	| Parser<T, C>
	| SignalProducer<T, C>

type FxFunction<P extends ComponentProps, E extends Element> = (
	host: Component<P>,
	target: E,
	index?: number
) => void | (() => void) | (() => void)[]

type ComponentSetup<P extends ComponentProps> = (host: Component<P>) => void

type Provider<T> = <E extends Element>(
	element: E,
	index: number
) => T

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

const isParser = <T extends {}, C extends HTMLElement>(value: unknown): value is Parser<T, C> =>
	isFunction(value) && value.length >= 2

const isSignalProducer = <T extends {}, C extends HTMLElement>(value: unknown): value is SignalProducer<T, C> =>
	isFunction(value) && value.length < 2

const isProvider = <T>(value: unknown): value is Provider<T> =>
	isFunction(value) && value.length == 2

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
	init: { [K in string & keyof P]: Initializer<P[K], Component<P>> } = {} as { [K in string & keyof P]: Initializer<P[K], Component<P>> },
	setup: ComponentSetup<P>
): Component<P> => {
	class CustomElement extends HTMLElement {
		#signals: { [K in string & keyof P]: Signal<P[K]> } = {} as { [K in string & keyof P]: Signal<P[K]> }
		#cleanup: (() => void)[] = []
	  
		static observedAttributes = Object.entries(init)
			?.filter(([, ini]) => isParser(ini))
			.map(([prop]) => prop)?? []
	  
		constructor() {
			super()
			for (const [prop, ini] of Object.entries(init)) {
				if (ini == null) continue
				const result = isParser<P[keyof P], Component<P>>(ini)
					? ini(this as unknown as Component<P>, null)
					: isSignalProducer<P[keyof P], Component<P>>(ini)
					? ini(this as unknown as Component<P>)
					: ini
				this.set(prop, toSignal(result ?? RESET))
			}
		}

		connectedCallback() {
			setup(this as unknown as Component<P>)
		}
		
		disconnectedCallback() {
			for (const off of this.#cleanup) off()
			this.#cleanup.length = 0
		}
		
		attributeChangedCallback(attr: string, old: string | null, value: string | null) {
			if (value === old || isComputed(this.#signals[attr])) return // unchanged or controlled by computed
			const parse = init[attr] as Parser<P[keyof P], Component<P>>
			if (!isParser(parse)) return
			(this as unknown as P)[attr as keyof P] = parse(this as unknown as Component<P>, value, old)
		}

		has(prop: string & keyof P): boolean {
			return prop in this.#signals
		}

		get(prop: string & keyof P): Signal<P[string & keyof P]> {
			return this.#signals[prop]
		}

		set(prop: string & keyof P, signal: Signal<P[string & keyof P]>): void {
			if (!validatePropertyName(prop)) {
				log(prop, `Property name ${valueString(prop)} in <${elementName(this)}> conflicts with HTMLElement properties or JavaScript reserved words.`, LOG_ERROR)
				return
			}
			if (!isSignal(signal)) {
				log(signal, `Expected signal as value for property ${valueString(prop)} on ${elementName(this)}.`, LOG_ERROR)
				return
			}
			const prev = this.#signals[prop]
			const writable = isState(signal)
			this.#signals[prop] = signal
			Object.defineProperty(this, prop, {
				get: signal.get,
				set: writable ? signal.set : undefined,
				enumerable: true,
				configurable: writable,
			})
			if (prev && isState(prev)) prev.set(UNSET)
		}

		self(...fns: FxFunction<P, Component<P>>[]): void {
			this.#cleanup.push(...run(fns, this as unknown as Component<P>, this as unknown as Component<P>))
		}

		first<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void {
			const target = (this.shadowRoot || this).querySelector<E>(selector)
			if (target) this.#cleanup.push(...run(fns, this as unknown as Component<P>, target))
		}
		
		all<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void {
			this.#cleanup.push(...Array.from((this.shadowRoot || this).querySelectorAll<E>(selector))
				.flatMap((target, index) => run(fns, this as unknown as Component<P>, target, index)))
		}
	}
	customElements.define(name, CustomElement)
	return CustomElement as unknown as Component<P>
}

const pass = <P extends ComponentProps, Q extends ComponentProps>(
	signals: Partial<{ [K in keyof Q]: Signal<Q[K]> }> | Provider<Partial<{ [K in keyof Q]: Signal<Q[K]> }>>
) => async (
	host: Component<P>,
	target: Component<Q>,
	index = 0
) => {
	await customElements.whenDefined(target.localName)
	const sources = isProvider(signals)
		? signals(target, index) as Partial<{ [K in keyof Q]: Signal<Q[K]> }>
		: signals
	if (!isDefinedObject(sources)) {
		log(sources, `Invalid passed signals provided.`, LOG_ERROR)
		return
	}
	for (const [prop, source] of Object.entries(sources)) {
		const signal = isString(source) ? host.get(prop) : toSignal(source)
		target.set(prop, signal)
	}
}

const on = (
	type: string,
	handler: EventListenerOrEventListenerObject | Provider<EventListenerOrEventListenerObject>,
) => <P extends ComponentProps>(
	host: Component<P>,
	target: Element = host,
	index = 0
): (() => void)[] => {
	const listener = isProvider(handler) ? handler(target, index) : handler
	if (!(isFunction(listener) || isDefinedObject(listener) && isFunction(listener.handleEvent))) {
		log(listener, `Invalid listener provided for ${type} event on element ${elementName(target)}`, LOG_ERROR)
	}
	target.addEventListener(type, listener)
	return [() => target.removeEventListener(type, listener)]
}

const emit = <T>(
	type: string,
	detail: T | ((target: Element, index: number) => T)
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

export {
	type ComponentProps, type Component, type Parser, type SignalProducer, type Initializer, type Provider,
	RESET, component, pass, on, emit
}
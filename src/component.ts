import {
	type ComputedCallback, type Signal,
	isComputed, isSignal, isState, state, toSignal, UNSET
} from "@zeix/cause-effect"

import { isDefinedObject, isFunction } from "./core/util"
import { elementName, log, LOG_ERROR, valueString } from "./core/log"

/* === Types === */

type ReservedWords = 'constructor' | 'prototype' | '__proto__' | 'toString' | 'valueOf' | 
  'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' | 'toLocaleString'

type ValidPropertyKey<T> = T extends keyof HTMLElement | ReservedWords ? never : T

type ComponentProps = { [K in string as ValidPropertyKey<K>]: {} }

type Component<P extends ComponentProps> = HTMLElement & P & {
	set(prop: string & keyof P, signal: Signal<P[string & keyof P]>): void
}

type AttributeParser<T extends {}> = (
	host: HTMLElement,
	value: string | null,
	old?: string | null
) => T

type SignalInitializer<T extends {}> = T
	| AttributeParser<T>
	| ((host: HTMLElement, signals: Signal<{}>[]) => ComputedCallback<T>)

type FxFunction<P extends ComponentProps> = (
	host: Component<P>,
	target?: Element,
	index?: number
) => (() => void)[]

type ComponentSetup<P extends ComponentProps> = (
	host: Component<P>,
	signals: { [K in string & keyof P]: Signal<P[K]> }
) => FxFunction<P>[]

type EventListenerProvider = <E extends Element>(
	element: E,
	index: number
) => EventListenerOrEventListenerObject

/* === Constants === */

// Special value explicitly marked as any so it can be used as signal value of any type
const RESET: any = Symbol()

// HTMLElement property names to check against
const HTML_ELEMENT_PROPS = new Set(Object.getOwnPropertyNames(HTMLElement.prototype))
// Add additional reserved words
const RESERVED_WORDS = new Set(['constructor', 'prototype', '__proto__', 'toString', 'valueOf', 
  'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString'])

/* === Internal Functions === */

const run = <P extends ComponentProps>(
	fns: FxFunction<P>[],
	host: Component<P>,
	target: Element = host,
    index: number = 0
): (() => void)[] =>
	fns.flatMap(fn => {
		const cleanup = isFunction(fn) ? fn(host, target, index) : []
		return Array.isArray(cleanup) ? cleanup.filter(isFunction)
			: isFunction(cleanup) ? [cleanup]
			: []
	})

const isAttributeParser = <T extends {}>(value: unknown): value is AttributeParser<T> =>
	isFunction(value) && value.length >= 2

const isProvider = <T>(value: unknown): value is (target: Element, index: number) => T =>
	isFunction(value) && value.length == 2

const validatePropertyName = (prop: string): boolean =>
	!((HTML_ELEMENT_PROPS.has(prop) || RESERVED_WORDS.has(prop)))

/* === Exported Functions === */

const first = <P extends ComponentProps>(
	selector: string,
	...fns: FxFunction<P>[]
) => (host: Component<P>): (() => void)[] => {
	const target = (host.shadowRoot || host).querySelector(selector)
	return target ? run(fns, host, target) : []
}

const all = <P extends ComponentProps>(
	selector: string,
	...fns: FxFunction<P>[]
) => (host: Component<P>): (() => void)[] =>
	Array.from((host.shadowRoot || host).querySelectorAll(selector))
		.flatMap((target, index) => run(fns, host, target, index))

/**
 * Define a component with its states and setup function (connectedCallback)
 * 
 * @since 0.12.0
 * @param {string} name - name of the custom element
 * @param {{ [K in keyof S]: SignalInitializer<S[K]> }} init - states of the component
 * @param {FxFunction<S>[]} fx - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof HTMLElement & P} - constructor function for the custom element
 */
const component = <P extends ComponentProps>(
	name: string,
	init: { [K in string & keyof P]: SignalInitializer<P[K]> } = {} as { [K in string & keyof P]: SignalInitializer<P[K]> },
	fx: ComponentSetup<P>
): Component<P> => {
	class CustomElement extends HTMLElement {
		#signals: { [K in string & keyof P]: Signal<P[K]> } = {} as { [K in string & keyof P]: Signal<P[K]> }
		#cleanup: (() => void)[] = []
	  
		static observedAttributes = Object.entries(init)
			?.filter(([, ini]) => isAttributeParser(ini))
			.map(([prop]) => prop) ?? []
	  
		constructor() {
			super()
			for (const [prop, ini] of Object.entries(init)) {
				if (ini == null) continue
				const signal = isAttributeParser(ini) ? state(RESET)
					: isFunction<P[string & keyof P]>(ini) ? toSignal(ini(this))
					: state(ini)
				this.set(prop, signal)
			}
		}

		connectedCallback() {
			this.#cleanup = run(fx(this as unknown as Component<P>, this.#signals), this as unknown as Component<P>)
		}
		
		disconnectedCallback() {
			for (const off of this.#cleanup) off()
			this.#cleanup.length = 0
		}
		
		attributeChangedCallback(attr: string, old: string | null, value: string | null) {
			if (value === old || isComputed(this.#signals[attr])) return // unchanged or controlled by computed
			const fn = init[attr as string & keyof P]
			if (!isAttributeParser(fn)) return
			(this as unknown as HTMLElement & P)[attr as keyof P] = (fn(this, value, old) ?? RESET) as (HTMLElement & P)[keyof P]
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
			Object.defineProperty(this, prop, {
				...signal,
				enumerable: true,
				configurable: isState(signal)
			})
			this.#signals[prop] = signal
			if (prev && isState(prev)) prev.set(UNSET)
		}
	}
	customElements.define(name, CustomElement)
	return CustomElement as unknown as Component<P>
}

const pass = <P extends ComponentProps>(
	signals: Partial<{ [K in keyof P]: Signal<P[K]> }>
) => async <Q extends ComponentProps>(
	_: Component<P>,
	target: Component<Q>,
	index = 0
) => {
	await customElements.whenDefined(target.localName)
	const sources = isProvider(signals)
		? signals(target, index) as Partial<{ [K in keyof P]: Signal<P[K]> }>
		: signals
	if (!isDefinedObject(sources)) {
		log(sources, `Invalid passed signals provided.`, LOG_ERROR)
		return
	}
	for (const [prop, source] of Object.entries(sources))
		target.set(prop, toSignal(source))
}

const on = (
	type: string,
	handler: EventListenerOrEventListenerObject | EventListenerProvider
) => <P extends ComponentProps>(
	host: Component<P>,
	target: Element = host,
	index = 0
): () => void => {
	const listener = isProvider(handler) ? handler(target, index) : handler
	if (!(isFunction(listener) || isDefinedObject(listener) && isFunction(listener.handleEvent))) {
		log(listener, `Invalid listener provided for ${type} event on element ${elementName(target)}`, LOG_ERROR)
	}
	target.addEventListener(type, listener)
	return () => target.removeEventListener(type, listener)
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
	type ComponentProps, type Component, type AttributeParser, type SignalInitializer, type EventListenerProvider,
	RESET, component, first, all, pass, on, emit
}
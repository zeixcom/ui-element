import { isComputed, state, toSignal, type ComputedCallback, type Signal } from "@zeix/cause-effect"

import { isFunction } from "./core/util"
import { elementName, log, LOG_ERROR } from "./core/log"

/* === Types === */

type ReservedWords = 'constructor' | 'prototype' | '__proto__' | 'toString' | 'valueOf' | 
  'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' | 'toLocaleString'

type ValidPropertyKey<T> = T extends keyof HTMLElement | ReservedWords ? never : T

type ComponentProps = { [K in string as ValidPropertyKey<K>]: {} }

type AttributeParser<T extends {}> = (
	host: HTMLElement,
	value: string | null,
	old?: string | null
) => T

type SignalInitializer<T extends {}> = T
	| AttributeParser<T>
	| ((host: HTMLElement, signals: Signal<{}>[]) => ComputedCallback<T>)

type FxFunction = <C extends HTMLElement>(
	host: C,
	target?: Element,
	index?: number
) => (() => void)[]

type ComponentSetup<P extends ComponentProps> = (
	host: HTMLElement & P,
	signals: { [K in keyof P]: Signal<P[K]> }
) => FxFunction[]

/* === Constants === */

// Special value explicitly marked as any so it can be used as signal value of any type
const RESET: any = Symbol()

// HTMLElement property names to check against
const HTML_ELEMENT_PROPS = new Set(Object.getOwnPropertyNames(HTMLElement.prototype))
// Add additional reserved words
const RESERVED_WORDS = new Set(['constructor', 'prototype', '__proto__', 'toString', 'valueOf', 
  'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString'])

/* === Internal Functions === */

const run = <C extends HTMLElement>(
	fns: FxFunction[],
	host: C,
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

const validatePropertyName = (prop: string): boolean =>
	!((HTML_ELEMENT_PROPS.has(prop) || RESERVED_WORDS.has(prop)))

/* === Exported Functions === */

const first = (
	selector: string,
	...fns: FxFunction[]
) => <C extends HTMLElement>(host: C): (() => void)[] => {
	const target = (host.shadowRoot || host).querySelector(selector)
	return target ? run(fns, host, target) : []
}

const all = (
	selector: string,
	...fns: FxFunction[]
) => <C extends HTMLElement>(host: C): (() => void)[] =>
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
	init: { [K in keyof P]: SignalInitializer<P[K]> } = {} as { [K in keyof P]: SignalInitializer<P[K]> },
	fx: ComponentSetup<P>
): typeof HTMLElement & P => {
	class CustomElement extends HTMLElement {
		#signals: { [K in keyof P]: Signal<P[K]> } = {} as { [K in keyof P]: Signal<P[K]> }
		#cleanup: (() => void)[] = []
	  
		static observedAttributes = Object.entries(init)
			?.filter(([, ini]) => isAttributeParser(ini))
			.map(([prop]) => prop) ?? []
	  
		constructor() {
			super()
			for (const [prop, ini] of Object.entries(init)) {
				if (ini == null) continue
				if (!validatePropertyName(prop)) {
					log(prop, `Property name "${prop}" in <${name}> conflicts with HTMLElement properties or JavaScript reserved words.`, LOG_ERROR)
					continue
				}
				const signal = isAttributeParser(ini) ? state(RESET)
					: isFunction<P[keyof P]>(ini) ? toSignal(ini(this, this.#signals))
					: state(ini)
				Object.defineProperty(this, prop, {
					get: () => signal.get(),
					set: (value: P[keyof P]) => 'set' in signal
						? signal.set(value)
						: log(prop, `Computed property "${prop}" of ${elementName(this)} cannot be set`, LOG_ERROR),
					enumerable: true,
					configurable: true
				})
				this.#signals[prop as keyof P] = signal
			}
		}
	  
		connectedCallback() {
			this.#cleanup = run(fx(this as unknown as HTMLElement & P, this.#signals), this)
		}
		
		disconnectedCallback() {
			for (const off of this.#cleanup) off()
			this.#cleanup.length = 0
		}
		
		attributeChangedCallback(attr: string, old: string | null, value: string | null) {
			if (value === old || isComputed(this.#signals[attr])) return // unchanged or controlled by computed
			const fn = init[attr as keyof P]
			if (!isAttributeParser(fn)) return
			(this as unknown as HTMLElement & P)[attr as keyof P] = (fn(this, value, old) ?? RESET) as (HTMLElement & P)[keyof P]
		}
	}
	customElements.define(name, CustomElement)
	return CustomElement as unknown as typeof HTMLElement & P
}

export {
	type ComponentProps, type AttributeParser, type SignalInitializer,
	RESET, component, first, all
}
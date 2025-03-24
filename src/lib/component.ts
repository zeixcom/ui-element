import { state, toSignal, type ComputedCallbacks } from "@zeix/cause-effect"

import { isFunction } from "../core/util"

/* === Types === */

export type ComponentSignals = { [key: string]: {} }

export type Component<S extends ComponentSignals> = HTMLElement & S

export type AttributeParser<T, S extends ComponentSignals> = (
	host: Component<S>,
	value: string | null,
	old?: string | null
) => T

export type Root<S extends ComponentSignals> = ShadowRoot | Component<S>

export type SignalInitializer<T, S extends ComponentSignals> = T
	| AttributeParser<T, S>
	| ComputedCallbacks<NonNullable<T>, []>

export type FxFunction<S extends ComponentSignals> = (
	host: Component<S>,
	target?: Element,
	index?: number
) => ((() => void) | void)[]

export type ComponentSetup<S extends ComponentSignals> = (
	host: Component<S>,
	signals: S
) => FxFunction<S>[]

/* === Internal Functions === */

const runFx = <S extends ComponentSignals>(
	fns: FxFunction<S>[],
	...args: [Component<S>, Element?, number?]
) => fns.flatMap(fn => isFunction(fn) ? [fn(...args)].filter(isFunction) : [])

const isAttributeParser = <T, S extends ComponentSignals>(value: unknown): value is AttributeParser<T, S> =>
	isFunction(value) && value.length >= 2

/* === Exported Functions === */

export const first = <S extends ComponentSignals>(
	selector: string,
	...fns: FxFunction<S>[]
) => (host: Component<S>) => {
	const target = host.querySelector(selector)
	return target ? runFx(fns, host, target) : []
}

export const all = <S extends ComponentSignals>(
	selector: string,
	...fns: FxFunction<S>[]
) => (host: Component<S>) =>
	Array.from(host.querySelectorAll(selector))
		.flatMap((target, index) => runFx(fns, host, target, index))

/**
 * Define a component with its states and setup function (connectedCallback)
 * 
 * @since 0.12.0
 * @param {string} name - name of the custom element
 * @param {{ [K in keyof S]: SignalInitializer<S[K], S> }} init - states of the component
 * @param {FxFunction<S>[]} fx - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {Component<S>} - the custom element class
 */
export const component = <S extends ComponentSignals>(
	name: string,
	init: { [K in keyof S]: SignalInitializer<S[K], S>} = {} as { [K in keyof S]: SignalInitializer<S[K], S> },
	fx: ComponentSetup<S>
) => {
	class Component<S> extends HTMLElement {
		#signals: S = {} as S
		#cleanup: (() => void)[] = []
	  
		static observedAttributes = Object.entries(init)
			.filter(([, ini]) => isAttributeParser(ini))
			.map(([prop]) => prop)
	  
		constructor() {
			super()
			for (const [prop, ini] of Object.entries(init)) {
				const signal = isAttributeParser<{}, ComponentSignals>(ini)
					? toSignal(ini(this, ''))
					: state(ini)
				Object.defineProperty(this, prop, signal)
				this.#signals[prop] = signal
			}
		}
	  
		connectedCallback() {
			this.#cleanup.push(...runFx(fx(this, this.#signals), this))
		}
		
		disconnectedCallback() {
			for (const off of this.#cleanup) off()
			this.#cleanup.length = 0
		}
		
		attributeChangedCallback(prop: string, old: string | null, value: string | null) {
			this[prop] = init[prop](this, value, old)
		}
	}
	customElements.define(name, Component)
	return Component
  }

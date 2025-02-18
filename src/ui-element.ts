import {
	type State, type Computed, type Signal,
	UNSET, isComputed, isSignal, isState, toSignal
} from "@zeix/cause-effect"

import { isFunction } from "./core/util"
import { DEV_MODE, elementName, log, LOG_ERROR, valueString } from "./core/log"
import { UI } from "./core/ui"
import { type UnknownContext, useContext } from "./core/context"

/* === Types === */

export interface BaseUIElement extends HTMLElement {
	states: ComponentStates
	has(key: string): boolean
	get(key: string): unknown
	set(key: string, value: unknown, update?: boolean): void
}

export type AttributeParser<T> = (
	value: string | null,
	element?: BaseUIElement,
	old?: string | null
) => T

export type StateInitializer<T> = T | AttributeParser<T> | Computed<T>

export type ComponentStates = Record<string, StateInitializer<{}>>

export type InferSignalTypes<S extends ComponentStates> = {
	[K in keyof S]:
		S[K] extends AttributeParser<infer T extends {}> ? State<T> :
		S[K] extends Computed<infer T> ? Computed<T> :
		State<S[K]>
}

export type InferReturnType<S, K extends keyof S> = 
	S[K] extends AttributeParser<infer R extends {}> ? R :
	S[K] extends Computed<infer R extends {}> ? R :
	S[K]

/* === Internal Functions === */

/**
 * Check if a value is an attribute parser
 * 
 * @since 0.10.1
 * @param {unknown} value - value to check
 * @returns {boolean} - true if value is an attribute parser, false otherwise
 */
const isAttributeParser = <T>(value: unknown): value is AttributeParser<T> =>
	isFunction(value) && !!value.length && !isComputed(value)

/**
 * Unwrap a signal or function to its value
 * 
 * @since 0.10.1
 * @param {T | (() => T) | Signal<T>} v 
 * @returns {T} - value of the signal or function
 */
const unwrap = <T extends {}>(v: T | (() => T) | Signal<T>): T =>
	isFunction<T>(v) ? unwrap(v()) : isSignal<T>(v) ? unwrap(v.get()) : v

/* === Exported Functions === */

/**
 * Parse according to static states
 * 
 * @since 0.8.4
 * @param {UIElement} host - host UIElement
 * @param {string} key - key for attribute parser or initial value from static states
 * @param {string | null} value - attribute value
 * @param {string | null} [old=undefined] - old attribute value
 * @returns {T | undefined}
 */
export const parse = <T>(
	host: BaseUIElement,
	key: string,
	value: string | null,
	old?: string | null
): T | undefined => {
	const parser = host.states[key]
	return isAttributeParser<T>(parser)
		? parser(value, host, old)
		: value as T | undefined
}

/* === Exported Class === */

/**
 * Base class for reactive custom elements
 * 
 * @since 0.1.0
 * @class UIElement
 * @extends HTMLElement<S>
 * @type {UIElement}
 */
export class UIElement<S extends ComponentStates> extends HTMLElement {
	static registry: CustomElementRegistry = customElements
	static observedAttributes: string[]
	static consumedContexts: UnknownContext[]
	static providedContexts: UnknownContext[]

	/**
	 * Define a custom element in the custom element registry
	 * 
	 * @since 0.5.0
	 * @param {string} tag - name of the custom element
	 */
	static define(tag: string): void {
		try {
			UIElement.registry.define(tag, this)
			if (DEV_MODE) log(tag, 'Registered custom element')
		} catch (error) {
			log(error, `Failed to register custom element ${tag}`, LOG_ERROR)
		}
	}

	/**
	 * @since 0.10.1
	 * @property
	 */
	states: S = {} as S

	/**
     * @since 0.9.0
     * @property {Record<string, Signal<{}>>} signals - object of state signals bound to the custom element
     */
	signals: InferSignalTypes<S> = {} as InferSignalTypes<S>


	/**
	 * @since 0.10.1
	 * @property {(() => void)[]} cleanup - array of functions to remove bound event listeners and perform other cleanup operations
	 */
	cleanup: (() => void)[] = []

	/**
	 * @since 0.9.0
	 * @property {ElementInternals | undefined} internals - native internal properties of the custom element
	 * /
	internals: ElementInternals | undefined

	/**
	 * @since 0.8.1
	 * @property {UI<UIElement>} self - UI object for this element
	 */
	self: UI<S, UIElement<S>> = new UI<S, UIElement<S>>(this)

	/**
	 * @since 0.8.3
	 */
	root: Element | ShadowRoot = this.shadowRoot || this

	/**
	 * @since 0.9.0
	 */
	debug: boolean = false

	/**
	 * Native callback function when an observed attribute of the custom element changes
	 * 
	 * @since 0.1.0
	 * @param {string} name - name of the modified attribute
	 * @param {string | null} old - old value of the modified attribute
	 * @param {string | null} value - new value of the modified attribute
	 */
	attributeChangedCallback(
		name: string,
		old: string | null,
		value: string | null
	): void {
		if (value === old) return
		const parsed = parse(this, name, value, old)
		if (DEV_MODE && this.debug)
			log(value, `Attribute "${name}" of ${elementName(this)} changed from ${valueString(old)} to ${valueString(value)}, parsed as <${typeof parsed}> ${valueString(parsed)}`)
        this.set(name, parsed ?? UNSET)
	}

	/**
     * Native callback function when the custom element is first connected to the document
	 * 
	 * Used for context providers and consumers
	 * If your component uses context, you must call `super.connectedCallback()`
     * 
     * @since 0.7.0
     */
	connectedCallback(): void {
		if (DEV_MODE) {
			this.debug = this.hasAttribute('debug')
			if (this.debug) log(this, 'Connected')
		}
		for (const [key, init] of Object.entries((this.states))) {
			const result = isAttributeParser(init)
				? init(this.getAttribute(key), this)
				: init
			this.set(key, result ?? UNSET)
		}
		useContext(this)
	}

	/**
	 * Native callback function when the custom element is disconnected from the document
	 */
	disconnectedCallback(): void {
		this.cleanup.forEach(off => off())
		this.cleanup = []
		if (DEV_MODE && this.debug)
			log(this, 'Disconnected')
	}

	/**
     * Native callback function when the custom element is adopted into a new document
     */
	adoptedCallback(): void {
		if (DEV_MODE && this.debug)
			log(this, 'Adopted')
    }

	/**
	 * Check whether a state is set
	 * 
	 * @since 0.2.0
	 * @param {string} key - state to be checked
	 * @returns {boolean} `true` if this element has state with the given key; `false` otherwise
	 */
	has(key: string): boolean {
		return key in this.signals
	}

    /**
     * Get the current value of a state
     *
     * @since 0.2.0
     * @param {K} key - state to get value from
     * @returns {InferReturnType<S, K>} current value of state; undefined if state does not exist
     */
    get<K extends keyof S>(key: K): InferReturnType<S, K> {
        const value = unwrap(this.signals[key]) as InferReturnType<S, K>
		if (DEV_MODE && this.debug)
			log(value, `Get current value of state <${typeof value}> ${valueString(key)} in ${elementName(this)}`)
		return value
	}

    /**
     * Create a state or update its value and return its current value
     * 
     * @since 0.2.0
     * @param {K} key - state to set value to
     * @param {InferSignalType<typeof this.signals[K]> | Signal<InferSignalType<typeof this.signals[K]>> | ((old?: InferSignalType<typeof this.signals[K]>) => InferSignalType<typeof this.signals[K]>)} value - initial or new value; may be a function (gets old value as parameter) to be evaluated when value is retrieved
     * @param {boolean} [update=true] - if `true` (default), the state is updated; if `false`, do nothing if state already exists
     */
    set<K extends keyof S>(
        key: K,
        value: InferReturnType<S, K> | Signal<InferReturnType<S, K>> | ((old: InferReturnType<S, K>) => InferReturnType<S, K>),
		update: boolean = true
	): void {
		let op: string;

		// State does not exist => create new state
		if (!(key in this.signals)) {
			if (DEV_MODE && this.debug) op = 'Create'
			this.signals[key] = toSignal(value, true) as InferSignalTypes<S>[K]

		// State already exists => update existing state
		} else if (update) {
			const s = this.signals[key]

			// Value is a Signal => replace state with new signal
			if (isSignal(value)) {
				if (DEV_MODE && this.debug) op = 'Replace'
				this.signals[key] = value  as InferSignalTypes<S>[K]
				if (isState(s)) s.set(UNSET) // clear previous state so watchers re-subscribe to new signal

			// Value is not a Signal => set existing state to new value
			} else {
				if (isState<InferReturnType<S, K>>(s)) {
					if (DEV_MODE && this.debug) op = 'Update'
					if (isFunction<InferReturnType<S, K>>(value)) s.update(value)
					else s.set(value as InferReturnType<S, K>)
				} else if (isComputed<InferReturnType<S, K>>(s)) {
					log(value, `Computed state ${valueString(key)} in ${elementName(this)} cannot be set`, LOG_ERROR)
					return
				} else {
					// This case should not occur, but we handle it for completeness
					log(value, `Unknown state type <${typeof value}> for ${valueString(key)} in ${elementName(this)}`, LOG_ERROR)
					return
				}
			}

		// Do nothing if state already exists and update is false
		} else return

		if (DEV_MODE && this.debug)
			log(value, `${op!} state <${typeof value}> ${valueString(key)} in ${elementName(this)}`)

	}

	/**
	 * Delete a state, also removing all effects dependent on the state
	 * 
	 * @since 0.4.0
	 * @param {string} key - state to be deleted
	 * @returns {boolean} `true` if the state existed and was deleted; `false` if ignored
	 */
	delete(key: string): boolean {
		if (DEV_MODE && this.debug)
			log(key, `Delete state ${valueString(key)} from ${elementName(this)}`)
		return delete this.signals[key]
	}

	/**
	 * Get array of first sub-element matching a given selector within the custom element
	 * 
	 * @since 0.8.1
	 * @param {string} selector - selector to match sub-element
	 * @returns {UI<Element>[]} - array of zero or one UI objects of matching sub-element
	 */
	first(selector: string): UI<S, Element> {
		const element = this.root.querySelector(selector)
		return new UI(this, element ? [element] : [])
	}
	/**
	 * Get array of all sub-elements matching a given selector within the custom element
	 * 
	 * @since 0.8.1
	 * @param {string} selector - selector to match sub-elements
	 * @returns {UI<Element>} - array of UI object of matching sub-elements
	 */
	all(selector: string): UI<S, Element> {
		return new UI(this, Array.from(this.root.querySelectorAll(selector)))
	}

}
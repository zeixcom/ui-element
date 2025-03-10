import {
	type Signal, type ComputedCallbacks,
	UNSET, isSignal, isComputedCallbacks, toSignal, isState, isComputed, computed
} from "@zeix/cause-effect"

import { isFunction } from "./core/util"
import { DEV_MODE, elementName, log, LOG_ERROR, LOG_WARN, typeString, valueString } from "./core/log"
import { UI } from "./core/ui"
import { type UnknownContext, useContext } from "./core/context"

/* === Types === */

export type ComponentSignals = { [key: string]: {} }

export type AttributeParser<T, S extends ComponentSignals> = (
	value: string | null,
	host: UIElement<S>,
	old?: string | null
) => T

export type StateUpdater<T> = (v: T) => T

export type Root<S extends ComponentSignals> = ShadowRoot | UIElement<S>

export type StateInitializer<T, S extends ComponentSignals> = T
	| AttributeParser<T, S>
	| ComputedCallbacks<NonNullable<T>, []>

/* === Constants === */

export const RESET: any = Symbol() // explicitly marked as any so it can be used as signal value of any type

/* === Internal Functions === */

/**
 * Check if a value is an attribute parser
 * 
 * @since 0.10.1
 * @param {unknown} value - value to check
 * @returns {boolean} - true if value is an attribute parser, false otherwise
 */
const isAttributeParser = <T, S extends ComponentSignals>(value: unknown): value is AttributeParser<T, S> =>
	isFunction(value) && !!value.length

/**
 * Check if a value is a state updater
 * 
 * @since 0.10.2
 * @param {unknown} value - value to check
 * @returns {boolean} - true if value is a state updater, false otherwise
 */
const isStateUpdater = <T>(value: unknown): value is StateUpdater<T> =>
	isFunction(value) && !!value.length

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
 * Parse according to states
 * 
 * @since 0.8.4
 * @param {UIElement} host - host UIElement
 * @param {string} key - key for attribute parser or initial value from states
 * @param {string | null} value - attribute value
 * @param {string | null} [old=undefined] - old attribute value
 * @returns {T | undefined}
 */
export const parse = <T, S extends ComponentSignals = {}>(
	host: UIElement<S>,
	key: string,
	value: string | null,
	old?: string | null
): T | undefined => {
	const parser = host.states[key] as StateInitializer<T, S>
	return isAttributeParser<T, S>(parser)
		? parser(value, host, old)
		: value as T ?? undefined
}

/* === Exported Class === */

/**
 * Base class for reactive custom elements
 * 
 * @since 0.1.0
 * @class UIElement
 * @extends HTMLElement
 * @type {UIElement}
 */
export class UIElement<S extends ComponentSignals = {}> extends HTMLElement {
	static registry: CustomElementRegistry = customElements
	static readonly localName: string
	static observedAttributes: string[]
	static consumedContexts: UnknownContext[]
	static providedContexts: UnknownContext[]

	/**
	 * Define a custom element in the custom element registry
	 * 
	 * @since 0.5.0
	 */
	static define(name: string = this.localName): typeof UIElement {
		try {
			this.registry.define(name, this)
			if (DEV_MODE) log(name, 'Registered custom element')
		} catch (error) {
			log(error, `Failed to register custom element ${name}`, LOG_ERROR)
		}
		return this
	}

	/**
	 * @since 0.10.1
	 * @property {ComponentStates} states - object of state initializers for signals (initial values or attribute parsers)
	 */
	states: { [K in keyof S]: StateInitializer<S[K], S> } = {} as { [K in keyof S]: StateInitializer<S[K], S> }

	/**
     * @since 0.9.0
     * @property {S} signals - object of publicly exposed signals bound to the custom element
     */
	signals: {[K in keyof S]: Signal<S[K]> } = {} as { [K in keyof S]: Signal<S[K]> }


	/**
	 * @since 0.10.1
	 * @property {(() => void)[]} cleanup - array of functions to remove bound event listeners and perform other cleanup operations
	 */
	cleanup: (() => void)[] = []

	/**
	 * @ property {ElementInternals | undefined} internals - native internal properties of the custom element
	 * /
	internals: ElementInternals | undefined

	/**
	 * @since 0.8.1
	 * @property {UI<UIElement>} self - UI object for this element
	 */
	self: UI<UIElement, S> = new UI<UIElement, S>(this)

	/**
	 * @since 0.8.3
	 */
	get root(): Root<S> {
		return this.shadowRoot || this
	}

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
		if (value === old || isComputed(this.signals[name])) return // unchanged or controlled
		const parsed = parse(this, name, value, old)
		if (DEV_MODE && this.debug)
			log(value, `Attribute "${name}" of ${elementName(this)} changed from ${valueString(old)} to ${valueString(value)}, parsed as <${typeString(parsed)}> ${valueString(parsed)}`)
        this.set(name, parsed ?? RESET)
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
				: isComputedCallbacks<{}>(init)
					? computed(init)
					: init
			this.set(key, result ?? RESET)
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
     * @returns {S[K]} current value of state; undefined if state does not exist
     */
    get<K extends keyof S | string>(key: K): S[K] {
        const value = unwrap(this.signals[key])
		if (DEV_MODE && this.debug)
			log(value, `Get current value of signal <${typeString(value)}> ${valueString(key)} in ${elementName(this)}`)
		return value
	}

    /**
     * Create a state or update its value and return its current value
     * 
     * @since 0.2.0
     * @param {K} key - state to set value to
     * @param {S[K] | ComputedCallbacks<S[K], []> | Signal<S[K]> | StateUpdater<S[K]>} value - initial or new value; may be a function (gets old value as parameter) to be evaluated when value is retrieved
     * @param {boolean} [update=true] - if `true` (default), the state is updated; if `false`, do nothing if state already exists
     */
    set<K extends keyof S | string>(
        key: K,
        value: S[K] | ComputedCallbacks<S[K], []> | Signal<S[K]> | StateUpdater<S[K]>,
		update: boolean = true
	): void {

		// Error and early return if value is null or undefined
		if (null == value) {
			log(value, `Attempt to set state ${valueString(key)} to null or undefined in ${elementName(this)}`, LOG_ERROR)
            return
		}

		let op: string;
		const s = this.signals[key]
		const old = s?.get()

		// State does not exist => create new state
		if (!(key in this.signals)) {
			if (isStateUpdater<S[K]>(value)) {
				log(value, `Cannot use updater function to create a computed signal in ${elementName(this)}`, LOG_ERROR)
				return
			}
			if (DEV_MODE && this.debug) op = 'Create'
			this.signals[key] = toSignal(value)

		// State already exists => update existing state
		} else if (update || old === UNSET || old === RESET) {
			if (isComputedCallbacks<S[K]>(value)) {
				log(value, `Cannot use computed callbacks to update signal ${valueString(key)} in ${elementName(this)}`, LOG_ERROR)
                return
			}

			// Value is a Signal => replace state with new signal
			if (isSignal(value)) {
				if (DEV_MODE && this.debug) op = 'Replace'
				this.signals[key] = value
				if (isState(s)) s.set(UNSET) // clear previous state so watchers re-subscribe to new signal

			// Value is not a Signal => set existing state to new value
			} else {
				if (isState<S[K]>(s)) {
					if (DEV_MODE && this.debug) op = 'Update'
					if (isStateUpdater<S[K]>(value)) s.update(value)
					else s.set(value)
				} else {
					log(value, `Computed signal ${valueString(key)} in ${elementName(this)} cannot be set`, LOG_WARN)
					return
				}
			}

		// Do nothing if state already exists and update is false
		} else return

		if (DEV_MODE && this.debug)
			log(value, `${op!} signal <${typeString(value)}> ${valueString(key)} in ${elementName(this)}`)

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
			log(key, `Delete signal ${valueString(key)} from ${elementName(this)}`)
		return delete this.signals[key]
	}

	/**
	 * Get array of first sub-element matching a given selector within the custom element
	 * 
	 * @since 0.8.1
	 * @param {string} selector - selector to match sub-element
	 * @returns {UI<Element>[]} - array of zero or one UI objects of matching sub-element
	 */
	first<E extends Element = HTMLElement>(selector: string): UI<E, S> {
		let element = this.root.querySelector<E>(selector)
		if (this.shadowRoot && !element) element = this.querySelector(selector)
		return new UI(this, element ? [element] : [])
	}
	/**
	 * Get array of all sub-elements matching a given selector within the custom element
	 * 
	 * @since 0.8.1
	 * @param {string} selector - selector to match sub-elements
	 * @returns {UI<Element>} - array of UI object of matching sub-elements
	 */
	all<E extends Element = HTMLElement>(selector: string): UI<E, S> {
		let elements = this.root.querySelectorAll<E>(selector)
		if (this.shadowRoot && !elements.length) elements = this.querySelectorAll(selector)
		return new UI(this, Array.from(elements))
	}

}
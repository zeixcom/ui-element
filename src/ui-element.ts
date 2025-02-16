import { type Computed, type Signal, UNSET, isComputed, isSignal, isState, toSignal } from "@zeix/cause-effect"

import { isFunction } from "./core/util"
import { DEV_MODE, elementName, log, LOG_ERROR, valueString } from "./core/log"
import { UI } from "./core/ui"
import { type UnknownContext, useContext } from "./core/context"

/* === Types === */

export type AttributeParser<T> = (
	value: string | undefined,
	element?: UIElement,
	old?: string
) => T

export type StateInitializer<T> = T | AttributeParser<T> | Computed<T>

export type InferSignalType<T> = T extends Signal<infer V> ? V : never

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
 * @param {string | undefined} value - attribute value
 * @param {string | undefined} [old=undefined] - old attribute value
 * @returns {T | undefined}
 */
export const parse = <T>(
	host: UIElement,
	key: string,
	value: string | undefined,
	old?: string
): T | undefined => {
	const parser = (host.constructor as typeof UIElement).states[key]
	return isAttributeParser(parser)
		? (parser as AttributeParser<T>)(value, host, old)
		: value as T | undefined
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
export class UIElement extends HTMLElement {
	static registry: CustomElementRegistry = customElements
	static states: Record<string, StateInitializer<NonNullable<unknown>>> = {}
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
     * @since 0.9.0
     * @property {Record<string, Signal<{}>>} signals - object of state signals bound to the custom element
     */
	signals: Record<string, Signal<{}>> = {}

	/**
	 * @since 0.10.0
	 * @property {Array<() => void>} cleanup - array of functions to remove bound event listeners
	 */
	cleanup: Array<() => void> = []

	/**
	 * @since 0.9.0
	 * @property {ElementInternals | undefined} internals - native internal properties of the custom element
	 * /
	internals: ElementInternals | undefined

	/**
	 * @since 0.8.1
	 * @property {UI<UIElement>} self - UI object for this element
	 */
	self: UI<UIElement> = new UI(this)

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
	 * @param {string | undefined} old - old value of the modified attribute
	 * @param {string | undefined} value - new value of the modified attribute
	 */
	attributeChangedCallback(
		name: string,
		old: string | undefined,
		value: string | undefined
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
		for (const [key, value] of Object.entries((this.constructor as typeof UIElement).states)) {
			const result = isAttributeParser(value)
				? value(this.getAttribute(key) ?? undefined, this)
				: value
			this.set(key, result ?? UNSET)
		}
		useContext(this)
	}

	/**
	 * Native callback function when the custom element is disconnected from the document
	 */
	disconnectedCallback(): void {
		this.cleanup.forEach(off => off())
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
	 * @param {string} key - state to get value from
	 * @returns {T} current value of state; undefined if state does not exist
	 */
	// get<K extends keyof typeof this.signals>(key: K): InferSignalType<typeof this.signals[K]> {
	get<T extends {}>(key: string): T {
		const value = unwrap(this.signals[key]) as T
		if (DEV_MODE && this.debug)
			log(value, `Get current value of state <${typeof value}> ${valueString(key)} in ${elementName(this)}`)
		return value
	}

	/**
	 * Create a state or update its value and return its current value
	 * 
	 * @since 0.2.0
	 * @param {string} key - state to set value to
	 * @param {T | ((old?: T) => T) | Signal<T>} value - initial or new value; may be a function (gets old value as parameter) to be evaluated when value is retrieved
	 * @param {boolean} [update=true] - if `true` (default), the state is updated; if `false`, do nothing if state already exists
	 */
	set<T extends {}>(
		key: string,
		value: T | Signal<T> | ((old?: T) => T),
		update: boolean = true
	): void {
		let op: string;

		// State does not exist => create new state
		if (!(key in this.signals)) {
			if (DEV_MODE && this.debug) op = 'Create'
			this.signals[key] = toSignal(value, true)

		// State already exists => update existing state
		} else if (update) {
			const s = this.signals[key]

			// Value is a Signal => replace state with new signal
			if (isSignal(value)) {
				if (DEV_MODE && this.debug) op = 'Replace'
				this.signals[key] = value
				if (isState(s)) s.set(UNSET) // clear previous state so watchers re-subscribe to new signal

			// Value is not a Signal => set existing state to new value
			} else {
				if (isState<T>(s)) {
					if (DEV_MODE && this.debug) op = 'Update'
					if (isFunction<T>(value)) s.update(value)
					else s.set(value as T)
				} else {
					log(value, `Computed state ${valueString(key)} in ${elementName(this)} cannot be set`, LOG_ERROR)
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
	first(selector: string): UI<Element> {
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
	all(selector: string): UI<Element> {
		return new UI(this, Array.from(this.root.querySelectorAll(selector)))
	}

}
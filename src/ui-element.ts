import {
	type Computed, type Signal,
	State, UNSET, isSignal, isState, toSignal
} from "@zeix/cause-effect"

import { isDefinedObject, isFunction } from "./core/util"
import { DEV_MODE, elementName, log, LOG_ERROR, valueString } from "./core/log"
import { UI } from "./core/ui"
import { parse } from "./core/parse"
import { type UnknownContext, useContext } from "./core/context"

/* === Types === */

export type AttributeParser<T> = (
	value: string | undefined,
	element: UIElement,
	old: string | undefined
) => T | undefined

export type StateInitializer<T> = T | AttributeParser<T>

type InferStateType<S> = S extends AttributeParser<infer V> ? V : S

type ExtractStateObject<T> = T extends Record<string, StateInitializer<unknown>> ? T : never

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
	// Correctly type `this.constructor` as a subclass of `UIElement`
	private get ctor(): typeof UIElement {
        return this.constructor as typeof UIElement;
    }

	static registry: CustomElementRegistry = customElements
	static states: Record<string, StateInitializer<unknown>> = {}
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
     * @property {Map<PropertyKey, Signal<InferStateType<typeof this.ctor.states[keyof typeof this.ctor.states]>>>} signals - map of state signals bound to the custom element
     */
	signals = new Map<
		keyof ExtractStateObject<typeof this.ctor.states>,
		Signal<InferStateType<ExtractStateObject<typeof this.ctor.states>[keyof ExtractStateObject<typeof this.ctor.states>]>>
    >()

	/**
	 * @since 0.10.0
	 * @property {Array<() => void>} listeners - array of functions to remove bound event listeners
	 */
	listeners: Array<() => void> = []

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
		value: string | undefined): void
	{
		if (value === old) return
		if (DEV_MODE && this.debug)
			log(`${valueString(old)} => ${valueString(value)}`, `Attribute "${name}" of ${elementName(this)} changed`)
		this.set(name, parse(this, this.ctor.states[name], value, old))
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
		Object.entries(this.ctor.states).forEach(([name, source]) => {
			const value = isFunction(source)
				? parse(this, this.ctor.states[name], this.getAttribute(name) ?? undefined)
				: source
			this.set(name, value, false)
		})
		useContext(this)
	}

	/**
	 * Native callback function when the custom element is disconnected from the document
	 */
	disconnectedCallback(): void {
		this.listeners.forEach(off => off())
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
		return this.signals.has(key)
	}

	/**
	 * Get the current value of a state
	 *
	 * @since 0.2.0
	 * @param {string} key - state to get value from
	 * @returns {T | undefined} current value of state; undefined if state does not exist
	 */
	get<T>(key: string): T | undefined {
		const unwrap = (v: T | (() => T) | Signal<T> | undefined): T | (() => T) | Signal<T> | undefined =>
			!isDefinedObject(v) ? v // shortcut for non-object values
				: isFunction<T>(v) ? unwrap(v())
				: isSignal(v) ? unwrap(v.get())
				: v
		const value = unwrap(this.signals.get(key) as Signal<T>) as T | undefined
		if (DEV_MODE && this.debug)
			log(value, `Get current value of state ${valueString(key)} in ${elementName(this)}`)
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
	set<T>(
		key: string,
		value: T | Signal<T> | ((old?: T) => T),
		update: boolean = true
	): void {
		let op: string;

		// State does not exist => create new state
		if (!this.signals.has(key)) {
			if (DEV_MODE && this.debug) op = 'Create'
			this.signals.set(key, toSignal(value as State<T> | Computed<T> | T, true) as Signal<unknown>)


		// State already exists => update existing state
		} else if (update) {
			const s = this.signals.get(key)

			// Value is a Signal => replace state with new signal
			if (isSignal(value)) {
				if (DEV_MODE && this.debug) op = 'Replace'
				this.signals.set(key, value)
				if (isState(s)) s.set(UNSET) // clear previous state so watchers re-subscribe to new signal

			// Value is not a Signal => set existing state to new value
			} else {
				if (isState(s)) {
					if (DEV_MODE && this.debug) op = 'Update'
					s.set(value)
				} else {
					log(value, `Computed state ${valueString(key)} in ${elementName(this)} cannot be set`, LOG_ERROR)
					return
				}
			}

		// Do nothing if state already exists and update is false
		} else return

		if (DEV_MODE && this.debug)
			log(value, `${op!} state ${valueString(key)} in ${elementName(this)}`)

	}

	/**
	 * Delete a state, also removing all effects dependent on the state
	 * 
	 * @since 0.4.0
	 * @param {string} key - state to be deleted
	 * @returns {boolean} `true` if the state existed and was deleted; `false` if ignored
	 */
	delete(key: string): boolean {
		if (DEV_MODE && this.debug) log(
			key,
			`Delete state ${valueString(key)} from ${elementName(this)}`
		)
		return this.signals.delete(key)
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
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
	type Parser,
	isParser,
	observeSubtree,
} from './core/dom'
import {
	InvalidComponentNameError,
	InvalidPropertyNameError,
	InvalidSetupFunctionError,
	InvalidSignalError,
	MissingElementError,
} from './core/errors'
import type { Effects } from './core/reactive'
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
	| Parser<T, C>
	| SignalProducer<T, C>
	| MethodProducer<C>

type ElementSelector<P extends ComponentProps> = {
	<S extends string>(
		selector: S,
		effects: Effects<P, ElementFromSelector<S>>,
		required?: string,
	): (host: Component<P>) => Cleanup | void
	<E extends Element>(
		selector: string,
		effects: Effects<P, E>,
		required?: string,
	): (host: Component<P>) => Cleanup | void
}

type ElementSelectors<P extends ComponentProps> = {
	first: ElementSelector<P>
	all: ElementSelector<P>
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
 *
 * @param {string} prop - Property name to validate
 * @returns {string | null} - Error message or null if valid
 */
const validatePropertyName = (prop: string): string | null => {
	if (RESERVED_WORDS.has(prop))
		return `Property name "${prop}" is a reserved word`
	if (HTML_ELEMENT_PROPS.has(prop))
		return `Property name "${prop}" conflicts with inherited HTMLElement property`
	return null
}

/**
 * Run one or more effect functions on a component's element
 *
 * @since 0.12.0
 * @param {Effects<P, E>} effects - Effect functions to run
 * @param {Component<P>} host - Component host element
 * @param {E} target - Target element
 * @returns {Cleanup} - Cleanup function that runs collected cleanup functions
 */
const runEffects = <P extends ComponentProps, E extends Element = Component<P>>(
	effects: Effects<P, E>,
	host: Component<P>,
	target: E = host as unknown as E,
): void | Cleanup => {
	if (!Array.isArray(effects)) return effects(host, target)
	const cleanups = effects
		.filter(isFunction)
		.map(effect => effect(host, target))
	return () => {
		cleanups.filter(isFunction).forEach(cleanup => cleanup())
		cleanups.length = 0
	}
}

/**
 * Create partially applied helper functions to select sub-elements
 *
 * @since 0.13.0
 * @returns {ElementSelectors<P>} - Helper functions for selecting sub-elements
 */
const select = <P extends ComponentProps>(): ElementSelectors<P> => ({
	/**
	 * Apply effect functions to a first matching descendant within the custom element
	 *
	 * @since 0.14.0
	 * @param {S} selector - Selector to match descendant
	 * @param {Effects<P, ElementFromSelector<S>>} effects - Effect functions to apply
	 * @param {string} required - Optional error message to explain why the element is required; if not provided, missing elements will be silently ignored
	 * @throws {MissingElementError} - Thrown when the element is required but not found
	 */
	first<S extends string, E extends Element = ElementFromSelector<S>>(
		selector: S,
		effects: Effects<P, E>,
		required?: string,
	): (host: Component<P>) => Cleanup | void {
		return (host: Component<P>) => {
			const target = (host.shadowRoot ?? host).querySelector<E>(selector)
			if (!target && required != null)
				throw new MissingElementError(host, selector, required)
			if (target) runEffects(effects, host, target)
		}
	},

	/**
	 * Apply effect functions to all matching descendant elements within the custom element
	 *
	 * @since 0.14.0
	 * @param {S} selector - Selector to match descendants
	 * @param {Effects<P, ElementFromSelector<S>>} effects - Effect functions to apply
	 * @param {string} required - Optional error message to explain why the element is required; if not provided, missing elements will be silently ignored
	 * @throws {MissingElementError} - Thrown when the element is required but not found
	 */
	all<S extends string, E extends Element = ElementFromSelector<S>>(
		selector: S,
		effects: Effects<P, E>,
		required?: string,
	): (host: Component<P>) => Cleanup | void {
		return (host: Component<P>) => {
			const cleanups = new Map<E, Cleanup>()
			const root = host.shadowRoot ?? host

			const attach = (target: E) => {
				const cleanup = runEffects(effects, host, target)
				if (cleanup && !cleanups.has(target))
					cleanups.set(target, cleanup)
			}

			const detach = (target: E) => {
				const cleanup = cleanups.get(target)
				if (cleanup) cleanup()
				cleanups.delete(target)
			}

			const applyToMatching =
				(fn: (target: E) => void) => (node: Node) => {
					if (isElement(node)) {
						if (node.matches(selector)) fn(node as E)
						node.querySelectorAll<E>(selector).forEach(fn)
					}
				}

			const observer = observeSubtree(root, selector, mutations => {
				for (const mutation of mutations) {
					mutation.addedNodes.forEach(applyToMatching(attach))
					mutation.removedNodes.forEach(applyToMatching(detach))
				}
			})

			const targets = root.querySelectorAll<E>(selector)
			if (!targets.length && required != null)
				throw new MissingElementError(host, selector, required)
			if (targets.length) targets.forEach(attach)

			return () => {
				observer.disconnect()
				cleanups.forEach(cleanup => cleanup())
				cleanups.clear()
			}
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
 * @param {Effects<P, Component<P>>} setup - Setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @throws {InvalidComponentNameError} If component name is invalid
 * @throws {InvalidPropertyNameError} If property name is invalid
 * @throws {InvalidSetupFunctionError} If setup function is invalid
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
		select: ElementSelectors<P>,
	) => Effects<P, Component<P>>,
): void => {
	if (!name.includes('-') || !name.match(/^[a-z][a-z0-9-]*$/))
		throw new InvalidComponentNameError(name)
	for (const prop of Object.keys(init)) {
		const error = validatePropertyName(prop)
		if (error) throw new InvalidPropertyNameError(name, prop, error)
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
				?.filter(([, initializer]) => isParser(initializer))
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
			const effects = setup(this as unknown as Component<P>, select())
			if (Array.isArray(effects) || isFunction(effects)) {
				const cleanup = runEffects(
					effects,
					this as unknown as Component<P>,
				)
				if (cleanup) this.#cleanup = cleanup
			} else {
				throw new InvalidSetupFunctionError(this)
			}
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
		 * @param {K} attr - Name of the modified attribute
		 * @param {string | null} old - Old value of the modified attribute
		 * @param {string | null} value - New value of the modified attribute
		 */
		attributeChangedCallback<K extends keyof P & string>(
			attr: K,
			old: string | null,
			value: string | null,
		) {
			if (value === old || isComputed(this.#signals[attr])) return // unchanged or controlled by computed
			const parser = init[attr]
			if (!isParser<P[K]>(parser)) return
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
		 * @param {Signal<P[keyof P]>} signal - Signal to set value to
		 * @throws {InvalidPropertyNameError} If key is not a valid property name
		 * @throws {InvalidSignalError} If signal is not a valid signal
		 */
		setSignal<K extends keyof P & string>(
			key: K,
			signal: Signal<P[K]>,
		): void {
			const error = validatePropertyName(String(key))
			if (error)
				throw new InvalidPropertyNameError(this.localName, key, error)
			if (!isSignal(signal)) throw new InvalidSignalError(this, key)
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
	type ElementSelector,
	type ElementSelectors,
	component,
}

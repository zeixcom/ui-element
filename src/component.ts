import {
	type ComputedCallback,
	computed,
	isComputed,
	isComputedCallback,
	isFunction,
	isMutableSignal,
	isSignal,
	isState,
	isStore,
	type MaybeCleanup,
	type Signal,
	state,
	UNSET,
} from '@zeix/cause-effect'

import {
	type Extractor,
	getHelpers,
	type Helpers,
	isParser,
	type Parser,
} from './core/dom'
import {
	DependencyTimeoutError,
	InvalidComponentNameError,
	InvalidPropertyNameError,
} from './core/errors'
import { type Effects, runEffects } from './core/reactive'
import {
	DEV_MODE,
	elementName,
	LOG_WARN,
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

type ComponentProp = Exclude<string, keyof HTMLElement | ReservedWords>
type ComponentProps = Record<ComponentProp, NonNullable<unknown>>

type Component<P extends ComponentProps> = HTMLElement & P & { debug?: boolean }

type MaybeSignal<T extends {}> = T | Signal<T> | ComputedCallback<T>

type Initializer<K extends ComponentProp, P extends ComponentProps> =
	| P[K]
	| Parser<P[K], Component<P>>
	| Extractor<MaybeSignal<P[K]>, Component<P>>
	| ((host: Component<P>) => void)

type Setup<P extends ComponentProps> = (
	host: Component<P>,
	helpers: Helpers<P>,
) => Effects<P, Component<P>>

/* === Constants === */

const DEPENDENCY_TIMEOUT = 50

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

/* === Exported Functions === */

/**
 * Define a component with dependency resolution and setup function (connectedCallback)
 *
 * @since 0.14.0
 * @param {string} name - Name of the custom element
 * @param {{ [K in keyof P]: Initializer<P[K], Component<P>> }} init - Signals of the component
 * @param {Setup<P>} setup - Setup function to be called after dependencies are resolved
 * @throws {InvalidComponentNameError} If component name is invalid
 * @throws {InvalidPropertyNameError} If property name is invalid
 */
function component<P extends ComponentProps>(
	name: string,
	init: {
		[K in keyof P]: K extends ComponentProp ? Initializer<K, P> : never
	},
	setup: Setup<P>,
): Component<P> {
	if (!name.includes('-') || !name.match(/^[a-z][a-z0-9-]*$/))
		throw new InvalidComponentNameError(name)
	for (const prop of Object.keys(init)) {
		const error = validatePropertyName(prop)
		if (error) throw new InvalidPropertyNameError(name, prop, error)
	}

	class CustomElement extends HTMLElement {
		debug?: boolean
		#signals = {} as { [K in keyof P]: Signal<P[K]> }
		#cleanup: MaybeCleanup

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
			const createSignal = <K extends keyof P & string>(
				key: K,
				initializer: Initializer<K, P>,
			) => {
				const result = isFunction<MaybeSignal<P[K]>>(initializer)
					? initializer(this as unknown as Component<P>)
					: (initializer as P[K])
				if (result != null) this.#setAccessor(key, result)
			}
			for (const [prop, initializer] of Object.entries(init)) {
				if (initializer == null || prop in this) continue
				createSignal(prop, initializer)
			}

			// Getting effects collects dependencies as a side-effect
			const [helpers, getDependencies] = getHelpers(
				this as unknown as Component<P>,
			)
			const effects = setup(this as unknown as Component<P>, helpers)

			// Resolve dependencies and run setup function
			const deps = getDependencies()
			const runSetup = () => {
				const cleanup = runEffects(
					effects,
					this as unknown as Component<P>,
				)
				if (cleanup) this.#cleanup = cleanup
			}

			if (deps.length) {
				Promise.race([
					Promise.all(
						deps.map(dep => customElements.whenDefined(dep)),
					),
					new Promise((_, reject) => {
						setTimeout(() => {
							reject(
								new DependencyTimeoutError(
									this,
									deps.filter(
										dep => !customElements.get(dep),
									),
								),
							)
						}, DEPENDENCY_TIMEOUT)
					}),
				])
					.then(runSetup)
					.catch(error => {
						if (DEV_MODE)
							log(
								error,
								`Error during setup of <${name}>. Trying to run effects anyway.`,
								LOG_WARN,
							)
						runSetup()
					})
			} else {
				runSetup()
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
		 * @param {K} name - Name of the modified attribute
		 * @param {string | null} oldValue - Old value of the modified attribute
		 * @param {string | null} newValue - New value of the modified attribute
		 */
		attributeChangedCallback<K extends keyof P>(
			name: K,
			oldValue: string | null,
			newValue: string | null,
		) {
			if (newValue === oldValue || isComputed(this.#signals[name])) return // unchanged or controlled by computed
			const parser = init[name]
			if (!isParser<P[K]>(parser)) return
			const parsed = parser(this, newValue, oldValue)
			if (DEV_MODE && this.debug)
				log(
					newValue,
					`Attribute "${String(name)}" of ${elementName(this)} changed from ${valueString(oldValue)} to ${valueString(newValue)}, parsed as <${typeString(parsed)}> ${valueString(parsed)}`,
				)
			if (name in this) (this as unknown as P)[name] = parsed
			else this.#setAccessor(name, parsed)
		}

		/**
		 * Set the signal for a given key
		 *
		 * @since 0.15.0
		 * @param {K} key - Key to set accessor for
		 * @param {MaybeSignal<P[K]>} value - Initial value, signal or computed callback to create signal
		 */
		#setAccessor<K extends keyof P>(
			key: K,
			value: MaybeSignal<P[K]>,
		): void {
			const signal = isSignal(value)
				? value
				: isComputedCallback(value)
					? computed(value)
					: state(value)
			const prev = this.#signals[key]
			const mutable = isMutableSignal(signal)
			this.#signals[key] = signal
			Object.defineProperty(this, key, {
				get: signal.get,
				set: mutable ? signal.set : undefined,
				enumerable: true,
				configurable: mutable,
			})
			if ((prev && isState(prev)) || isStore(prev)) prev.set(UNSET)
			if (DEV_MODE && this.debug)
				log(
					signal,
					`Set ${typeString(signal)} "${String(key)}" in ${elementName(this)}`,
				)
		}
	}

	customElements.define(name, CustomElement)
	return customElements.get(name) as unknown as Component<P>
}

export {
	type Component,
	type ComponentProp,
	type ComponentProps,
	type MaybeSignal,
	type ReservedWords,
	type Initializer,
	type Setup,
	component,
}

import {
	type Cleanup,
	type Signal,
	UNSET,
	effect,
	enqueue,
	isFunction,
	isSignal,
	isState,
	toSignal,
} from '@zeix/cause-effect'

import {
	type Component,
	type ComponentProps,
	type Effect,
	RESET,
} from '../component'
import type { HTMLElementEventType, ValidEventName } from '../core/dom'
import {
	DEV_MODE,
	LOG_ERROR,
	elementName,
	hasMethod,
	isCustomElement,
	isDefinedObject,
	isString,
	log,
	valueString,
} from '../core/util'

/* === Types === */

type Reactive<T, P extends ComponentProps, E extends Element = HTMLElement> =
	| keyof P
	| Signal<NonNullable<T>>
	| ((element: E) => T | null | undefined)

type PassedReactives<P extends ComponentProps, E extends Element> = {
	[K in keyof E]?: Reactive<E[K], P, E>
}

type UpdateOperation = 'a' | 'c' | 'h' | 'p' | 's' | 't'

type ElementUpdater<E extends Element, T> = {
	op: UpdateOperation
	name?: string
	read: (element: E) => T | null
	update: (element: E, value: T) => void
	delete?: (element: E) => void
	resolve?: (element: E) => void
	reject?: (error: unknown) => void
}

type ElementInserter<E extends Element> = {
	position?: InsertPosition
	create: (parent: E) => Element | null
	resolve?: (parent: E) => void
	reject?: (error: unknown) => void
}

type DangerouslySetInnerHTMLOptions = {
	shadowRootMode?: ShadowRootMode
	allowScripts?: boolean
}

/* === Internal Constants === */

const RESOLVE_ERROR = Symbol('RESOLVE_ERROR')

/* === Internal Functions === */

const resolveReactive = <
	T extends {},
	P extends ComponentProps,
	E extends Element = Component<P>,
>(
	reactive: Reactive<T, P, E>,
	host: Component<P>,
	target: E,
	context?: string,
): T | typeof RESOLVE_ERROR => {
	try {
		return isString(reactive)
			? (host.getSignal(reactive).get() as unknown as T)
			: isSignal(reactive)
				? reactive.get()
				: isFunction<T>(reactive)
					? reactive(target)
					: RESET
	} catch (error) {
		if (context) {
			log(
				error,
				`Failed to resolve value of ${valueString(reactive)} for ${context} in ${elementName(target)} in ${elementName(host)}`,
				LOG_ERROR,
			)
		}
		return RESOLVE_ERROR
	}
}

const getOperationDescription = (
	op: UpdateOperation,
	name: string = '',
): string => {
	const ops: Record<UpdateOperation, string> = {
		a: 'attribute ',
		c: 'class ',
		h: 'inner HTML',
		p: 'property ',
		s: 'style property ',
		t: 'text content',
	}
	return ops[op] + name
}

const createOperationHandlers = <P extends ComponentProps, E extends Element>(
	host: Component<P>,
	target: E,
	operationDesc: string,
	resolve?: (target: E) => void,
	reject?: (error: unknown) => void,
) => {
	const ok = (verb: string) => () => {
		if (DEV_MODE && host.debug) {
			log(
				target,
				`${verb} ${operationDesc} of ${elementName(target)} in ${elementName(host)}`,
			)
		}
		resolve?.(target)
	}

	const err = (verb: string) => (error: unknown) => {
		log(
			error,
			`Failed to ${verb} ${operationDesc} of ${elementName(target)} in ${elementName(host)}`,
			LOG_ERROR,
		)
		reject?.(error)
	}

	return { ok, err }
}

const createDedupeSymbol = (operation: string, identifier?: string): symbol => {
	return Symbol(identifier ? `${operation}:${identifier}` : operation)
}

const withReactiveValue = <T, P extends ComponentProps, E extends Element>(
	reactive: Reactive<T, P, E>,
	host: Component<P>,
	target: E,
	context: string,
	handler: (value: T) => void,
): Cleanup => {
	return effect(() => {
		const value = resolveReactive(reactive, host, target, context)
		if (value === RESOLVE_ERROR) return
		handler(value as T)
	})
}

const isSafeURL = (value: string): boolean => {
	if (/^(mailto|tel):/i.test(value)) return true
	if (value.includes('://')) {
		try {
			const url = new URL(value, window.location.origin)
			return ['http:', 'https:', 'ftp:'].includes(url.protocol)
		} catch {
			return false
		}
	}
	return true
}

const safeSetAttribute = (
	element: Element,
	attr: string,
	value: string,
): void => {
	if (/^on/i.test(attr)) throw new Error(`Unsafe attribute: ${attr}`)
	value = String(value).trim()
	if (!isSafeURL(value)) throw new Error(`Unsafe URL for ${attr}: ${value}`)
	element.setAttribute(attr, value)
}

/* === Exported Functions === */

/**
 * Core effect function for updating element properties based on reactive values.
 * This function handles the lifecycle of reading, updating, and deleting element properties
 * while providing proper error handling and debugging support.
 *
 * @since 0.9.0
 * @param {Reactive<T, P, E>} reactive - The reactive value that drives the element updates
 * @param {ElementUpdater<E, T>} updater - Configuration object defining how to read, update, and delete the element property
 * @returns {Effect<P, E>} Effect function that manages the element property updates
 */
const updateElement =
	<P extends ComponentProps, T extends {}, E extends Element = HTMLElement>(
		reactive: Reactive<T, P, E>,
		updater: ElementUpdater<E, T>,
	): Effect<P, E> =>
	(host: Component<P>, target: E): Cleanup => {
		const { op, name = '', read, update } = updater
		const fallback = read(target)
		const operationDesc = getOperationDescription(op, name)

		// If not yet set, set signal value to value read from DOM
		if (
			isString(reactive) &&
			isString(fallback) &&
			host[reactive] === RESET
		) {
			host.attributeChangedCallback(reactive, null, fallback)
		}

		const { ok, err } = createOperationHandlers(
			host,
			target,
			operationDesc,
			updater.resolve,
			updater.reject,
		)

		return effect(() => {
			const updateSymbol = createDedupeSymbol(op, name)
			const deleteSymbol = createDedupeSymbol(`${op}-delete`, name)

			const value = resolveReactive(reactive, host, target, operationDesc)
			if (value === RESOLVE_ERROR) return

			const resolvedValue =
				value === RESET
					? fallback
					: value === UNSET
						? updater.delete
							? null
							: fallback
						: value

			if (updater.delete && resolvedValue === null) {
				enqueue(() => {
					updater.delete!(target)
					return true
				}, deleteSymbol)
					.then(ok('Deleted'))
					.catch(err('delete'))
			} else if (resolvedValue != null) {
				const current = read(target)
				if (Object.is(resolvedValue, current)) return

				enqueue(() => {
					update(target, resolvedValue)
					return true
				}, updateSymbol)
					.then(ok('Updated'))
					.catch(err('update'))
			}
		})
	}

/**
 * Effect for dynamically inserting or removing elements based on a reactive numeric value.
 * Positive values insert elements, negative values remove them.
 *
 * @since 0.12.1
 * @param {Reactive<number, P, E>} reactive - Reactive value determining number of elements to insert (positive) or remove (negative)
 * @param {ElementInserter<E>} inserter - Configuration object defining how to create and position elements
 * @returns {Effect<P, E>} Effect function that manages element insertion and removal
 */
const insertOrRemoveElement =
	<P extends ComponentProps, E extends Element = HTMLElement>(
		reactive: Reactive<number, P, E>,
		inserter?: ElementInserter<E>,
	): Effect<P, E> =>
	(host: Component<P>, target: E) => {
		// Custom ok handler for insertOrRemoveElement
		const insertRemoveOk = (verb: string) => () => {
			if (DEV_MODE && host.debug) {
				log(
					target,
					`${verb} element in ${elementName(target)} in ${elementName(host)}`,
				)
			}
			if (isFunction(inserter?.resolve)) {
				inserter.resolve(target)
			} else {
				const signal = isSignal(reactive)
					? reactive
					: isString(reactive)
						? host.getSignal(reactive)
						: undefined
				if (isState<number>(signal)) signal.set(0)
			}
		}

		const insertRemoveErr = (verb: string) => (error: unknown) => {
			log(
				error,
				`Failed to ${verb} element in ${elementName(target)} in ${elementName(host)}`,
				LOG_ERROR,
			)
			inserter?.reject?.(error)
		}

		return effect(() => {
			const insertSymbol = createDedupeSymbol('insert')
			const removeSymbol = createDedupeSymbol('remove')

			const diff = resolveReactive(
				reactive,
				host,
				target,
				'insertion or deletion',
			)
			if (diff === RESOLVE_ERROR) return

			const resolvedDiff = diff === RESET ? 0 : diff

			if (resolvedDiff > 0) {
				// Positive diff => insert element
				if (!inserter) throw new TypeError(`No inserter provided`)
				enqueue(() => {
					for (let i = 0; i < resolvedDiff; i++) {
						const element = inserter.create(target)
						if (!element) continue
						target.insertAdjacentElement(
							inserter.position ?? 'beforeend',
							element,
						)
					}
					return true
				}, insertSymbol)
					.then(insertRemoveOk('Inserted'))
					.catch(insertRemoveErr('insert'))
			} else if (resolvedDiff < 0) {
				// Negative diff => remove element
				enqueue(() => {
					if (
						inserter &&
						(inserter.position === 'afterbegin' ||
							inserter.position === 'beforeend')
					) {
						for (let i = 0; i > resolvedDiff; i--) {
							if (inserter.position === 'afterbegin')
								target.firstElementChild?.remove()
							else target.lastElementChild?.remove()
						}
					} else {
						target.remove()
					}
					return true
				}, removeSymbol)
					.then(insertRemoveOk('Removed'))
					.catch(insertRemoveErr('remove'))
			}
		})
	}

/**
 * Effect for setting the text content of an element.
 * Replaces all child nodes (except comments) with a single text node.
 *
 * @since 0.8.0
 * @param {Reactive<string, P, E>} reactive - Reactive value bound to the text content
 * @returns {Effect<P, E>} Effect function that sets the text content of the element
 */
const setText = <P extends ComponentProps, E extends Element = HTMLElement>(
	reactive: Reactive<string, P, E>,
): Effect<P, E> =>
	updateElement(reactive, {
		op: 't',
		read: el => el.textContent,
		update: (el, value) => {
			Array.from(el.childNodes)
				.filter(node => node.nodeType !== Node.COMMENT_NODE)
				.forEach(node => node.remove())
			el.append(document.createTextNode(value))
		},
	})

/**
 * Effect for setting a property on an element.
 * Sets the specified property directly on the element object.
 *
 * @since 0.8.0
 * @param {K} key - Name of the property to set
 * @param {Reactive<E[K], P, E>} reactive - Reactive value bound to the property value (defaults to property name)
 * @returns {Effect<P, E>} Effect function that sets the property on the element
 */
const setProperty = <
	P extends ComponentProps,
	K extends keyof E,
	E extends Element = HTMLElement,
>(
	key: K,
	reactive: Reactive<E[K], P, E> = key as Reactive<E[K], P, E>,
): Effect<P, E> =>
	updateElement(reactive, {
		op: 'p',
		name: String(key),
		read: el => (key in el ? el[key] : UNSET),
		update: (el, value) => {
			el[key] = value
		},
	})

/**
 * Effect for controlling element visibility by setting the 'hidden' property.
 * When the reactive value is true, the element is shown; when false, it's hidden.
 *
 * @since 0.13.1
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the visibility state
 * @returns {Effect<P, E>} Effect function that controls element visibility
 */
const show = <P extends ComponentProps, E extends HTMLElement = HTMLElement>(
	reactive: Reactive<boolean, P, E>,
): Effect<P, E> =>
	updateElement(reactive, {
		op: 'p',
		name: 'hidden',
		read: el => !el.hidden,
		update: (el, value) => {
			el.hidden = !value
		},
	})

/**
 * Effect for setting an attribute on an element.
 * Sets the specified attribute with security validation for unsafe values.
 *
 * @since 0.8.0
 * @param {string} name - Name of the attribute to set
 * @param {Reactive<string, P, E>} reactive - Reactive value bound to the attribute value (defaults to attribute name)
 * @returns {Effect<P, E>} Effect function that sets the attribute on the element
 */
const setAttribute = <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	reactive: Reactive<string, P, E> = name,
): Effect<P, E> =>
	updateElement(reactive, {
		op: 'a',
		name,
		read: el => el.getAttribute(name),
		update: (el, value) => {
			safeSetAttribute(el, name, value)
		},
		delete: el => {
			el.removeAttribute(name)
		},
	})

/**
 * Effect for toggling a boolean attribute on an element.
 * When the reactive value is true, the attribute is present; when false, it's absent.
 *
 * @since 0.8.0
 * @param {string} name - Name of the attribute to toggle
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the attribute presence (defaults to attribute name)
 * @returns {Effect<P, E>} Effect function that toggles the attribute on the element
 */
const toggleAttribute = <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	reactive: Reactive<boolean, P, E> = name,
): Effect<P, E> =>
	updateElement(reactive, {
		op: 'a',
		name,
		read: el => el.hasAttribute(name),
		update: (el, value) => {
			el.toggleAttribute(name, value)
		},
	})

/**
 * Effect for toggling a CSS class token on an element.
 * When the reactive value is true, the class is added; when false, it's removed.
 *
 * @since 0.8.0
 * @param {string} token - CSS class token to toggle
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the class presence (defaults to class name)
 * @returns {Effect<P, E>} Effect function that toggles the class on the element
 */
const toggleClass = <P extends ComponentProps, E extends Element = HTMLElement>(
	token: string,
	reactive: Reactive<boolean, P, E> = token,
): Effect<P, E> =>
	updateElement(reactive, {
		op: 'c',
		name: token,
		read: el => el.classList.contains(token),
		update: (el, value) => {
			el.classList.toggle(token, value)
		},
	})

/**
 * Effect for setting a CSS style property on an element.
 * Sets the specified style property with support for deletion via UNSET.
 *
 * @since 0.8.0
 * @param {string} prop - Name of the CSS style property to set
 * @param {Reactive<string, P, E>} reactive - Reactive value bound to the style property value (defaults to property name)
 * @returns {Effect<P, E>} Effect function that sets the style property on the element
 */
const setStyle = <
	P extends ComponentProps,
	E extends HTMLElement | SVGElement | MathMLElement,
>(
	prop: string,
	reactive: Reactive<string, P, E> = prop,
): Effect<P, E> =>
	updateElement(reactive, {
		op: 's',
		name: prop,
		read: el => el.style.getPropertyValue(prop),
		update: (el, value) => {
			el.style.setProperty(prop, value)
		},
		delete: el => {
			el.style.removeProperty(prop)
		},
	})

/**
 * Effect for setting the inner HTML of an element with optional Shadow DOM support.
 * Provides security options for script execution and shadow root creation.
 *
 * @since 0.11.0
 * @param {Reactive<string, P, E>} reactive - Reactive value bound to the inner HTML content
 * @param {DangerouslySetInnerHTMLOptions} options - Configuration options: shadowRootMode, allowScripts
 * @returns {Effect<P, E>} Effect function that sets the inner HTML of the element
 */
const dangerouslySetInnerHTML = <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	reactive: Reactive<string, P, E>,
	options: DangerouslySetInnerHTMLOptions = {},
): Effect<P, E> =>
	updateElement(reactive, {
		op: 'h',
		read: el =>
			(el.shadowRoot || !options.shadowRootMode ? el : null)?.innerHTML ??
			'',
		update: (el, html) => {
			const { shadowRootMode, allowScripts } = options
			if (!html) {
				if (el.shadowRoot) el.shadowRoot.innerHTML = '<slot></slot>'
				return ''
			}
			if (shadowRootMode && !el.shadowRoot)
				el.attachShadow({ mode: shadowRootMode })
			const target = el.shadowRoot || el
			target.innerHTML = html
			if (!allowScripts) return ''
			target.querySelectorAll('script').forEach(script => {
				const newScript = document.createElement('script')
				newScript.appendChild(
					document.createTextNode(script.textContent ?? ''),
				)
				target.appendChild(newScript)
				script.remove()
			})
			return ' with scripts'
		},
	})

/**
 * Effect for attaching an event listener to an element.
 * Provides proper cleanup when the effect is disposed.
 *
 * @since 0.12.0
 * @param {K} type - Event type to listen for
 * @param {(event: HTMLElementEventType<K>) => void} listener - Event listener function
 * @param {boolean | AddEventListenerOptions} options - Event listener options
 * @returns {Effect<ComponentProps, E>} Effect function that manages the event listener
 * @throws {TypeError} When the provided handler is not a function
 */
const on =
	<E extends HTMLElement, K extends ValidEventName>(
		type: K,
		listener: (event: HTMLElementEventType<K>) => void,
		options: boolean | AddEventListenerOptions = false,
	): Effect<ComponentProps, E> =>
	<P extends ComponentProps>(
		host: Component<P>,
		target: E = host as unknown as E,
	): Cleanup => {
		if (!isFunction(listener))
			throw new TypeError(
				`Invalid event listener provided for "${type} event on element ${elementName(target)}`,
			)
		target.addEventListener(type, listener, options)
		return () => target.removeEventListener(type, listener)
	}

/**
 * Effect for emitting custom events with reactive detail values.
 * Creates and dispatches CustomEvent instances with bubbling enabled by default.
 *
 * @since 0.13.2
 * @param {string} type - Event type to emit
 * @param {Reactive<T, P, E>} reactive - Reactive value bound to the event detail
 * @returns {Effect<P, E>} Effect function that emits custom events
 */
const emit =
	<T, P extends ComponentProps, E extends Element = HTMLElement>(
		type: string,
		reactive: Reactive<T, P, E>,
	): Effect<P, E> =>
	(host: Component<P>, target: E = host as unknown as E): Cleanup =>
		withReactiveValue(
			reactive,
			host,
			target,
			`custom event "${type}" detail`,
			detail => {
				if (detail === RESET || detail === UNSET) return
				target.dispatchEvent(
					new CustomEvent(type, {
						detail,
						bubbles: true,
					}),
				)
			},
		)

/**
 * Effect for passing reactive values to descendant elements.
 * Supports both direct property setting and signal passing for custom elements.
 *
 * @since 0.13.2
 * @param {PassedReactives<P, E> | ((target: E) => PassedReactives<P, E>)} reactives - Reactive values to pass or function that returns them
 * @returns {Effect<P, E>} Effect function that passes reactive values to descendant elements
 * @throws {TypeError} When the provided reactives are not an object or provider function
 */
const pass =
	<P extends ComponentProps, E extends Element>(
		reactives:
			| PassedReactives<P, E>
			| ((target: E) => PassedReactives<P, E>),
	): Effect<P, E> =>
	(host: Component<P>, target: E): Cleanup | void => {
		const sources = isFunction<PassedReactives<P, E>>(reactives)
			? reactives(target)
			: reactives
		if (!isDefinedObject(sources))
			throw new TypeError(
				`Passed signals must be an object or a provider function`,
			)

		const setProperties = () =>
			effect(() => {
				for (const [prop, source] of Object.entries(sources)) {
					const value = resolveReactive<
						NonNullable<E[keyof E]>,
						P,
						E
					>(source, host, target, `signal ${prop}`)
					if (value === RESOLVE_ERROR) {
						throw new Error(
							`Failed to resolve signal ${prop} for ${elementName(target)}`,
						)
					}
					if (value == null || value === RESET) continue
					target[prop as keyof E] = value
				}
			})
		if (!isCustomElement(target)) return setProperties()
		customElements
			.whenDefined(target.localName)
			.then(() => {
				if (!hasMethod(target, 'setSignal')) return setProperties()
				for (const [prop, source] of Object.entries(sources)) {
					target.setSignal(
						prop,
						isString(source)
							? host.getSignal(source)
							: toSignal(source),
					)
				}
			})
			.catch(error => {
				throw new Error(
					`Failed to pass signals to ${elementName(target)}`,
					{ cause: error },
				)
			})
	}

/* === Exports === */

export {
	type Reactive,
	type PassedReactives,
	type UpdateOperation,
	type ElementUpdater,
	type ElementInserter,
	type DangerouslySetInnerHTMLOptions,
	updateElement,
	insertOrRemoveElement,
	setText,
	setProperty,
	show,
	setAttribute,
	toggleAttribute,
	toggleClass,
	setStyle,
	dangerouslySetInnerHTML,
	on,
	emit,
	pass,
}

import {
	type Cleanup,
	effect,
	enqueue,
	isFunction,
	isSignal,
	isState,
	toSignal,
	UNSET,
} from '@zeix/cause-effect'

import type { Component, ComponentProps } from '../component'
import {
	type Effect,
	RESET,
	type Reactive,
	resolveReactive,
} from '../core/reactive'
import {
	DEV_MODE,
	elementName,
	hasMethod,
	isCustomElement,
	isDefinedObject,
	isString,
	LOG_ERROR,
	log,
} from '../core/util'

/* === Types === */

type Reactives<E extends Element, P extends ComponentProps> = {
	[K in keyof E]?: Reactive<E[K], P, E>
}

type UpdateOperation = 'a' | 'c' | 'd' | 'h' | 'm' | 'p' | 's' | 't'

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

/* === Internal Functions === */

const getOperationDescription = (
	op: UpdateOperation,
	name: string = '',
): string => {
	const ops: Record<UpdateOperation, string> = {
		a: 'attribute ',
		c: 'class ',
		d: 'dataset ',
		h: 'inner HTML',
		m: 'method call ',
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
	(host, target): Cleanup => {
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

		return effect((): undefined => {
			const updateSymbol = Symbol(name ? `${op}:${name}` : op)

			const value = resolveReactive(reactive, host, target, operationDesc)
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
				}, updateSymbol)
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
	(host, target) => {
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

		return effect((): undefined => {
			const insertSymbol = Symbol('i')
			const removeSymbol = Symbol('r')

			const diff = resolveReactive(
				reactive,
				host,
				target,
				'insertion or deletion',
			)
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
	K extends keyof E & string,
	E extends Element = HTMLElement,
>(
	key: K,
	reactive: Reactive<E[K], P, E> = key as Reactive<E[K], P, E>,
): Effect<P, E> =>
	updateElement(reactive, {
		op: 'p',
		name: key,
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
 * Effect for calling a method on an element.
 *
 * @since 0.13.3
 * @param {K} methodName - Name of the method to call
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the method call
 * @param {unknown[]} args - Arguments to pass to the method
 * @returns Effect function that calls the method on the element
 */
const callMethod = <
	P extends ComponentProps,
	K extends keyof E,
	E extends HTMLElement = HTMLElement,
>(
	methodName: K,
	reactive: Reactive<boolean, P, E>,
	args?: unknown[],
): Effect<P, E> =>
	updateElement(reactive, {
		op: 'm',
		name: String(methodName),
		read: () => null,
		update: (el, value) => {
			if (value && hasMethod(el, methodName)) {
				if (args) el[methodName](...args)
				else el[methodName]()
			}
		},
	})

/**
 * Effect for controlling element focus by calling the 'focus()' method.
 * If the reactive value is true, element will be focussed; when false, nothing happens.
 *
 * @since 0.13.3
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the focus state
 * @returns {Effect<P, E>} Effect function that sets element focus
 */
const focus = <P extends ComponentProps, E extends HTMLElement = HTMLElement>(
	reactive: Reactive<boolean, P, E>,
): Effect<P, E> =>
	updateElement(reactive, {
		op: 'm',
		name: 'focus',
		read: el => el === document.activeElement,
		update: (el, value) => {
			if (value && hasMethod(el, 'focus')) el.focus()
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
	E extends HTMLElement | SVGElement | MathMLElement = HTMLElement,
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
 * Effect for passing reactive values to a descendant UIElement component.
 *
 * @since 0.13.3
 * @param {Reactives<Component<Q>, P>} reactives - Reactive values to pass
 * @returns {Effect<P, E>} Effect function that passes reactive values to the descendant component
 * @throws {TypeError} When the provided reactives are not an object or the target is not a UIElement component
 * @throws {Error} When passing signals failed for some other reason
 */
const pass =
	<P extends ComponentProps, Q extends ComponentProps>(
		reactives: Reactives<Component<Q>, P>,
	): Effect<P, Component<Q>> =>
	(host, target): Cleanup | void => {
		if (!isDefinedObject(reactives))
			throw new TypeError(`Reactives must be an object of passed signals`)
		if (!isCustomElement(target))
			throw new TypeError(
				`Target ${elementName(target)} is not a custom element`,
			)
		/* customElements
			.whenDefined(target.localName)
			.then(() => { */
		if (!hasMethod(target, 'setSignal'))
			throw new TypeError(
				`Target ${elementName(target)} is not a UIElement component`,
			)
		for (const [prop, reactive] of Object.entries(reactives)) {
			target.setSignal(
				prop,
				isString(reactive)
					? host.getSignal(reactive)
					: toSignal(reactive),
			)
		}
		/* })
			.catch(error => {
				throw new Error(
					`Failed to pass signals to ${elementName(target)}`,
					{ cause: error },
				)
			}) */
	}

/* === Exports === */

export {
	type Reactives,
	type UpdateOperation,
	type ElementUpdater,
	type ElementInserter,
	type DangerouslySetInnerHTMLOptions,
	updateElement,
	insertOrRemoveElement,
	setText,
	setProperty,
	show,
	callMethod,
	focus,
	setAttribute,
	toggleAttribute,
	toggleClass,
	setStyle,
	dangerouslySetInnerHTML,
	pass,
}

import { type Signal } from '@zeix/cause-effect'
import { type ComponentProps, type Effect } from '../component'
import type { HTMLElementEventType, ValidEventName } from '../core/dom'
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
/**
 * Effect for setting properties of a target element according to a given Reactive
 *
 * @since 0.9.0
 * @param {Reactive<T, P, E>} s - Reactive bound to the element property
 * @param {ElementUpdater} updater - Updater object containing key, read, update, and delete methods
 * @returns {Effect<P, E>} Effect function that updates the element properties
 */
declare const updateElement: <
	P extends ComponentProps,
	T extends {},
	E extends Element = HTMLElement,
>(
	s: Reactive<T, P, E>,
	updater: ElementUpdater<E, T>,
) => Effect<P, E>
/**
 * Effect for inserting or removing elements according to a given Reactive
 *
 * @since 0.12.1
 * @param {Reactive<number, P, E>} s - Reactive bound to the number of elements to insert (positive) or remove (negative)
 * @param {ElementInserter<E>} inserter - Inserter object containing position, insert, and remove methods
 * @returns {Effect<P, E>} - Effect function that inserts or removes elements
 */
declare const insertOrRemoveElement: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	s: Reactive<number, P, E>,
	inserter?: ElementInserter<E>,
) => Effect<P, E>
/**
 * Set text content of an element
 *
 * @since 0.8.0
 * @param {Reactive<string, P, E>} s - Reactive bound to the text content
 * @returns {Effect<P, E>} An effect function that sets the text content of the element
 */
declare const setText: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	s: Reactive<string, P, E>,
) => Effect<P, E>
/**
 * Set property of an element
 *
 * @since 0.8.0
 * @param {string} key - Name of property to be set
 * @param {Reactive<E[K], P, E>} s - Reactive bound to the property value
 * @returns {Effect<P, E>} An effect function that sets the property of the element
 */
declare const setProperty: <
	P extends ComponentProps,
	K extends keyof E,
	E extends Element = HTMLElement,
>(
	key: K,
	s?: Reactive<E[K], P, E>,
) => Effect<P, E>
/**
 * Set 'hidden' property of an element
 *
 * @since 0.13.1
 * @param {Reactive<boolean, P, E>} s - Reactive bound to the 'hidden' property value
 * @returns {Effect<P, E>} An effect function that sets the 'hidden' property of the element
 */
declare const show: <
	P extends ComponentProps,
	E extends HTMLElement = HTMLElement,
>(
	s: Reactive<boolean, P, E>,
) => Effect<P, E>
/**
 * Set attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - Name of attribute to be set
 * @param {Reactive<string, P, E>} s - Reactive bound to the attribute value
 * @returns {Effect<P, E>} An effect function that sets the attribute of the element
 */
declare const setAttribute: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	s?: Reactive<string, P, E>,
) => Effect<P, E>
/**
 * Toggle a boolean attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - Name of attribute to be toggled
 * @param {Reactive<boolean, P, E>} s - Reactive bound to the attribute existence
 * @returns {Effect<P, E>} An effect function that toggles the attribute of the element
 */
declare const toggleAttribute: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	s?: Reactive<boolean, P, E>,
) => Effect<P, E>
/**
 * Toggle a classList token of an element
 *
 * @since 0.8.0
 * @param {string} token - Class token to be toggled
 * @param {Reactive<boolean, P, E>} s - Reactive bound to the class existence
 * @returns {Effect<P, E>} An effect function that toggles the classList token of the element
 */
declare const toggleClass: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	token: string,
	s?: Reactive<boolean, P, E>,
) => Effect<P, E>
/**
 * Set a style property of an element
 *
 * @since 0.8.0
 * @param {string} prop - Name of style property to be set
 * @param {Reactive<string, P, E>} s - Reactive bound to the style property value
 * @returns {Effect<P, E>} An effect function that sets the style property of the element
 */
declare const setStyle: <
	P extends ComponentProps,
	E extends HTMLElement | SVGElement | MathMLElement,
>(
	prop: string,
	s?: Reactive<string, P, E>,
) => Effect<P, E>
/**
 * Set inner HTML of an element
 *
 * @since 0.11.0
 * @param {Reactive<string, P, E>} s - Reactive bound to the inner HTML
 * @param {DangerouslySetInnerHTMLOptions} options - Options for setting inner HTML: shadowRootMode, allowScripts
 * @returns {Effect<P, E>} An effect function that sets the inner HTML of the element
 */
declare const dangerouslySetInnerHTML: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	s: Reactive<string, P, E>,
	options?: DangerouslySetInnerHTMLOptions,
) => Effect<P, E>
/**
 * Attach an event listener to an element
 *
 * @since 0.12.0
 * @param {K} type - event type to listen for
 * @param {(event: HTMLElementEventType<K>) => void} listener - event listener
 * @param {boolean | AddEventListenerOptions} options - event listener options
 * @throws {TypeError} - if the provided handler is not an event listener or a provider function
 */
declare const on: <E extends HTMLElement, K extends ValidEventName>(
	type: K,
	listener: (event: HTMLElementEventType<K>) => void,
	options?: boolean | AddEventListenerOptions,
) => Effect<ComponentProps, E>
/**
 * Emit a custom event with the given detail
 *
 * @since 0.13.2
 * @param {string} type - Event type to emit
 * @param {Reactive<T, P, E>} s - State bound to event detail
 * @returns {Effect<P, E>} Effect function
 */
declare const emit: <
	T,
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	type: string,
	s: Reactive<T, P, E>,
) => Effect<P, E>
/**
 * Pass reactives to a descendent element
 *
 * @since 0.13.2
 * @param {PassedReactives<P, E> | ((target: E) => PassedReactives<P, E>)} reactives - Reactives to be passed to descendent element
 * @returns {Effect<P, E>} An effect function that passes the reactives to the descendent element
 * @throws {TypeError} If the provided signals are not an object or a provider function
 */
declare const pass: <P extends ComponentProps, E extends Element>(
	reactives: PassedReactives<P, E> | ((target: E) => PassedReactives<P, E>),
) => Effect<P, E>
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

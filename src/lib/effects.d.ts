import { type Signal } from '@zeix/cause-effect'
import { type ComponentProps, type FxFunction } from '../component'
type SignalLike<P extends ComponentProps, T, E extends Element = HTMLElement> =
	| keyof P
	| Signal<NonNullable<T>>
	| ((element: E) => T | null | undefined)
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
 * Effect for setting properties of a target element according to a given SignalLike
 *
 * @since 0.9.0
 * @param {SignalLike<T>} s - state bound to the element property
 * @param {ElementUpdater} updater - updater object containing key, read, update, and delete methods
 */
declare const updateElement: <
	P extends ComponentProps,
	T extends {},
	E extends Element = HTMLElement,
>(
	s: SignalLike<P, T, E>,
	updater: ElementUpdater<E, T>,
) => FxFunction<P, E>
/**
 * Effect for inserting or removing elements according to a given SignalLike
 *
 * @since 0.12.1
 * @param {SignalLike<P, E, number>} s - state bound to the number of elements to insert (positive) or remove (negative)
 * @param {ElementInserter<E>} inserter - inserter object containing position, insert, and remove methods
 */
declare const insertOrRemoveElement: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	s: SignalLike<P, number, E>,
	inserter?: ElementInserter<E>,
) => FxFunction<P, E>
/**
 * Set text content of an element
 *
 * @since 0.8.0
 * @param {SignalLike<string>} s - state bound to the text content
 */
declare const setText: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	s: SignalLike<P, string, E>,
) => FxFunction<P, E>
/**
 * Set property of an element
 *
 * @since 0.8.0
 * @param {string} key - name of property to be set
 * @param {SignalLike<E[K]>} s - state bound to the property value
 */
declare const setProperty: <
	P extends ComponentProps,
	K extends keyof E,
	E extends Element = HTMLElement,
>(
	key: K,
	s?: SignalLike<P, E[K], E>,
) => FxFunction<P, E>
/**
 * Set 'hidden' property of an element
 *
 * @since 0.13.1
 * @param {SignalLike<boolean>} s - state bound to the 'hidden' property value
 */
declare const show: <
	P extends ComponentProps,
	E extends HTMLElement = HTMLElement,
>(
	s: SignalLike<P, boolean, E>,
) => FxFunction<P, E>
/**
 * Set attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {SignalLike<string>} s - state bound to the attribute value
 */
declare const setAttribute: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	s?: SignalLike<P, string, E>,
) => FxFunction<P, E>
/**
 * Toggle a boolan attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {SignalLike<boolean>} s - state bound to the attribute existence
 */
declare const toggleAttribute: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	s?: SignalLike<P, boolean, E>,
) => FxFunction<P, E>
/**
 * Toggle a classList token of an element
 *
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {SignalLike<boolean>} s - state bound to the class existence
 */
declare const toggleClass: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	token: string,
	s?: SignalLike<P, boolean, E>,
) => FxFunction<P, E>
/**
 * Set a style property of an element
 *
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {SignalLike<string>} s - state bound to the style property value
 */
declare const setStyle: <
	P extends ComponentProps,
	E extends HTMLElement | SVGElement | MathMLElement,
>(
	prop: string,
	s?: SignalLike<P, string, E>,
) => FxFunction<P, E>
/**
 * Set inner HTML of an element
 *
 * @since 0.11.0
 * @param {SignalLike<string>} s - state bound to the inner HTML
 * @param {DangerouslySetInnerHTMLOptions} options - options for setting inner HTML: shadowRootMode, allowScripts
 */
declare const dangerouslySetInnerHTML: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	s: SignalLike<P, string, E>,
	options?: DangerouslySetInnerHTMLOptions,
) => FxFunction<P, E>
export {
	type SignalLike,
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
}

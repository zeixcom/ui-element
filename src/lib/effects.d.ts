import { type Signal } from '@zeix/cause-effect'
import { type Component, type ComponentProps, type Effect } from '../component'
import type { EventType } from '../core/dom'
type Reactive<T, P extends ComponentProps, E extends Element = HTMLElement> =
	| keyof P
	| Signal<NonNullable<T>>
	| ((element: E) => T | null | undefined)
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
declare const updateElement: <
	P extends ComponentProps,
	T extends {},
	E extends Element = HTMLElement,
>(
	reactive: Reactive<T, P, E>,
	updater: ElementUpdater<E, T>,
) => Effect<P, E>
/**
 * Effect for dynamically inserting or removing elements based on a reactive numeric value.
 * Positive values insert elements, negative values remove them.
 *
 * @since 0.12.1
 * @param {Reactive<number, P, E>} reactive - Reactive value determining number of elements to insert (positive) or remove (negative)
 * @param {ElementInserter<E>} inserter - Configuration object defining how to create and position elements
 * @returns {Effect<P, E>} Effect function that manages element insertion and removal
 */
declare const insertOrRemoveElement: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	reactive: Reactive<number, P, E>,
	inserter?: ElementInserter<E>,
) => Effect<P, E>
/**
 * Effect for setting the text content of an element.
 * Replaces all child nodes (except comments) with a single text node.
 *
 * @since 0.8.0
 * @param {Reactive<string, P, E>} reactive - Reactive value bound to the text content
 * @returns {Effect<P, E>} Effect function that sets the text content of the element
 */
declare const setText: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	reactive: Reactive<string, P, E>,
) => Effect<P, E>
/**
 * Effect for setting a property on an element.
 * Sets the specified property directly on the element object.
 *
 * @since 0.8.0
 * @param {K} key - Name of the property to set
 * @param {Reactive<E[K], P, E>} reactive - Reactive value bound to the property value (defaults to property name)
 * @returns {Effect<P, E>} Effect function that sets the property on the element
 */
declare const setProperty: <
	P extends ComponentProps,
	K extends keyof E,
	E extends Element = HTMLElement,
>(
	key: K,
	reactive?: Reactive<E[K], P, E>,
) => Effect<P, E>
/**
 * Effect for controlling element visibility by setting the 'hidden' property.
 * When the reactive value is true, the element is shown; when false, it's hidden.
 *
 * @since 0.13.1
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the visibility state
 * @returns {Effect<P, E>} Effect function that controls element visibility
 */
declare const show: <
	P extends ComponentProps,
	E extends HTMLElement = HTMLElement,
>(
	reactive: Reactive<boolean, P, E>,
) => Effect<P, E>
/**
 * Effect for calling a method on an element.
 *
 * @since 0.13.3
 * @param {K} methodName - Name of the method to call
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the method call
 * @param {unknown[]} args - Arguments to pass to the method
 * @returns Effect function that calls the method on the element
 */
declare const callMethod: <
	P extends ComponentProps,
	K extends keyof E,
	E extends HTMLElement = HTMLElement,
>(
	methodName: K,
	reactive: Reactive<boolean, P, E>,
	args?: unknown[],
) => Effect<P, E>
/**
 * Effect for controlling element focus by calling the 'focus()' method.
 * If the reactive value is true, element will be focussed; when false, nothing happens.
 *
 * @since 0.13.3
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the focus state
 * @returns {Effect<P, E>} Effect function that sets element focus
 */
declare const focus: <
	P extends ComponentProps,
	E extends HTMLElement = HTMLElement,
>(
	reactive: Reactive<boolean, P, E>,
) => Effect<P, E>
/**
 * Effect for setting an attribute on an element.
 * Sets the specified attribute with security validation for unsafe values.
 *
 * @since 0.8.0
 * @param {string} name - Name of the attribute to set
 * @param {Reactive<string, P, E>} reactive - Reactive value bound to the attribute value (defaults to attribute name)
 * @returns {Effect<P, E>} Effect function that sets the attribute on the element
 */
declare const setAttribute: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	reactive?: Reactive<string, P, E>,
) => Effect<P, E>
/**
 * Effect for toggling a boolean attribute on an element.
 * When the reactive value is true, the attribute is present; when false, it's absent.
 *
 * @since 0.8.0
 * @param {string} name - Name of the attribute to toggle
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the attribute presence (defaults to attribute name)
 * @returns {Effect<P, E>} Effect function that toggles the attribute on the element
 */
declare const toggleAttribute: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	name: string,
	reactive?: Reactive<boolean, P, E>,
) => Effect<P, E>
/**
 * Effect for toggling a CSS class token on an element.
 * When the reactive value is true, the class is added; when false, it's removed.
 *
 * @since 0.8.0
 * @param {string} token - CSS class token to toggle
 * @param {Reactive<boolean, P, E>} reactive - Reactive value bound to the class presence (defaults to class name)
 * @returns {Effect<P, E>} Effect function that toggles the class on the element
 */
declare const toggleClass: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	token: string,
	reactive?: Reactive<boolean, P, E>,
) => Effect<P, E>
/**
 * Effect for setting a CSS style property on an element.
 * Sets the specified style property with support for deletion via UNSET.
 *
 * @since 0.8.0
 * @param {string} prop - Name of the CSS style property to set
 * @param {Reactive<string, P, E>} reactive - Reactive value bound to the style property value (defaults to property name)
 * @returns {Effect<P, E>} Effect function that sets the style property on the element
 */
declare const setStyle: <
	P extends ComponentProps,
	E extends HTMLElement | SVGElement | MathMLElement,
>(
	prop: string,
	reactive?: Reactive<string, P, E>,
) => Effect<P, E>
/**
 * Effect for setting the inner HTML of an element with optional Shadow DOM support.
 * Provides security options for script execution and shadow root creation.
 *
 * @since 0.11.0
 * @param {Reactive<string, P, E>} reactive - Reactive value bound to the inner HTML content
 * @param {DangerouslySetInnerHTMLOptions} options - Configuration options: shadowRootMode, allowScripts
 * @returns {Effect<P, E>} Effect function that sets the inner HTML of the element
 */
declare const dangerouslySetInnerHTML: <
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	reactive: Reactive<string, P, E>,
	options?: DangerouslySetInnerHTMLOptions,
) => Effect<P, E>
/**
 * Effect for attaching an event listener to an element.
 * Provides proper cleanup when the effect is disposed.
 *
 * @since 0.12.0
 * @param {string} type - Event type
 * @param {(event: EventType<K>) => void} listener - Event listener function
 * @param {AddEventListenerOptions | boolean} options - Event listener options
 * @returns {Effect<ComponentProps, E>} Effect function that manages the event listener
 */
declare const on: <
	K extends keyof HTMLElementEventMap | string,
	E extends HTMLElement,
>(
	type: K,
	listener: (event: EventType<K>) => void,
	options?: AddEventListenerOptions | boolean,
) => Effect<ComponentProps, E>
/**
 * Effect for emitting custom events with reactive detail values.
 * Creates and dispatches CustomEvent instances with bubbling enabled by default.
 *
 * @since 0.13.3
 * @param {string} type - Event type to emit
 * @param {Reactive<T, P, E>} reactive - Reactive value bound to the event detail
 * @returns {Effect<P, E>} Effect function that emits custom events
 */
declare const emitEvent: <
	T,
	P extends ComponentProps,
	E extends Element = HTMLElement,
>(
	type: string,
	reactive: Reactive<T, P, E>,
) => Effect<P, E>
/**
 * Effect for passing reactive values to descendant elements.
 * Supports both direct property setting and signal passing for custom elements.
 *
 * @since 0.13.2
 * @param {Reactives<P, E>} reactives - Reactive values to pass or function that returns them
 * @returns {Effect<P, E>} Effect function that passes reactive values to descendant elements
 * @throws {TypeError} When the provided reactives are not an object or the target is not a UIElement component
 * @throws {Error}
 */
declare const pass: <P extends ComponentProps, Q extends ComponentProps>(
	reactives: Reactives<Component<Q>, P>,
) => Effect<P, Component<Q>>
export {
	type Reactive,
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
	on,
	emitEvent,
	pass,
}

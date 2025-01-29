import type { UIElement } from '../ui-element';
type ElementUpdater<E extends Element, T> = {
    r: (element: E) => T | null;
    u: (element: E, value: T) => void;
    d?: (element: E) => void;
};
type StateKeyOrFunction<T> = PropertyKey | ((v?: T | null) => T);
/**
 * Auto-Effect to emit a custom event when a state changes
 *
 * @since 0.8.3
 * @param {string} event - event name to dispatch
 * @param {StateKeyOrFunction<T>} s - state key or function
 */
declare const emit: <E extends Element, T>(event: string, s?: StateKeyOrFunction<T>) => (host: UIElement, target: E) => void;
/**
 * Auto-effect for setting properties of a target element according to a given state
 *
 * @since 0.9.0
 * @param {StateKeyOrFunction<T>} s - state bound to the element property
 * @param {ElementUpdater} updater - updater object containing key, read, update, and delete methods
 */
declare const updateElement: <E extends Element, T>(s: StateKeyOrFunction<T>, updater: ElementUpdater<E, T>) => (host: UIElement, target: E) => void;
/**
 * Create an element with a given tag name and optionally set its attributes
 *
 * @since 0.9.0
 * @param {string} tag - tag name of the element to create
 * @param {StateKeyOrFunction<Record<string, string>>} s - state bound to the element's attributes
 */
declare const createElement: (tag: string, s: StateKeyOrFunction<Record<string, string>>, text?: string) => (host: UIElement, target: Element) => void;
/**
 * Remove an element from the DOM
 *
 * @since 0.9.0
 * @param {StateKeyOrFunction<boolean>} s - state bound to the element removal
 */
declare const removeElement: (s: StateKeyOrFunction<boolean>) => (host: UIElement, target: Element) => void;
/**
 * Set text content of an element
 *
 * @since 0.8.0
 * @param {StateKeyOrFunction<string>} s - state bound to the text content
 */
declare const setText: (s: StateKeyOrFunction<string>) => (host: UIElement, target: Element) => void;
/**
 * Set property of an element
 *
 * @since 0.8.0
 * @param {PropertyKey} key - name of property to be set
 * @param {StateKeyOrFunction<unknown>} s - state bound to the property value
 */
declare const setProperty: (key: PropertyKey, s?: StateKeyOrFunction<unknown>) => (host: UIElement, target: Element) => void;
/**
 * Set attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {StateKeyOrFunction<string>} s - state bound to the attribute value
 */
declare const setAttribute: (name: string, s?: StateKeyOrFunction<string>) => (host: UIElement, target: Element) => void;
/**
 * Toggle a boolan attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {StateKeyOrFunction<boolean>} s - state bound to the attribute existence
 */
declare const toggleAttribute: (name: string, s?: StateKeyOrFunction<boolean>) => (host: UIElement, target: Element) => void;
/**
 * Toggle a classList token of an element
 *
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {StateKeyOrFunction<boolean>} s - state bound to the class existence
 */
declare const toggleClass: (token: string, s?: StateKeyOrFunction<boolean>) => (host: UIElement, target: Element) => void;
/**
 * Set a style property of an element
 *
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {StateKeyOrFunction<string>} s - state bound to the style property value
 */
declare const setStyle: <E extends (HTMLElement | SVGElement | MathMLElement)>(prop: string, s?: StateKeyOrFunction<string>) => (host: UIElement, target: E) => void;
export { type ElementUpdater, emit, updateElement, createElement, removeElement, setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle };

import { type Signal, type Cleanup } from '@zeix/cause-effect';
import { type ComponentProps, type Component } from '../component';
type SignalLike<P extends ComponentProps, E extends Element, T> = keyof P | Signal<NonNullable<T>> | ((element: E) => T | null | undefined);
type UpdateOperation = 'a' | 'c' | 'h' | 'p' | 's' | 't';
type ElementUpdater<E extends Element, T> = {
    op: UpdateOperation;
    name?: string;
    read: (element: E) => T | null;
    update: (element: E, value: T) => void;
    delete?: (element: E) => void;
    resolve?: (element: E) => void;
    reject?: (error: unknown) => void;
};
type ElementInserter<E extends Element> = {
    position?: InsertPosition;
    create: (parent: E) => Element | null;
    resolve?: (parent: E) => void;
    reject?: (error: unknown) => void;
};
/**
 * Effect for setting properties of a target element according to a given SignalLike
 *
 * @since 0.9.0
 * @param {SignalLike<T>} s - state bound to the element property
 * @param {ElementUpdater} updater - updater object containing key, read, update, and delete methods
 */
declare const updateElement: <P extends ComponentProps, E extends Element, T extends {}>(s: SignalLike<P, E, T>, updater: ElementUpdater<E, T>) => (host: Component<P>, target: E) => Cleanup;
/**
 * Effect for inserting or removing elements according to a given SignalLike
 *
 * @since 0.12.1
 * @param {SignalLike<P, E, number>} s - state bound to the number of elements to insert (positive) or remove (negative)
 * @param {ElementInserter<E>} inserter - inserter object containing position, insert, and remove methods
 */
declare const insertOrRemoveElement: <P extends ComponentProps, E extends Element>(s: SignalLike<P, E, number>, inserter?: ElementInserter<E>) => (host: Component<P>, target: E) => Cleanup;
/**
 * Set text content of an element
 *
 * @since 0.8.0
 * @param {SignalLike<string>} s - state bound to the text content
 */
declare const setText: <P extends ComponentProps, E extends Element>(s: SignalLike<P, E, string>) => (host: Component<P>, target: E) => Cleanup;
/**
 * Set property of an element
 *
 * @since 0.8.0
 * @param {string} key - name of property to be set
 * @param {SignalLike<E[K]>} s - state bound to the property value
 */
declare const setProperty: <P extends ComponentProps, E extends Element, K extends keyof E>(key: K, s?: SignalLike<P, E, E[K]>) => (host: Component<P>, target: E) => Cleanup;
/**
 * Set attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {SignalLike<string>} s - state bound to the attribute value
 */
declare const setAttribute: <P extends ComponentProps, E extends Element>(name: string, s?: SignalLike<P, E, string>) => (host: Component<P>, target: E) => Cleanup;
/**
 * Toggle a boolan attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {SignalLike<boolean>} s - state bound to the attribute existence
 */
declare const toggleAttribute: <P extends ComponentProps, E extends Element>(name: string, s?: SignalLike<P, E, boolean>) => (host: Component<P>, target: E) => Cleanup;
/**
 * Toggle a classList token of an element
 *
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {SignalLike<boolean>} s - state bound to the class existence
 */
declare const toggleClass: <P extends ComponentProps, E extends Element>(token: string, s?: SignalLike<P, E, boolean>) => (host: Component<P>, target: E) => Cleanup;
/**
 * Set a style property of an element
 *
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {SignalLike<string>} s - state bound to the style property value
 */
declare const setStyle: <P extends ComponentProps, E extends HTMLElement | SVGElement | MathMLElement>(prop: string, s?: SignalLike<P, E, string>) => (host: Component<P>, target: E) => Cleanup;
/**
 * Set inner HTML of an element
 *
 * @since 0.11.0
 * @param {SignalLike<string>} s - state bound to the inner HTML
 * @param {'open' | 'closed'} [attachShadow] - whether to attach a shadow root to the element, expects mode 'open' or 'closed'
 * @param {boolean} [allowScripts] - whether to allow executable script tags in the HTML content, defaults to false
 */
declare const dangerouslySetInnerHTML: <P extends ComponentProps, E extends Element>(s: SignalLike<P, E, string>, attachShadow?: "open" | "closed", allowScripts?: boolean) => (host: Component<P>, target: E) => Cleanup;
export { type SignalLike, type UpdateOperation, type ElementUpdater, type ElementInserter, updateElement, insertOrRemoveElement, setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle, dangerouslySetInnerHTML, };

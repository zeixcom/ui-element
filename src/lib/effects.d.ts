import { UIElement, type ComponentSignals } from '../ui-element';
import type { SignalLike } from '../core/ui';
import { type LogLevel } from '../core/log';
type ElementUpdater<E extends Element, T> = {
    read: (element: E) => T | null;
    update: (element: E, value: T) => void;
    delete?: (element: E) => void;
};
/**
 * Effect for setting properties of a target element according to a given state
 *
 * @since 0.9.0
 * @param {SignalLike<T>} s - state bound to the element property
 * @param {ElementUpdater} updater - updater object containing key, read, update, and delete methods
 */
declare const updateElement: <E extends Element, T extends {}, S extends ComponentSignals = {}>(s: SignalLike<T>, updater: ElementUpdater<E, T>) => (host: UIElement<S>, target: E) => void;
/**
 * Create an element with a given tag name and optionally set its attributes
 *
 * @since 0.9.0
 * @param {string} tag - tag name of the element to create
 * @param {SignalLike<Record<string, string>>} s - state bound to the element's attributes
 */
declare const createElement: (tag: string, s: SignalLike<Record<string, string>>, text?: string) => (host: UIElement<{}>, target: Element) => void;
/**
 * Remove an element from the DOM
 *
 * @since 0.9.0
 * @param {SignalLike<string>} s - state bound to the element removal
 */
declare const removeElement: <E extends Element>(s: SignalLike<boolean>) => (host: UIElement<{}>, target: E) => void;
/**
 * Set text content of an element
 *
 * @since 0.8.0
 * @param {SignalLike<string>} s - state bound to the text content
 */
declare const setText: <E extends Element>(s: SignalLike<string>) => (host: UIElement<{}>, target: E) => void;
/**
 * Set property of an element
 *
 * @since 0.8.0
 * @param {string} key - name of property to be set
 * @param {SignalLike<E[K]>} s - state bound to the property value
 */
declare const setProperty: <E extends Element, K extends keyof E>(key: K, s?: SignalLike<E[K]>) => (host: UIElement<{}>, target: E) => void;
/**
 * Set attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {SignalLike<string>} s - state bound to the attribute value
 */
declare const setAttribute: <E extends Element>(name: string, s?: SignalLike<string>) => (host: UIElement<{}>, target: E) => void;
/**
 * Toggle a boolan attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {SignalLike<boolean>} s - state bound to the attribute existence
 */
declare const toggleAttribute: <E extends Element>(name: string, s?: SignalLike<boolean>) => (host: UIElement<{}>, target: E) => void;
/**
 * Toggle a classList token of an element
 *
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {SignalLike<boolean>} s - state bound to the class existence
 */
declare const toggleClass: <E extends Element>(token: string, s?: SignalLike<boolean>) => (host: UIElement<{}>, target: E) => void;
/**
 * Set a style property of an element
 *
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {SignalLike<string>} s - state bound to the style property value
 */
declare const setStyle: <E extends (HTMLElement | SVGElement | MathMLElement)>(prop: string, s?: SignalLike<string>) => (host: UIElement<{}>, target: E) => void;
/**
 * Log a message to the console
 *
 * @since 0.10.1
 * @param {string} message - message to be logged
 * @param {SignalLike<T>} s - observed signal
 * @param {LogLevel} logLevel - log level to be used: LOG_DEBUG (default), LOG_INFO, LOG_WARN, LOG_ERROR
 */
declare const logMessage: <E extends Element, K extends keyof S, S extends ComponentSignals = {}>(message: string, s?: SignalLike<S[K]>, logLevel?: LogLevel) => (host: UIElement<S>, target: E) => void;
export { type ElementUpdater, updateElement, createElement, removeElement, setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle, logMessage };

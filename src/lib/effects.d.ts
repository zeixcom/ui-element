import { type Signal } from '@zeix/cause-effect';
import { type ComponentSignals, UIElement } from '../ui-element';
type SignalValueProvider<T> = <E extends Element>(target: E, index: number) => T;
type SignalLike<T> = PropertyKey | Signal<NonNullable<T>> | SignalValueProvider<T>;
type ElementUpdater<E extends Element, T> = {
    op: string;
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
declare const updateElement: <E extends Element, T extends {}, S extends ComponentSignals = {}, K extends keyof S = never>(s: K | SignalLike<T>, updater: ElementUpdater<E, S[K] | T>) => (host: UIElement<S>, target: E, index: number) => void;
/**
 * Create an element with a given tag name and optionally set its attributes
 *
 * @since 0.9.0
 * @param {string} tag - tag name of the element to create
 * @param {SignalLike<Record<string, string>>} s - state bound to the element's attributes
 */
declare const createElement: <E extends Element>(tag: string, s: SignalLike<Record<string, string>>, text?: string) => (host: UIElement<{}>, target: E, index: number) => void;
/**
 * Remove an element from the DOM
 *
 * @since 0.9.0
 * @param {SignalLike<string>} s - state bound to the element removal
 */
declare const removeElement: <E extends Element>(s: SignalLike<boolean>) => (host: UIElement<{}>, target: E, index: number) => void;
/**
 * Set text content of an element
 *
 * @since 0.8.0
 * @param {SignalLike<string>} s - state bound to the text content
 */
declare const setText: <E extends Element>(s: SignalLike<string>) => (host: UIElement<{}>, target: E, index: number) => void;
/**
 * Set inner HTML of an element
 *
 * @since 0.10.2
 * @param {SignalLike<string>} s - state bound to the inner HTML
 * @param {boolean} [allowScripts=false] - whether to allow executable script tags in the HTML content, defaults to false
 */
declare const dangerouslySetInnerHTML: <E extends Element>(s: SignalLike<string>, allowScripts?: boolean) => (host: UIElement<{}>, target: E, index: number) => void;
/**
 * Set property of an element
 *
 * @since 0.8.0
 * @param {string} key - name of property to be set
 * @param {SignalLike<E[K]>} s - state bound to the property value
 */
declare const setProperty: <E extends Element, K extends keyof E>(key: K, s?: SignalLike<E[K]>) => (host: UIElement<ComponentSignals>, target: E, index: number) => void;
/**
 * Set attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {SignalLike<string>} s - state bound to the attribute value
 */
declare const setAttribute: <E extends Element>(name: string, s?: SignalLike<string>) => (host: UIElement<{}>, target: E, index: number) => void;
/**
 * Toggle a boolan attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {SignalLike<boolean>} s - state bound to the attribute existence
 */
declare const toggleAttribute: <E extends Element>(name: string, s?: SignalLike<boolean>) => (host: UIElement<{}>, target: E, index: number) => void;
/**
 * Toggle a classList token of an element
 *
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {SignalLike<boolean>} s - state bound to the class existence
 */
declare const toggleClass: <E extends Element>(token: string, s?: SignalLike<boolean>) => (host: UIElement<{}>, target: E, index: number) => void;
/**
 * Set a style property of an element
 *
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {SignalLike<string>} s - state bound to the style property value
 */
declare const setStyle: <E extends (HTMLElement | SVGElement | MathMLElement)>(prop: string, s?: SignalLike<string>) => (host: UIElement<{}>, target: E, index: number) => void;
export { type SignalValueProvider, type SignalLike, type ElementUpdater, updateElement, createElement, removeElement, setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle, dangerouslySetInnerHTML };

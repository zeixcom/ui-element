import { type Signal } from '@zeix/cause-effect';
import { type ComponentProps, type Component, type Cleanup } from '../component';
type SignalLike<P extends ComponentProps, E extends Element, T> = keyof P | Signal<NonNullable<T>> | ((element: E) => T | null | undefined);
type ElementUpdater<E extends Element, T> = {
    op: string;
    read: (element: E) => T | null;
    update: (element: E, value: T) => string;
    delete?: (element: E) => string;
};
type NodeInserter = {
    type: string;
    where: InsertPosition;
    create: () => Node | undefined;
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
 * Effect to insert a node relative to an element according to a given SignalLike
 *
 * @since 0.9.0
 * @param {SignalLike<string>} s - state bound to the node insertion
 * @param {NodeInserter} inserter - inserter object containing type, where, and create methods
 * @throws {TypeError} if the insertPosition is invalid for the target element
 */
declare const insertNode: <P extends ComponentProps, E extends Element>(s: SignalLike<P, E, boolean>, { type, where, create }: NodeInserter) => (host: Component<P>, target: E) => void | (() => void);
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
declare const setStyle: <P extends ComponentProps, E extends (HTMLElement | SVGElement | MathMLElement)>(prop: string, s?: SignalLike<P, E, string>) => (host: Component<P>, target: E) => Cleanup;
/**
 * Set inner HTML of an element
 *
 * @since 0.11.0
 * @param {SignalLike<string>} s - state bound to the inner HTML
 * @param {'open' | 'closed'} [attachShadow] - whether to attach a shadow root to the element, expects mode 'open' or 'closed'
 * @param {boolean} [allowScripts] - whether to allow executable script tags in the HTML content, defaults to false
 */
declare const dangerouslySetInnerHTML: <P extends ComponentProps, E extends Element>(s: SignalLike<P, E, string>, attachShadow?: "open" | "closed", allowScripts?: boolean) => (host: Component<P>, target: E) => Cleanup;
/**
 * Insert template content next to or inside an element
 *
 * @since 0.11.0
 * @param {HTMLTemplateElement} template - template element to clone or import from
 * @param {SignalLike<boolean>} s - insert if SignalLike evalutes to true, otherwise ignore
 * @param {InsertPosition} where - position to insert the template relative to the target element ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
 * @param {string} content - content to be inserted into the template's slot
 * @throws {TypeError} if the template is not an HTMLTemplateElement
 */
declare const insertTemplate: <P extends ComponentProps>(template: HTMLTemplateElement, s: SignalLike<P, Element, boolean>, where?: InsertPosition, content?: string | (() => string)) => (host: Component<P>, target: Element) => void | (() => void);
/**
 * Create an element with a given tag name and optionally set its attributes
 *
 * @since 0.11.0
 * @param {string} tag - tag name of the element to create
 * @param {SignalLike<boolean>} s - insert if SignalLike evalutes to true, otherwise ignore
 * @param {InsertPosition} where - position to insert the template relative to the target element ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
 * @param {Record<string, string>} attributes - attributes to set on the element
 * @param {string} content - text content to be inserted into the element
 */
declare const createElement: <P extends ComponentProps>(tag: string, s: SignalLike<P, Element, boolean>, where?: InsertPosition, attributes?: Record<string, string>, content?: string | (() => string)) => (host: Component<P>, target: Element) => void | (() => void);
/**
 * Remove an element from the DOM
 *
 * @since 0.9.0
 * @param {SignalLike<string>} s - state bound to the element removal
 */
declare const removeElement: <P extends ComponentProps, E extends Element>(s: SignalLike<P, E, boolean>) => (host: Component<P>, target: E) => () => void;
export { type SignalLike, type ElementUpdater, type NodeInserter, updateElement, insertNode, setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle, insertTemplate, createElement, removeElement, dangerouslySetInnerHTML };

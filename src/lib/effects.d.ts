import { type Signal } from '@zeix/cause-effect';
import { type ComponentProps, type Component } from '../component';
type SignalLike<T> = PropertyKey | Signal<NonNullable<T>> | (<E extends Element>(target: E, index: number) => T);
type ElementUpdater<E extends Element, T> = {
    op: string;
    read: (element: E) => T | null;
    update: (element: E, value: T) => string;
    delete?: (element: E) => string;
};
type NodeInserter<P extends ComponentProps> = {
    type: string;
    where: InsertPosition;
    create: (host: HTMLElement & P) => Node | undefined;
};
/**
 * Effect for setting properties of a target element according to a given SignalLike
 *
 * @since 0.9.0
 * @param {SignalLike<T>} s - state bound to the element property
 * @param {ElementUpdater} updater - updater object containing key, read, update, and delete methods
 */
declare const updateElement: <E extends Element, T extends {}, P extends ComponentProps = {}, K extends keyof P = never>(s: K | SignalLike<T>, updater: ElementUpdater<E, P[K] | T>) => (host: Component<P>, target: E, index: number) => void;
/**
 * Effect to insert a node relative to an element according to a given SignalLike
 */
declare const insertNode: <E extends Element, P extends ComponentProps = {}, K extends keyof P = never>(s: K | SignalLike<boolean>, { type, where, create }: NodeInserter<P>) => (host: Component<P>, target: E, index: number) => void;
/**
 * Set text content of an element
 *
 * @since 0.8.0
 * @param {SignalLike<string>} s - state bound to the text content
 */
declare const setText: <E extends Element>(s: SignalLike<string>) => (host: Component<{}>, target: E, index: number) => void;
/**
 * Set property of an element
 *
 * @since 0.8.0
 * @param {string} key - name of property to be set
 * @param {SignalLike<E[K]>} s - state bound to the property value
 */
declare const setProperty: <E extends Element, K extends keyof E>(key: K, s?: SignalLike<E[K]>) => (host: Component<ComponentProps>, target: E, index: number) => void;
/**
 * Set attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be set
 * @param {SignalLike<string>} s - state bound to the attribute value
 */
declare const setAttribute: <E extends Element>(name: string, s?: SignalLike<string>) => (host: Component<{}>, target: E, index: number) => void;
/**
 * Toggle a boolan attribute of an element
 *
 * @since 0.8.0
 * @param {string} name - name of attribute to be toggled
 * @param {SignalLike<boolean>} s - state bound to the attribute existence
 */
declare const toggleAttribute: <E extends Element>(name: string, s?: SignalLike<boolean>) => (host: Component<{}>, target: E, index: number) => void;
/**
 * Toggle a classList token of an element
 *
 * @since 0.8.0
 * @param {string} token - class token to be toggled
 * @param {SignalLike<boolean>} s - state bound to the class existence
 */
declare const toggleClass: <E extends Element>(token: string, s?: SignalLike<boolean>) => (host: Component<{}>, target: E, index: number) => void;
/**
 * Set a style property of an element
 *
 * @since 0.8.0
 * @param {string} prop - name of style property to be set
 * @param {SignalLike<string>} s - state bound to the style property value
 */
declare const setStyle: <E extends (HTMLElement | SVGElement | MathMLElement)>(prop: string, s?: SignalLike<string>) => (host: Component<{}>, target: E, index: number) => void;
/**
 * Set inner HTML of an element
 *
 * @since 0.11.0
 * @param {SignalLike<string>} s - state bound to the inner HTML
 * @param {'open' | 'closed'} [attachShadow] - whether to attach a shadow root to the element, expects mode 'open' or 'closed'
 * @param {boolean} [allowScripts] - whether to allow executable script tags in the HTML content, defaults to false
 */
declare const dangerouslySetInnerHTML: <E extends Element>(s: SignalLike<string>, attachShadow?: "open" | "closed", allowScripts?: boolean) => (host: Component<{}>, target: E, index: number) => void;
/**
 * Insert template content next to or inside an element
 *
 * @since 0.11.0
 * @param {HTMLTemplateElement} template - template element to clone or import from
 * @param {SignalLike<boolean>} s - insert if SignalLike evalutes to true, otherwise ignore
 * @param {InsertPosition} where - position to insert the template relative to the target element ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
 */
declare const insertTemplate: <P extends ComponentProps>(template: HTMLTemplateElement, s: SignalLike<boolean>, where?: InsertPosition) => (host: Component<P & {
    set(prop: string & keyof P, signal: Signal<P[string & keyof P]>): void;
}>, target: Element, index: number) => void;
/**
 * Create an element with a given tag name and optionally set its attributes
 *
 * @since 0.11.0
 * @param {string} tag - tag name of the element to create
 * @param {SignalLike<boolean>} s - insert if SignalLike evalutes to true, otherwise ignore
 * @param {InsertPosition} [where] - position to insert the template relative to the target element ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
 * @param {Record<string, string>} [attributes] - attributes to set on the element
 * @param {string} [text] - text content to set on the element
 */
declare const createElement: (tag: string, s: SignalLike<boolean>, where?: InsertPosition, attributes?: Record<string, string>, text?: string) => (host: Component<{}>, target: Element, index: number) => void;
/**
 * Remove an element from the DOM
 *
 * @since 0.9.0
 * @param {SignalLike<string>} s - state bound to the element removal
 */
declare const removeElement: <E extends Element, P extends ComponentProps>(s: SignalLike<boolean>) => (host: Component<P>, target: E, index: number) => void;
export { type SignalLike, type ElementUpdater, type NodeInserter, updateElement, insertNode, setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle, insertTemplate, createElement, removeElement, dangerouslySetInnerHTML };

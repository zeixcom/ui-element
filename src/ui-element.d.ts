import { type State, type Computed, type Signal } from "@zeix/cause-effect";
import { UI } from "./core/ui";
import { type UnknownContext } from "./core/context";
export interface BaseUIElement extends HTMLElement {
    states: ComponentStates;
    has(key: string): boolean;
    get(key: string): unknown;
    set(key: string, value: unknown, update?: boolean): void;
}
export type AttributeParser<T> = (value: string | null, element?: BaseUIElement, old?: string | null) => T;
export type StateInitializer<T> = T | AttributeParser<T> | Computed<T>;
export type ComponentStates = Record<string, StateInitializer<{}>>;
export type InferSignalTypes<S extends ComponentStates> = {
    [K in keyof S]: S[K] extends AttributeParser<infer T extends {}> ? State<T> : S[K] extends Computed<infer T> ? Computed<T> : State<S[K]>;
};
export type InferReturnType<S, K extends keyof S> = S[K] extends AttributeParser<infer R extends {}> ? R : S[K] extends Computed<infer R extends {}> ? R : S[K];
/**
 * Parse according to static states
 *
 * @since 0.8.4
 * @param {UIElement} host - host UIElement
 * @param {string} key - key for attribute parser or initial value from static states
 * @param {string | null} value - attribute value
 * @param {string | null} [old=undefined] - old attribute value
 * @returns {T | undefined}
 */
export declare const parse: <T>(host: BaseUIElement, key: string, value: string | null, old?: string | null) => T | undefined;
/**
 * Base class for reactive custom elements
 *
 * @since 0.1.0
 * @class UIElement
 * @extends HTMLElement<S>
 * @type {UIElement}
 */
export declare class UIElement<S extends ComponentStates> extends HTMLElement {
    static registry: CustomElementRegistry;
    static observedAttributes: string[];
    static consumedContexts: UnknownContext[];
    static providedContexts: UnknownContext[];
    /**
     * Define a custom element in the custom element registry
     *
     * @since 0.5.0
     * @param {string} tag - name of the custom element
     */
    static define(tag: string): void;
    /**
     * @since 0.10.1
     * @property
     */
    states: S;
    /**
     * @since 0.9.0
     * @property {Record<string, Signal<{}>>} signals - object of state signals bound to the custom element
     */
    signals: InferSignalTypes<S>;
    /**
     * @since 0.10.1
     * @property {(() => void)[]} cleanup - array of functions to remove bound event listeners and perform other cleanup operations
     */
    cleanup: (() => void)[];
    /**
     * @since 0.9.0
     * @property {ElementInternals | undefined} internals - native internal properties of the custom element
     * /
    internals: ElementInternals | undefined

    /**
     * @since 0.8.1
     * @property {UI<UIElement>} self - UI object for this element
     */
    self: UI<S, UIElement<S>>;
    /**
     * @since 0.8.3
     */
    root: Element | ShadowRoot;
    /**
     * @since 0.9.0
     */
    debug: boolean;
    /**
     * Native callback function when an observed attribute of the custom element changes
     *
     * @since 0.1.0
     * @param {string} name - name of the modified attribute
     * @param {string | null} old - old value of the modified attribute
     * @param {string | null} value - new value of the modified attribute
     */
    attributeChangedCallback(name: string, old: string | null, value: string | null): void;
    /**
     * Native callback function when the custom element is first connected to the document
     *
     * Used for context providers and consumers
     * If your component uses context, you must call `super.connectedCallback()`
     *
     * @since 0.7.0
     */
    connectedCallback(): void;
    /**
     * Native callback function when the custom element is disconnected from the document
     */
    disconnectedCallback(): void;
    /**
     * Native callback function when the custom element is adopted into a new document
     */
    adoptedCallback(): void;
    /**
     * Check whether a state is set
     *
     * @since 0.2.0
     * @param {string} key - state to be checked
     * @returns {boolean} `true` if this element has state with the given key; `false` otherwise
     */
    has(key: string): boolean;
    /**
     * Get the current value of a state
     *
     * @since 0.2.0
     * @param {K} key - state to get value from
     * @returns {InferReturnType<S, K>} current value of state; undefined if state does not exist
     */
    get<K extends keyof S>(key: K): InferReturnType<S, K>;
    /**
     * Create a state or update its value and return its current value
     *
     * @since 0.2.0
     * @param {K} key - state to set value to
     * @param {InferSignalType<typeof this.signals[K]> | Signal<InferSignalType<typeof this.signals[K]>> | ((old?: InferSignalType<typeof this.signals[K]>) => InferSignalType<typeof this.signals[K]>)} value - initial or new value; may be a function (gets old value as parameter) to be evaluated when value is retrieved
     * @param {boolean} [update=true] - if `true` (default), the state is updated; if `false`, do nothing if state already exists
     */
    set<K extends keyof S>(key: K, value: InferReturnType<S, K> | Signal<InferReturnType<S, K>> | ((old: InferReturnType<S, K>) => InferReturnType<S, K>), update?: boolean): void;
    /**
     * Delete a state, also removing all effects dependent on the state
     *
     * @since 0.4.0
     * @param {string} key - state to be deleted
     * @returns {boolean} `true` if the state existed and was deleted; `false` if ignored
     */
    delete(key: string): boolean;
    /**
     * Get array of first sub-element matching a given selector within the custom element
     *
     * @since 0.8.1
     * @param {string} selector - selector to match sub-element
     * @returns {UI<Element>[]} - array of zero or one UI objects of matching sub-element
     */
    first(selector: string): UI<S, Element>;
    /**
     * Get array of all sub-elements matching a given selector within the custom element
     *
     * @since 0.8.1
     * @param {string} selector - selector to match sub-elements
     * @returns {UI<Element>} - array of UI object of matching sub-elements
     */
    all(selector: string): UI<S, Element>;
}

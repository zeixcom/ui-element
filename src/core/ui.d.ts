import { type Signal } from '@zeix/cause-effect';
import { UIElement } from '../ui-element';
type StateLike<T extends {}> = string | Signal<T> | ((v?: T) => T);
type ValueOrProvider<T> = T | ((element: Element, index: number) => T);
type StateLikeOrStateLikeProvider<T extends {}> = ValueOrProvider<StateLike<T>>;
type EventListenerOrEventListenerProvider = ValueOrProvider<EventListenerOrEventListenerObject>;
/**
 * UI class for managing UI elements and their events, passed states and applied effects
 *
 * @since 0.8.0
 * @class UI
 * @type {UI}
 */
declare class UI<E extends Element> {
    readonly host: UIElement;
    readonly targets: E[];
    constructor(host: UIElement, targets?: E[]);
    /**
     * Add event listener to target element(s)
     *
     * @since 0.9.0
     * @param {string} type - event type
     * @param {EventListenerOrEventListenerFactory} listeners - event listener or factory function
     * @returns {UI<T>} - self
     */
    on(type: string, listeners: EventListenerOrEventListenerProvider): UI<E>;
    /**
     * Emit custom event to target element(s)
     *
     * @since 0.10.0
     * @param {string} type - event type
     * @param {unknown} detail - event detail
     * @returns {UI<T>} - self
     */
    emit(type: string, detail?: unknown): UI<E>;
    /**
     * Pass states to target element(s) of type UIElement using provided sources
     *
     * @since 0.9.0
     * @param {Record<PropertyKey, StateLikeOrStateLikeProvider<{}>>} states - state sources
     * @returns {UI<T>} - self
     */
    pass(states: Record<PropertyKey, StateLikeOrStateLikeProvider<{}>>): UI<E>;
    /**
     * Sync state changes to target element(s) using provided functions
     *
     * @since 0.9.0
     * @param {((host: UIElement<S>, target: T, index: number) => void)[]} fns - state sync functions
     * @returns {UI<T>} - self
     */
    sync(...fns: ((host: UIElement, target: E, index: number) => void)[]): UI<E>;
}
export { type StateLike, type StateLikeOrStateLikeProvider, type EventListenerOrEventListenerProvider, UI };

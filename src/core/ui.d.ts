import { type Signal } from '@zeix/cause-effect';
import { UIElement } from '../ui-element';
type StateLike<T> = string | Signal<T> | ((v?: T) => T);
type ValueOrFactory<T> = T | ((element: Element, index: number) => T);
type StateLikeOrStateLikeFactory<T> = ValueOrFactory<StateLike<T>>;
type EventListenerOrEventListenerFactory = ValueOrFactory<EventListenerOrEventListenerObject>;
/**
 * UI class for managing UI elements and their events, passed states and applied effects
 *
 * @since 0.8.0
 * @class UI
 * @type {UI}
 */
declare class UI<T extends Element> {
    readonly host: UIElement;
    readonly targets: T[];
    constructor(host: UIElement, targets?: T[]);
    /**
     * Add event listener to target element(s)
     *
     * @since 0.9.0
     * @param {string} type - event type
     * @param {EventListenerOrEventListenerFactory} listeners - event listener or factory function
     * @returns {UI<T>} - self
     */
    on(type: string, listeners: EventListenerOrEventListenerFactory): UI<T>;
    /**
     * Emit custom event to target element(s)
     *
     * @since 0.10.0
     * @param {string} type - event type
     * @param {unknown} detail - event detail
     * @returns {UI<T>} - self
     */
    emit(type: string, detail?: unknown): UI<T>;
    /**
     * Pass states to target element(s) of type UIElement using provided sources
     *
     * @since 0.9.0
     * @param {S extends Record<PropertyKey, StateLikeOrStateLikeFactory<unknown>>} states - state sources
     * @returns {UI<T>} - self
     */
    pass<S extends Record<PropertyKey, StateLikeOrStateLikeFactory<unknown>>>(states: S): UI<T>;
    /**
     * Sync state changes to target element(s) using provided functions
     *
     * @since 0.9.0
     * @param {((host: UIElement, target: T, index: number) => void)[]} fns - state sync functions
     * @returns {UI<T>} - self
     */
    sync(...fns: ((host: UIElement, target: T, index: number) => void)[]): UI<T>;
}
export { type StateLike, type StateLikeOrStateLikeFactory, type EventListenerOrEventListenerFactory, UI };

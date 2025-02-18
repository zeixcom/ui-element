import { type Signal } from '@zeix/cause-effect';
import { UIElement, type ComponentStates } from '../ui-element';
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
declare class UI<S extends ComponentStates, T extends Element> {
    readonly host: UIElement<S>;
    readonly targets: T[];
    constructor(host: UIElement<S>, targets?: T[]);
    /**
     * Add event listener to target element(s)
     *
     * @since 0.9.0
     * @param {string} type - event type
     * @param {EventListenerOrEventListenerFactory} listeners - event listener or factory function
     * @returns {UI<T>} - self
     */
    on(type: string, listeners: EventListenerOrEventListenerProvider): UI<S, T>;
    /**
     * Emit custom event to target element(s)
     *
     * @since 0.10.0
     * @param {string} type - event type
     * @param {unknown} detail - event detail
     * @returns {UI<T>} - self
     */
    emit(type: string, detail?: unknown): UI<S, T>;
    /**
     * Pass states to target element(s) of type UIElement using provided sources
     *
     * @since 0.9.0
     * @param {Record<PropertyKey, StateLikeOrStateLikeProvider<{}>>} states - state sources
     * @returns {UI<T>} - self
     */
    pass(states: Record<PropertyKey, StateLikeOrStateLikeProvider<{}>>): UI<S, T>;
    /**
     * Sync state changes to target element(s) using provided functions
     *
     * @since 0.9.0
     * @param {((host: UIElement, target: T, index: number) => void)[]} fns - state sync functions
     * @returns {UI<T>} - self
     */
    sync(...fns: ((host: UIElement<S>, target: T, index: number) => void)[]): UI<S, T>;
}
export { type StateLike, type StateLikeOrStateLikeProvider, type EventListenerOrEventListenerProvider, UI };

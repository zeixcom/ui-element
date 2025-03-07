import { type MaybeSignal } from '@zeix/cause-effect';
import { UIElement, type ComponentSignals } from '../ui-element';
type EventListenerProvider = (<E extends Element>(element: E, index: number) => EventListenerOrEventListenerObject);
type PassedSignals<S extends ComponentSignals> = {
    [K in keyof S]: MaybeSignal<S[K]>;
};
type PassedSignalsProvider<S extends ComponentSignals> = (<E extends Element>(element: E, index: number) => PassedSignals<S> | PassedSignalsProvider<S>);
/**
 * UI class for managing UI elements and their events, passed states and applied effects
 *
 * @since 0.8.0
 * @class UI
 * @type {UI}
 */
declare class UI<E extends Element = HTMLElement, S extends ComponentSignals = {}> {
    readonly host: UIElement<S>;
    readonly targets: E[];
    constructor(host: UIElement<S>, targets?: E[]);
    /**
     * Add event listener to target element(s)
     *
     * @since 0.9.0
     * @param {string} type - event type
     * @param {EventListenerOrEventListenerObject | EventListenerProvider} listenerOrProvider - event listener or provider function
     * @returns {this} - self
     */
    on(type: string, listenerOrProvider: EventListenerOrEventListenerObject | EventListenerProvider): this;
    /**
     * Emit custom event to target element(s)
     *
     * @since 0.10.0
     * @param {string} type - event type
     * @param {T} detail - event detail
     * @returns {this} - self
     */
    emit<T>(type: string, detail?: T): this;
    /**
     * Pass states to target element(s) of type UIElement using provided sources
     *
     * @since 0.9.0
     * @param {PassedSignals<T> | PassedSignalsProvider<T>} passedSignalsOrProvider - object of signal sources or provider function
     * @returns {this} - self
     */
    pass<T extends ComponentSignals>(passedSignalsOrProvider: PassedSignals<T> | PassedSignalsProvider<T>): this;
    /**
     * Sync state changes to target element(s) using provided functions
     *
     * @since 0.9.0
     * @param {((host: UIElement<S>, target: E, index: number) => void)[]} fns - state sync functions
     * @returns {this} - self
     */
    sync(...fns: ((host: UIElement, target: E, index: number) => void)[]): this;
}
export { type PassedSignals, type PassedSignalsProvider, type EventListenerProvider, UI };

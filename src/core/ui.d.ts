import { type MaybeSignal } from '@zeix/cause-effect';
import { UIElement, type ComponentSignals } from '../ui-element';
type EventListenerProvider = (<E extends Element>(element: E, index: number) => EventListenerOrEventListenerObject);
type PassedSignals<S extends ComponentSignals> = {
    [K in keyof S]: MaybeSignal<S[K]>;
};
type PassedSignalsProvider<S extends ComponentSignals> = (<E extends Element>(element: E, index: number) => PassedSignals<S> | PassedSignalsProvider<S>);
type UI<E extends Element, S extends ComponentSignals> = {
    host: UIElement<S>;
    targets: E[];
    on: (type: string, listenerOrProvider: EventListenerOrEventListenerObject | EventListenerProvider) => UI<E, S>;
    emit: <T>(type: string, detail?: T) => UI<E, S>;
    pass: <T extends ComponentSignals>(passedSignalsOrProvider: PassedSignals<T> | PassedSignalsProvider<T>) => UI<E, S>;
    sync: (...fns: ((host: UIElement<S>, target: E, index: number) => void)[]) => UI<E, S>;
};
/**
 * Create a new UI object for managing UI elements and their events, passed states and applied effects
 *
 * @since 0.11.0
 * @param {UIElement<S>} host
 * @param {E} targets
 * @returns {UI<E, S>} - new UI object
 */
declare const ui: <E extends Element, S extends ComponentSignals>(host: UIElement<S>, targets?: E[]) => UI<E, S>;
export { type UI, type PassedSignals, type PassedSignalsProvider, type EventListenerProvider, ui };

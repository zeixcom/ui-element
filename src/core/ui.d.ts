import { type Signal } from "@zeix/cause-effect";
import type { Component, ComponentProps } from "../component";
type Provider<T> = <E extends Element>(element: E, index: number) => T;
type PassedSignals<P extends ComponentProps, Q extends ComponentProps> = {
    [K in string & keyof Q]?: Signal<Q[K]> | Provider<Q[K]> | (() => Q[K]) | (string & keyof P);
};
/**
 * Attach an event listener to an element
 *
 * @param {string} type - event type to listen for
 * @param {EventListenerOrEventListenerObject | Provider<EventListenerOrEventListenerObject>} handler - event listener or provider function
 * @throws {TypeError} - if the provided handler is not an event listener or a provider function
 */
declare const on: (type: string, handler: EventListenerOrEventListenerObject | Provider<EventListenerOrEventListenerObject>) => <P extends ComponentProps>(host: Component<P>, target?: Element, index?: number) => () => void;
/**
 * Emit a custom event with the given detail
 *
 * @param {string} type - event type to emit
 * @param {T | Provider<T>} detail - event detail or provider function
 */
declare const emit: <T>(type: string, detail: T | Provider<T>) => <P extends ComponentProps>(host: Component<P>, target?: Element, index?: number) => void;
/**
 * Pass signals to a custom element
 *
 * @param {PassedSignals<P, Q>} signals - signals to be passed to the custom element
 * @throws {TypeError} - if the target element is not a custom element
 * @throws {TypeError} - if the provided signals are not an object or a provider function
 * @throws {Error} - if it fails to pass signals to the target element
 */
declare const pass: <P extends ComponentProps, Q extends ComponentProps>(signals: PassedSignals<P, Q>) => <E extends Element>(host: Component<P>, target: E, index?: number) => void;
export { type Provider, type PassedSignals, on, emit, pass };

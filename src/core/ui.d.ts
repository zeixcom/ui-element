import { type Computed, type Signal } from '@zeix/cause-effect';
import type { Cleanup, Component, ComponentProps, FxFunction } from '../component';
type PassedSignals<P extends ComponentProps, Q extends ComponentProps> = {
    [K in keyof Q]?: Signal<Q[K]> | ((element: Component<Q>) => Q[K]) | keyof P;
};
/**
 * Run one or more functions on a component's element
 *
 * @since 0.12.0
 * @param {FxFunction<P, E>[]} fns - functions to run
 * @param {Component<P>} host - component host element
 * @param {E} target - target element
 * @returns {Cleanup} - a cleanup function that runs collected cleanup functions
 */
declare const run: <P extends ComponentProps, E extends Element>(fns: FxFunction<P, E>[], host: Component<P>, target: E) => Cleanup;
/**
 * Apply effect functions to a first matching sub-element within the custom element
 *
 * @since 0.12.0
 * @param {string} selector - selector to match sub-element
 */
declare const first: <P extends ComponentProps, E extends Element>(selector: string, ...fns: FxFunction<P, E>[]) => (host: Component<P>) => Cleanup | void;
/**
 * Apply effect functions to all matching sub-elements within the custom element
 *
 * @since 0.12.0
 * @param {string} selector - selector to match sub-elements
 */
declare const all: <P extends ComponentProps, E extends Element>(selector: string, ...fns: FxFunction<P, E>[]) => (host: Component<P>) => Cleanup;
/**
 * Create a element selection signal from a query selector
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node to query
 * @param {string} selectors - query selector
 * @returns {Computed<T>} - Element selection signal
 */
declare const selection: <E extends Element>(parent: ParentNode, selectors: string) => Computed<E[]>;
/**
 * Attach an event listener to an element
 *
 * @since 0.12.0
 * @param {string} type - event type to listen for
 * @param {(evt: E) => void} listener - event listener
 * @throws {TypeError} - if the provided handler is not an event listener or a provider function
 */
declare const on: <E extends Event>(type: string, listener: (evt: E) => void) => <P extends ComponentProps>(host: Component<P>, target?: Element) => Cleanup;
/**
 * Emit a custom event with the given detail
 *
 * @since 0.12.0
 * @param {string} type - event type to emit
 * @param {T | ((element: Element) => T)} detail - event detail or provider function
 */
declare const emit: <T>(type: string, detail: T | ((element: Element) => T)) => <P extends ComponentProps>(host: Component<P>, target?: Element) => void;
/**
 * Pass signals to a custom element
 *
 * @since 0.12.0
 * @param {PassedSignals<P, Q> | ((target: Component<Q>) => PassedSignals<P, Q>)} signals - signals to be passed to the custom element
 * @throws {TypeError} - if the target element is not a custom element
 * @throws {TypeError} - if the provided signals are not an object or a provider function
 * @throws {Error} - if it fails to pass signals to the target element
 */
declare const pass: <P extends ComponentProps, Q extends ComponentProps>(signals: PassedSignals<P, Q> | ((target: Component<Q>) => PassedSignals<P, Q>)) => <E extends Element>(host: Component<P>, target: E) => void;
export { type PassedSignals, run, first, all, selection, on, emit, pass };

import { type Computed, type Signal, type Cleanup } from '@zeix/cause-effect';
import type { Component, ComponentProps } from '../component';
type PassedSignals<P extends ComponentProps, Q extends ComponentProps> = {
    [K in keyof Q]?: Signal<Q[K]> | ((element: Component<Q>) => Q[K]) | keyof P;
};
/**
 * Observe a DOM subtree with a mutation observer
 *
 * @since 0.12.2
 * @param {ParentNode} parent - parent node
 * @param {string} selectors - selector for matching elements to observe
 * @param {MutationCallback} callback - mutation callback
 * @returns {MutationObserver} - the created mutation observer
 */
declare const observeSubtree: (parent: ParentNode, selectors: string, callback: MutationCallback) => MutationObserver;
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
/**
 * Read a signal property from a custom element safely after it's defined
 * Returns a function that provides the signal value with fallback until component is ready
 *
 * @since 0.13.1
 * @param {Component<Q>} source - source custom element to read signal from
 * @param {K} prop - property name to get signal for
 * @param {Q[K]} fallback - fallback value to use until component is ready
 * @returns {() => Q[K]} - function that returns signal value or fallback
 */
declare const read: <Q extends ComponentProps, K extends keyof Q>(source: Component<Q> | null, prop: K, fallback: Q[K]) => (() => Q[K]);
export { type PassedSignals, observeSubtree, selection, on, emit, pass, read };

import { type Cleanup, type MaybeCleanup, type Signal } from '@zeix/cause-effect';
import type { Component, ComponentProps } from '../component';
import type { LooseExtractor } from './dom';
type Effect<P extends ComponentProps, E extends Element> = (host: Component<P>, element: E) => MaybeCleanup;
type Effects<P extends ComponentProps, E extends Element> = Effect<P, E> | Effect<P, E>[] | Promise<Effect<P, E>> | Promise<Effect<P, E>[]>;
type Reactive<T, P extends ComponentProps, E extends Element = HTMLElement> = keyof P | Signal<T & {}> | LooseExtractor<T, E>;
type PassedProp<T, P extends ComponentProps, E extends HTMLElement = HTMLElement> = Reactive<T, P, E> | [Reactive<T, P, E>, (value: T) => void];
type PassedProps<P extends ComponentProps, Q extends ComponentProps> = {
    [K in keyof Q & string]?: PassedProp<Q[K], P, Component<Q>>;
};
declare const RESET: any;
/**
 * Run one or more effect functions on a component's element
 *
 * @since 0.14.0
 * @param {Effects<P, E>} effects - Effect functions to run
 * @param {Component<P>} host - Component host element
 * @param {E} target - Target element
 * @returns {Cleanup} - Cleanup function that runs collected cleanup functions
 * @throws {InvalidEffectsError} - If the effects are invalid
 */
declare const runEffects: <P extends ComponentProps, E extends Element = Component<P>>(effects: Effects<P, E>, host: Component<P>, target?: E) => void | Cleanup;
declare const resolveReactive: <T extends {}, P extends ComponentProps, E extends Element = Component<P>>(reactive: Reactive<T, P, E>, host: Component<P>, target: E, context?: string) => T;
/**
 * Effect for passing reactive values to a descendant El Truco component.
 *
 * @since 0.15.0
 * @param {MutableReactives<Component<Q>, P>} props - Reactive values to pass
 * @returns {Effect<P, Component<Q>>} Effect function that passes reactive values to the descendant component
 * @throws {InvalidCustomElementError} When the target element is not a valid custom element
 * @throws {InvalidReactivesError} When the provided reactives is not a record of signals, reactive property names or functions
 * @throws {Error} When passing signals failed for some other reason
 */
declare const pass: <P extends ComponentProps, Q extends ComponentProps>(props: PassedProps<P, Q> | ((target: Component<Q>) => PassedProps<P, Q>)) => Effect<P, Component<Q>>;
export { type Effect, type Effects, type Reactive, type PassedProp, type PassedProps, pass, RESET, resolveReactive, runEffects, };

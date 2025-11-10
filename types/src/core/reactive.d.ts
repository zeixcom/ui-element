import { type Cleanup, type MaybeCleanup, type Signal } from '@zeix/cause-effect';
import type { Component, ComponentProps } from '../component';
import type { LooseExtractor } from './dom';
type Effect<P extends ComponentProps, E extends Element> = (host: Component<P>, element: E) => MaybeCleanup;
type Effects<P extends ComponentProps, E extends Element> = Effect<P, E> | Effect<P, E>[] | Promise<Effect<P, E>> | Promise<Effect<P, E>[]>;
type Reactive<T, P extends ComponentProps, E extends Element = HTMLElement> = keyof P | Signal<T & {}> | LooseExtractor<T, E>;
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
export { type Effect, type Effects, type Reactive, RESET, resolveReactive, runEffects, };

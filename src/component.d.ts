import { type MaybeSignal, type Signal } from "@zeix/cause-effect";
type ReservedWords = 'constructor' | 'prototype' | '__proto__' | 'toString' | 'valueOf' | 'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' | 'toLocaleString';
type ValidPropertyKey<T> = T extends keyof HTMLElement | ReservedWords ? never : T;
type ComponentProps = {
    [K in string as ValidPropertyKey<K>]: {};
};
type Component<P extends ComponentProps> = HTMLElement & P & {
    debug?: boolean;
    attributeChangedCallback(name: string, old: string | null, value: string | null): void;
    has(prop: string & keyof P): boolean;
    get(prop: string & keyof P): Signal<P[string & keyof P]>;
    set(prop: string & keyof P, signal: Signal<P[string & keyof P]>): void;
    self(...fns: FxFunction<P, Component<P>>[]): void;
    first<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void;
    all<E extends Element>(selector: string, ...fns: FxFunction<P, E>[]): void;
};
type AttributeParser<T extends {}, C extends HTMLElement> = (host: C, value: string | null, old?: string | null) => T;
type SignalProducer<T extends {}, C extends HTMLElement> = (host: C) => MaybeSignal<T>;
type SignalInitializer<T extends {}, C extends HTMLElement> = T | AttributeParser<T, C> | SignalProducer<T, C>;
type FxFunction<P extends ComponentProps, E extends Element> = (host: Component<P>, target: E, index?: number) => void | (() => void) | (() => void)[];
declare const RESET: any;
/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.12.0
 * @param {string} name - name of the custom element
 * @param {{ [K in keyof S]: Initializer<S[K], Component<P>> }} init - signals of the component
 * @param {FxFunction<S>[]} setup - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof HTMLElement & P} - constructor function for the custom element
 */
declare const component: <P extends ComponentProps>(name: string, init: { [K in string & keyof P]: SignalInitializer<P[K], Component<P>>; } | undefined, setup: (host: Component<P>) => void) => Component<P>;
export { type Component, type ComponentProps, type ValidPropertyKey, type ReservedWords, type SignalInitializer, type AttributeParser, type SignalProducer, type FxFunction, RESET, component };

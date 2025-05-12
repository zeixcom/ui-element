import { type MaybeSignal, type Signal } from "@zeix/cause-effect";
type ReservedWords = 'constructor' | 'prototype' | '__proto__' | 'toString' | 'valueOf' | 'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' | 'toLocaleString';
type ValidPropertyKey<T> = T extends keyof HTMLElement | ReservedWords ? never : T;
type ComponentProps = {
    [K in string as ValidPropertyKey<K>]: {};
};
type Component<P extends ComponentProps> = HTMLElement & P & {
    adoptedCallback?(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    debug?: boolean;
    shadowRoot: ShadowRoot | null;
    getSignal(prop: keyof P): Signal<P[keyof P]>;
    setSignal(prop: keyof P, signal: Signal<P[keyof P]>): void;
};
type AttributeParser<C extends HTMLElement, T extends {}> = (host: C, value: string | null, old?: string | null) => T;
type SignalProducer<C extends HTMLElement, T extends {}> = (host: C) => MaybeSignal<T>;
type MethodProducer<C extends HTMLElement> = (host: C) => void;
type Initializer<C extends HTMLElement, T extends {}> = T | AttributeParser<C, T> | SignalProducer<C, T> | MethodProducer<C>;
type Cleanup = () => void;
type FxFunction<P extends ComponentProps, E extends Element> = (host: Component<P>, element: E) => Cleanup | void;
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
declare const component: <P extends ComponentProps>(name: string, init: { [K in keyof P]: Initializer<Component<P>, P[K]>; } | undefined, setup: (host: Component<P>) => FxFunction<P, Component<P>>[]) => Component<P>;
export { type Component, type ComponentProps, type ValidPropertyKey, type ReservedWords, type Initializer, type AttributeParser, type SignalProducer, type MethodProducer, type Cleanup, type FxFunction, RESET, component };

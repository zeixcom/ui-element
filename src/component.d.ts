import { type ComputedCallback, type Signal } from "@zeix/cause-effect";
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
    delete(prop: string & keyof P): void;
};
type AttributeParser<T extends {}> = (host: HTMLElement, value: string | null, old?: string | null) => T;
type SignalInitializer<T extends {}> = T | AttributeParser<T> | ((host: HTMLElement) => T | ComputedCallback<T>);
type FxFunction<P extends ComponentProps, E extends Element> = (host: Component<P>, target: E, index?: number) => (() => void)[];
type ComponentSetup<P extends ComponentProps> = (host: Component<P>) => FxFunction<P, Component<P>>[];
type EventListenerProvider = <E extends Element>(element: E, index: number) => EventListenerOrEventListenerObject;
declare const RESET: any;
declare const first: <E extends Element, P extends ComponentProps = ComponentProps>(selector: string, ...fns: FxFunction<P, E>[]) => (host: Component<P>) => (() => void)[];
declare const all: <E extends Element, P extends ComponentProps = ComponentProps>(selector: string, ...fns: FxFunction<P, E>[]) => (host: Component<P>) => (() => void)[];
/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.12.0
 * @param {string} name - name of the custom element
 * @param {{ [K in keyof S]: SignalInitializer<S[K]> }} init - states of the component
 * @param {FxFunction<S>[]} setup - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof HTMLElement & P} - constructor function for the custom element
 */
declare const component: <P extends ComponentProps>(name: string, init: { [K in string & keyof P]: SignalInitializer<P[K]>; } | undefined, setup: ComponentSetup<P>) => Component<P>;
declare const pass: <P extends ComponentProps, Q extends ComponentProps>(signals: Partial<{ [K in keyof Q]: Signal<Q[K]>; }>) => (host: Component<P>, target: Component<Q>, index?: number) => Promise<void>;
declare const on: (type: string, handler: EventListenerOrEventListenerObject | EventListenerProvider) => <P extends ComponentProps>(host: Component<P>, target?: Element, index?: number) => () => void;
declare const emit: <T>(type: string, detail: T | ((target: Element, index: number) => T)) => <P extends ComponentProps>(host: Component<P>, target?: Element, index?: number) => void;
export { type ComponentProps, type Component, type AttributeParser, type SignalInitializer, type EventListenerProvider, RESET, component, first, all, pass, on, emit };

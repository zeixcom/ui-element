import { type ComputedCallback, type Signal } from "@zeix/cause-effect";
type ReservedWords = 'constructor' | 'prototype' | '__proto__' | 'toString' | 'valueOf' | 'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' | 'toLocaleString';
type ValidPropertyKey<T> = T extends keyof HTMLElement | ReservedWords ? never : T;
type ComponentProps = {
    [K in string as ValidPropertyKey<K>]: {};
};
type Component<P extends ComponentProps> = HTMLElement & P & {
    set(prop: string & keyof P, signal: Signal<P[string & keyof P]>): void;
};
type AttributeParser<T extends {}> = (host: HTMLElement, value: string | null, old?: string | null) => T;
type SignalInitializer<T extends {}> = T | AttributeParser<T> | ((host: HTMLElement, signals: Signal<{}>[]) => ComputedCallback<T>);
type FxFunction<P extends ComponentProps> = (host: Component<P>, target?: Element, index?: number) => (() => void)[];
type ComponentSetup<P extends ComponentProps> = (host: Component<P>, signals: {
    [K in string & keyof P]: Signal<P[K]>;
}) => FxFunction<P>[];
type EventListenerProvider = <E extends Element>(element: E, index: number) => EventListenerOrEventListenerObject;
declare const RESET: any;
declare const first: <P extends ComponentProps>(selector: string, ...fns: FxFunction<P>[]) => (host: Component<P>) => (() => void)[];
declare const all: <P extends ComponentProps>(selector: string, ...fns: FxFunction<P>[]) => (host: Component<P>) => (() => void)[];
/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.12.0
 * @param {string} name - name of the custom element
 * @param {{ [K in keyof S]: SignalInitializer<S[K]> }} init - states of the component
 * @param {FxFunction<S>[]} fx - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof HTMLElement & P} - constructor function for the custom element
 */
declare const component: <P extends ComponentProps>(name: string, init: { [K in string & keyof P]: SignalInitializer<P[K]>; } | undefined, fx: ComponentSetup<P>) => Component<P>;
declare const pass: <P extends ComponentProps>(signals: Partial<{ [K in keyof P]: Signal<P[K]>; }>) => <Q extends ComponentProps>(_: Component<P>, target: Component<Q>, index?: number) => Promise<void>;
declare const on: (type: string, handler: EventListenerOrEventListenerObject | EventListenerProvider) => <P extends ComponentProps>(host: Component<P>, target?: Element, index?: number) => () => void;
declare const emit: <T>(type: string, detail: T | ((target: Element, index: number) => T)) => <P extends ComponentProps>(host: Component<P>, target?: Element, index?: number) => void;
export { type ComponentProps, type Component, type AttributeParser, type SignalInitializer, type EventListenerProvider, RESET, component, first, all, pass, on, emit };

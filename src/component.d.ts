import { type ComputedCallback, type Signal } from "@zeix/cause-effect";
type ComponentProps = {
    [key: string]: {};
};
type AttributeParser<T extends {}> = (host: HTMLElement, value: string | null, old?: string | null) => T;
type SignalInitializer<T extends {}> = T | AttributeParser<T> | ComputedCallback<T>;
type FxFunction = <C extends HTMLElement>(host: C, target?: Element, index?: number) => (() => void)[];
type ComponentSetup<P extends ComponentProps> = (host: HTMLElement & P, signals: {
    [K in keyof P]: Signal<P[K]>;
}) => FxFunction[];
declare const RESET: any;
declare const first: (selector: string, ...fns: FxFunction[]) => <C extends HTMLElement>(host: C) => (() => void)[];
declare const all: (selector: string, ...fns: FxFunction[]) => <C extends HTMLElement>(host: C) => (() => void)[];
/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.12.0
 * @param {string} name - name of the custom element
 * @param {{ [K in keyof S]: SignalInitializer<S[K]> }} init - states of the component
 * @param {FxFunction<S>[]} fx - setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns {typeof HTMLElement & P} - constructor function for the custom element
 */
declare const component: <P extends ComponentProps>(name: string, init: { [K in keyof P]: SignalInitializer<P[K]>; } | undefined, fx: ComponentSetup<P>) => typeof HTMLElement & P;
export { type ComponentProps, type AttributeParser, type SignalInitializer, RESET, component, first, all };

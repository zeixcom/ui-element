import { type ComputedCallback, type Signal } from '@zeix/cause-effect';
import { type Extractor, type Helpers, type Parser } from './core/dom';
import { type Effects } from './core/reactive';
type ReservedWords = 'constructor' | 'prototype' | '__proto__' | 'toString' | 'valueOf' | 'hasOwnProperty' | 'isPrototypeOf' | 'propertyIsEnumerable' | 'toLocaleString';
type ComponentProp = Exclude<string, keyof HTMLElement | ReservedWords>;
type ComponentProps = Record<ComponentProp, NonNullable<unknown>>;
type Component<P extends ComponentProps> = HTMLElement & P & {
    debug?: boolean;
};
type MaybeSignal<T extends {}> = T | Signal<T> | ComputedCallback<T>;
type Initializer<K extends ComponentProp, P extends ComponentProps> = P[K] | Parser<P[K], Component<P>> | Extractor<MaybeSignal<P[K]>, Component<P>> | ((host: Component<P>) => void);
type Setup<P extends ComponentProps> = (host: Component<P>, helpers: Helpers<P>) => Effects<P, Component<P>>;
/**
 * Define a component with dependency resolution and setup function (connectedCallback)
 *
 * @since 0.14.0
 * @param {string} name - Name of the custom element
 * @param {{ [K in keyof P]: Initializer<P[K], Component<P>> }} init - Signals of the component
 * @param {Setup<P>} setup - Setup function to be called after dependencies are resolved
 * @throws {InvalidComponentNameError} If component name is invalid
 * @throws {InvalidPropertyNameError} If property name is invalid
 */
declare function component<P extends ComponentProps>(name: string, init: {
    [K in keyof P]: K extends ComponentProp ? Initializer<K, P> : never;
}, setup: Setup<P>): Component<P>;
export { type Component, type ComponentProp, type ComponentProps, type MaybeSignal, type ReservedWords, type Initializer, type Setup, component, };

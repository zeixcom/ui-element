import { type MaybeSignal, type Signal } from '@zeix/cause-effect'
import { type Extractor, type Helpers, type Parser } from './core/dom'
import { type Effects } from './core/reactive'
type ReservedWords =
	| 'constructor'
	| 'prototype'
	| '__proto__'
	| 'toString'
	| 'valueOf'
	| 'hasOwnProperty'
	| 'isPrototypeOf'
	| 'propertyIsEnumerable'
	| 'toLocaleString'
type ValidPropertyKey<T> = T extends keyof HTMLElement | ReservedWords
	? never
	: T
type ValidateComponentProps<P> = {
	[K in keyof P]: ValidPropertyKey<K> extends never ? never : P[K]
}
type ComponentProps = {
	[K in string as ValidPropertyKey<K>]: {}
}
type Component<P extends ComponentProps> = HTMLElement &
	P & {
		attributeChangedCallback<K extends keyof P & string>(
			name: K,
			oldValue: string | null,
			newValue: string | null,
		): void
		debug?: boolean
		getSignal<K extends keyof P & string>(prop: K): Signal<P[K]>
		setSignal<K extends keyof P & string>(
			prop: K,
			signal: Signal<P[K]>,
		): void
	}
type SignalProducer<
	T extends {},
	C extends HTMLElement = HTMLElement,
> = Extractor<MaybeSignal<T>, C>
type MethodProducer<C extends HTMLElement> = (host: C) => void
type Initializer<T extends {}, C extends HTMLElement> =
	| T
	| Parser<T, C>
	| SignalProducer<T, C>
	| MethodProducer<C>
type Setup<P extends ComponentProps> = (
	host: Component<P>,
	helpers: Helpers<P>,
) => Effects<P, Component<P>>
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
declare function component<
	P extends ComponentProps & ValidateComponentProps<P>,
>(
	name: string,
	init: { [K in keyof P]: Initializer<P[K], Component<P>> } | undefined,
	setup: Setup<P>,
): void
export {
	type Component,
	type ComponentProps,
	type ReservedWords,
	type ValidPropertyKey,
	type ValidateComponentProps,
	type Initializer,
	type SignalProducer,
	type MethodProducer,
	type Setup,
	component,
}

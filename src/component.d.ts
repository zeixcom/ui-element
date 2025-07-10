import { type Cleanup, type MaybeSignal, type Signal } from '@zeix/cause-effect'
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
type ComponentProps = {
	[K in string as ValidPropertyKey<K>]: {}
}
type Component<P extends ComponentProps> = HTMLElement &
	P & {
		adoptedCallback?(): void
		attributeChangedCallback(
			name: string,
			oldValue: string | null,
			newValue: string | null,
		): void
		connectedCallback(): void
		disconnectedCallback(): void
		debug?: boolean
		shadowRoot: ShadowRoot | null
		getSignal<K extends keyof P>(prop: K): Signal<P[K]>
		setSignal<K extends keyof P>(prop: K, signal: Signal<P[K]>): void
	}
type AttributeParser<T extends {}, C extends HTMLElement = HTMLElement> = (
	host: C,
	value: string | null | undefined,
	old?: string | null,
) => T
type SignalProducer<T extends {}, C extends HTMLElement = HTMLElement> = (
	host: C,
) => MaybeSignal<T>
type MethodProducer<C extends HTMLElement> = (host: C) => void
type Initializer<T extends {}, C extends HTMLElement> =
	| T
	| AttributeParser<T, C>
	| SignalProducer<T, C>
	| MethodProducer<C>
type Effect<P extends ComponentProps, E extends Element> = (
	host: Component<P>,
	element: E,
) => Cleanup | void
type ElementFromSelector<
	K extends string,
	E extends Element = HTMLElement,
> = K extends keyof HTMLElementTagNameMap
	? HTMLElementTagNameMap[K]
	: K extends keyof SVGElementTagNameMap
		? SVGElementTagNameMap[K]
		: K extends keyof MathMLElementTagNameMap
			? MathMLElementTagNameMap[K]
			: E
type SelectorFunctions<P extends ComponentProps> = {
	first: <E extends Element = never, K extends string = string>(
		selector: K,
		...fns: Effect<P, ElementFromSelector<K, E>>[]
	) => (host: Component<P>) => Cleanup | void
	all: <E extends Element = never, K extends string = string>(
		selector: K,
		...fns: Effect<P, ElementFromSelector<K, E>>[]
	) => (host: Component<P>) => Cleanup
}
declare const RESET: any
/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.12.0
 * @param {string} name - Name of the custom element
 * @param {{ [K in keyof P]: Initializer<P[K], Component<P>> }} init - Signals of the component
 * @param {FxFunction<S>[]} setup - Setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns: void
 */
declare const component: <P extends ComponentProps>(
	name: string,
	init: { [K in keyof P]: Initializer<P[K], Component<P>> } | undefined,
	setup: (
		host: Component<P>,
		select: SelectorFunctions<P>,
	) => Effect<P, Component<P>>[],
) => void
export {
	type Component,
	type ComponentProps,
	type ValidPropertyKey,
	type ReservedWords,
	type Initializer,
	type AttributeParser,
	type SignalProducer,
	type MethodProducer,
	type Effect,
	type ElementFromSelector,
	type SelectorFunctions,
	RESET,
	component,
}

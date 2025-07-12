import { type Cleanup, type MaybeSignal, type Signal } from '@zeix/cause-effect'
import { type ElementFromSelector, type StringParser } from './core/dom'
import type { Effect } from './core/reactive'
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
type SignalProducer<T extends {}, C extends HTMLElement = HTMLElement> = (
	host: C,
) => MaybeSignal<T>
type MethodProducer<C extends HTMLElement> = (host: C) => void
type Initializer<T extends {}, C extends HTMLElement> =
	| T
	| StringParser<T, C>
	| SignalProducer<T, C>
	| MethodProducer<C>
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
/**
 * Define a component with its states and setup function (connectedCallback)
 *
 * @since 0.12.0
 * @param {string} name - Name of the custom element
 * @param {{ [K in keyof P]: Initializer<P[K], Component<P>> }} init - Signals of the component
 * @param {FxFunction<S>[]} setup - Setup function to be called in connectedCallback(), may return cleanup function to be called in disconnectedCallback()
 * @returns: void
 */
declare const component: <P extends ComponentProps & ValidateComponentProps<P>>(
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
	type ReservedWords,
	type ValidPropertyKey,
	type ValidateComponentProps,
	type Initializer,
	type SignalProducer,
	type MethodProducer,
	type SelectorFunctions,
	component,
}

import {
	type Cleanup,
	computed,
	isComputedCallback,
	isFunction,
	isRecord,
	isSignal,
	isString,
	type MaybeCleanup,
	type Signal,
	UNSET,
} from '@zeix/cause-effect'

import type { Component, ComponentProps } from '../component'
import type { LooseExtractor } from './dom'
import {
	InvalidCustomElementError,
	InvalidEffectsError,
	InvalidReactivesError,
} from './errors'
import {
	elementName,
	isCustomElement,
	LOG_ERROR,
	log,
	valueString,
} from './util'

/* === Types === */

type Effect<P extends ComponentProps, E extends Element> = (
	host: Component<P>,
	element: E,
) => MaybeCleanup

type Effects<P extends ComponentProps, E extends Element> =
	| Effect<P, E>
	| Effect<P, E>[]
	| Promise<Effect<P, E>>
	| Promise<Effect<P, E>[]>

type Reactive<T, P extends ComponentProps, E extends Element = HTMLElement> =
	| keyof P
	| Signal<T & {}>
	| LooseExtractor<T, E>

type PassedProp<
	T,
	P extends ComponentProps,
	E extends HTMLElement = HTMLElement,
> = Reactive<T, P, E> | [Reactive<T, P, E>, (value: T) => void]

type PassedProps<P extends ComponentProps, Q extends ComponentProps> = {
	[K in keyof Q & string]?: PassedProp<Q[K], P, Component<Q>>
}

/* === Constants === */

// Special value explicitly marked as any so it can be used as signal value of any type
const RESET: any = Symbol('RESET')

/* === Exported Functions === */

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
const runEffects = <P extends ComponentProps, E extends Element = Component<P>>(
	effects: Effects<P, E>,
	host: Component<P>,
	target: E = host as unknown as E,
): void | Cleanup => {
	try {
		if (effects instanceof Promise) throw effects
		if (!Array.isArray(effects)) return effects(host, target)
		const cleanups = effects
			.filter(isFunction)
			.map(effect => effect(host, target))
		return () => {
			cleanups.filter(isFunction).forEach(cleanup => cleanup())
			cleanups.length = 0
		}
	} catch (error) {
		if (error instanceof Promise) {
			error.then(() => runEffects(effects, host, target))
		} else {
			throw new InvalidEffectsError(
				host,
				error instanceof Error ? error : new Error(String(error)),
			)
		}
	}
}

const resolveReactive = <
	T extends {},
	P extends ComponentProps,
	E extends Element = Component<P>,
>(
	reactive: Reactive<T, P, E>,
	host: Component<P>,
	target: E,
	context?: string,
): T => {
	try {
		return isString(reactive)
			? (host[reactive] as unknown as T)
			: isSignal(reactive)
				? reactive.get()
				: isFunction(reactive)
					? (reactive(target) as unknown as T)
					: RESET
	} catch (error) {
		if (context) {
			log(
				error,
				`Failed to resolve value of ${valueString(reactive)}${
					context ? ` for ${context}` : ''
				} in ${elementName(target)}${
					(host as unknown as E) !== target
						? ` in ${elementName(host)}`
						: ''
				}`,
				LOG_ERROR,
			)
		}
		return RESET
	}
}

/**
 * Effect for passing reactive values to a descendant El Truco component.
 *
 * @since 0.15.0
 * @param {MutableReactives<Component<Q>, P>} props - Reactive values to pass
 * @returns {Effect<P, Component<Q>>} Effect function that passes reactive values to the descendant component
 * @throws {InvalidCustomElementError} When the target element is not a valid custom element
 * @throws {InvalidReactivesError} When the provided reactives is not a record of signals, reactive property names or functions
 * @throws {Error} When passing signals failed for some other reason
 */
const pass =
	<P extends ComponentProps, Q extends ComponentProps>(
		props:
			| PassedProps<P, Q>
			| ((target: Component<Q>) => PassedProps<P, Q>),
	): Effect<P, Component<Q>> =>
	(host, target): MaybeCleanup => {
		if (!isCustomElement(target))
			throw new InvalidCustomElementError(
				target,
				`pass from ${elementName(host)}`,
			)
		const reactives = isFunction(props) ? props(target) : props
		if (!isRecord(reactives))
			throw new InvalidReactivesError(host, target, reactives)

		const resetProperties: PropertyDescriptorMap = {}

		// Return getter from signal, reactive property name or function
		const getGetter = (value: unknown) => {
			if (isSignal(value)) return value.get
			const fn =
				isString(value) && value in host
					? () => host[value as keyof typeof host]
					: isComputedCallback(value)
						? value
						: undefined
			return fn ? computed(fn).get : undefined
		}

		// Iterate through reactives
		for (const [prop, reactive] of Object.entries(reactives)) {
			if (reactive == null) continue

			// Ensure target has configurable property
			const descriptor = Object.getOwnPropertyDescriptor(target, prop)
			if (!(prop in target) || !descriptor?.configurable) continue

			// Determine getter	and setter
			const applied =
				isFunction(reactive) && reactive.length === 1
					? reactive(target)
					: reactive
			const isArray = Array.isArray(applied) && applied.length === 2
			const getter = getGetter(isArray ? applied[0] : applied)
			const setter =
				isArray && isFunction(applied[1]) ? applied[1] : undefined
			if (!getter) continue

			// Store original descriptor for reset and assign new descriptor
			resetProperties[prop] = descriptor
			Object.defineProperty(target, prop, {
				configurable: true,
				enumerable: true,
				get: getter,
				set: setter,
			})

			// Unset previous value so subscribers are notified
			descriptor.set?.call(target, UNSET)
		}

		// Reset to original descriptors on cleanup
		return () => {
			Object.defineProperties(target, resetProperties)
		}
	}

/* === Exports === */

export {
	type Effect,
	type Effects,
	type Reactive,
	type PassedProp,
	type PassedProps,
	pass,
	RESET,
	resolveReactive,
	runEffects,
}

import {
	type Cleanup,
	isFunction,
	isSignal,
	type Signal,
} from '@zeix/cause-effect'

import type { Component, ComponentProps } from '../component'
import type { LooseExtractor } from './dom'
import { InvalidEffectsError } from './errors'
import { elementName, isString, LOG_ERROR, log, valueString } from './util'

/* === Types === */

type Effect<P extends ComponentProps, E extends Element> = (
	host: Component<P>,
	element: E,
) => Cleanup | void

type Effects<P extends ComponentProps, E extends Element> =
	| Effect<P, E>
	| Effect<P, E>[]
	| Promise<Effect<P, E>>
	| Promise<Effect<P, E>[]>

type Reactive<T, P extends ComponentProps, E extends Element = HTMLElement> =
	| keyof P
	| Signal<NonNullable<T>>
	| LooseExtractor<T | null | undefined, E>

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
			? host.getSignal(reactive).get()
			: isSignal(reactive)
				? reactive.get()
				: isFunction(reactive)
					? reactive(target)
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

/* === Exports === */

export {
	type Effect,
	type Effects,
	type Reactive,
	RESET,
	resolveReactive,
	runEffects,
}

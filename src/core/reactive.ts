import {
	type Cleanup,
	type Signal,
	isFunction,
	isSignal,
} from '@zeix/cause-effect'

import type { Component, ComponentProps } from '../component'
import { LOG_ERROR, elementName, isString, log, valueString } from './util'

/* === Types === */

type Effect<P extends ComponentProps, E extends Element> = (
	host: Component<P>,
	element: E,
) => Cleanup | void

type Reactive<T, P extends ComponentProps, E extends Element = HTMLElement> =
	| keyof P
	| Signal<NonNullable<T>>
	| ((element: E) => T | null | undefined)

/* === Constants === */

// Special value explicitly marked as any so it can be used as signal value of any type
const RESET: any = Symbol('RESET')

/* === Exported Functions === */

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
			? (host.getSignal(reactive).get() as unknown as T)
			: isSignal(reactive)
				? reactive.get()
				: isFunction<T>(reactive)
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

export { type Effect, type Reactive, RESET, resolveReactive }

import { type Cleanup, type Signal } from '@zeix/cause-effect'
import type { Component, ComponentProps } from '../component'
import type { LooseExtractor } from './dom'
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
declare const RESET: any
declare const resolveReactive: <
	T extends {},
	P extends ComponentProps,
	E extends Element = Component<P>,
>(
	reactive: Reactive<T, P, E>,
	host: Component<P>,
	target: E,
	context?: string,
) => T
export { type Effect, type Effects, type Reactive, RESET, resolveReactive }

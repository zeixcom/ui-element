import { type Cleanup, type Signal } from '@zeix/cause-effect'
import type { Component, ComponentProps } from '../component'
type Effect<P extends ComponentProps, E extends Element> = (
	host: Component<P>,
	element: E,
) => Cleanup | void
type Reactive<T, P extends ComponentProps, E extends Element = HTMLElement> =
	| keyof P
	| Signal<NonNullable<T>>
	| ((element: E) => T | null | undefined)
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
export { type Effect, type Reactive, RESET, resolveReactive }

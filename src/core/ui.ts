import { type Signal, toSignal } from '@zeix/cause-effect'

import { UIElement } from '../ui-element'
import { log, LOG_ERROR, valueString } from './log'
import { isFunction, isPropertyKey } from './util'

/* === Types === */

type StateLike<T> = PropertyKey | Signal<T> | ((v?: T) => T)
type ValueOrFactory<T> = T | ((element: Element, index: number) => T)
type StateLikeOrStateLikeFactory<T> = ValueOrFactory<StateLike<T>>
type EventListenerOrEventListenerFactory = ValueOrFactory<EventListenerOrEventListenerObject>

/* === Internal Functions === */

const isFactoryFunction = /*#__PURE__*/ <T>(fn: ValueOrFactory<T>): fn is ((element: Element, index: number) => T) =>
	isFunction(fn) && fn.length === 2

const fromFactory = /*#__PURE__*/ <T>(
	fn: ValueOrFactory<T>,
	element: Element,
	index: number = 0,
): T =>
	isFactoryFunction(fn) ? fn(element, index) : fn

/* === Exported Class === */

class UI<T extends Element> {
	constructor(
		public readonly host: UIElement,
		public readonly targets: T[] = [host as unknown as T]
	) {}

	on(type: keyof ElementEventMap, listeners: EventListenerOrEventListenerFactory): UI<T> {
		this.targets.forEach((target, index) => {
			const listener = fromFactory(listeners, target, index)
			target.addEventListener(type, listener)
			this.host.listeners.push(() => target.removeEventListener(type, listener))
		})
        return this
	}

	pass(states: Record<string, StateLikeOrStateLikeFactory<any>>): UI<T> {
		this.targets.forEach(async (target, index) => {
			await UIElement.registry.whenDefined(target.localName)
			if (target instanceof UIElement) {
				Object.entries(states).forEach(([name, source]) => {
					const result = fromFactory(source, target, index)
					const value = isPropertyKey(result)
						? this.host.signals.get(result)
						: toSignal(result, true)
					if (value) target.set(name, value)
				    else log(source, `Invalid source for state ${valueString(name)}`, LOG_ERROR)
				})
            } else {
                log(target, `Target is not a UIElement`, LOG_ERROR)
            }
        })
        return this
	}

	sync(...fns: ((host: UIElement, target: T, index: number) => void)[]): UI<T> {
		this.targets.forEach((target, index) => fns.forEach(fn => fn(this.host, target, index)))
        return this
	}

}

export {
	type StateLike, type StateLikeOrStateLikeFactory, type EventListenerOrEventListenerFactory,
	UI
}
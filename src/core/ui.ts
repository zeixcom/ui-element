import { type Signal, toSignal } from '@zeix/cause-effect'

import { UIElement } from '../ui-element'
import { log, LOG_ERROR, valueString } from './log'
import { isFunction, isPropertyKey } from './util'

/* === Types === */

type StateLike<T> = string | Signal<T> | ((v?: T) => T)
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

/**
 * UI class for managing UI elements and their events, passed states and applied effects
 * 
 * @since 0.8.0
 * @class UI
 * @type {UI}
 */
class UI<T extends Element> {
	constructor(
		public readonly host: UIElement,
		public readonly targets: T[] = [host as unknown as T]
	) {}

	/**
	 * Add event listener to target element(s)
	 * 
	 * @since 0.9.0
	 * @param {string} type - event type
	 * @param {EventListenerOrEventListenerFactory} listeners - event listener or factory function
	 * @returns {UI<T>} - self
	 */
	on(type: string, listeners: EventListenerOrEventListenerFactory): UI<T> {
		this.targets.forEach((target, index) => {
			const listener = fromFactory(listeners, target, index)
			target.addEventListener(type, listener)
			this.host.listeners.push(() => target.removeEventListener(type, listener))
		})
        return this
	}

	/**
	 * Emit custom event to target element(s)
	 * 
	 * @since 0.10.0
	 * @param {string} type - event type
	 * @param {unknown} detail - event detail
	 * @returns {UI<T>} - self
	 */
	emit(type: string, detail?: unknown): UI<T> {
		this.targets.forEach(target => {
			target.dispatchEvent(new CustomEvent(type, {
				detail,
				bubbles: true
			}))
		})
		return this
	}

	/**
	 * Pass states to target element(s) of type UIElement using provided sources
	 * 
	 * @since 0.9.0
	 * @param {S extends Record<PropertyKey, StateLikeOrStateLikeFactory<unknown>>} states - state sources
	 * @returns {UI<T>} - self
	 */
	pass<S extends Record<PropertyKey, StateLikeOrStateLikeFactory<unknown>>>(states: S): UI<T> {
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

	/**
	 * Sync state changes to target element(s) using provided functions
	 * 
	 * @since 0.9.0
	 * @param {((host: UIElement, target: T, index: number) => void)[]} fns - state sync functions
	 * @returns {UI<T>} - self
	 */
	sync(...fns: ((host: UIElement, target: T, index: number) => void)[]): UI<T> {
		this.targets.forEach((target, index) => fns.forEach(fn => fn(this.host, target, index)))
        return this
	}

}

export {
	type StateLike, type StateLikeOrStateLikeFactory, type EventListenerOrEventListenerFactory,
	UI
}
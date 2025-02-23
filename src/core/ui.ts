import { isSignal, type Signal, toSignal } from '@zeix/cause-effect'

import { UIElement, type ComponentSignals } from '../ui-element'
import { elementName, log, LOG_ERROR, LOG_WARN, valueString } from './log'
import { isDefinedObject, isFunction, isString } from './util'

/* === Types === */

type EventListenerProvider = (<E extends Element>(element: E, index: number) => EventListenerOrEventListenerObject)

type SignalLike<T> = PropertyKey | Signal<NonNullable<T>> | ((v?: T) => T)
type PassedSignals<S extends ComponentSignals> = { [K in keyof S]: SignalLike<S[K]> }
type PassedSignalsProvider<S extends ComponentSignals> = (<E extends Element>(element: E, index: number) => PassedSignals<S> | PassedSignalsProvider<S>)

/* === Exported Class === */

/**
 * UI class for managing UI elements and their events, passed states and applied effects
 * 
 * @since 0.8.0
 * @class UI
 * @type {UI}
 */
class UI<E extends Element = HTMLElement, S extends ComponentSignals = {}> {
	constructor(
		public readonly host: UIElement<S>,
		public readonly targets: E[] = [host as unknown as E]
	) {}

	/**
	 * Add event listener to target element(s)
	 * 
	 * @since 0.9.0
	 * @param {string} type - event type
	 * @param {EventListenerOrEventListenerObject | EventListenerProvider} listenerOrProvider - event listener or provider function
	 * @returns {this} - self
	 */
	on(
		type: string,
		listenerOrProvider: EventListenerOrEventListenerObject | EventListenerProvider
	): this {
		this.targets.forEach((target, index) => {
			let listener: EventListenerOrEventListenerObject
			if (isFunction(listenerOrProvider)) {
				listener = (listenerOrProvider.length === 2)
					? (listenerOrProvider as EventListenerProvider)(target, index)
					: listenerOrProvider
			} else if (isDefinedObject(listenerOrProvider) && isFunction(listenerOrProvider.handleEvent)) {
				listener = listenerOrProvider as EventListenerObject
			} else {
				log(listenerOrProvider, `Invalid listener provided for ${type} event on element ${elementName(target)}`, LOG_ERROR)
			    return
			}
			target.addEventListener(type, listener)
			this.host.cleanup.push(() => target.removeEventListener(type, listener))
		})
        return this
	}

	/**
	 * Emit custom event to target element(s)
	 * 
	 * @since 0.10.0
	 * @param {string} type - event type
	 * @param {T} detail - event detail
	 * @returns {this} - self
	 */
	emit<T>(type: string, detail?: T): this {
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
 	 * @param {PassedSignals<T> | PassedSignalsProvider<T>} passedSignalsOrProvider - object of signal sources or provider function
	 * @returns {this} - self
	 */
	pass<T extends ComponentSignals>(
		passedSignalsOrProvider: PassedSignals<T> | PassedSignalsProvider<T>
	): this {
		this.targets.forEach(async (target, index) => {
			await UIElement.registry.whenDefined(target.localName)
			if (target instanceof UIElement) {

				// Get passed signals from provider function or object
				let passedSignals: PassedSignals<T>
				if (isFunction(passedSignalsOrProvider) && passedSignalsOrProvider.length === 2) {
					passedSignals = passedSignalsOrProvider(target, index) as PassedSignals<T>
                } else if (isDefinedObject(passedSignalsOrProvider)) {
					passedSignals = passedSignalsOrProvider as PassedSignals<T>
				} else {
                    log(passedSignalsOrProvider, `Invalid passed signals provided`, LOG_ERROR)
                    return
                }

				// Set states from passed signals or provider function or object to target UIElement instance
				Object.entries(passedSignals).forEach(([key, source]) => {
					if (isString(source)) {
						if (source in this.host.signals) {
							target.set(key, this.host.signals[source as keyof S])
						} else {
							log(source, `Invalid string key "${source}" for state ${valueString(key)}`, LOG_WARN)
						}
					} else if (isFunction(source) || isSignal(source)) {
						target.set(key, toSignal(source, true))
					} else {
						log(source, `Invalid source for state ${valueString(key)}`, LOG_WARN)
					}
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
	 * @param {((host: UIElement<S>, target: E, index: number) => void)[]} fns - state sync functions
	 * @returns {this} - self
	 */
	sync(
		...fns: ((host: UIElement, target: E, index: number) => void)[]
	): this {
		this.targets.forEach((target, index) =>
			fns.forEach(fn => fn(this.host, target, index)))
        return this
	}

}

export {
	type SignalLike, type PassedSignals, type PassedSignalsProvider, type EventListenerProvider,
	UI
}
import { isState, type Signal, toSignal, UNSET } from '@zeix/cause-effect'

import { isFunction } from './util'
import type { ComponentProps } from '../component'
import { elementName, log, LOG_ERROR } from './log'

/* === Types === */

type EventListenerProvider = (<E extends Element>(element: E, index: number) => EventListenerOrEventListenerObject)

/* type PassedSignals<S extends ComponentSignals> = { [K in keyof S]: MaybeSignal<S[K]> }
type PassedSignalsProvider<S extends ComponentSignals> = (<E extends Element>(element: E, index: number) => PassedSignals<S> | PassedSignalsProvider<S>)

type UI<E extends Element, S extends ComponentSignals> = {
	host: UIElement<S>,
	targets: E[],
	on: (
        type: string,
        listenerOrProvider: EventListenerOrEventListenerObject | EventListenerProvider
    ) => UI<E, S>,
    emit: <T>(
		type: string,
		detail?: T
	) => UI<E, S>,
	pass: <T extends ComponentSignals>(
		passedSignalsOrProvider: PassedSignals<T> | PassedSignalsProvider<T>
	) => UI<E, S>,
	sync: (
		...fns: ((host: UIElement<S>, target: E, index: number) => void)[]
	) => UI<E, S>,
} */

/* === Internal Functions === */

const isProvider = <T>(value: unknown): value is (target: Element, index: number) => T =>
	isFunction(value) && value.length == 2

/* === Exported Function === */

/**
 * Create a new UI object for managing UI elements and their events, passed states and applied effects
 * 
 * @since 0.11.0
 * @param {UIElement<S>} host
 * @param {E} targets
 * @returns {UI<E, S>} - new UI object
 * /
const ui = <E extends Element, S extends ComponentSignals>(
	host: UIElement<S>,
	targets: E[] = [host as unknown as E]
): UI<E, S> => {
	const u = {
		host,
		targets,

		/**
		 * Add event listener to target element(s)
		 * 
		 * @since 0.9.0
		 * @param {string} type - event type
		 * @param {EventListenerOrEventListenerObject | EventListenerProvider} listenerOrProvider - event listener or provider function
		 * @returns {UI<E, S>} - self
		 * /
		on: (
			type: string,
			listenerOrProvider: EventListenerOrEventListenerObject | EventListenerProvider
		): UI<E, S> => {
			targets.forEach((target, index) => {
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
				host.cleanup.push(() => target.removeEventListener(type, listener))
			})
			return u
		},

			/**
		 * Emit custom event to target element(s)
		 * 
		 * @since 0.10.0
		 * @param {string} type - event type
		 * @param {T} detail - event detail
		 * @returns {UI<E, S>} - self
		 * /
		emit: <T>(type: string, detail?: T): UI<E, S> => {
			targets.forEach(target => {
				target.dispatchEvent(new CustomEvent(type, {
					detail,
					bubbles: true
				}))
			})
			return u
		},

		/**
		 * Pass states to target element(s) of type UIElement using provided sources
		 * 
		 * @since 0.9.0
		 * @param {PassedSignals<T> | PassedSignalsProvider<T>} passedSignalsOrProvider - object of signal sources or provider function
		 * @returns {UI<E, S>} - self
		 * /
		pass: <T extends ComponentSignals>(
			passedSignalsOrProvider: PassedSignals<T> | PassedSignalsProvider<T>
		): UI<E, S> => {
			targets.forEach(async (target, index) => {
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
							if (source in host.signals) {
								target.set(key, host.signals[source as keyof S])
							} else {
								log(source, `Invalid string key "${source}" for state ${valueString(key)}`, LOG_WARN)
							}
						} else {
							try {
								target.set(key, toSignal(source))
							} catch (error) {
								log(error, `Invalid source for state ${valueString(key)}`, LOG_WARN)
							}
						}
					})
				} else {
					log(target, `Target is not a UIElement`, LOG_ERROR)
				}
			})
			return u
		},

		/**
		 * Sync state changes to target element(s) using provided functions
		 * 
		 * @since 0.9.0
		 * @param {((host: UIElement<S>, target: E, index: number) => void)[]} fns - state sync functions
		 * @returns {UI<E, S>} - self
		 * /
		sync: (
			...fns: ((host: UIElement<S>, target: E, index: number) => void)[]
		): UI<E, S> => {
			targets.forEach((target, index) =>
				fns.forEach(fn => fn(host, target, index)))
			return u
		}
	}

	return u
} */

const on = (
	type: string,
	handler: EventListenerOrEventListenerObject | EventListenerProvider
) => <P extends ComponentProps>(
	host: HTMLElement & P,
	target: Element = host,
	index = 0
): () => void => {
	const listener = isProvider(handler) ? handler(target, index) : handler
	target.addEventListener(type, listener)
	return () => target.removeEventListener(type, listener)
}

const emit = <T>(
	type: string,
	detail: T | ((target: Element, index: number) => T)
) => <P extends ComponentProps>(
	host: HTMLElement & P,
	target: Element = host,
	index = 0
): void => {
	target.dispatchEvent(new CustomEvent(type, {
		detail: isProvider(detail) ? detail(target, index) : detail,
		bubbles: true
	}))
}

const pass = <P extends ComponentProps>(
	signals: Partial<{ [K in keyof P]: Signal<P[K]> }>
) => <Q extends ComponentProps>(
	_: HTMLElement & P,
	target: HTMLElement & Q,
	index = 0
) => {
	const sources = isProvider(signals)
		? signals(target, index) as Partial<{ [K in keyof P]: Signal<P[K]> }>
		: signals
	Object.entries(sources).forEach(([prop, source]) => {
		if (prop in target && isState(target[prop])) {
			target[prop].set(UNSET) // clear previous state so watchers re-subscribe to new signal
		}
		const signal = toSignal(source)
	  	Object.defineProperty(target, prop, {
			get: () => signal.get(),
			set: (value: P[keyof P]) => 'set' in signal
				? signal.set(value)
				: log(prop, `Computed property "${prop}" of ${elementName(target)} cannot be set`, LOG_ERROR),
			enumerable: true,
			configurable: true
		})
	})
}

export {
	type EventListenerProvider,
	on, emit, pass
}
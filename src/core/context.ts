import type { Signal } from '@zeix/cause-effect'
import { isFunction } from '@zeix/cause-effect/src/util'

import { type Component, type ComponentProps } from '../component'

/** @see https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md */

/* === Type definitions === */

/**
 * A context key.
 *
 * A context key can be any type of object, including strings and symbols. The
 *  Context type brands the key type with the `__context__` property that
 * carries the type of the value the context references.
 */
type Context<K, V> = K & { __context__: V }

/**
 * An unknown context type
 */
type UnknownContext = Context<unknown, unknown>

/**
 * A helper type which can extract a Context value type from a Context type
 */
type ContextType<T extends UnknownContext> =
	T extends Context<string, infer V> ? V : never

/**
 * A callback which is provided by a context requester and is called with the value satisfying the request.
 * This callback can be called multiple times by context providers as the requested value is changed.
 */
type ContextCallback<V> = (value: V, unsubscribe?: () => void) => void

declare global {
	interface HTMLElementEventMap {
		/**
		 * A 'context-request' event can be emitted by any element which desires
		 * a context value to be injected by an external provider.
		 */
		'context-request': ContextRequestEvent<Context<string, unknown>>
	}
}

/* === Constants === */

const CONTEXT_REQUEST = 'context-request'

/* === Exported class === */

/**
 * Class for context-request events
 *
 * An event fired by a context requester to signal it desires a named context.
 *
 * A provider should inspect the `context` property of the event to determine if it has a value that can
 * satisfy the request, calling the `callback` with the requested value if so.
 *
 * If the requested context event contains a truthy `subscribe` value, then a provider can call the callback
 * multiple times if the value is changed, if this is the case the provider should pass an `unsubscribe`
 * function to the callback which requesters can invoke to indicate they no longer wish to receive these updates.
 *
 * @class ContextRequestEvent
 * @extends {Event}
 *
 * @property {T} context - context key
 * @property {ContextCallback<ContextType<T>>} callback - callback function for value getter and unsubscribe function
 * @property {boolean} [subscribe=false] - whether to subscribe to context changes
 */
class ContextRequestEvent<T extends UnknownContext> extends Event {
	constructor(
		public readonly context: T,
		public readonly callback: ContextCallback<ContextType<T>>,
		public readonly subscribe: boolean = false,
	) {
		super(CONTEXT_REQUEST, {
			bubbles: true,
			composed: true,
		})
	}
}

const provide =
	<P extends ComponentProps>(
		provided: Context<keyof P, Signal<P[keyof P]>>[],
	) =>
	(host: Component<P>) => {
		const listener = (e: Event) => {
			const { context, callback } = e as ContextRequestEvent<
				Context<keyof P, Signal<P[keyof P]>>
			>
			if (provided.includes(context) && isFunction(callback)) {
				e.stopPropagation()
				callback(host.getSignal(String(context)))
			}
		}
		host.addEventListener(CONTEXT_REQUEST, listener)
		return () => host.removeEventListener(CONTEXT_REQUEST, listener)
	}

const consume =
	<T extends {}, C extends HTMLElement>(
		context: Context<string, Signal<T>>,
	) =>
	(host: C) => {
		let consumed
		host.dispatchEvent(
			new ContextRequestEvent(context, (value: Signal<T>) => {
				consumed = value
			}),
		)
		return consumed
	}

export {
	type Context,
	type UnknownContext,
	type ContextType,
	CONTEXT_REQUEST,
	ContextRequestEvent,
	provide,
	consume,
}

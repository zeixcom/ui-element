/**
 * Simple event emitter for the dev server
 */

import type { EventHandler, IEventEmitter, ServerEvents } from './types.js'

/**
 * Simple event emitter implementation
 */
export class EventEmitter implements IEventEmitter {
	private eventListeners = new Map<
		keyof ServerEvents,
		Set<EventHandler<any>>
	>()

	/**
	 * Register an event handler
	 */
	public on<K extends keyof ServerEvents>(
		event: K,
		handler: EventHandler<ServerEvents[K]>,
	): void {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, new Set())
		}
		this.eventListeners.get(event)!.add(handler)
	}

	/**
	 * Remove an event handler
	 */
	public off<K extends keyof ServerEvents>(
		event: K,
		handler: EventHandler<ServerEvents[K]>,
	): void {
		const handlers = this.eventListeners.get(event)
		if (handlers) {
			handlers.delete(handler)
			if (handlers.size === 0) {
				this.eventListeners.delete(event)
			}
		}
	}

	/**
	 * Emit an event to all registered handlers
	 */
	public emit<K extends keyof ServerEvents>(
		event: K,
		data: ServerEvents[K],
	): void {
		const handlers = this.eventListeners.get(event)
		if (handlers) {
			for (const handler of handlers) {
				try {
					const result = handler(data)
					if (result instanceof Promise) {
						result.catch(error => {
							console.error(
								`Error in event handler for '${String(event)}':`,
								error,
							)
						})
					}
				} catch (error) {
					console.error(
						`Error in event handler for '${String(event)}':`,
						error,
					)
				}
			}
		}
	}

	/**
	 * Register a one-time event handler
	 */
	public once<K extends keyof ServerEvents>(
		event: K,
		handler: EventHandler<ServerEvents[K]>,
	): void {
		const onceHandler = (data: ServerEvents[K]) => {
			handler(data)
			this.off(event, onceHandler as any)
		}
		this.on(event, onceHandler as any)
	}

	/**
	 * Remove all handlers for an event
	 */
	public removeAllListeners<K extends keyof ServerEvents>(event?: K): void {
		if (event) {
			this.eventListeners.delete(event)
		} else {
			this.eventListeners.clear()
		}
	}

	/**
	 * Get the number of handlers for an event
	 */
	public listenerCount<K extends keyof ServerEvents>(event: K): number {
		return this.eventListeners.get(event)?.size || 0
	}

	/**
	 * Get all registered event names
	 */
	public eventNames(): (keyof ServerEvents)[] {
		return Array.from(this.eventListeners.keys())
	}

	/**
	 * Get all handlers for an event
	 */
	public listeners<K extends keyof ServerEvents>(
		event: K,
	): EventHandler<ServerEvents[K]>[] {
		const handlers = this.eventListeners.get(event)
		return handlers ? Array.from(handlers) : []
	}
}

/**
 * Event Emitter Tests
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { EventEmitter } from '../event-emitter.js'
import type { ServerEvents } from '../types.js'
import { createMockFunction, delay } from './helpers/test-setup.js'

describe('EventEmitter', () => {
	let eventEmitter: EventEmitter

	beforeEach(() => {
		eventEmitter = new EventEmitter()
	})

	afterEach(() => {
		eventEmitter.removeAllListeners()
	})

	describe('on() and emit()', () => {
		it('should register and call event handlers', () => {
			const handler = createMockFunction()
			const testData = { files: ['test.ts'], commands: ['build'] }

			eventEmitter.on('build:start', handler)
			eventEmitter.emit('build:start', testData)

			expect(handler.calls.length).toBe(1)
			expect(handler.calls[0][0]).toEqual(testData)
		})

		it('should call multiple handlers for the same event', () => {
			const handler1 = createMockFunction()
			const handler2 = createMockFunction()
			const testData = { files: ['test.ts'], commands: ['build'] }

			eventEmitter.on('build:start', handler1)
			eventEmitter.on('build:start', handler2)
			eventEmitter.emit('build:start', testData)

			expect(handler1.calls.length).toBe(1)
			expect(handler2.calls.length).toBe(1)
			expect(handler1.calls[0][0]).toEqual(testData)
			expect(handler2.calls[0][0]).toEqual(testData)
		})

		it('should handle multiple different events', () => {
			const startHandler = createMockFunction()
			const completeHandler = createMockFunction()

			const startData = { files: ['test.ts'], commands: ['build'] }
			const completeData = { results: [], duration: 100 }

			eventEmitter.on('build:start', startHandler)
			eventEmitter.on('build:complete', completeHandler)

			eventEmitter.emit('build:start', startData)
			eventEmitter.emit('build:complete', completeData)

			expect(startHandler.calls.length).toBe(1)
			expect(completeHandler.calls.length).toBe(1)
			expect(startHandler.calls[0][0]).toEqual(startData)
			expect(completeHandler.calls[0][0]).toEqual(completeData)
		})

		it('should not call handlers for different events', () => {
			const handler = createMockFunction()

			eventEmitter.on('build:start', handler)
			eventEmitter.emit('build:complete', { results: [], duration: 100 })

			expect(handler.calls.length).toBe(0)
		})

		it('should handle handlers that throw errors', () => {
			const errorHandler = createMockFunction(() => {
				throw new Error('Handler error')
			})
			const normalHandler = createMockFunction()

			eventEmitter.on('build:start', errorHandler)
			eventEmitter.on('build:start', normalHandler)

			// Should not throw even if handler throws
			expect(() => {
				eventEmitter.emit('build:start', { files: [], commands: [] })
			}).not.toThrow()

			expect(errorHandler.calls.length).toBe(1)
			expect(normalHandler.calls.length).toBe(1)
		})

		it('should handle async handlers that reject', async () => {
			const asyncErrorHandler = createMockFunction(async () => {
				throw new Error('Async handler error')
			})
			const normalHandler = createMockFunction()

			eventEmitter.on('build:start', asyncErrorHandler)
			eventEmitter.on('build:start', normalHandler)

			// Should not throw
			expect(() => {
				eventEmitter.emit('build:start', { files: [], commands: [] })
			}).not.toThrow()

			expect(asyncErrorHandler.calls.length).toBe(1)
			expect(normalHandler.calls.length).toBe(1)

			// Wait a bit for async errors to be handled
			await delay(10)
		})

		it('should preserve handler execution order', () => {
			const executionOrder: number[] = []

			const handler1 = createMockFunction(() => executionOrder.push(1))
			const handler2 = createMockFunction(() => executionOrder.push(2))
			const handler3 = createMockFunction(() => executionOrder.push(3))

			eventEmitter.on('build:start', handler1)
			eventEmitter.on('build:start', handler2)
			eventEmitter.on('build:start', handler3)

			eventEmitter.emit('build:start', { files: [], commands: [] })

			expect(executionOrder).toEqual([1, 2, 3])
		})
	})

	describe('off()', () => {
		it('should remove specific handler', () => {
			const handler1 = createMockFunction()
			const handler2 = createMockFunction()

			eventEmitter.on('build:start', handler1)
			eventEmitter.on('build:start', handler2)

			eventEmitter.off('build:start', handler1)
			eventEmitter.emit('build:start', { files: [], commands: [] })

			expect(handler1.calls.length).toBe(0)
			expect(handler2.calls.length).toBe(1)
		})

		it('should handle removing non-existent handler', () => {
			const handler = createMockFunction()

			// Should not throw
			expect(() => {
				eventEmitter.off('build:start', handler)
			}).not.toThrow()
		})

		it('should handle removing handler from non-existent event', () => {
			const handler = createMockFunction()

			// Should not throw
			expect(() => {
				eventEmitter.off('build:start', handler)
			}).not.toThrow()
		})

		it('should remove event when no handlers remain', () => {
			const handler = createMockFunction()

			eventEmitter.on('build:start', handler)
			expect(eventEmitter.listenerCount('build:start')).toBe(1)

			eventEmitter.off('build:start', handler)
			expect(eventEmitter.listenerCount('build:start')).toBe(0)
		})
	})

	describe('once()', () => {
		it('should call handler only once', () => {
			const handler = createMockFunction()

			eventEmitter.once('build:start', handler)

			eventEmitter.emit('build:start', { files: [], commands: [] })
			eventEmitter.emit('build:start', { files: [], commands: [] })

			expect(handler.calls.length).toBe(1)
		})

		it('should automatically remove handler after first call', () => {
			const handler = createMockFunction()

			eventEmitter.once('build:start', handler)
			expect(eventEmitter.listenerCount('build:start')).toBe(1)

			eventEmitter.emit('build:start', { files: [], commands: [] })
			expect(eventEmitter.listenerCount('build:start')).toBe(0)
		})

		it('should work alongside regular handlers', () => {
			const onceHandler = createMockFunction()
			const regularHandler = createMockFunction()

			eventEmitter.once('build:start', onceHandler)
			eventEmitter.on('build:start', regularHandler)

			eventEmitter.emit('build:start', { files: [], commands: [] })
			eventEmitter.emit('build:start', { files: [], commands: [] })

			expect(onceHandler.calls.length).toBe(1)
			expect(regularHandler.calls.length).toBe(2)
		})
	})

	describe('removeAllListeners()', () => {
		it('should remove all listeners for specific event', () => {
			const handler1 = createMockFunction()
			const handler2 = createMockFunction()
			const otherHandler = createMockFunction()

			eventEmitter.on('build:start', handler1)
			eventEmitter.on('build:start', handler2)
			eventEmitter.on('build:complete', otherHandler)

			eventEmitter.removeAllListeners('build:start')

			eventEmitter.emit('build:start', { files: [], commands: [] })
			eventEmitter.emit('build:complete', { results: [], duration: 100 })

			expect(handler1.calls.length).toBe(0)
			expect(handler2.calls.length).toBe(0)
			expect(otherHandler.calls.length).toBe(1)
		})

		it('should remove all listeners for all events', () => {
			const handler1 = createMockFunction()
			const handler2 = createMockFunction()

			eventEmitter.on('build:start', handler1)
			eventEmitter.on('build:complete', handler2)

			eventEmitter.removeAllListeners()

			eventEmitter.emit('build:start', { files: [], commands: [] })
			eventEmitter.emit('build:complete', { results: [], duration: 100 })

			expect(handler1.calls.length).toBe(0)
			expect(handler2.calls.length).toBe(0)
		})

		it('should handle removing from non-existent event', () => {
			// Should not throw
			expect(() => {
				eventEmitter.removeAllListeners('build:start')
			}).not.toThrow()
		})
	})

	describe('listenerCount()', () => {
		it('should return correct count for event with handlers', () => {
			const handler1 = createMockFunction()
			const handler2 = createMockFunction()

			expect(eventEmitter.listenerCount('build:start')).toBe(0)

			eventEmitter.on('build:start', handler1)
			expect(eventEmitter.listenerCount('build:start')).toBe(1)

			eventEmitter.on('build:start', handler2)
			expect(eventEmitter.listenerCount('build:start')).toBe(2)
		})

		it('should return 0 for event with no handlers', () => {
			expect(eventEmitter.listenerCount('build:start')).toBe(0)
		})

		it('should update count when handlers are removed', () => {
			const handler1 = createMockFunction()
			const handler2 = createMockFunction()

			eventEmitter.on('build:start', handler1)
			eventEmitter.on('build:start', handler2)
			expect(eventEmitter.listenerCount('build:start')).toBe(2)

			eventEmitter.off('build:start', handler1)
			expect(eventEmitter.listenerCount('build:start')).toBe(1)

			eventEmitter.off('build:start', handler2)
			expect(eventEmitter.listenerCount('build:start')).toBe(0)
		})
	})

	describe('eventNames()', () => {
		it('should return empty array when no events registered', () => {
			expect(eventEmitter.eventNames()).toEqual([])
		})

		it('should return names of registered events', () => {
			const handler = createMockFunction()

			eventEmitter.on('build:start', handler)
			eventEmitter.on('build:complete', handler)

			const eventNames = eventEmitter.eventNames()
			expect(eventNames).toContain('build:start')
			expect(eventNames).toContain('build:complete')
			expect(eventNames.length).toBe(2)
		})

		it('should not include duplicate event names', () => {
			const handler1 = createMockFunction()
			const handler2 = createMockFunction()

			eventEmitter.on('build:start', handler1)
			eventEmitter.on('build:start', handler2)

			const eventNames = eventEmitter.eventNames()
			expect(
				eventNames.filter(name => name === 'build:start').length,
			).toBe(1)
		})

		it('should update when events are removed', () => {
			const handler = createMockFunction()

			eventEmitter.on('build:start', handler)
			expect(eventEmitter.eventNames()).toContain('build:start')

			eventEmitter.off('build:start', handler)
			expect(eventEmitter.eventNames()).not.toContain('build:start')
		})
	})

	describe('listeners()', () => {
		it('should return array of handlers for event', () => {
			const handler1 = createMockFunction()
			const handler2 = createMockFunction()

			eventEmitter.on('build:start', handler1)
			eventEmitter.on('build:start', handler2)

			const listeners = eventEmitter.listeners('build:start')
			expect(listeners).toContain(handler1)
			expect(listeners).toContain(handler2)
			expect(listeners.length).toBe(2)
		})

		it('should return empty array for event with no handlers', () => {
			const listeners = eventEmitter.listeners('build:start')
			expect(listeners).toEqual([])
		})

		it('should return copy of handlers array', () => {
			const handler = createMockFunction()

			eventEmitter.on('build:start', handler)

			const listeners1 = eventEmitter.listeners('build:start')
			const listeners2 = eventEmitter.listeners('build:start')

			expect(listeners1).not.toBe(listeners2) // Different array instances
			expect(listeners1).toEqual(listeners2) // Same content
		})
	})

	describe('memory management', () => {
		it('should not leak memory when handlers are added and removed', () => {
			const handler = createMockFunction()

			for (let i = 0; i < 100; i++) {
				eventEmitter.on('build:start', handler)
				eventEmitter.off('build:start', handler)
			}

			expect(eventEmitter.listenerCount('build:start')).toBe(0)
			expect(eventEmitter.eventNames()).not.toContain('build:start')
		})

		it('should clean up after removeAllListeners', () => {
			const handler = createMockFunction()

			for (let i = 0; i < 10; i++) {
				eventEmitter.on(`event:${i}` as keyof ServerEvents, handler)
			}

			expect(eventEmitter.eventNames().length).toBe(10)

			eventEmitter.removeAllListeners()

			expect(eventEmitter.eventNames().length).toBe(0)
		})
	})

	describe('type safety', () => {
		it('should only accept valid server events', () => {
			const handler = createMockFunction()

			// These should compile without errors
			eventEmitter.on('build:start', handler)
			eventEmitter.on('build:complete', handler)
			eventEmitter.on('build:error', handler)
			eventEmitter.on('file:changed', handler)
			eventEmitter.on('client:connected', handler)
			eventEmitter.on('client:disconnected', handler)
			eventEmitter.on('server:ready', handler)
			eventEmitter.on('server:error', handler)

			// Test that we can emit with correct data types
			eventEmitter.emit('build:start', {
				files: ['test'],
				commands: ['build'],
			})
			eventEmitter.emit('build:complete', { results: [], duration: 100 })
			eventEmitter.emit('server:ready', { port: 3000, host: 'localhost' })

			expect(handler.calls.length).toBe(3) // 3 emissions only
		})

		it('should provide correct event data types to handlers', () => {
			eventEmitter.on('build:start', data => {
				// TypeScript should infer correct types
				expect(Array.isArray(data.files)).toBe(true)
				expect(Array.isArray(data.commands)).toBe(true)
			})

			eventEmitter.on('server:ready', data => {
				expect(typeof data.port).toBe('number')
				expect(typeof data.host).toBe('string')
			})

			eventEmitter.emit('build:start', {
				files: ['test'],
				commands: ['build'],
			})
			eventEmitter.emit('server:ready', { port: 3000, host: 'localhost' })
		})
	})
})

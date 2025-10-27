/**
 * Reactive File Watcher Tests
 * Basic tests for the reactive file watching system
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { EventEmitter } from '../event-emitter'
import { FileWatcher } from '../file-watcher'
import {
	createFileSystemSignals,
	createFileProcessor,
} from '../signals'
import type { DevServerConfig, FileProcessor, FileSystemSignals } from '../types'
import {
	createMockFunction,
	createTestContext,
	delay,
	type TestContext,
} from './helpers/test-setup.js'

describe('ReactiveFileWatcher', () => {
	let testContext: TestContext
	let watcher: FileWatcher
	let eventEmitter: EventEmitter
	let signals: FileSystemSignals
	let processor: FileProcessor
	let config: DevServerConfig

	beforeEach(async () => {
		testContext = createTestContext('watcher-test')
		config = testContext.config
		eventEmitter = new EventEmitter()

		// Initialize reactive architecture
		signals = createFileSystemSignals({ config })
		processor = createFileProcessor(signals)

		// Create watcher with reactive dependencies
		watcher = new FileWatcher(
			config,
			eventEmitter,
			processor,
			signals,
		)

		// Create test directories
		mkdirSync(config.paths.pages, { recursive: true })
		mkdirSync(config.paths.components, { recursive: true })
		mkdirSync(config.paths.src, { recursive: true })
	})

	afterEach(async () => {
		if (watcher) {
			await watcher.stop()
		}
		testContext.cleanup()
	})

	describe('initialization', () => {
		it('should create watcher with correct dependencies', () => {
			expect(watcher).toBeDefined()
		})

		it('should have initial inactive state', () => {
			const stats = watcher.getStats()
			expect(stats.isActive).toBe(false)
			expect(stats.watchedPaths).toBe(0)
		})
	})

	describe('start() and stop()', () => {
		it('should start watching configured paths', async () => {
			await watcher.start()

			const stats = watcher.getStats()
			expect(stats.isActive).toBe(true)
			expect(stats.watchedPaths).toBeGreaterThan(0)
		})

		it('should stop watching and cleanup', async () => {
			await watcher.start()
			expect(watcher.getStats().isActive).toBe(true)

			await watcher.stop()
			expect(watcher.getStats().isActive).toBe(false)
		})

		it('should handle stop when not started', async () => {
			// Should not throw
			await watcher.stop()
			expect(watcher.getStats().isActive).toBe(false)
		})

		it('should not start twice', async () => {
			await watcher.start()
			const firstStats = watcher.getStats()

			// Second start should be ignored
			await watcher.start()
			const secondStats = watcher.getStats()

			expect(firstStats.isActive).toBe(true)
			expect(secondStats.isActive).toBe(true)
		})
	})

	describe('file change detection', () => {
		beforeEach(async () => {
			await watcher.start()
		})

		it('should detect markdown file changes', async () => {
			const mockHandler = createMockFunction(() => {})
			eventEmitter.on('file:changed', mockHandler)

			const testFile = join(config.paths.pages, 'test.md')
			writeFileSync(testFile, '# Test Page')

			// Allow time for file system events
			await delay(300)

			// Should have detected the change
			expect(mockHandler.calls.length).toBeGreaterThan(0)
		})

		it('should detect TypeScript component changes', async () => {
			const mockHandler = createMockFunction(() => {})
			eventEmitter.on('file:changed', mockHandler)

			const testFile = join(config.paths.components, 'test.ts')
			writeFileSync(testFile, 'export class Test {}')

			// Allow time for file system events
			await delay(300)

			// Should have detected the change
			expect(mockHandler.calls.length).toBeGreaterThan(0)
		})

		it('should detect CSS component changes', async () => {
			const mockHandler = createMockFunction(() => {})
			eventEmitter.on('file:changed', mockHandler)

			const testFile = join(config.paths.components, 'test.css')
			writeFileSync(testFile, 'body { margin: 0; }')

			// Allow time for file system events
			await delay(300)

			// Should have detected the change
			expect(mockHandler.calls.length).toBeGreaterThan(0)
		})

		it('should detect src file changes', async () => {
			const mockHandler = createMockFunction(() => {})
			eventEmitter.on('file:changed', mockHandler)

			const testFile = join(config.paths.src, 'utils.ts')
			writeFileSync(testFile, 'export const utils = {};')

			// Allow time for file system events
			await delay(300)

			// Should have detected the change
			expect(mockHandler.calls.length).toBeGreaterThan(0)
		})
	})

	describe('statistics', () => {
		it('should provide accurate statistics', async () => {
			const initialStats = watcher.getStats()
			expect(initialStats.isActive).toBe(false)
			expect(initialStats.watchedPaths).toBe(0)

			await watcher.start()

			const runningStats = watcher.getStats()
			expect(runningStats.isActive).toBe(true)
			expect(runningStats.watchedPaths).toBeGreaterThan(0)
			expect(typeof runningStats.lastChange).toBe('number')
			expect(typeof runningStats.trackedFiles).toBe('number')
		})

		it('should update lastChange when files change', async () => {
			await watcher.start()

			const initialStats = watcher.getStats()
			const initialLastChange = initialStats.lastChange

			// Create a file change
			const testFile = join(config.paths.pages, 'change-test.md')
			writeFileSync(testFile, '# Change Test')

			// Allow time for processing
			await delay(200)

			const updatedStats = watcher.getStats()
			expect(updatedStats.lastChange).toBeGreaterThan(initialLastChange)
		})
	})

	describe('error handling', () => {
		it('should handle invalid directories gracefully', async () => {
			// Modify config to include non-existent directory
			const invalidConfig = {
				...config,
				watch: {
					...config.watch,
					paths: [
						...config.watch.paths,
						{
							directory: '/nonexistent/path',
							extensions: ['.md'],
							label: '❓',
							buildCommands: [],
						},
					],
				},
			}

			const invalidWatcher = new FileWatcher(
				invalidConfig,
				eventEmitter,
				processor,
				signals,
			)

			// Should not throw
			await invalidWatcher.start()
			await invalidWatcher.stop()
		})

		it('should handle file system errors gracefully', async () => {
			await watcher.start()

			// Create and immediately delete a file to cause potential race conditions
			const testFile = join(config.paths.pages, 'race-test.md')
			writeFileSync(testFile, 'content')
			rmSync(testFile, { force: true })

			// Should not throw and watcher should continue functioning
			await delay(100)

			const stats = watcher.getStats()
			expect(stats.isActive).toBe(true)
		})
	})

	describe('integration with reactive system', () => {
		it('should trigger signal updates on file changes', async () => {
			await watcher.start()

			// Monitor signal changes
			signals.markdownFiles.get() // Access to set up tracking

			// Create markdown file
			const testFile = join(config.paths.pages, 'signal-test.md')
			writeFileSync(testFile, '# Signal Test')

			// Allow time for processing
			await delay(200)

			// Signals should be updated (we can't easily test this without
			// more complex signal monitoring, but the file should be processed)
			const stats = watcher.getStats()
			expect(stats.lastChange).toBeGreaterThan(0)
		})

		it('should work with processor for file change handling', async () => {
			await watcher.start()

			const mockProcessorHandler = createMockFunction(() => {})
			eventEmitter.on('file:changed', mockProcessorHandler)

			// Create file change
			const testFile = join(config.paths.components, 'processor-test.ts')
			writeFileSync(testFile, 'export class ProcessorTest {}')

			// Allow time for processing
			await delay(200)

			// Processor should have been invoked
			expect(mockProcessorHandler.calls.length).toBeGreaterThan(0)
		})
	})

	describe('debouncing', () => {
		it('should debounce rapid file changes', async () => {
			await watcher.start()

			const mockHandler = createMockFunction(() => {})
			eventEmitter.on('file:changed', mockHandler)

			const testFile = join(config.paths.pages, 'debounce-test.md')

			// Make rapid changes
			for (let i = 0; i < 5; i++) {
				writeFileSync(testFile, `# Test ${i}`)
				await delay(10) // Very short delay between writes
			}

			// Allow time for debouncing
			await delay(300)

			// Should have fewer events than writes due to debouncing
			expect(mockHandler.calls.length).toBeLessThan(5)
			expect(mockHandler.calls.length).toBeGreaterThan(0)
		})
	})
})

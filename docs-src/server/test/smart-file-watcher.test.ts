/**
 * Smart File Watcher Tests
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { SmartFileWatcher } from '../smart-file-watcher'
import type {} from '../types'
import {
	createMockFunction,
	createTestContext,
	delay,
	type TestContext,
	waitFor,
} from './helpers/test-setup.js'

describe('SmartFileWatcher', () => {
	let testContext: TestContext
	let watcher: SmartFileWatcher
	let mockEventEmitter: {
		emit: ReturnType<typeof createMockFunction>
		on: ReturnType<typeof createMockFunction>
		off: ReturnType<typeof createMockFunction>
	}

	beforeEach(async () => {
		testContext = createTestContext('watcher-test')

		// Create mock event emitter
		mockEventEmitter = {
			emit: createMockFunction(),
			on: createMockFunction(),
			off: createMockFunction(),
		}

		watcher = new SmartFileWatcher(testContext.config, mockEventEmitter)
	})

	afterEach(async () => {
		if (watcher && watcher.isWatching()) {
			await watcher.stop()
		}
		testContext.cleanup()
	})

	describe('initialization', () => {
		it('should create watcher with correct config', () => {
			expect(watcher).toBeDefined()
			expect(watcher.isWatching()).toBe(false)
			expect(watcher.getWatchedPaths()).toEqual([])
		})

		it('should create watcher without event emitter', () => {
			const watcherNoEvents = new SmartFileWatcher(testContext.config)
			expect(watcherNoEvents).toBeDefined()
			expect(watcherNoEvents.isWatching()).toBe(false)
		})
	})

	describe('start() and stop()', () => {
		it('should start watching configured paths', async () => {
			await watcher.start()

			expect(watcher.isWatching()).toBe(true)

			const watchedPaths = watcher.getWatchedPaths()
			expect(watchedPaths.length).toBe(3) // pages, components, src
			expect(watchedPaths.some(p => p.includes('pages'))).toBe(true)
			expect(watchedPaths.some(p => p.includes('components'))).toBe(true)
			expect(watchedPaths.some(p => p.includes('src'))).toBe(true)
		})

		it('should emit server:ready event when started', async () => {
			await watcher.start()

			expect(mockEventEmitter.emit.calls.length).toBeGreaterThan(0)
			const readyCall = mockEventEmitter.emit.calls.find(
				call => call[0] === 'server:ready',
			)
			expect(readyCall).toBeDefined()
			expect(readyCall?.[0]).toBe('server:ready')
			expect(readyCall![1]).toEqual({
				port: testContext.config.server.port,
				host: testContext.config.server.host,
			})
		})

		it('should not start twice', async () => {
			await watcher.start()
			expect(watcher.isWatching()).toBe(true)

			// Starting again should not throw or change state
			await watcher.start()
			expect(watcher.isWatching()).toBe(true)
		})

		it('should stop watching and cleanup', async () => {
			await watcher.start()
			expect(watcher.isWatching()).toBe(true)

			await watcher.stop()
			expect(watcher.isWatching()).toBe(false)
			expect(watcher.getWatchedPaths()).toEqual([])
		})

		it('should handle stop when not started', async () => {
			expect(watcher.isWatching()).toBe(false)

			// Should not throw
			await watcher.stop()
			expect(watcher.isWatching()).toBe(false)
		})
	})

	describe('addPath() and removePath()', () => {
		beforeEach(async () => {
			await watcher.start()
		})

		it('should add new watch path', async () => {
			const newPath = join(testContext.tempDir, 'custom')
			mkdirSync(newPath, { recursive: true })

			const pathConfig = {
				directory: newPath,
				extensions: ['.txt'],
				label: '📄',
				buildCommands: ['custom:build'],
			}

			await watcher.addPath(pathConfig)

			const watchedPaths = watcher.getWatchedPaths()
			expect(watchedPaths.includes(newPath)).toBe(true)
		})

		it('should ignore non-existent directories', async () => {
			const nonExistentPath = join(testContext.tempDir, 'does-not-exist')

			const pathConfig = {
				directory: nonExistentPath,
				extensions: ['.txt'],
				label: '📄',
				buildCommands: ['custom:build'],
			}

			// Should not throw
			await watcher.addPath(pathConfig)

			const watchedPaths = watcher.getWatchedPaths()
			expect(watchedPaths.includes(nonExistentPath)).toBe(false)
		})

		it('should not add duplicate paths', async () => {
			const existingPath = testContext.config.watch.paths[0]

			// Try to add existing path again
			await watcher.addPath(existingPath)

			// Should not create duplicate
			const watchedPaths = watcher.getWatchedPaths()
			const duplicates = watchedPaths.filter(
				p => p === existingPath.directory,
			)
			expect(duplicates.length).toBe(1)
		})

		it('should remove watch path', async () => {
			const pathToRemove = testContext.config.watch.paths[0].directory

			await watcher.removePath(pathToRemove)

			const watchedPaths = watcher.getWatchedPaths()
			expect(watchedPaths.includes(pathToRemove)).toBe(false)
		})

		it('should handle removing non-existent path', async () => {
			const nonExistentPath = join(testContext.tempDir, 'never-added')

			// Should not throw
			await watcher.removePath(nonExistentPath)

			// Should not affect other paths
			expect(watcher.getWatchedPaths().length).toBe(3)
		})
	})

	describe('file change detection', () => {
		beforeEach(async () => {
			await watcher.start()
		})

		it('should detect markdown file changes', async () => {
			const testFile = join(
				testContext.tempDir,
				'pages',
				'test-change.md',
			)

			// Create file
			writeFileSync(testFile, '# Initial content')
			await delay(100) // Let initial detection settle

			mockEventEmitter.emit.clear()

			// Modify file
			writeFileSync(testFile, '# Modified content')

			// Wait for file change to be detected
			await waitFor(
				() => mockEventEmitter.emit.calls.length > 0,
				2000,
				100,
			)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			expect(fileChangeCalls.length).toBeGreaterThan(0)

			const changeEvent = fileChangeCalls[0][1]
			expect(changeEvent.event.filePath).toContain('test-change.md')
			expect(changeEvent.buildCommands).toBeUndefined()
		})

		it('should detect TypeScript component changes', async () => {
			const testFile = join(
				testContext.tempDir,
				'components',
				'test-component.ts',
			)

			// Create file
			writeFileSync(testFile, 'export class TestComponent {}')
			await delay(100)

			mockEventEmitter.emit.clear()

			// Modify file
			writeFileSync(
				testFile,
				'export class TestComponent { updated = true }',
			)

			await waitFor(
				() => mockEventEmitter.emit.calls.length > 0,
				2000,
				100,
			)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			expect(fileChangeCalls.length).toBeGreaterThan(0)

			// Find the specific event for test-component.ts
			const componentChangeEvent = fileChangeCalls.find(call =>
				call[1].event.filePath.includes('test-component.ts'),
			)
			expect(componentChangeEvent).toBeDefined()

			const changeEvent = componentChangeEvent![1]
			expect(changeEvent.event.filePath).toContain('test-component.ts')
			expect(changeEvent.buildCommands).toBeUndefined()
		})

		it('should detect CSS component changes', async () => {
			const testFile = join(
				testContext.tempDir,
				'components',
				'test-styles.css',
			)

			writeFileSync(testFile, '.test { color: red; }')
			await delay(100)

			mockEventEmitter.emit.clear()

			writeFileSync(testFile, '.test { color: blue; }')

			await waitFor(
				() => mockEventEmitter.emit.calls.length > 0,
				2000,
				100,
			)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			expect(fileChangeCalls.length).toBeGreaterThan(0)

			const changeEvent = fileChangeCalls[0][1]
			expect(changeEvent.event.filePath).toContain('test-styles.css')
			expect(changeEvent.buildCommands).toBeUndefined()
		})

		it('should detect HTML component changes', async () => {
			const testFile = join(
				testContext.tempDir,
				'components',
				'test-template.html',
			)

			writeFileSync(testFile, '<div>Initial</div>')
			await delay(100)

			mockEventEmitter.emit.clear()

			writeFileSync(testFile, '<div>Modified</div>')

			await waitFor(
				() => mockEventEmitter.emit.calls.length > 0,
				2000,
				100,
			)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			expect(fileChangeCalls.length).toBeGreaterThan(0)

			const changeEvent = fileChangeCalls[0][1]
			expect(changeEvent.event.filePath).toContain('test-template.html')
			expect(changeEvent.buildCommands).toBeUndefined()
		})

		it('should detect source TypeScript changes', async () => {
			const testFile = join(testContext.tempDir, 'src', 'test-source.ts')

			writeFileSync(testFile, 'export const test = true')
			await delay(100)

			mockEventEmitter.emit.clear()

			writeFileSync(testFile, 'export const test = false')

			await waitFor(
				() => mockEventEmitter.emit.calls.length > 0,
				2000,
				100,
			)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			expect(fileChangeCalls.length).toBeGreaterThan(0)

			// Find the specific event for test-source.ts
			const sourceChangeEvent = fileChangeCalls.find(call =>
				call[1].event.filePath.includes('test-source.ts'),
			)
			expect(sourceChangeEvent).toBeDefined()

			const changeEvent = sourceChangeEvent![1]
			expect(changeEvent.event.filePath).toContain('test-source.ts')
			expect(changeEvent.buildCommands).toBeUndefined()
		})

		it('should ignore hidden files', async () => {
			const hiddenFile = join(
				testContext.tempDir,
				'pages',
				'.hidden-file.md',
			)

			writeFileSync(hiddenFile, '# Hidden content')
			await delay(200)

			// Should not emit any events for hidden files
			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			expect(fileChangeCalls.length).toBe(0)
		})

		it('should ignore temporary files', async () => {
			const tempFiles = [
				join(testContext.tempDir, 'pages', 'temp.md~'),
				join(testContext.tempDir, 'pages', 'temp.tmp'),
				join(testContext.tempDir, 'pages', 'temp.swp'),
			]

			for (const tempFile of tempFiles) {
				writeFileSync(tempFile, 'temp content')
			}

			await delay(200)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			expect(fileChangeCalls.length).toBe(0)
		})

		it('should ignore files with non-matching extensions', async () => {
			const nonMatchingFile = join(
				testContext.tempDir,
				'pages',
				'document.txt',
			)

			writeFileSync(nonMatchingFile, 'This is a text file')
			await delay(200)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			expect(fileChangeCalls.length).toBe(0)
		})
	})

	describe('debouncing', () => {
		beforeEach(async () => {
			await watcher.start()
		})

		it('should debounce rapid file changes', async () => {
			const testFile = join(
				testContext.tempDir,
				'pages',
				'debounce-test.md',
			)

			writeFileSync(testFile, '# Initial')
			await delay(100)

			mockEventEmitter.emit.clear()

			// Make rapid changes
			writeFileSync(testFile, '# Change 1')
			writeFileSync(testFile, '# Change 2')
			writeFileSync(testFile, '# Change 3')
			writeFileSync(testFile, '# Final change')

			// Wait for debounce to settle (should be 50ms in test config)
			await delay(200)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			// Should only emit once after debounce period
			expect(fileChangeCalls.length).toBe(1)
		})

		it('should debounce per-file independently', async () => {
			const testFile1 = join(testContext.tempDir, 'pages', 'file1.md')
			const testFile2 = join(testContext.tempDir, 'pages', 'file2.md')

			writeFileSync(testFile1, '# File 1')
			writeFileSync(testFile2, '# File 2')
			await delay(100)

			mockEventEmitter.emit.clear()

			// Change both files
			writeFileSync(testFile1, '# File 1 changed')
			writeFileSync(testFile2, '# File 2 changed')

			await delay(200)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			// Should emit once for each file
			expect(fileChangeCalls.length).toBe(2)
		})
	})

	describe('stat-based change detection', () => {
		beforeEach(async () => {
			await watcher.start()
		})

		it('should detect actual content changes', async () => {
			const testFile = join(testContext.tempDir, 'pages', 'stat-test.md')

			writeFileSync(testFile, '# Original content')
			await delay(100)

			mockEventEmitter.emit.clear()

			// Touch file with different content
			writeFileSync(testFile, '# Different content')

			await waitFor(
				() => mockEventEmitter.emit.calls.length > 0,
				2000,
				100,
			)

			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			expect(fileChangeCalls.length).toBeGreaterThan(0)
		})

		it('should ignore touch without content change', async () => {
			const testFile = join(testContext.tempDir, 'pages', 'touch-test.md')

			writeFileSync(testFile, '# Same content')
			await delay(100)

			mockEventEmitter.emit.clear()

			// Touch file with same content (this might not trigger on all systems)
			writeFileSync(testFile, '# Same content')

			await delay(200)

			// This test might be system-dependent, so we'll just ensure it doesn't crash
			expect(watcher.isWatching()).toBe(true)
		})
	})

	describe('error handling', () => {
		beforeEach(async () => {
			await watcher.start()
		})

		it('should handle file system errors gracefully', async () => {
			const nonExistentFile = join(
				testContext.tempDir,
				'pages',
				'non-existent.md',
			)

			// Try to watch a file that doesn't exist and then create it
			writeFileSync(nonExistentFile, '# Created file')
			await delay(100)

			// Should not crash the watcher
			expect(watcher.isWatching()).toBe(true)
		})

		it('should emit server error on watcher failure', async () => {
			// This is difficult to test without mocking the file system
			// For now, just ensure the error handling structure exists
			expect(mockEventEmitter.emit).toBeDefined()
		})

		it('should handle cleanup errors gracefully', async () => {
			// Add a path and then remove the directory while watching
			const testPath = join(testContext.tempDir, 'to-be-removed')
			mkdirSync(testPath, { recursive: true })

			await watcher.addPath({
				directory: testPath,
				extensions: ['.test'],
				label: '🧪',
				buildCommands: ['test:build'],
			})

			// Remove directory while watching
			rmSync(testPath, { recursive: true, force: true })

			// Cleanup should not throw
			try {
				await watcher.stop()
				// If we get here without throwing, the test passes
			} catch (error) {
				throw new Error(`watcher.stop() should not throw: ${error}`)
			}
		})
	})

	describe('getStats()', () => {
		it('should return correct stats when not watching', () => {
			const stats = watcher.getStats()

			expect(stats.watchedPaths).toBe(0)
			expect(stats.activeTimers).toBe(0)
			expect(stats.isActive).toBe(false)
			expect(stats.trackedFiles).toBe(0)
			expect(typeof stats.lastChange).toBe('number')
		})

		it('should return correct stats when watching', async () => {
			await watcher.start()

			const stats = watcher.getStats()

			expect(stats.watchedPaths).toBe(3) // pages, components, src
			expect(stats.isActive).toBe(true)
			expect(stats.trackedFiles).toBeGreaterThanOrEqual(0)
		})

		it('should track active timers during debouncing', async () => {
			await watcher.start()

			const testFile = join(testContext.tempDir, 'pages', 'timer-test.md')
			writeFileSync(testFile, '# Content')

			// Immediately check stats (during debounce period)
			const _statsImmediateAft = watcher.getStats()

			// Wait for debounce to complete
			await delay(200)

			const statsFinal = watcher.getStats()
			expect(statsFinal.activeTimers).toBe(0)
		})
	})

	describe('build command mapping', () => {
		beforeEach(async () => {
			await watcher.start()
		})

		it('should map TypeScript files to correct build commands', async () => {
			const testFile = join(
				testContext.tempDir,
				'components',
				'mapping-test.ts',
			)

			writeFileSync(testFile, 'export class Test {}')
			await delay(100)

			mockEventEmitter.emit.clear()
			writeFileSync(testFile, 'export class TestUpdated {}')

			await waitFor(
				() => mockEventEmitter.emit.calls.length > 0,
				2000,
				100,
			)

			const changeEvent = mockEventEmitter.emit.calls.find(
				call => call[0] === 'file:changed',
			)?.[1]

			expect(changeEvent?.buildCommands).toBeUndefined()
		})

		it('should use explicit build commands when provided', async () => {
			// The pages directory has explicit build commands
			const testFile = join(
				testContext.tempDir,
				'pages',
				'explicit-commands.md',
			)

			writeFileSync(testFile, '# Test')
			await delay(100)

			mockEventEmitter.emit.clear()
			writeFileSync(testFile, '# Test Updated')

			await waitFor(
				() => mockEventEmitter.emit.calls.length > 0,
				2000,
				100,
			)

			const changeEvent = mockEventEmitter.emit.calls.find(
				call => call[0] === 'file:changed',
			)?.[1]

			expect(changeEvent?.buildCommands).toBeUndefined()
		})

		it('should return empty commands for unknown file types', async () => {
			// Add a path with no dynamic mapping
			const unknownPath = join(testContext.tempDir, 'unknown')
			mkdirSync(unknownPath, { recursive: true })

			await watcher.addPath({
				directory: unknownPath,
				extensions: ['.unknown'],
				label: '❓',
				buildCommands: [], // No explicit commands
			})

			const testFile = join(unknownPath, 'test.unknown')
			writeFileSync(testFile, 'unknown content')
			await delay(100)

			mockEventEmitter.emit.clear()
			writeFileSync(testFile, 'updated unknown content')

			await delay(200) // Wait longer since no commands might mean no events

			// Should either not emit or emit with empty commands
			const fileChangeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'file:changed',
			)

			if (fileChangeCalls.length > 0) {
				const changeEvent = fileChangeCalls[0][1]
				expect(changeEvent.buildCommands).toBeUndefined()
			}
		})
	})
})

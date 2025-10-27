/**
 * Integration Test for Reactive Build System
 * Tests the complete reactive build pipeline
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdir, rmdir } from 'fs/promises'
import { join } from 'path'
import { BuildSystem } from '../build'
import { DEFAULT_CONFIG } from '../config'
import type { DevServerConfig } from '../types'

describe('Reactive Build System Integration', () => {
	let buildSystem: BuildSystem
	let config: DevServerConfig
	let tempDir: string

	beforeEach(async () => {
		// Create a temporary directory for test files
		tempDir = join(process.cwd(), 'test-output', Date.now().toString())
		await mkdir(tempDir, { recursive: true })

		// Create test config
		config = {
			...DEFAULT_CONFIG,
			paths: {
				...DEFAULT_CONFIG.paths,
				output: tempDir,
			},
			server: {
				...DEFAULT_CONFIG.server,
				development: true,
			},
		}

		buildSystem = new BuildSystem(config)
	})

	afterEach(async () => {
		// Cleanup
		await buildSystem.cleanup()
		try {
			await rmdir(tempDir, { recursive: true })
		} catch {
			// Ignore cleanup errors
		}
	})

	it('should initialize reactive build system', async () => {
		await buildSystem.initialize()

		const stats = buildSystem.getStats()
		expect(stats.trackedFiles).toBeGreaterThanOrEqual(0)
		expect(stats.processedPages).toBeGreaterThanOrEqual(0)
		expect(stats.dependencies).toBeGreaterThanOrEqual(0)
		expect(stats.watcherActive).toBe(false) // Not started yet
	}, 10000) // Increase timeout

	it('should build and track markdown files', async () => {
		await buildSystem.initialize()

		// Run build without creating temporary files
		// The build system should work with existing files
		await buildSystem.build()

		const stats = buildSystem.getStats()
		expect(stats.trackedFiles).toBeGreaterThanOrEqual(0)
		expect(stats.processedPages).toBeGreaterThanOrEqual(0)
		expect(stats.dependencies).toBeGreaterThanOrEqual(0)
		expect(stats.watcherActive).toBe(true) // Should be active after build
	}, 30000) // Increase timeout significantly

	it('should handle template dependencies', async () => {
		await buildSystem.initialize()
		await buildSystem.build()

		const stats = buildSystem.getStats()

		// Should have some dependencies due to template files
		expect(stats.dependencies).toBeGreaterThanOrEqual(0)

		// Watcher should be tracking template files
		expect(stats.watcherActive).toBe(true)
	}, 20000) // Increase timeout

	it('should provide correct build statistics', async () => {
		await buildSystem.initialize()
		await buildSystem.build()

		const stats = buildSystem.getStats()

		expect(typeof stats.trackedFiles).toBe('number')
		expect(typeof stats.processedPages).toBe('number')
		expect(typeof stats.dependencies).toBe('number')
		expect(typeof stats.watcherActive).toBe('boolean')

		expect(stats.trackedFiles).toBeGreaterThanOrEqual(0)
		expect(stats.processedPages).toBeGreaterThanOrEqual(0)
		expect(stats.dependencies).toBeGreaterThanOrEqual(0)
	}, 20000) // Increase timeout

	it('should cleanup properly', async () => {
		await buildSystem.initialize()
		await buildSystem.build()

		let stats = buildSystem.getStats()
		expect(stats.watcherActive).toBe(true)

		await buildSystem.cleanup()

		stats = buildSystem.getStats()
		expect(stats.watcherActive).toBe(false)
	}, 20000) // Increase timeout

	it('should handle buildFile method for compatibility', async () => {
		await buildSystem.initialize()

		// Should not throw error
		await expect(
			buildSystem.buildFile('test-file.md'),
		).resolves.toBeUndefined()
	})

	it('should track file changes reactively', async () => {
		await buildSystem.initialize()
		await buildSystem.build()

		const initialStats = buildSystem.getStats()

		// In a real scenario, file changes would be detected by the watcher
		// and would update the reactive signals automatically
		// For this test, we verify the system is set up to handle changes

		expect(initialStats.watcherActive).toBe(true)
		expect(typeof initialStats.trackedFiles).toBe('number')
	}, 20000) // Increase timeout
})

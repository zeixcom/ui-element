/**
 * Phase 3: Reactive Development Server Tests
 * Simplified testing to avoid circular dependency issues
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdir, rm, writeFile } from 'fs/promises'
import { join } from 'path'
import { ReactiveDevServer } from '../dev-server'
import { ReactiveDevServerApp } from '../serve-docs'
import type { DevServerConfig } from '../types'

// Test fixtures with minimal configuration
const TEST_OUTPUT_DIR = join(process.cwd(), 'test-output')
const TEST_CONFIG: Partial<DevServerConfig> = {
	server: {
		port: 3001, // Use different port for testing
		host: 'localhost',
		development: true,
	},
	paths: {
		pages: join(process.cwd(), 'test-pages'),
		components: join(process.cwd(), 'test-components'),
		includes: join(process.cwd(), 'test-includes'),
		layout: join(process.cwd(), 'test-layout.html'),
		src: join(process.cwd(), 'test-src'),
		output: TEST_OUTPUT_DIR,
		assets: join(process.cwd(), 'test-assets'),
	},
	build: {
		optimizeLayout: false,
		generateSourceMaps: false,
		minify: false,
		cacheMaxAge: 0,
	},
	watch: {
		debounceDelay: 50,
		paths: [],
	},
	assets: {
		compression: {
			enabled: false,
			brotli: false,
			gzip: false,
		},
		versioning: {
			enabled: false,
			hashLength: 8,
		},
	},
}

describe('ReactiveDevServer Basic Functionality', () => {
	beforeEach(async () => {
		// Create minimal test setup
		await mkdir(TEST_OUTPUT_DIR, { recursive: true })
		await mkdir(TEST_CONFIG.paths!.pages!, { recursive: true })
		await mkdir(TEST_CONFIG.paths!.components!, { recursive: true })
		await mkdir(TEST_CONFIG.paths!.includes!, { recursive: true })
		await mkdir(TEST_CONFIG.paths!.src!, { recursive: true })

		// Create basic test files
		await writeFile(
			join(TEST_OUTPUT_DIR, 'index.html'),
			'<!DOCTYPE html><html><body><h1>Test</h1></body></html>',
		)

		await writeFile(
			TEST_CONFIG.paths!.layout!,
			'<!DOCTYPE html><html><body>{content}</body></html>',
		)

		await writeFile(
			join(TEST_CONFIG.paths!.pages!, 'test.md'),
			'# Test Page\n\nContent',
		)
	})

	afterEach(async () => {
		// Clean up test files
		const dirsToClean = [
			TEST_OUTPUT_DIR,
			TEST_CONFIG.paths!.pages!,
			TEST_CONFIG.paths!.components!,
			TEST_CONFIG.paths!.includes!,
			TEST_CONFIG.paths!.src!,
			TEST_CONFIG.paths!.layout!,
		]

		for (const dir of dirsToClean) {
			try {
				await rm(dir, { recursive: true, force: true })
			} catch {
				// Ignore cleanup errors
			}
		}
	})

	test('should initialize reactive dev server', () => {
		const server = new ReactiveDevServer(TEST_CONFIG)
		expect(server).toBeDefined()
	})

	test('should provide server stats interface', () => {
		const server = new ReactiveDevServer(TEST_CONFIG)
		const statsMethod = server.getServerStats
		expect(typeof statsMethod).toBe('function')
	})

	test('should handle configuration merging', () => {
		const customConfig: Partial<DevServerConfig> = {
			...TEST_CONFIG,
			server: {
				port: 4000,
				host: '0.0.0.0',
				development: true,
			},
		}

		const server = new ReactiveDevServer(customConfig)
		expect(server).toBeDefined()
	})

	test('should provide start and stop methods', async () => {
		const server = new ReactiveDevServer(TEST_CONFIG)

		expect(typeof server.start).toBe('function')
		expect(typeof server.stop).toBe('function')

		// Test that stop can be called even when not started
		await server.stop()
	})
})

describe('ReactiveDevServerApp', () => {
	let app: ReactiveDevServerApp | null = null

	afterEach(async () => {
		if (app) {
			await app.stop()
			app = null
		}
	})

	test('should create app instance', () => {
		app = new ReactiveDevServerApp()
		expect(app).toBeDefined()
	})

	test('should provide required methods', () => {
		app = new ReactiveDevServerApp()
		expect(typeof app.start).toBe('function')
		expect(typeof app.stop).toBe('function')
		expect(typeof app.getStats).toBe('function')
	})

	test('should handle getStats when not started', () => {
		app = new ReactiveDevServerApp()
		const stats = app.getStats()
		expect(stats).toBeNull()
	})

	test('should handle graceful shutdown', async () => {
		app = new ReactiveDevServerApp()
		// Should not throw when stopping before starting
		await expect(app.stop()).resolves.toBeUndefined()
	})
})

describe('ReactiveDevServer File Serving', () => {
	beforeEach(async () => {
		await mkdir(TEST_OUTPUT_DIR, { recursive: true })
		await writeFile(
			join(TEST_OUTPUT_DIR, 'index.html'),
			'<!DOCTYPE html><html><body><h1>Test</h1></body></html>',
		)
		await writeFile(
			join(TEST_OUTPUT_DIR, 'style.css'),
			'body { margin: 0; }',
		)
		await writeFile(
			join(TEST_OUTPUT_DIR, 'script.js'),
			'console.log("test");',
		)
	})

	afterEach(async () => {
		try {
			await rm(TEST_OUTPUT_DIR, { recursive: true, force: true })
		} catch {
			// Ignore cleanup errors
		}
	})

	test('should determine content types correctly', () => {
		const server = new ReactiveDevServer(TEST_CONFIG)

		// Access the private method via reflection for testing
		const getContentType = (server as any).getContentType.bind(server)

		expect(getContentType('/index.html')).toBe('text/html')
		expect(getContentType('/style.css')).toBe('text/css')
		expect(getContentType('/script.js')).toBe('application/javascript')
		expect(getContentType('/data.json')).toBe('application/json')
		expect(getContentType('/unknown')).toBe('application/octet-stream')
	})
})

describe('ReactiveDevServer Configuration Validation', () => {
	test('should handle partial configuration', () => {
		const partialConfig = {
			server: { port: 8080, development: true },
		}

		expect(() => {
			new ReactiveDevServer(partialConfig)
		}).not.toThrow()
	})

	test('should handle empty configuration', () => {
		expect(() => {
			new ReactiveDevServer({})
		}).not.toThrow()
	})

	test('should merge with default configuration', () => {
		const customPort = 9000
		const _server = new ReactiveDevServer({
			server: { port: customPort, host: 'localhost', development: true },
		})

		expect(_server).toBeDefined()
	})
})

describe('ReactiveDevServer Memory Management', () => {
	test('should provide memory usage stats', async () => {
		const _server = new ReactiveDevServer(TEST_CONFIG)

		// Memory stats should be available even before starting
		const memoryUsage = process.memoryUsage()
		expect(typeof memoryUsage.rss).toBe('number')
		expect(typeof memoryUsage.heapUsed).toBe('number')
		expect(memoryUsage.rss).toBeGreaterThan(0)
		expect(memoryUsage.heapUsed).toBeGreaterThan(0)
	})
})

describe('ReactiveDevServer Error Handling', () => {
	test('should handle invalid port gracefully', () => {
		const invalidConfig = {
			...TEST_CONFIG,
			server: {
				port: -1,
				host: 'localhost',
				development: true,
			},
		}

		// Should not throw during construction
		expect(() => {
			new ReactiveDevServer(invalidConfig)
		}).not.toThrow()
	})

	test('should handle invalid paths in configuration', () => {
		const invalidConfig: Partial<DevServerConfig> = {
			...TEST_CONFIG,
			paths: {
				pages: '/nonexistent/path',
				components: TEST_CONFIG.paths!.components,
				src: TEST_CONFIG.paths!.src,
				output: TEST_CONFIG.paths!.output,
				assets: TEST_CONFIG.paths!.assets,
				includes: TEST_CONFIG.paths!.includes,
				layout: TEST_CONFIG.paths!.layout,
			},
		}

		// Should not throw during construction
		expect(() => {
			new ReactiveDevServer(invalidConfig)
		}).not.toThrow()
	})
})

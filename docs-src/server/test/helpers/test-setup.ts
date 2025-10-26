/**
 * Test setup and configuration helpers
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import type { DevServerConfig } from '../../types'

export interface TestContext {
	tempDir: string
	config: DevServerConfig
	cleanup: () => void
}

/**
 * Create a temporary test directory with mock files
 */
export function createTestContext(testName: string): TestContext {
	const tempDir = resolve(`./test-temp-${testName}-${Date.now()}`)

	// Create directory structure
	mkdirSync(tempDir, { recursive: true })
	mkdirSync(join(tempDir, 'pages'), { recursive: true })
	mkdirSync(join(tempDir, 'components'), { recursive: true })
	mkdirSync(join(tempDir, 'includes'), { recursive: true })
	mkdirSync(join(tempDir, 'output'), { recursive: true })
	mkdirSync(join(tempDir, 'src'), { recursive: true })

	// Create mock layout file
	writeFileSync(
		join(tempDir, 'layout.html'),
		`<!DOCTYPE html>
<html>
<head><title>{{ title }}</title></head>
<body>{{ content }}</body>
</html>`,
	)

	// Create mock pages
	writeFileSync(
		join(tempDir, 'pages', 'index.md'),
		`---
title: Test Page
---

# Test Content
`,
	)

	writeFileSync(
		join(tempDir, 'pages', 'about.md'),
		`---
title: About
---

# About Page
`,
	)

	// Create mock components
	writeFileSync(
		join(tempDir, 'components', 'test.ts'),
		`export class TestComponent {
	render() { return 'test' }
}`,
	)

	writeFileSync(
		join(tempDir, 'components', 'test.css'),
		`.test { color: blue; }`,
	)

	writeFileSync(
		join(tempDir, 'components', 'test.html'),
		`<div class="test">Test Component</div>`,
	)

	// Create mock src files
	writeFileSync(
		join(tempDir, 'src', 'main.ts'),
		`export const main = () => console.log('main')`,
	)

	// Create test configuration
	const config: DevServerConfig = {
		server: {
			port: 0, // Let system assign port for tests
			host: 'localhost',
			development: true,
		},
		paths: {
			pages: join(tempDir, 'pages'),
			components: join(tempDir, 'components'),
			src: join(tempDir, 'src'),
			output: join(tempDir, 'output'),
			assets: join(tempDir, 'output', 'assets'),
			includes: join(tempDir, 'includes'),
			layout: join(tempDir, 'layout.html'),
		},
		build: {
			optimizeLayout: false, // Disable for faster tests
			generateSourceMaps: false,
			minify: false,
			cacheMaxAge: 0,
		},
		watch: {
			debounceDelay: 50, // Shorter for tests
			paths: [
				{
					directory: join(tempDir, 'pages'),
					extensions: ['.md'],
					label: '📝',
					buildCommands: ['build:docs-html'],
				},
				{
					directory: join(tempDir, 'components'),
					extensions: ['.ts', '.html', '.css'],
					label: '🔧',
					buildCommands: [],
				},
				{
					directory: join(tempDir, 'src'),
					extensions: ['.ts'],
					label: '📦',
					buildCommands: ['build', 'build:docs-js'],
				},
			],
		},
		assets: {
			compression: {
				enabled: false, // Disable for simpler tests
				brotli: false,
				gzip: false,
			},
			versioning: {
				enabled: false,
				hashLength: 8,
			},
		},
	}

	const cleanup = () => {
		if (existsSync(tempDir)) {
			rmSync(tempDir, { recursive: true, force: true })
		}
	}

	return {
		tempDir,
		config,
		cleanup,
	}
}

/**
 * Wait for a specified amount of time
 */
export function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Wait for a condition to become true
 */
export async function waitFor(
	condition: () => boolean | Promise<boolean>,
	timeout = 5000,
	interval = 100,
): Promise<void> {
	const start = Date.now()

	while (Date.now() - start < timeout) {
		if (await condition()) {
			return
		}
		await delay(interval)
	}

	throw new Error(`Condition not met within ${timeout}ms`)
}

/**
 * Create a mock HTTP request
 */
export function createMockRequest(
	url: string,
	options: {
		method?: string
		headers?: Record<string, string>
	} = {},
): Request {
	const { method = 'GET', headers = {} } = options

	return new Request(url, {
		method,
		headers: new Headers(headers),
	})
}

/**
 * Get a free port for testing
 */
export async function getFreePort(): Promise<number> {
	const server = Bun.serve({
		port: 0,
		fetch: () => new Response('test'),
	})

	const port = server.port
	server.stop()
	return port ?? 0
}

/**
 * Mock function type for Bun testing
 */
export interface MockFunction<T extends (...args: any[]) => any> {
	(...args: Parameters<T>): ReturnType<T>
	calls: Array<Parameters<T>>
	results: Array<ReturnType<T>>
	clear: () => void
}

/**
 * Create a mock function for Bun testing
 */
export function createMockFunction<T extends (...args: any[]) => any>(
	implementation?: T,
): MockFunction<T> {
	const calls: Array<Parameters<T>> = []
	const results: Array<ReturnType<T>> = []

	const mockFn = ((...args: Parameters<T>) => {
		calls.push(args)
		const result = implementation ? implementation(...args) : undefined
		results.push(result as ReturnType<T>)
		return result
	}) as MockFunction<T>

	mockFn.calls = calls
	mockFn.results = results
	mockFn.clear = () => {
		calls.length = 0
		results.length = 0
	}

	return mockFn
}

/**
 * Mock console methods for testing
 */
export interface MockConsole {
	log: MockFunction<typeof console.log>
	error: MockFunction<typeof console.error>
	warn: MockFunction<typeof console.warn>
	info: MockFunction<typeof console.info>
	restore: () => void
}

export function mockConsole(): MockConsole {
	const originalLog = console.log
	const originalError = console.error
	const originalWarn = console.warn
	const originalInfo = console.info

	const log = createMockFunction<typeof console.log>()
	const error = createMockFunction<typeof console.error>()
	const warn = createMockFunction<typeof console.warn>()
	const info = createMockFunction<typeof console.info>()

	console.log = log
	console.error = error
	console.warn = warn
	console.info = info

	return {
		log,
		error,
		warn,
		info,
		restore: () => {
			console.log = originalLog
			console.error = originalError
			console.warn = originalWarn
			console.info = originalInfo
		},
	}
}

/**
 * Create a test WebSocket client
 */
export class TestWebSocketClient {
	private ws: WebSocket | null = null
	private messages: string[] = []
	private connected = false

	async connect(port: number): Promise<void> {
		return new Promise((resolve, reject) => {
			this.ws = new WebSocket(`ws://localhost:${port}/ws`)

			this.ws.onopen = () => {
				this.connected = true
				resolve()
			}

			this.ws.onmessage = event => {
				this.messages.push(event.data)
			}

			this.ws.onerror = error => {
				reject(error)
			}

			this.ws.onclose = () => {
				this.connected = false
			}
		})
	}

	send(message: string): void {
		if (this.ws && this.connected) {
			this.ws.send(message)
		}
	}

	getMessages(): string[] {
		return [...this.messages]
	}

	clearMessages(): void {
		this.messages = []
	}

	isConnected(): boolean {
		return this.connected
	}

	close(): void {
		if (this.ws) {
			this.ws.close()
			this.ws = null
			this.connected = false
		}
	}
}

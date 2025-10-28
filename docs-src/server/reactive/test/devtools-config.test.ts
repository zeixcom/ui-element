/**
 * DevTools Configuration Tests
 * Converted from verify-devtools-config.ts to be part of the test suite
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { resolve } from 'path'
import { DevServer } from '../dev-server'
import {
	createTestContext,
	getFreePort,
	mockConsole,
	type TestContext,
} from './helpers/test-setup'

describe('DevTools Configuration', () => {
	let testContext: TestContext
	let devServer: DevServer
	let testPort: number
	let mockConsoleOutput: ReturnType<typeof mockConsole>

	beforeEach(async () => {
		testContext = createTestContext('devtools-test')
		testPort = await getFreePort()
		testContext.config.server.port = testPort
		devServer = new DevServer(testContext.config)
		mockConsoleOutput = mockConsole()
	})

	afterEach(async () => {
		mockConsoleOutput.restore()
		if (devServer) {
			await devServer.stop()
		}
		testContext.cleanup()
	})

	describe('DevTools endpoint availability', () => {
		it('should serve DevTools configuration when server is running', async () => {
			await devServer.start()

			const response = await fetch(
				`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
			)

			expect(response.ok).toBe(true)
			expect(response.headers.get('content-type')).toContain(
				'application/json',
			)

			const config = await response.json()
			expect(config).toBeDefined()
		})

		it('should return 404 when server is not running', async () => {
			try {
				await fetch(
					`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
				)
				throw new Error('Should have failed')
			} catch (error) {
				// Expected to fail when server is not running
				expect(error.message).toContain('connect')
			}
		})
	})

	describe('DevTools configuration structure', () => {
		it('should have required configuration fields', async () => {
			await devServer.start()

			const response = await fetch(
				`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
			)

			const config = await response.json()

			// Check required fields
			expect(config.version).toBeDefined()
			expect(typeof config.version).toBe('number')

			expect(config.workspace).toBeDefined()
			expect(config.workspace.root).toBeDefined()
			expect(typeof config.workspace.root).toBe('string')

			expect(config.workspace.uuid).toBeDefined()
			expect(typeof config.workspace.uuid).toBe('string')
		})

		it('should have correct project root path', async () => {
			await devServer.start()

			const response = await fetch(
				`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
			)

			const config = await response.json()
			const projectRoot = resolve('.')

			expect(config.workspace.root).toBe(projectRoot)
		})

		it('should have valid UUID format', async () => {
			await devServer.start()

			const response = await fetch(
				`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
			)

			const config = await response.json()

			// UUID should be a string identifier for the workspace
			expect(config.workspace.uuid).toBeDefined()
			expect(typeof config.workspace.uuid).toBe('string')
			expect(config.workspace.uuid.length).toBeGreaterThan(0)
		})
	})

	describe('DevTools configuration content', () => {
		it('should return consistent configuration between requests', async () => {
			await devServer.start()

			const response1 = await fetch(
				`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
			)
			const config1 = await response1.json()

			const response2 = await fetch(
				`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
			)
			const config2 = await response2.json()

			expect(config1).toEqual(config2)
		})

		it('should return proper JSON content type', async () => {
			await devServer.start()

			const response = await fetch(
				`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
			)

			expect(response.headers.get('content-type')).toBe(
				'application/json; charset=UTF-8',
			)
		})

		it('should handle concurrent requests properly', async () => {
			await devServer.start()

			const requests = Array.from({ length: 5 }, () =>
				fetch(
					`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
				),
			)

			const responses = await Promise.all(requests)

			// All requests should succeed
			for (const response of responses) {
				expect(response.ok).toBe(true)
			}

			// All responses should have the same content
			const configs = await Promise.all(responses.map(r => r.json()))

			for (let i = 1; i < configs.length; i++) {
				expect(configs[i]).toEqual(configs[0])
			}
		})
	})

	describe('DevTools workspace integration', () => {
		it('should provide configuration that enables file mapping', async () => {
			await devServer.start()

			const response = await fetch(
				`http://localhost:${testPort}/.well-known/appspecific/com.chrome.devtools.json`,
			)

			const config = await response.json()

			// The configuration should provide enough information for Chrome DevTools
			// to map between served files and source files
			expect(config.workspace.root).toBeTruthy()
			expect(config.workspace.uuid).toBeTruthy()

			// Version should indicate the schema version
			expect(config.version).toBeTruthy()
		})
	})
})

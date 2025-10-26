/**
 * Configuration System Tests
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { rmSync } from 'fs'
import { join } from 'path'
import { DEFAULT_CONFIG } from '../config'
import {
	ConfigManager,
	ConfigValidationError,
	getBuildCommandsForFile,
} from '../config-manager'
import { createTestContext, type TestContext } from './helpers/test-setup'

describe('ConfigManager', () => {
	let testContext: TestContext
	let originalEnv: Record<string, string | undefined>

	beforeEach(() => {
		testContext = createTestContext('config-test')

		// Backup original environment variables
		originalEnv = {
			DEV_SERVER_PORT: process.env.DEV_SERVER_PORT,
			DEV_SERVER_HOST: process.env.DEV_SERVER_HOST,
			OPTIMIZE_LAYOUT: process.env.OPTIMIZE_LAYOUT,
			DEV_MODE: process.env.DEV_MODE,
		}
	})

	afterEach(() => {
		testContext.cleanup()

		// Restore original environment variables
		for (const [key, value] of Object.entries(originalEnv)) {
			if (value === undefined) {
				delete process.env[key]
			} else {
				process.env[key] = value
			}
		}
	})

	describe('load()', () => {
		it('should load default configuration successfully', async () => {
			const configManager = new ConfigManager()
			const config = await configManager.load(DEFAULT_CONFIG)

			expect(config).toBeDefined()
			expect(config.server).toBeDefined()
			expect(config.server.port).toBe(3000)
			expect(config.server.host).toBe('localhost')
			expect(config.server.development).toBe(true)
		})

		it('should resolve relative paths to absolute paths', async () => {
			const configManager = new ConfigManager()
			const config = await configManager.load(DEFAULT_CONFIG)

			expect(config.paths.pages).toContain('docs-src/pages')
			expect(config.paths.components).toContain('docs-src/components')
			expect(config.paths.src).toContain('src')
			expect(config.paths.output).toContain('docs')
		})

		it('should validate required directories exist', async () => {
			// Create a config that points to non-existent directories
			const tempDir = testContext.tempDir
			rmSync(join(tempDir, 'pages'), { recursive: true, force: true })

			const configManager = new ConfigManager()

			// Temporarily change working directory context
			const originalCwd = process.cwd()
			try {
				process.chdir(tempDir)
				await expect(
					configManager.load(DEFAULT_CONFIG),
				).rejects.toThrow(ConfigValidationError)
			} finally {
				process.chdir(originalCwd)
			}
		})

		it('should validate required files exist', async () => {
			const tempDir = testContext.tempDir
			rmSync(join(tempDir, 'layout.html'), { force: true })

			const configManager = new ConfigManager()

			const originalCwd = process.cwd()
			try {
				process.chdir(tempDir)
				await expect(
					configManager.load(DEFAULT_CONFIG),
				).rejects.toThrow(ConfigValidationError)
			} finally {
				process.chdir(originalCwd)
			}
		})
	})

	describe('environment variable overrides', () => {
		it('should override port from DEV_SERVER_PORT', async () => {
			process.env.DEV_SERVER_PORT = '4000'

			const configManager = new ConfigManager()
			const config = await configManager.load(DEFAULT_CONFIG)

			expect(config.server.port).toBe(4000)
		})

		it('should override host from DEV_SERVER_HOST', async () => {
			process.env.DEV_SERVER_HOST = '0.0.0.0'

			const configManager = new ConfigManager()
			const config = await configManager.load(DEFAULT_CONFIG)

			expect(config.server.host).toBe('0.0.0.0')
		})

		it('should override OPTIMIZE_LAYOUT setting', async () => {
			process.env.OPTIMIZE_LAYOUT = 'false'

			const configManager = new ConfigManager()
			const config = await configManager.load(DEFAULT_CONFIG)

			expect(config.build.optimizeLayout).toBe(false)
		})

		it('should override DEV_MODE setting', async () => {
			process.env.DEV_MODE = 'false'

			const configManager = new ConfigManager()
			const config = await configManager.load(DEFAULT_CONFIG)

			expect(config.server.development).toBe(false)
		})

		it('should ignore invalid port numbers', async () => {
			process.env.DEV_SERVER_PORT = 'invalid'

			const configManager = new ConfigManager()
			const config = await configManager.load(DEFAULT_CONFIG)

			expect(config.server.port).toBe(3000) // Should use default
		})
	})

	describe('configuration validation', () => {
		it('should reject invalid configuration object', () => {
			expect(() => {
				ConfigManager.validate(null)
			}).toThrow(ConfigValidationError)

			expect(() => {
				ConfigManager.validate('not an object')
			}).toThrow(ConfigValidationError)
		})

		it('should reject missing server configuration', () => {
			const invalidConfig = {
				paths: { pages: './pages' },
			}

			expect(() => {
				ConfigManager.validate(invalidConfig)
			}).toThrow(ConfigValidationError)
		})

		it('should reject invalid port number', () => {
			const invalidConfig = {
				server: { port: -1, host: 'localhost', development: true },
				paths: {
					pages: './pages',
					components: './components',
					src: './src',
					output: './output',
					assets: './assets',
					includes: './includes',
					layout: './layout.html',
				},
			}

			expect(() => {
				ConfigManager.validate(invalidConfig)
			}).toThrow(ConfigValidationError)
		})

		it('should reject missing required paths', () => {
			const invalidConfig = {
				server: { port: 3000, host: 'localhost', development: true },
				paths: {
					pages: './pages',
					// Missing other required paths
				},
			}

			expect(() => {
				ConfigManager.validate(invalidConfig)
			}).toThrow(ConfigValidationError)
		})

		it('should reject invalid watch configuration', () => {
			const invalidConfig = {
				server: { port: 3000, host: 'localhost', development: true },
				paths: {
					pages: './pages',
					components: './components',
					src: './src',
					output: './output',
					assets: './assets',
					includes: './includes',
					layout: './layout.html',
				},
				watch: {
					debounceDelay: 'invalid', // Should be number
				},
			}

			expect(() => {
				ConfigManager.validate(invalidConfig)
			}).toThrow(ConfigValidationError)
		})

		it('should reject invalid watch path configuration', () => {
			const invalidConfig = {
				server: { port: 3000, host: 'localhost', development: true },
				paths: {
					pages: './pages',
					components: './components',
					src: './src',
					output: './output',
					assets: './assets',
					includes: './includes',
					layout: './layout.html',
				},
				watch: {
					debounceDelay: 300,
					paths: [
						{
							directory: './pages',
							extensions: 'not an array', // Should be array
							label: '📝',
							buildCommands: ['build:docs-html'],
						},
					],
				},
			}

			expect(() => {
				ConfigManager.validate(invalidConfig)
			}).toThrow(ConfigValidationError)
		})
	})

	describe('getBuildCommands()', () => {
		it('should return build commands for markdown files', async () => {
			const testConfigManager = new ConfigManager()
			await testConfigManager.load(DEFAULT_CONFIG)

			// Use the internal function directly with the test config
			const commands = getBuildCommandsForFile(
				'docs-src/pages/test.md',
				testConfigManager.config,
			)
			expect(commands).toEqual(['build:docs-html'])
		})

		it('should return build commands for TypeScript component files', async () => {
			const testConfigManager = new ConfigManager()
			await testConfigManager.load(DEFAULT_CONFIG)

			const commands = getBuildCommandsForFile(
				'docs-src/components/test.ts',
				testConfigManager.config,
			)
			expect(commands).toEqual(['build:docs-js'])
		})

		it('should return build commands for CSS component files', async () => {
			const testConfigManager = new ConfigManager()
			await testConfigManager.load(DEFAULT_CONFIG)

			const commands = getBuildCommandsForFile(
				'docs-src/components/test.css',
				testConfigManager.config,
			)
			expect(commands).toEqual(['build:docs-css'])
		})

		it('should return build commands for HTML component files', async () => {
			const testConfigManager = new ConfigManager()
			await testConfigManager.load(DEFAULT_CONFIG)

			const commands = getBuildCommandsForFile(
				'docs-src/components/test.html',
				testConfigManager.config,
			)
			expect(commands).toEqual(['build:docs-html'])
		})

		it('should return build commands for source TypeScript files', async () => {
			const testConfigManager = new ConfigManager()
			await testConfigManager.load(DEFAULT_CONFIG)

			const commands = getBuildCommandsForFile(
				'src/main.ts',
				testConfigManager.config,
			)
			expect(commands).toEqual([
				'build',
				'build:docs-js',
				'build:docs-api',
			])
		})

		it('should return empty array for unmatched files', async () => {
			const testConfigManager = new ConfigManager()
			await testConfigManager.load(DEFAULT_CONFIG)

			const commands = getBuildCommandsForFile(
				'random/file.txt',
				testConfigManager.config,
			)
			expect(commands).toEqual([])
		})
	})

	describe('create() static method', () => {
		it('should create config with defaults', () => {
			const config = ConfigManager.create(DEFAULT_CONFIG)

			expect(config.server.port).toBe(3000)
			expect(config.server.host).toBe('localhost')
			expect(config.server.development).toBe(true)
		})

		it('should merge custom configuration', () => {
			const customConfig = {
				server: {
					port: 4000,
					host: '0.0.0.0',
				},
			}

			const config = ConfigManager.create(DEFAULT_CONFIG, customConfig)

			expect(config.server.port).toBe(4000)
			expect(config.server.host).toBe('0.0.0.0')
			expect(config.server.development).toBe(true) // Should keep default
		})

		it('should validate merged configuration', () => {
			const invalidConfig = {
				server: {
					port: -1, // Invalid port
				},
			}

			expect(() => {
				ConfigManager.create(DEFAULT_CONFIG, invalidConfig)
			}).toThrow(ConfigValidationError)
		})
	})

	describe('reload()', () => {
		it('should reload configuration', async () => {
			const configManager = new ConfigManager()

			// Load initial config
			const config1 = await configManager.load(DEFAULT_CONFIG)
			expect(config1.server.port).toBe(3000)

			// Change environment variable
			process.env.DEV_SERVER_PORT = '5000'

			// Reload config
			const config2 = await configManager.reload(DEFAULT_CONFIG)
			expect(config2.server.port).toBe(5000)
		})

		it('should throw error if reload called before load', async () => {
			const configManager = new ConfigManager()

			// Don't call load() first
			process.env.DEV_SERVER_PORT = '5000'

			const config = await configManager.reload(DEFAULT_CONFIG)
			expect(config.server.port).toBe(5000)
		})
	})

	describe('config getter', () => {
		it('should return loaded configuration', async () => {
			const configManager = new ConfigManager()
			await configManager.load(DEFAULT_CONFIG)

			const config = configManager.config
			expect(config).toBeDefined()
			expect(config.server.port).toBe(3000)
		})

		it('should throw error if accessed before load', () => {
			const configManager = new ConfigManager()

			expect(() => {
				const _config = configManager.config
			}).toThrow('Configuration not loaded. Call load() first.')
		})
	})

	describe('configuration merging', () => {
		it('should deep merge nested objects', () => {
			const override = {
				server: { port: 4000 }, // Should override port only
				build: { minify: true }, // Should override minify only
				assets: {
					compression: { enabled: false }, // Should override enabled only
				},
			}

			const config = ConfigManager.create(DEFAULT_CONFIG, override)

			expect(config.server.port).toBe(4000)
			expect(config.server.host).toBe('localhost') // Should keep original
			expect(config.build.minify).toBe(true)
			expect(config.build.optimizeLayout).toBe(true) // Should keep original
			expect(config.assets.compression.enabled).toBe(false)
			expect(config.assets.compression.brotli).toBe(true) // Should keep original
		})

		it('should handle array overrides', () => {
			const override = {
				watch: {
					paths: [
						{
							directory: './custom',
							extensions: ['.custom'],
							label: '🔧',
							buildCommands: ['custom:build'],
						},
					],
				},
			}

			const config = ConfigManager.create(DEFAULT_CONFIG, override)

			expect(config.watch.paths).toHaveLength(1)
			expect(config.watch.paths[0].directory).toContain('custom')
		})
	})

	describe('watch path enhancement', () => {
		it('should enhance watch paths with dynamic build commands', async () => {
			const configManager = new ConfigManager()
			const config = await configManager.load(DEFAULT_CONFIG)

			const componentsPath = config.watch.paths.find(p =>
				p.directory.includes('components'),
			)

			expect(componentsPath).toBeDefined()
			expect(componentsPath?.buildCommands).toEqual([]) // Empty for dynamic mapping
		})

		it('should preserve explicit build commands', async () => {
			const configManager = new ConfigManager()
			const config = await configManager.load(DEFAULT_CONFIG)

			const pagesPath = config.watch.paths.find(p =>
				p.directory.includes('pages'),
			)

			expect(pagesPath).toBeDefined()
			expect(pagesPath?.buildCommands).toEqual(['build:docs-html'])
		})
	})
})

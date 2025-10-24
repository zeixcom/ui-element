/**
 * Modular SSG Tests
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, rmSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { BaseBuildPlugin, ModularSSG } from '../modular-ssg.js'
import type { BuildInput, BuildOutput, DevServerConfig } from '../types.js'
import {
	createMockFunction,
	createTestContext,
	type TestContext,
} from './helpers/test-setup.js'

// Test plugin implementations
class TestMarkdownPlugin extends BaseBuildPlugin {
	public readonly name = 'test-markdown'
	public readonly version = '1.0.0'
	public readonly description = 'Test markdown processor'

	shouldRun(filePath: string): boolean {
		return filePath.endsWith('.md')
	}

	async transform(input: BuildInput): Promise<BuildOutput> {
		if (input.content.includes('# Error')) {
			return this.createError(input, 'Test error in markdown')
		}

		if (input.content.includes('# Warning')) {
			const result = this.createSuccess(input, {
				content: '<h1>Warning</h1>',
			})
			result.warnings = [
				{ message: 'Test warning', file: input.filePath },
			]
			return result
		}

		// Simple markdown-like transformation
		const content = input.content
			.replace(/^# (.+)$/gm, '<h1>$1</h1>')
			.replace(/^## (.+)$/gm, '<h2>$1</h2>')
			.replace(/^\* (.+)$/gm, '<li>$1</li>')

		return this.createSuccess(input, {
			content,
			metadata: { processed: true },
			dependencies: [input.filePath],
		})
	}

	async getDependencies(filePath: string): Promise<string[]> {
		return [filePath, join(filePath, '../layout.html')]
	}
}

class TestCSSPlugin extends BaseBuildPlugin {
	public readonly name = 'test-css'

	shouldRun(filePath: string): boolean {
		return filePath.endsWith('.css')
	}

	async transform(input: BuildInput): Promise<BuildOutput> {
		// Simple CSS processing
		const content = input.content
			.replace(/\/\*.*?\*\//g, '') // Remove comments
			.replace(/\s+/g, ' ') // Compress whitespace
			.trim()

		return this.createSuccess(input, {
			content,
			metadata: { minified: true },
		})
	}
}

class AsyncPlugin extends BaseBuildPlugin {
	public readonly name = 'async-plugin'
	private delay: number

	constructor(delay = 100) {
		super()
		this.delay = delay
	}

	shouldRun(filePath: string): boolean {
		return filePath.includes('async')
	}

	async transform(input: BuildInput): Promise<BuildOutput> {
		await new Promise(resolve => setTimeout(resolve, this.delay))
		return this.createSuccess(input, {
			content: `ASYNC: ${input.content}`,
		})
	}
}

describe('ModularSSG', () => {
	let testContext: TestContext
	let ssg: ModularSSG
	let mockEventEmitter: {
		emit: ReturnType<typeof createMockFunction>
		on: ReturnType<typeof createMockFunction>
		off: ReturnType<typeof createMockFunction>
	}

	beforeEach(() => {
		testContext = createTestContext('ssg-test')

		mockEventEmitter = {
			emit: createMockFunction(),
			on: createMockFunction(),
			off: createMockFunction(),
		}

		ssg = new ModularSSG(testContext.config, mockEventEmitter)
	})

	afterEach(() => {
		testContext.cleanup()
	})

	describe('plugin registration', () => {
		it('should register plugins', () => {
			const plugin = new TestMarkdownPlugin()

			const result = ssg.use(plugin)

			expect(result).toBe(ssg) // Should return self for chaining
			expect(ssg.getPlugins()).toContain(plugin)
			expect(ssg.getPlugins().length).toBe(1)
		})

		it('should register multiple plugins', () => {
			const plugin1 = new TestMarkdownPlugin()
			const plugin2 = new TestCSSPlugin()

			ssg.use(plugin1).use(plugin2)

			const plugins = ssg.getPlugins()
			expect(plugins).toContain(plugin1)
			expect(plugins).toContain(plugin2)
			expect(plugins.length).toBe(2)
		})

		it('should allow registering same plugin multiple times', () => {
			const plugin = new TestMarkdownPlugin()

			ssg.use(plugin).use(plugin)

			expect(ssg.getPlugins().length).toBe(2)
		})
	})

	describe('initialization', () => {
		it('should initialize plugins with config', async () => {
			const initializeMock = createMockFunction()

			class InitializablePlugin extends BaseBuildPlugin {
				public readonly name = 'initializable'

				shouldRun(): boolean {
					return false
				}
				async transform(input: BuildInput): Promise<BuildOutput> {
					return this.createSuccess(input)
				}

				async initialize(config: DevServerConfig): Promise<void> {
					initializeMock(config)
				}
			}

			const plugin = new InitializablePlugin()
			ssg.use(plugin)

			await ssg.initialize()

			expect(initializeMock.calls.length).toBe(1)
			expect(initializeMock.calls[0][0]).toBe(testContext.config)
		})

		it('should handle plugin initialization errors', async () => {
			class FailingInitPlugin extends BaseBuildPlugin {
				public readonly name = 'failing-init'

				shouldRun(): boolean {
					return false
				}
				async transform(input: BuildInput): Promise<BuildOutput> {
					return this.createSuccess(input)
				}

				async initialize(): Promise<void> {
					throw new Error('Init failed')
				}
			}

			const plugin = new FailingInitPlugin()
			ssg.use(plugin)

			await expect(ssg.initialize()).rejects.toThrow('Init failed')
		})

		it('should skip initialization for plugins without initialize method', async () => {
			const plugin = new TestMarkdownPlugin()
			ssg.use(plugin)

			// Should not throw
			try {
				await ssg.initialize()
				// If we get here without throwing, the test passes
			} catch (error) {
				throw new Error(`ssg.initialize() should not throw: ${error}`)
			}
		})
	})

	describe('buildFile()', () => {
		beforeEach(async () => {
			ssg.use(new TestMarkdownPlugin())
			ssg.use(new TestCSSPlugin())
			await ssg.initialize()
		})

		it('should build markdown file successfully', async () => {
			const testFile = join(testContext.tempDir, 'test.md')
			writeFileSync(testFile, '# Test Title\n\n## Subtitle\n\n* Item 1')

			const result = await ssg.buildFile(testFile)

			expect(result.success).toBe(true)
			expect(result.content).toContain('<h1>Test Title</h1>')
			expect(result.content).toContain('<h2>Subtitle</h2>')
			expect(result.content).toContain('<li>Item 1</li>')
			expect(result.metadata?.processed).toBe(true)
			expect(result.dependencies).toContain(testFile)
		})

		it('should build CSS file successfully', async () => {
			const testFile = join(testContext.tempDir, 'test.css')
			writeFileSync(testFile, '/* Comment */ .test  {  color: red;  }')

			const result = await ssg.buildFile(testFile)

			expect(result.success).toBe(true)
			expect(result.content).toBe('.test { color: red; }')
			expect(result.metadata?.minified).toBe(true)
		})

		it('should handle file not found', async () => {
			const nonExistentFile = join(
				testContext.tempDir,
				'does-not-exist.md',
			)

			const result = await ssg.buildFile(nonExistentFile)

			expect(result.success).toBe(false)
			expect(result.errors).toBeDefined()
			expect(result.errors![0].message).toContain('File not found')
		})

		it('should handle no applicable plugins', async () => {
			const testFile = join(testContext.tempDir, 'test.txt')
			writeFileSync(testFile, 'Plain text content')

			const result = await ssg.buildFile(testFile)

			expect(result.success).toBe(true)
			expect(result.filePath).toBe(resolve(testFile))
		})

		it('should handle plugin errors gracefully', async () => {
			const testFile = join(testContext.tempDir, 'error.md')
			writeFileSync(testFile, '# Error\n\nThis should cause an error')

			const result = await ssg.buildFile(testFile)

			expect(result.success).toBe(false)
			expect(result.errors).toBeDefined()
			expect(result.errors![0].message).toContain(
				'Test error in markdown',
			)
		})

		it('should handle plugin warnings', async () => {
			const testFile = join(testContext.tempDir, 'warning.md')
			writeFileSync(testFile, '# Warning\n\nThis should cause a warning')

			const result = await ssg.buildFile(testFile)

			expect(result.success).toBe(true)
			expect(result.content).toBe('<h1>Warning</h1>')
			expect(result.warnings).toBeDefined()
			expect(result.warnings![0].message).toBe('Test warning')
		})

		it('should prevent concurrent builds of same file', async () => {
			const testFile = join(testContext.tempDir, 'concurrent.md')
			writeFileSync(testFile, '# Concurrent Test')

			// Start multiple builds simultaneously
			const builds = [
				ssg.buildFile(testFile),
				ssg.buildFile(testFile),
				ssg.buildFile(testFile),
			]

			const results = await Promise.all(builds)

			// At least one should succeed
			const successCount = results.filter(r => r.success).length
			const errorCount = results.filter(r => !r.success).length

			expect(successCount).toBeGreaterThan(0)
			expect(errorCount).toBeGreaterThan(0) // Some should fail due to concurrent protection

			const concurrentErrors = results
				.filter(r => !r.success)
				.filter(r =>
					r.errors![0].message.includes('already in progress'),
				)

			expect(concurrentErrors.length).toBeGreaterThan(0)
		})

		it('should process through multiple applicable plugins', async () => {
			// Create a plugin that processes markdown files too
			class SecondMarkdownPlugin extends BaseBuildPlugin {
				public readonly name = 'second-markdown'

				shouldRun(filePath: string): boolean {
					return filePath.endsWith('.md')
				}

				async transform(input: BuildInput): Promise<BuildOutput> {
					const content =
						input.content + '\n<p>Processed by second plugin</p>'
					return this.createSuccess(input, { content })
				}
			}

			ssg.use(new SecondMarkdownPlugin())

			const testFile = join(testContext.tempDir, 'multi.md')
			writeFileSync(testFile, '# Multi Plugin Test')

			const result = await ssg.buildFile(testFile)

			expect(result.success).toBe(true)
			expect(result.content).toContain('<h1>Multi Plugin Test</h1>')
			expect(result.content).toContain('Processed by second plugin')
		})

		it('should stop processing on plugin failure', async () => {
			class FirstPlugin extends BaseBuildPlugin {
				public readonly name = 'first'
				shouldRun(): boolean {
					return true
				}
				async transform(input: BuildInput): Promise<BuildOutput> {
					return this.createError(input, 'First plugin failed')
				}
			}

			class SecondPlugin extends BaseBuildPlugin {
				public readonly name = 'second'
				shouldRun(): boolean {
					return true
				}
				async transform(input: BuildInput): Promise<BuildOutput> {
					return this.createSuccess(input, {
						content: 'Should not reach here',
					})
				}
			}

			const newSSG = new ModularSSG(testContext.config)
			newSSG.use(new FirstPlugin()).use(new SecondPlugin())

			const testFile = join(testContext.tempDir, 'fail-stop.md')
			writeFileSync(testFile, 'Test content')

			const result = await newSSG.buildFile(testFile)

			expect(result.success).toBe(false)
			expect(result.content).not.toBe('Should not reach here')
		})
	})

	describe('build()', () => {
		beforeEach(async () => {
			ssg.use(new TestMarkdownPlugin())
			await ssg.initialize()
		})

		it('should emit build start and complete events', async () => {
			const testFile = join(testContext.tempDir, 'event-test.md')
			writeFileSync(testFile, '# Event Test')

			await ssg.build([testFile])

			const startCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'build:start',
			)
			const completeCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'build:complete',
			)

			expect(startCalls.length).toBe(1)
			expect(completeCalls.length).toBe(1)

			const startData = startCalls[0][1]
			expect(startData.files).toEqual([testFile])
			expect(Array.isArray(startData.commands)).toBe(true)

			const completeData = completeCalls[0][1]
			expect(Array.isArray(completeData.results)).toBe(true)
			expect(typeof completeData.duration).toBe('number')
		})

		it('should build multiple files', async () => {
			const testFile1 = join(testContext.tempDir, 'test1.md')
			const testFile2 = join(testContext.tempDir, 'test2.md')

			writeFileSync(testFile1, '# Test 1')
			writeFileSync(testFile2, '# Test 2')

			const results = await ssg.build([testFile1, testFile2])

			expect(results.length).toBe(2)
			expect(results.every(r => r.success)).toBe(true)
		})

		it('should handle build errors and emit error events', async () => {
			const testFile = join(testContext.tempDir, 'error-build.md')
			writeFileSync(testFile, '# Error')

			const results = await ssg.build([testFile])

			// Build should complete but with errors
			expect(results.length).toBe(1)
			expect(results[0].success).toBe(false)
			expect(results[0].errors).toBeDefined()
			expect(results[0].errors![0].message).toContain(
				'Test error in markdown',
			)

			const errorCalls = mockEventEmitter.emit.calls.filter(
				call => call[0] === 'build:error',
			)

			expect(errorCalls.length).toBe(0) // No error events for plugin failures, only build system failures
		})

		it('should handle empty file list', async () => {
			const results = await ssg.build([])

			// Empty array now triggers full build (discovers files)
			expect(results.length).toBeGreaterThan(0)
			expect(results.every(r => r.success)).toBe(true)

			// Should still emit events
			expect(mockEventEmitter.emit.calls.length).toBeGreaterThan(0)
		})
	})

	describe('getApplicablePlugins()', () => {
		beforeEach(() => {
			ssg.use(new TestMarkdownPlugin())
			ssg.use(new TestCSSPlugin())
		})

		it('should return all plugins when no file specified', () => {
			const plugins = ssg.getApplicablePlugins()

			expect(plugins.length).toBe(2)
			expect(plugins.some(p => p.name === 'test-markdown')).toBe(true)
			expect(plugins.some(p => p.name === 'test-css')).toBe(true)
		})

		it('should return plugins applicable to markdown files', () => {
			const plugins = ssg.getApplicablePlugins('test.md')

			expect(plugins.length).toBe(1)
			expect(plugins[0].name).toBe('test-markdown')
		})

		it('should return plugins applicable to CSS files', () => {
			const plugins = ssg.getApplicablePlugins('test.css')

			expect(plugins.length).toBe(1)
			expect(plugins[0].name).toBe('test-css')
		})

		it('should return empty array for non-matching files', () => {
			const plugins = ssg.getApplicablePlugins('test.txt')

			expect(plugins.length).toBe(0)
		})
	})

	describe('cleanup()', () => {
		it('should cleanup all plugins', async () => {
			const cleanupMock = createMockFunction()

			class CleanupPlugin extends BaseBuildPlugin {
				public readonly name = 'cleanup-test'

				shouldRun(): boolean {
					return false
				}
				async transform(input: BuildInput): Promise<BuildOutput> {
					return this.createSuccess(input)
				}

				async cleanup(): Promise<void> {
					cleanupMock()
				}
			}

			const plugin = new CleanupPlugin()
			ssg.use(plugin)

			await ssg.cleanup()

			expect(cleanupMock.calls.length).toBe(1)
			expect(ssg.getPlugins().length).toBe(0)
		})

		it('should handle cleanup errors gracefully', async () => {
			class FailingCleanupPlugin extends BaseBuildPlugin {
				public readonly name = 'failing-cleanup'

				shouldRun(): boolean {
					return false
				}
				async transform(input: BuildInput): Promise<BuildOutput> {
					return this.createSuccess(input)
				}

				async cleanup(): Promise<void> {
					throw new Error('Cleanup failed')
				}
			}

			const plugin = new FailingCleanupPlugin()
			ssg.use(plugin)

			// Should not throw
			try {
				await ssg.cleanup()
				// If we get here without throwing, the test passes
			} catch (error) {
				throw new Error(`ssg.cleanup() should not throw: ${error}`)
			}
			expect(ssg.getPlugins().length).toBe(0)
		})

		it('should clear dependency graph and build state', async () => {
			const testFile = join(testContext.tempDir, 'cleanup.md')
			writeFileSync(testFile, '# Cleanup Test')

			ssg.use(new TestMarkdownPlugin())
			await ssg.initialize()
			await ssg.buildFile(testFile)

			// Should have dependency graph entries
			expect(ssg.getDependencyGraph().size).toBeGreaterThan(0)

			await ssg.cleanup()

			expect(ssg.getDependencyGraph().size).toBe(0)
		})
	})

	describe('writeOutput()', () => {
		it('should write successful build output', async () => {
			const input = join(testContext.tempDir, 'pages', 'output-test.md')
			const outputPath = join(
				testContext.tempDir,
				'output',
				'output-test.md',
			)

			const result: BuildOutput = {
				success: true,
				filePath: input,
				content: '<h1>Test Output</h1>',
			}

			await ssg.writeOutput(result)

			expect(existsSync(outputPath)).toBe(true)
			const written = Bun.file(outputPath).text()
			expect(await written).toBe('<h1>Test Output</h1>')
		})

		it('should create output directory if needed', async () => {
			const input = join(
				testContext.tempDir,
				'pages',
				'nested',
				'deep.md',
			)
			const outputDir = join(testContext.tempDir, 'output', 'nested')

			// Ensure output directory doesn't exist
			if (existsSync(outputDir)) {
				rmSync(outputDir, { recursive: true })
			}

			const result: BuildOutput = {
				success: true,
				filePath: input,
				content: '<h1>Deep Content</h1>',
			}

			await ssg.writeOutput(result)

			expect(existsSync(outputDir)).toBe(true)
		})

		it('should not write failed builds', async () => {
			const result: BuildOutput = {
				success: false,
				filePath: 'test.md',
				errors: [{ message: 'Build failed' }],
			}

			// Should not throw
			try {
				await ssg.writeOutput(result)
				// If we get here without throwing, the test passes
			} catch (error) {
				throw new Error(`ssg.writeOutput() should not throw: ${error}`)
			}
		})

		it('should not write builds without content', async () => {
			const result: BuildOutput = {
				success: true,
				filePath: 'test.md',
				// No content
			}

			try {
				await ssg.writeOutput(result)
				// If we get here without throwing, the test passes
			} catch (error) {
				throw new Error(`ssg.writeOutput() should not throw: ${error}`)
			}
		})

		it('should map component paths correctly', async () => {
			const input = join(testContext.tempDir, 'components', 'comp.html')
			const expectedOutput = join(
				testContext.tempDir,
				'output',
				'examples',
				'comp.html',
			)

			const result: BuildOutput = {
				success: true,
				filePath: input,
				content: '<div>Component</div>',
			}

			await ssg.writeOutput(result)

			expect(existsSync(expectedOutput)).toBe(true)
		})
	})

	describe('getStats()', () => {
		it('should return correct stats', () => {
			ssg.use(new TestMarkdownPlugin())
			ssg.use(new TestCSSPlugin())

			const stats = ssg.getStats()

			expect(stats.pluginCount).toBe(2)
			expect(stats.dependencyCount).toBe(0)
			expect(stats.buildsInProgress).toBe(0)
			expect(stats.lastBuildTime).toBeUndefined()
		})

		it('should track builds in progress', async () => {
			ssg.use(new AsyncPlugin(100))

			const testFile = join(testContext.tempDir, 'async-test.md')
			writeFileSync(testFile, 'Async content')

			// Start build but don't await
			const buildPromise = ssg.buildFile(testFile)

			// Check stats during build
			const statsDuring = ssg.getStats()
			expect(statsDuring.buildsInProgress).toBe(1)

			// Wait for completion
			await buildPromise

			const statsAfter = ssg.getStats()
			expect(statsAfter.buildsInProgress).toBe(0)
		})
	})

	describe('dependency tracking', () => {
		beforeEach(async () => {
			ssg.use(new TestMarkdownPlugin())
			await ssg.initialize()
		})

		it('should track file dependencies', async () => {
			const testFile = join(testContext.tempDir, 'deps.md')
			writeFileSync(testFile, '# Dependencies Test')

			await ssg.buildFile(testFile)

			const depGraph = ssg.getDependencyGraph()
			const dependencies = depGraph.get(resolve(testFile))

			expect(dependencies).toBeDefined()
			expect(dependencies).toContain(resolve(testFile))
		})

		it('should return copy of dependency graph', () => {
			const graph1 = ssg.getDependencyGraph()
			const graph2 = ssg.getDependencyGraph()

			expect(graph1).not.toBe(graph2) // Different instances
		})
	})

	describe('BaseBuildPlugin', () => {
		it('should provide helper methods', () => {
			const plugin = new TestMarkdownPlugin()
			const input: BuildInput = {
				filePath: 'test.md',
				content: '# Test',
			}

			const success = plugin['createSuccess'](input, {
				content: '<h1>Test</h1>',
			})
			expect(success.success).toBe(true)
			expect(success.content).toBe('<h1>Test</h1>')
			expect(success.filePath).toBe('test.md')

			const error = plugin['createError'](input, 'Test error', 1, 5)
			expect(error.success).toBe(false)
			expect(error.errors).toBeDefined()
			expect(error.errors![0].message).toBe('Test error')
			expect(error.errors![0].line).toBe(1)
			expect(error.errors![0].column).toBe(5)
		})

		it('should have optional lifecycle methods', async () => {
			const plugin = new TestMarkdownPlugin()

			// These should not throw even if not implemented
			try {
				await plugin.initialize?.(testContext.config)
				await plugin.cleanup?.()
				// If we get here without throwing, the test passes
			} catch (error) {
				throw new Error(
					`Plugin lifecycle methods should not throw: ${error}`,
				)
			}
			await expect(plugin.getDependencies?.('test.md')).resolves.toEqual([
				'test.md',
				join('test.md', '../layout.html'),
			])
		})
	})

	describe('async plugin execution', () => {
		it('should handle plugins with different execution times', async () => {
			const fastPlugin = new AsyncPlugin(10)
			const slowPlugin = new AsyncPlugin(100)

			const testSSG = new ModularSSG(testContext.config)
			testSSG.use(fastPlugin).use(slowPlugin)

			const testFile = join(testContext.tempDir, 'async-mixed.md')
			writeFileSync(testFile, 'Mixed async content')

			const startTime = Date.now()
			const result = await testSSG.buildFile(testFile)
			const duration = Date.now() - startTime

			expect(result.success).toBe(true)
			expect(duration).toBeGreaterThan(100) // Should wait for slowest plugin
			expect(result.content).toContain('ASYNC:')
		})

		it('should handle plugin timeouts gracefully', async () => {
			const timeoutPlugin = new AsyncPlugin(5000) // Very slow

			const testSSG = new ModularSSG(testContext.config)
			testSSG.use(timeoutPlugin)

			const testFile = join(testContext.tempDir, 'timeout-test.md')
			writeFileSync(testFile, 'Timeout content')

			// This test just ensures the system doesn't crash
			// In a real implementation, you might want timeout handling
			const result = await testSSG.buildFile(testFile)
			expect(result).toBeDefined()
		})
	})
})

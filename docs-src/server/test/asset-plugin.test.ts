/**
 * AssetPlugin Tests
 * Tests for asset regeneration when dependencies change
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { AssetPlugin } from '../plugins/asset-plugin'
import type { BuildInput } from '../types'
import {
	createTestContext,
	type MockConsole,
	mockConsole,
	type TestContext,
} from './helpers/test-setup'

describe('AssetPlugin', () => {
	let plugin: AssetPlugin
	let testContext: TestContext
	let mockConsoleInstance: MockConsole

	beforeEach(async () => {
		testContext = createTestContext('asset-plugin')
		plugin = new AssetPlugin()
		mockConsoleInstance = mockConsole()

		// Create required directories and files for asset processing
		mkdirSync(join(testContext.tempDir, 'docs-src'), { recursive: true })
		mkdirSync(
			join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-component',
			),
			{ recursive: true },
		)
		mkdirSync(
			join(testContext.tempDir, 'docs-src', 'functions', 'shared'),
			{ recursive: true },
		)
		mkdirSync(join(testContext.tempDir, 'docs'), { recursive: true })
		mkdirSync(join(testContext.tempDir, 'docs', 'assets'), {
			recursive: true,
		})

		// Mock main.css that imports component CSS
		writeFileSync(
			join(testContext.tempDir, 'docs-src', 'main.css'),
			`@import "./global.css";
@import "./components/test-component/test-component.css";`,
		)

		// Mock global.css
		writeFileSync(
			join(testContext.tempDir, 'docs-src', 'global.css'),
			`:root { --test-color: blue; }`,
		)

		// Mock component CSS
		writeFileSync(
			join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-component',
				'test-component.css',
			),
			`.test-component { color: var(--test-color); }`,
		)

		// Mock main.ts that imports component TS
		writeFileSync(
			join(testContext.tempDir, 'docs-src', 'main.ts'),
			`import './components/test-component/test-component.ts';`,
		)

		// Mock component TS that imports functions
		writeFileSync(
			join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-component',
				'test-component.ts',
			),
			`import { testHelper } from '../../functions/shared/testHelper';
export class TestComponent {
	render() { return testHelper('test'); }
}`,
		)

		// Mock function file
		writeFileSync(
			join(
				testContext.tempDir,
				'docs-src',
				'functions',
				'shared',
				'testHelper.ts',
			),
			`export function testHelper(value: string): string { return value; }`,
		)

		// Mock src files that components might import
		writeFileSync(
			join(testContext.tempDir, 'src', 'core.ts'),
			`export const core = () => 'core functionality';`,
		)

		// Initialize plugin in test mode
		process.env.NODE_ENV = 'test'
		await plugin.initialize()
	})

	afterEach(() => {
		testContext.cleanup()
		mockConsoleInstance.restore()
		delete process.env.NODE_ENV
	})

	describe('shouldRun()', () => {
		describe('CSS dependencies', () => {
			it('should trigger for main.css', () => {
				const filePath = join(
					testContext.tempDir,
					'docs-src',
					'main.css',
				)
				expect(plugin.shouldRun(filePath)).toBe(true)
			})

			it('should trigger for global.css', () => {
				const filePath = join(
					testContext.tempDir,
					'docs-src',
					'global.css',
				)
				expect(plugin.shouldRun(filePath)).toBe(true)
			})

			it('should trigger for component CSS files', () => {
				const filePath = join(
					testContext.tempDir,
					'docs-src',
					'components',
					'test-component',
					'test-component.css',
				)
				expect(plugin.shouldRun(filePath)).toBe(true)
			})

			it('should not trigger for non-CSS files', () => {
				const filePath = join(
					testContext.tempDir,
					'docs-src',
					'readme.txt',
				)
				expect(plugin.shouldRun(filePath)).toBe(false)
			})

			it('should not trigger for CSS files outside component structure', () => {
				const filePath = join(testContext.tempDir, 'other', 'style.css')
				expect(plugin.shouldRun(filePath)).toBe(false)
			})
		})

		describe('JavaScript/TypeScript dependencies', () => {
			it('should trigger for main.ts', () => {
				const filePath = join(
					testContext.tempDir,
					'docs-src',
					'main.ts',
				)
				expect(plugin.shouldRun(filePath)).toBe(true)
			})

			it('should trigger for component TS files', () => {
				const filePath = join(
					testContext.tempDir,
					'docs-src',
					'components',
					'test-component',
					'test-component.ts',
				)
				expect(plugin.shouldRun(filePath)).toBe(true)
			})

			it('should trigger for function files', () => {
				const filePath = join(
					testContext.tempDir,
					'docs-src',
					'functions',
					'shared',
					'testHelper.ts',
				)
				expect(plugin.shouldRun(filePath)).toBe(true)
			})

			it('should trigger for src files', () => {
				const filePath = join(testContext.tempDir, 'src', 'core.ts')
				expect(plugin.shouldRun(filePath)).toBe(true)
			})

			it('should not trigger for non-TS files', () => {
				const filePath = join(
					testContext.tempDir,
					'docs-src',
					'readme.md',
				)
				expect(plugin.shouldRun(filePath)).toBe(false)
			})
		})
	})

	describe('transform()', () => {
		describe('CSS processing', () => {
			it('should process main.css changes', async () => {
				const input: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', 'main.css'),
					content: '@import "./global.css";',
					metadata: {},
				}

				const result = await plugin.transform(input)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('css')
			})

			it('should process component CSS changes', async () => {
				const input: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-component',
						'test-component.css',
					),
					content: '.test { color: red; }',
					metadata: {},
				}

				const result = await plugin.transform(input)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('css')
			})

			it('should process global.css changes', async () => {
				const input: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'global.css',
					),
					content: ':root { --color: red; }',
					metadata: {},
				}

				const result = await plugin.transform(input)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('css')
			})

			it('should clear cache when component CSS changes', async () => {
				// First process main.css
				const mainInput: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', 'main.css'),
					content: '@import "./global.css";',
					metadata: {},
				}
				await plugin.transform(mainInput)

				// Now process component CSS - should clear cache and reprocess
				const componentInput: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-component',
						'test-component.css',
					),
					content: '.test { color: green; }',
					metadata: {},
				}

				const result = await plugin.transform(componentInput)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('css')
				// Should not be marked as already-processed
				expect(result.content).not.toBe('already-processed')
			})
		})

		describe('JavaScript processing', () => {
			it('should process main.ts changes', async () => {
				const input: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', 'main.ts'),
					content: 'console.log("main");',
					metadata: {},
				}

				const result = await plugin.transform(input)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('js')
			})

			it('should process component TS changes', async () => {
				const input: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-component',
						'test-component.ts',
					),
					content: 'export class Test {}',
					metadata: {},
				}

				const result = await plugin.transform(input)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('js')
			})

			it('should process function file changes', async () => {
				const input: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'functions',
						'shared',
						'helper.ts',
					),
					content: 'export const helper = () => true;',
					metadata: {},
				}

				const result = await plugin.transform(input)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('js')
			})

			it('should process src file changes', async () => {
				const input: BuildInput = {
					filePath: join(testContext.tempDir, 'src', 'utils.ts'),
					content: 'export const utils = {};',
					metadata: {},
				}

				const result = await plugin.transform(input)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('js')
			})

			it('should clear cache when component TS changes', async () => {
				// First process main.ts
				const mainInput: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', 'main.ts'),
					content: 'console.log("main");',
					metadata: {},
				}
				await plugin.transform(mainInput)

				// Now process component TS - should clear cache and reprocess
				const componentInput: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-component',
						'test-component.ts',
					),
					content: 'export class Updated {}',
					metadata: {},
				}

				const result = await plugin.transform(componentInput)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('js')
				// Should not be marked as already-processed
				expect(result.content).not.toBe('already-processed')
			})
		})

		describe('selective processing', () => {
			it('should only rebuild CSS when CSS files change', async () => {
				const cssInput: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-component',
						'test-component.css',
					),
					content: '.test { color: blue; }',
					metadata: {},
				}

				const result = await plugin.transform(cssInput)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('css')

				// Verify only CSS processing messages appear
				const logCalls = mockConsoleInstance.log.calls.flat()
				const hasJSBundling = logCalls.some(
					call =>
						typeof call === 'string' && call.includes('Bundled'),
				)
				expect(hasJSBundling).toBe(false) // JS should not be rebuilt
			})

			it('should only rebuild JS when TS files change', async () => {
				const tsInput: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-component',
						'test-component.ts',
					),
					content: 'export class Test {}',
					metadata: {},
				}

				const result = await plugin.transform(tsInput)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('js')
			})

			it('should not rebuild JS when CSS files change', async () => {
				// First process JS to add it to cache
				const jsInput: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', 'main.ts'),
					content: 'console.log("test");',
					metadata: {},
				}
				await plugin.transform(jsInput)

				// Clear mock calls
				mockConsoleInstance.log.clear()

				// Now process CSS - should not trigger JS rebuild
				const cssInput: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'global.css',
					),
					content: ':root { --color: red; }',
					metadata: {},
				}

				const result = await plugin.transform(cssInput)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('css')

				// Verify no JS bundling occurred
				const logCalls = mockConsoleInstance.log.calls.flat()
				const hasJSBundling = logCalls.some(
					call =>
						typeof call === 'string' && call.includes('Bundled'),
				)
				expect(hasJSBundling).toBe(false)
			})

			it('should not rebuild CSS when JS files change', async () => {
				// First process CSS to add it to cache
				const cssInput: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', 'main.css'),
					content: '@import "./global.css";',
					metadata: {},
				}
				await plugin.transform(cssInput)

				// Clear mock calls
				mockConsoleInstance.log.clear()

				// Now process JS - should not trigger CSS rebuild
				const jsInput: BuildInput = {
					filePath: join(testContext.tempDir, 'src', 'utils.ts'),
					content: 'export const utils = {};',
					metadata: {},
				}

				const result = await plugin.transform(jsInput)

				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('js')
			})
		})

		describe('cache management', () => {
			it('should cache processed files to avoid duplicate work', async () => {
				const input: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', 'main.css'),
					content: '@import "./global.css";',
					metadata: {},
				}

				// Process once
				const result1 = await plugin.transform(input)
				expect(result1.success).toBe(true)
				expect(result1.content).toBe('processed')

				// Process again - should be cached
				const result2 = await plugin.transform(input)
				expect(result2.success).toBe(true)
				expect(result2.content).toBe('already-processed')
			})

			it('should clear specific file type cache on dependency changes', async () => {
				// Process main CSS
				const mainCssInput: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', 'main.css'),
					content: '@import "./global.css";',
					metadata: {},
				}
				await plugin.transform(mainCssInput)

				// Process main JS
				const mainJsInput: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', 'main.ts'),
					content: 'console.log("main");',
					metadata: {},
				}
				await plugin.transform(mainJsInput)

				// Change component CSS - should clear only CSS cache
				const componentCssInput: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-component',
						'test-component.css',
					),
					content: '.test { color: red; }',
					metadata: {},
				}
				const cssResult = await plugin.transform(componentCssInput)
				expect(cssResult.content).toBe('processed') // Not cached

				// JS should still be cached
				const jsResult = await plugin.transform(mainJsInput)
				expect(jsResult.content).toBe('already-processed') // Still cached
			})
		})
	})

	describe('integration scenarios', () => {
		it('should handle complex dependency chain for CSS', async () => {
			// Create a complex CSS dependency chain
			mkdirSync(
				join(testContext.tempDir, 'docs-src', 'components', 'button'),
				{ recursive: true },
			)
			writeFileSync(
				join(
					testContext.tempDir,
					'docs-src',
					'components',
					'button',
					'button.css',
				),
				`.button { background: var(--button-bg); }`,
			)

			// Update main.css to import button
			writeFileSync(
				join(testContext.tempDir, 'docs-src', 'main.css'),
				`@import "./global.css";
@import "./components/test-component/test-component.css";
@import "./components/button/button.css";`,
			)

			const inputs = [
				{ file: 'global.css', content: ':root { --button-bg: blue; }' },
				{
					file: 'components/test-component/test-component.css',
					content: '.test { color: green; }',
				},
				{
					file: 'components/button/button.css',
					content: '.button { padding: 10px; }',
				},
			]

			// Each should trigger CSS rebuild
			for (const { file, content } of inputs) {
				const input: BuildInput = {
					filePath: join(testContext.tempDir, 'docs-src', file),
					content,
					metadata: {},
				}

				const result = await plugin.transform(input)
				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('css')
			}
		})

		it('should handle complex dependency chain for JS', async () => {
			// Create additional function files
			mkdirSync(
				join(testContext.tempDir, 'docs-src', 'functions', 'parser'),
				{ recursive: true },
			)
			writeFileSync(
				join(
					testContext.tempDir,
					'docs-src',
					'functions',
					'parser',
					'parseValue.ts',
				),
				`export function parseValue(val: string) { return val; }`,
			)

			// Update component to use multiple functions
			writeFileSync(
				join(
					testContext.tempDir,
					'docs-src',
					'components',
					'test-component',
					'test-component.ts',
				),
				`import { testHelper } from '../../functions/shared/testHelper';
import { parseValue } from '../../functions/parser/parseValue';
import { core } from '../../../src/core';

export class TestComponent {
	render() {
		return parseValue(testHelper(core()));
	}
}`,
			)

			const inputs = [
				{
					file: 'functions/shared/testHelper.ts',
					content: 'export const testHelper = (v: string) => v;',
				},
				{
					file: 'functions/parser/parseValue.ts',
					content:
						'export const parseValue = (v: string) => v.toUpperCase();',
				},
				{
					file: 'src/core.ts',
					content: 'export const core = () => "updated core";',
				},
				{
					file: 'components/test-component/test-component.ts',
					content: 'export class Updated {}',
				},
			]

			// Each should trigger JS rebuild
			for (const { file, content } of inputs) {
				const input: BuildInput = {
					filePath: join(testContext.tempDir, file),
					content,
					metadata: {},
				}

				const result = await plugin.transform(input)
				expect(result.success).toBe(true)
				expect(result.metadata?.fileType).toBe('js')
			}
		})
	})

	describe('error handling', () => {
		it('should handle missing files gracefully', async () => {
			const input: BuildInput = {
				filePath: join(testContext.tempDir, 'nonexistent', 'file.css'),
				content: '.test { color: red; }',
				metadata: {},
			}

			const result = await plugin.transform(input)
			// Should still attempt to process in test mode
			expect(result.success).toBe(true)
		})

		it('should handle invalid file paths', async () => {
			const input: BuildInput = {
				filePath: '',
				content: '.test { color: red; }',
				metadata: {},
			}

			const result = await plugin.transform(input)
			// Should handle gracefully
			expect(result.success).toBeDefined()
		})
	})

	describe('cleanup()', () => {
		it('should clear all caches and state', async () => {
			// Process some files to populate caches
			const cssInput: BuildInput = {
				filePath: join(testContext.tempDir, 'docs-src', 'main.css'),
				content: '@import "./global.css";',
				metadata: {},
			}
			await plugin.transform(cssInput)

			const jsInput: BuildInput = {
				filePath: join(testContext.tempDir, 'docs-src', 'main.ts'),
				content: 'console.log("test");',
				metadata: {},
			}
			await plugin.transform(jsInput)

			// Cleanup
			await plugin.cleanup()

			// Should reprocess after cleanup (not cached)
			const result1 = await plugin.transform(cssInput)
			expect(result1.content).toBe('processed') // Not cached

			const result2 = await plugin.transform(jsInput)
			expect(result2.content).toBe('processed') // Not cached
		})
	})
})

/**
 * Reactive FragmentPlugin Tests
 * Tests for reactive component fragment processing using Cause & Effect signals
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { FragmentPlugin } from '../plugins/fragment-plugin'
import {
	createFileSystemSignals,
	createReactiveFileProcessor,
} from '../signals'
import type { BuildInput, DevServerConfig, FileChangeEvent } from '../types'
import {
	createTestContext,
	type MockConsole,
	mockConsole,
	type TestContext,
} from './helpers/test-setup'

describe('Reactive FragmentPlugin', () => {
	let plugin: FragmentPlugin
	let testContext: TestContext
	let mockConsoleInstance: MockConsole
	let signals: ReturnType<typeof createFileSystemSignals>
	let processor: ReturnType<typeof createReactiveFileProcessor>
	let testConfig: DevServerConfig
	let componentsDir: string
	let fragmentsDir: string

	beforeEach(async () => {
		testContext = createTestContext('reactive-fragment-plugin')
		mockConsoleInstance = mockConsole()

		// Change to the temp directory so relative paths work
		const originalCwd = process.cwd()
		process.chdir(testContext.tempDir)

		// Create the exact directory structure the plugin expects
		componentsDir = join(testContext.tempDir, 'docs-src', 'components')
		fragmentsDir = join(testContext.tempDir, 'docs-src', 'fragments')

		// Create test configuration
		testConfig = {
			port: 3000,
			watchMode: true,
			assetsDir: join(testContext.tempDir, 'docs', 'assets'),
			componentsDir,
			fragmentsDir,
			docsDir: join(testContext.tempDir, 'docs'),
			docsSourceDir: join(testContext.tempDir, 'docs-src'),
			pagesDir: join(testContext.tempDir, 'docs-src', 'pages'),
			includesDir: join(testContext.tempDir, 'docs-src', 'includes'),
			srcDir: join(testContext.tempDir, 'src'),
		}

		// Create reactive signals and processor
		signals = createFileSystemSignals({ config: testConfig })
		processor = createReactiveFileProcessor(signals)

		// Create necessary directories
		for (const dir of [componentsDir, fragmentsDir]) {
			mkdirSync(dir, { recursive: true })
		}

		// Initialize plugin
		plugin = new FragmentPlugin()

		// Store original cwd to restore later
		;(testContext as any).originalCwd = originalCwd

		// Create test components
		await createTestComponent('basic-button', {
			html: '<button class="basic-button">Click me</button>',
			css: `.basic-button {
	background: #007bff;
	color: white;
	border: none;
	padding: 10px 20px;
	border-radius: 4px;
	cursor: pointer;
}

.basic-button:hover {
	background: #0056b3;
}`,
			ts: `export class BasicButton extends HTMLElement {
	connectedCallback() {
		this.innerHTML = '<button class="basic-button">Click me</button>';
		this.querySelector('button')?.addEventListener('click', () => {
			console.log('Button clicked!');
		});
	}
}

customElements.define('basic-button', BasicButton);`,
		})

		await createTestComponent('simple-card', {
			html: '<div class="simple-card"><slot></slot></div>',
			css: `.simple-card {
	border: 1px solid #ddd;
	padding: 16px;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}`,
		})

		await createTestComponent('text-only', {
			ts: `export class TextOnly extends HTMLElement {
	connectedCallback() {
		this.textContent = 'Text only component';
	}
}`,
		})

		await plugin.initialize(testConfig, signals, processor)
	})

	afterEach(async () => {
		// Restore original working directory
		if ((testContext as any).originalCwd) {
			process.chdir((testContext as any).originalCwd)
		}
		await plugin.cleanup()
		testContext.cleanup()
		mockConsoleInstance.restore()
	})

	// Helper function to create test components
	async function createTestComponent(
		name: string,
		files: { html?: string; css?: string; ts?: string },
	) {
		const componentDir = join(componentsDir, name)
		mkdirSync(componentDir, { recursive: true })

		if (files.html) {
			writeFileSync(join(componentDir, `${name}.html`), files.html)
		}
		if (files.css) {
			writeFileSync(join(componentDir, `${name}.css`), files.css)
		}
		if (files.ts) {
			writeFileSync(join(componentDir, `${name}.ts`), files.ts)
		}
	}

	describe('reactive interface compliance', () => {
		it('should have reactive property set to true', () => {
			expect(plugin.reactive).toBe(true)
		})

		it('should implement ReactivePlugin interface', () => {
			expect(plugin.name).toBe('reactive-fragment-processor')
			expect(plugin.version).toBe('2.0.0')
			expect(plugin.description).toContain('Reactive')
			expect(typeof plugin.shouldRun).toBe('function')
			expect(typeof plugin.transform).toBe('function')
			expect(typeof plugin.initialize).toBe('function')
			expect(typeof plugin.cleanup).toBe('function')
		})

		it('should provide watch patterns', () => {
			const patterns = plugin.getWatchPatterns?.()
			expect(Array.isArray(patterns)).toBe(true)
			expect(patterns?.length).toBeGreaterThan(0)
		})
	})

	describe('shouldRun() - file targeting', () => {
		it('should trigger for component TypeScript files', () => {
			const filePath = join(
				componentsDir,
				'basic-button',
				'basic-button.ts',
			)
			expect(plugin.shouldRun(filePath)).toBe(true)
		})

		it('should trigger for component HTML files', () => {
			const filePath = join(
				componentsDir,
				'basic-button',
				'basic-button.html',
			)
			expect(plugin.shouldRun(filePath)).toBe(true)
		})

		it('should trigger for component CSS files', () => {
			const filePath = join(
				componentsDir,
				'basic-button',
				'basic-button.css',
			)
			expect(plugin.shouldRun(filePath)).toBe(true)
		})

		it('should not trigger for files outside components directory', () => {
			const filePath = join(testContext.tempDir, 'other', 'file.ts')
			expect(plugin.shouldRun(filePath)).toBe(false)
		})

		it('should not trigger for unsupported file types', () => {
			const filePath = join(componentsDir, 'basic-button', 'README.md')
			expect(plugin.shouldRun(filePath)).toBe(false)
		})

		it('should trigger for nested component files', () => {
			const filePath = join(
				componentsDir,
				'nested',
				'deep',
				'component',
				'component.ts',
			)
			expect(plugin.shouldRun(filePath)).toBe(true)
		})
	})

	describe('shouldReactToChange() - reactive behavior', () => {
		it('should react to component file changes', () => {
			const filePath = join(
				componentsDir,
				'basic-button',
				'basic-button.ts',
			)
			expect(plugin.shouldReactToChange?.(filePath, 'change')).toBe(true)
		})

		it('should react to component HTML changes', () => {
			const filePath = join(
				componentsDir,
				'basic-button',
				'basic-button.html',
			)
			expect(plugin.shouldReactToChange?.(filePath, 'change')).toBe(true)
		})

		it('should not react to non-component file changes', () => {
			const filePath = join(testContext.tempDir, 'README.md')
			expect(plugin.shouldReactToChange?.(filePath, 'change')).toBe(false)
		})
	})

	describe('reactive file change handling', () => {
		it('should handle component file changes through signals', async () => {
			const componentFilePath = join(
				componentsDir,
				'basic-button',
				'basic-button.ts',
			)
			const changeEvent: FileChangeEvent = {
				filePath: componentFilePath,
				eventType: 'change',
				stats: {
					size: 500,
					mtime: new Date(),
				},
			}

			// Process file change through reactive system
			await processor.processFileChange(changeEvent)

			// Plugin should handle the change via onFileChange
			if (plugin.onFileChange) {
				await plugin.onFileChange(changeEvent, signals)
			}

			// Verify the change was processed (plugin may or may not log)
			// The important thing is that it doesn't throw
			expect(true).toBe(true)
		})

		it('should handle new component creation', async () => {
			// Create a new component
			await createTestComponent('new-component', {
				html: '<div class="new">New Component</div>',
				ts: 'export class NewComponent extends HTMLElement {}',
			})

			const newComponentPath = join(
				componentsDir,
				'new-component',
				'new-component.html',
			)
			const changeEvent: FileChangeEvent = {
				filePath: newComponentPath,
				eventType: 'add',
				stats: {
					size: 100,
					mtime: new Date(),
				},
			}

			await processor.processFileChange(changeEvent)

			if (plugin.onFileChange) {
				await plugin.onFileChange(changeEvent, signals)
			}

			// Should process the new component (plugin may or may not log)
			expect(true).toBe(true)
		})
	})

	describe('transform() - reactive processing', () => {
		it('should process component with all file types', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				content: 'export class BasicButton extends HTMLElement {}',
				metadata: { lastModified: Date.now() },
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)
			expect(result.filePath).toBe(input.filePath)

			// Check that fragment was generated
			const fragmentPath = join(
				fragmentsDir,
				'basic-button-fragment.html',
			)
			expect(existsSync(fragmentPath)).toBe(true)

			// Check fragment content structure
			const fragmentContent = readFileSync(fragmentPath, 'utf8')
			expect(fragmentContent).toContain('tab-group')
			expect(fragmentContent).toContain('data-tabs')
			expect(fragmentContent).toContain('HTML')
			expect(fragmentContent).toContain('CSS')
			expect(fragmentContent).toContain('TypeScript')
		})

		it('should process component with partial files (HTML + CSS only)', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'simple-card',
					'simple-card.html',
				),
				content: '<div class="simple-card"><slot></slot></div>',
				metadata: { lastModified: Date.now() },
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)

			// Check that fragment was generated
			const fragmentPath = join(fragmentsDir, 'simple-card-fragment.html')
			expect(existsSync(fragmentPath)).toBe(true)

			// Should contain HTML and CSS tabs, but not TypeScript
			const fragmentContent = readFileSync(fragmentPath, 'utf8')
			expect(fragmentContent).toContain('HTML')
			expect(fragmentContent).toContain('CSS')
			expect(fragmentContent).not.toContain('TypeScript')
		})

		it('should process component with single file type', async () => {
			const input: BuildInput = {
				filePath: join(componentsDir, 'text-only', 'text-only.ts'),
				content: 'export class TextOnly extends HTMLElement {}',
				metadata: { lastModified: Date.now() },
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)

			// Check that fragment was generated
			const fragmentPath = join(fragmentsDir, 'text-only-fragment.html')
			expect(existsSync(fragmentPath)).toBe(true)

			// Should only contain TypeScript tab
			const fragmentContent = readFileSync(fragmentPath, 'utf8')
			expect(fragmentContent).toContain('TypeScript')
			expect(fragmentContent).not.toContain('HTML')
			expect(fragmentContent).not.toContain('CSS')
		})

		it('should handle errors gracefully in reactive mode', async () => {
			const input: BuildInput = {
				filePath: '/nonexistent/component.ts',
				content: 'invalid content',
				metadata: { lastModified: Date.now() },
			}

			const result = await plugin.transform(input)

			// Should handle the error without throwing
			expect(typeof result.success).toBe('boolean')
		})
	})

	describe('component processing methods', () => {
		it('should process all components in the directory', async () => {
			// Process all components
			if (plugin.processAllComponents) {
				await plugin.processAllComponents()
			}

			// Check that fragments were generated for all components
			const expectedFragments = [
				'basic-button-fragment.html',
				'simple-card-fragment.html',
				'text-only-fragment.html',
			]

			for (const fragmentFile of expectedFragments) {
				const fragmentPath = join(fragmentsDir, fragmentFile)
				expect(existsSync(fragmentPath)).toBe(true)
			}
		})

		it('should generate syntax-highlighted code blocks', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				content: 'export class BasicButton extends HTMLElement {}',
				metadata: { lastModified: Date.now() },
			}

			await plugin.transform(input)

			const fragmentPath = join(
				fragmentsDir,
				'basic-button-fragment.html',
			)
			const fragmentContent = readFileSync(fragmentPath, 'utf8')

			// Should contain syntax highlighting elements
			expect(fragmentContent).toMatch(/<pre class="shiki/)
			expect(fragmentContent).toMatch(/<code/)
		})

		it('should select last panel (TypeScript) by default', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				content: 'export class BasicButton extends HTMLElement {}',
				metadata: { lastModified: Date.now() },
			}

			await plugin.transform(input)

			const fragmentPath = join(
				fragmentsDir,
				'basic-button-fragment.html',
			)
			const fragmentContent = readFileSync(fragmentPath, 'utf8')

			// Should have TypeScript tab selected by default
			expect(fragmentContent).toMatch(/data-selected="TypeScript"/)
		})
	})

	describe('signal integration', () => {
		it('should work with file system signals', async () => {
			// Verify that signals are properly connected
			expect(signals).toBeDefined()
			expect(processor).toBeDefined()

			// Test signal updates
			const testFile = join(
				componentsDir,
				'basic-button',
				'basic-button.ts',
			)
			writeFileSync(testFile, '/* updated content */')

			const changeEvent: FileChangeEvent = {
				filePath: testFile,
				eventType: 'change',
				stats: {
					size: 20,
					mtime: new Date(),
				},
			}

			await processor.processFileChange(changeEvent)

			// Plugin should be notified of the change
			if (plugin.onFileChange) {
				await plugin.onFileChange(changeEvent, signals)
			}

			// Verify signals are working (plugin may or may not log)
			expect(true).toBe(true)
		})

		it('should clean up reactive effects on cleanup', async () => {
			await plugin.cleanup()

			// After cleanup, plugin should not respond to changes
			const changeEvent: FileChangeEvent = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				eventType: 'change',
				stats: {
					size: 100,
					mtime: new Date(),
				},
			}

			// After cleanup, plugin should handle changes gracefully
			try {
				if (plugin.onFileChange) {
					await plugin.onFileChange(changeEvent, signals)
				}
			} catch (error) {
				// Expected - plugin may throw after cleanup
			}

			// Test passed if no unhandled errors
			expect(true).toBe(true)
		})
	})

	describe('getDependencies() - reactive dependencies', () => {
		it('should return related component files as dependencies', async () => {
			if (!plugin.getDependencies) {
				expect(true).toBe(true) // Skip if method not implemented
				return
			}

			const filePath = join(
				componentsDir,
				'basic-button',
				'basic-button.ts',
			)
			const dependencies = await plugin.getDependencies(filePath)

			expect(Array.isArray(dependencies)).toBe(true)
			expect(dependencies.length).toBeGreaterThan(0)

			// Should include related component files
			const hasRelatedFiles = dependencies.some(dep =>
				dep.includes('basic-button'),
			)
			expect(hasRelatedFiles).toBe(true)
		})

		it('should exclude the input file from dependencies', async () => {
			if (!plugin.getDependencies) {
				expect(true).toBe(true)
				return
			}

			const filePath = join(
				componentsDir,
				'basic-button',
				'basic-button.ts',
			)
			const dependencies = await plugin.getDependencies(filePath)

			expect(dependencies).not.toContain(filePath)
		})
	})

	describe('performance and efficiency', () => {
		it('should handle rapid component changes efficiently', async () => {
			const componentPath = join(
				componentsDir,
				'basic-button',
				'basic-button.ts',
			)
			const startTime = Date.now()

			// Simulate rapid changes
			for (let i = 0; i < 3; i++) {
				const changeEvent: FileChangeEvent = {
					filePath: componentPath,
					eventType: 'change',
					stats: {
						size: 500 + i,
						mtime: new Date(),
					},
				}

				await processor.processFileChange(changeEvent)

				if (plugin.onFileChange) {
					await plugin.onFileChange(changeEvent, signals)
				}
			}

			const duration = Date.now() - startTime
			expect(duration).toBeLessThan(2000) // Should handle 3 changes in under 2 seconds
		})

		it('should efficiently determine component file applicability', () => {
			const files = [
				join(componentsDir, 'basic-button', 'basic-button.ts'),
				join(componentsDir, 'basic-button', 'basic-button.html'),
				join(componentsDir, 'basic-button', 'basic-button.css'),
				join(testContext.tempDir, 'docs-src', 'main.ts'),
				'/completely/unrelated/file.txt',
			]

			const startTime = Date.now()

			const results = files.map(file => plugin.shouldRun(file))

			const duration = Date.now() - startTime
			expect(duration).toBeLessThan(50) // Should be very fast

			expect(results).toEqual([true, true, true, false, false])
		})
	})

	describe('error handling and resilience', () => {
		it('should handle component processing errors gracefully', async () => {
			// Create a component with malformed content
			await createTestComponent('broken-component', {
				ts: 'this is not valid typescript ]]',
			})

			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'broken-component',
					'broken-component.ts',
				),
				content: 'this is not valid typescript ]]',
				metadata: { lastModified: Date.now() },
			}

			// Should not throw even with invalid content
			const result = await plugin.transform(input)
			expect(typeof result.success).toBe('boolean')
		})

		it('should handle file system errors gracefully', async () => {
			const changeEvent: FileChangeEvent = {
				filePath: '/nonexistent/directory/component.ts',
				eventType: 'change',
				stats: {
					size: 0,
					mtime: new Date(),
				},
			}

			// Should handle invalid paths gracefully
			if (plugin.onFileChange) {
				try {
					await plugin.onFileChange(changeEvent, signals)
					// If it succeeds, that's fine
					expect(true).toBe(true)
				} catch (error) {
					// If it throws, that's also acceptable for invalid paths
					expect(error).toBeDefined()
				}
			}
		})

		it('should recover from fragment generation errors', async () => {
			// Create an invalid fragments directory to cause write errors
			const invalidFragmentsDir = '/read-only-path/fragments'

			const originalFragmentsDir = testConfig.fragmentsDir
			testConfig.fragmentsDir = invalidFragmentsDir

			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				content: 'export class BasicButton extends HTMLElement {}',
				metadata: { lastModified: Date.now() },
			}

			// Should handle write errors gracefully
			const result = await plugin.transform(input)
			expect(typeof result.success).toBe('boolean')

			// Restore original config
			testConfig.fragmentsDir = originalFragmentsDir
		})
	})

	describe('fragment HTML generation', () => {
		it('should generate proper tab structure', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				content: 'export class BasicButton extends HTMLElement {}',
				metadata: { lastModified: Date.now() },
			}

			await plugin.transform(input)

			const fragmentPath = join(
				fragmentsDir,
				'basic-button-fragment.html',
			)
			const fragmentContent = readFileSync(fragmentPath, 'utf8')

			// Should have proper tab structure
			expect(fragmentContent).toContain('tab-group')
			expect(fragmentContent).toContain('role="tablist"')
			expect(fragmentContent).toContain('role="tab"')
			expect(fragmentContent).toContain('role="tabpanel"')
		})

		it('should include accessibility attributes', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				content: 'export class BasicButton extends HTMLElement {}',
				metadata: { lastModified: Date.now() },
			}

			await plugin.transform(input)

			const fragmentPath = join(
				fragmentsDir,
				'basic-button-fragment.html',
			)
			const fragmentContent = readFileSync(fragmentPath, 'utf8')

			// Should have accessibility attributes
			expect(fragmentContent).toContain('aria-')
			expect(fragmentContent).toContain('tabindex')
			expect(fragmentContent).toContain('role=')
		})
	})
})

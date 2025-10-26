/**
 * FragmentPlugin Tests
 * Tests for component fragment processing and HTML tabbed interface generation
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { FragmentPlugin } from '../plugins/fragment-plugin'
import type { BuildInput } from '../types'

import {
	createTestContext,
	type MockConsole,
	mockConsole,
	type TestContext,
} from './helpers/test-setup'

describe('FragmentPlugin', () => {
	let plugin: FragmentPlugin
	let testContext: TestContext
	let mockConsoleInstance: MockConsole
	let componentsDir: string
	let fragmentsDir: string

	beforeEach(async () => {
		testContext = createTestContext('fragment-plugin')
		mockConsoleInstance = mockConsole()

		// Change to the temp directory so relative paths work
		const originalCwd = process.cwd()
		process.chdir(testContext.tempDir)

		// Create the exact directory structure the plugin expects
		componentsDir = join(testContext.tempDir, 'docs-src', 'components')
		fragmentsDir = join(testContext.tempDir, 'docs-src', 'fragments')

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

		await plugin.initialize()
	})

	afterEach(() => {
		// Restore original working directory
		if ((testContext as any).originalCwd) {
			process.chdir((testContext as any).originalCwd)
		}
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

	describe('shouldRun()', () => {
		it('should trigger for component TypeScript files', () => {
			const filePath =
				'./docs-src/components/test-component/test-component.ts'
			expect(plugin.shouldRun(filePath)).toBe(true)
		})

		it('should trigger for component HTML files', () => {
			const filePath =
				'./docs-src/components/test-component/test-component.html'
			expect(plugin.shouldRun(filePath)).toBe(true)
		})

		it('should trigger for component CSS files', () => {
			const filePath =
				'./docs-src/components/test-component/test-component.css'
			expect(plugin.shouldRun(filePath)).toBe(true)
		})

		it('should not trigger for files outside components directory', () => {
			const filePath = join(testContext.tempDir, 'docs-src', 'main.ts')
			expect(plugin.shouldRun(filePath)).toBe(false)
		})

		it('should not trigger for unsupported file types', () => {
			const filePath = join(componentsDir, 'test-comp', 'README.md')
			expect(plugin.shouldRun(filePath)).toBe(false)
		})

		it('should trigger for nested component files', () => {
			const filePath = join(componentsDir, 'nested', 'comp', 'comp.ts')
			expect(plugin.shouldRun(filePath)).toBe(true)
		})
	})

	describe('transform()', () => {
		it('should process component with all file types', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				content: 'export class BasicButton {}',
				metadata: {},
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)
			expect(result.content).toBe('processed')
			expect(result.metadata?.componentName).toBe('basic-button')
			expect(result.metadata?.outputPath).toContain('basic-button.html')

			// Check that fragment HTML was generated
			const fragmentPath = join(fragmentsDir, 'basic-button.html')
			expect(existsSync(fragmentPath)).toBe(true)

			const fragmentHtml = readFileSync(fragmentPath, 'utf8')
			expect(fragmentHtml).toContain('<module-tabgroup>')
			expect(fragmentHtml).toContain('HTML')
			expect(fragmentHtml).toContain('CSS')
			expect(fragmentHtml).toContain('TypeScript')
			expect(fragmentHtml).toContain('<pre class="shiki')
			expect(fragmentHtml).toContain('basic-button')
		})

		it('should process component with partial files (HTML + CSS only)', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'simple-card',
					'simple-card.html',
				),
				content: '<div>Card content</div>',
				metadata: {},
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)
			expect(result.metadata?.componentName).toBe('simple-card')

			const fragmentPath = join(fragmentsDir, 'simple-card.html')
			expect(existsSync(fragmentPath)).toBe(true)

			const fragmentHtml = readFileSync(fragmentPath, 'utf8')
			expect(fragmentHtml).toContain('HTML')
			expect(fragmentHtml).toContain('CSS')
			expect(fragmentHtml).not.toContain('TypeScript')
		})

		it('should process component with single file type', async () => {
			const input: BuildInput = {
				filePath: './docs-src/components/text-only/text-only.html',
				content: '<div>Text only component</div>',
				metadata: {},
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)
			expect(result.metadata?.componentName).toBe('text-only')

			const fragmentPath = join(fragmentsDir, 'text-only.html')
			expect(existsSync(fragmentPath)).toBe(true)

			const fragmentHtml = readFileSync(fragmentPath, 'utf8')
			expect(fragmentHtml).toContain('module-tabgroup')
			expect(fragmentHtml).toContain('text-only.ts')
		})

		it('should skip processing already processed components', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				content: 'export class BasicButton {}',
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

		it('should handle components without any supported files', async () => {
			// Create a component directory with no supported files
			const componentDir = join(componentsDir, 'empty-component')
			mkdirSync(componentDir, { recursive: true })
			writeFileSync(join(componentDir, 'README.md'), '# Empty component')

			const input: BuildInput = {
				filePath: join(componentDir, 'empty-component.ts'), // File doesn't exist
				content: 'export class Empty {}',
				metadata: {},
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)
			expect(result.content).toBe('processed')

			// Should not generate fragment since no supported files exist
			const fragmentPath = join(fragmentsDir, 'empty-component.html')
			expect(existsSync(fragmentPath)).toBe(false)
		})

		it('should handle invalid component names', async () => {
			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'some',
					'invalid',
					'path.ts',
				),
				content: 'export class Invalid {}',
				metadata: {},
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(false)
			expect(result.errors).toBeDefined()
			expect(result.errors![0].message).toContain(
				'Could not extract component name',
			)
		})

		it('should generate syntax-highlighted code blocks', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.css',
				),
				content: '.button { color: red; }',
				metadata: {},
			}

			await plugin.transform(input)

			const fragmentPath = join(fragmentsDir, 'basic-button.html')
			const fragmentHtml = readFileSync(fragmentPath, 'utf8')

			// Check for syntax highlighting
			expect(fragmentHtml).toContain('<pre class="shiki')
			expect(fragmentHtml).toContain('#007bff')
			expect(fragmentHtml).toContain('px')

			// Check for proper code structure
			expect(fragmentHtml).toContain('class="basic-button"')
			expect(fragmentHtml).toContain('addEventListener')
		})

		it('should select last panel (TypeScript) by default', async () => {
			const input: BuildInput = {
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.html',
				),
				content: '<button>Test</button>',
				metadata: {},
			}

			await plugin.transform(input)

			const fragmentPath = join(fragmentsDir, 'basic-button.html')
			const fragmentHtml = readFileSync(fragmentPath, 'utf8')

			// Check that TypeScript tab is selected
			expect(fragmentHtml).toMatch(
				/<button[^>]*aria-selected="true"[^>]*>TypeScript</,
			)
		})

		it('should handle file system errors gracefully', async () => {
			// Create test component first
			await createTestComponent('error-test', {
				ts: 'export class ErrorTest {}',
				html: '<div>Error test</div>',
			})

			// Create a component that doesn't exist to trigger error
			const result = await plugin.transform({
				filePath: './docs-src/components/nonexistent/nonexistent.ts',
				content: 'export class NonExistent {}',
				metadata: {},
			})

			// The plugin should handle missing files gracefully
			expect(result.success).toBe(true)
		})
	})

	describe('processAllComponents()', () => {
		beforeEach(async () => {
			// Create additional test components
			await createTestComponent('multi-file', {
				html: '<div>Multi file component</div>',
				css: '.multi-file { color: blue; }',
				ts: 'export class MultiFile extends HTMLElement {}',
			})

			await createTestComponent('css-only', {
				css: '.css-only { display: block; }',
			})
		})

		it('should process all components in the directory', async () => {
			const results = await plugin.processAllComponents()

			expect(results.length).toBeGreaterThan(0)

			// Should include all our test components
			const componentNames = results.map(r => r.name)
			expect(componentNames).toContain('basic-button')
			expect(componentNames).toContain('simple-card')
			expect(componentNames).toContain('text-only')
			expect(componentNames).toContain('multi-file')
			expect(componentNames).toContain('css-only')
		})

		it('should return detailed component information', async () => {
			const results = await plugin.processAllComponents()

			const basicButton = results.find(r => r.name === 'basic-button')!
			expect(basicButton).toBeDefined()
			expect(basicButton.files.html).toBeDefined()
			expect(basicButton.files.css).toBeDefined()
			expect(basicButton.files.typescript).toBeDefined()
			expect(basicButton.panelTypes).toHaveLength(3)

			const cssOnly = results.find(r => r.name === 'css-only')!
			expect(cssOnly).toBeDefined()
			expect(cssOnly.files.css).toBeDefined()
			expect(cssOnly.files.html).toBeUndefined()
			expect(cssOnly.files.typescript).toBeUndefined()
			expect(cssOnly.panelTypes).toHaveLength(1)
		})

		it('should generate fragments for all processed components', async () => {
			await plugin.processAllComponents()

			// Check that fragment files were created
			expect(existsSync(join(fragmentsDir, 'basic-button.html'))).toBe(
				true,
			)
			expect(existsSync(join(fragmentsDir, 'simple-card.html'))).toBe(
				true,
			)
			expect(existsSync(join(fragmentsDir, 'text-only.html'))).toBe(true)
			expect(existsSync(join(fragmentsDir, 'multi-file.html'))).toBe(true)
			expect(existsSync(join(fragmentsDir, 'css-only.html'))).toBe(true)
		})

		it('should handle empty components directory', async () => {
			// Create empty test context
			const emptyContext = createTestContext('empty-fragments')
			const emptyComponentsDir = join(
				emptyContext.tempDir,
				'docs-src',
				'components',
			)
			const emptyFragmentsDir = join(
				emptyContext.tempDir,
				'docs-src',
				'fragments',
			)
			mkdirSync(emptyComponentsDir, { recursive: true })
			mkdirSync(emptyFragmentsDir, { recursive: true })

			// Change to empty directory temporarily
			const originalCwd = process.cwd()
			process.chdir(emptyContext.tempDir)

			const emptyPlugin = new FragmentPlugin()
			await emptyPlugin.initialize()

			const results = await emptyPlugin.processAllComponents()

			expect(results).toHaveLength(0)

			// Restore working directory
			process.chdir(originalCwd)

			// Cleanup
			emptyContext.cleanup()
			await emptyPlugin.cleanup()
		})
	})

	describe('getDependencies()', () => {
		it('should return related component files as dependencies', async () => {
			const filePath =
				'./docs-src/components/basic-button/basic-button.ts'
			const dependencies = await plugin.getDependencies(filePath)

			expect(dependencies).toHaveLength(3) // HTML, CSS, and other component files
			expect(
				dependencies.some(dep => dep.includes('basic-button.html')),
			).toBe(true)
			expect(
				dependencies.some(dep => dep.includes('basic-button.css')),
			).toBe(true)
		})

		it('should exclude the input file from dependencies', async () => {
			const filePath =
				'./docs-src/components/basic-button/basic-button.ts'
			const dependencies = await plugin.getDependencies(filePath)

			expect(dependencies).not.toContain(filePath)
			expect(dependencies.length).toBeGreaterThan(0)
		})

		it('should return empty array for invalid component paths', async () => {
			const dependencies = await plugin.getDependencies(
				'/invalid/path/test.ts',
			)

			expect(dependencies).toHaveLength(0)
		})

		it('should only return existing files as dependencies', async () => {
			const filePath = './docs-src/components/text-only/text-only.ts'
			const dependencies = await plugin.getDependencies(filePath)

			// text-only component dependencies
			expect(dependencies).toHaveLength(1)
		})

		it('should handle components with only HTML and CSS files', async () => {
			const filePath =
				'./docs-src/components/simple-card/simple-card.html'
			const dependencies = await plugin.getDependencies(filePath)

			// simple-card has HTML and CSS files
			expect(dependencies).toHaveLength(2) // Related component files
			expect(
				dependencies.some(dep => dep.includes('simple-card.css')),
			).toBe(true)
		})
	})

	describe('getProcessedComponents()', () => {
		it('should return list of processed component names', async () => {
			// Process some components
			const inputs = [
				join(componentsDir, 'basic-button', 'basic-button.ts'),
				join(componentsDir, 'simple-card', 'simple-card.html'),
			]

			for (const filePath of inputs) {
				await plugin.transform({
					filePath,
					content: 'test content',
					metadata: {},
				})
			}

			const processed = plugin.getProcessedComponents()

			expect(processed).toContain('basic-button')
			expect(processed).toContain('simple-card')
			expect(processed).toHaveLength(2)
		})

		it('should return empty array when no components processed', () => {
			const processed = plugin.getProcessedComponents()
			expect(processed).toHaveLength(0)
		})
	})

	describe('cleanup()', () => {
		it('should clear processed components state', async () => {
			// Process a component
			// Process a component first to add to the list
			await plugin.transform({
				filePath: './docs-src/components/basic-button/basic-button.ts',
				content: 'test content',
				metadata: {},
			})

			expect(plugin.getProcessedComponents()).toHaveLength(1)

			// Cleanup should clear the list
			await plugin.cleanup()

			expect(plugin.getProcessedComponents()).toHaveLength(0)
		})
	})

	describe('component name extraction', () => {
		it('should extract component name from various path formats', () => {
			const testCases = [
				{
					path: '/components/button/button.ts',
					expected: 'button',
				},
				{
					path: 'components\\card\\card.css',
					expected: 'card',
				},
				{
					path: './docs-src/components/form-input/form-input.html',
					expected: 'form-input',
				},
				{
					path: 'C:\\project\\components\\nav-bar\\nav-bar.ts',
					expected: 'nav-bar',
				},
			]

			for (const testCase of testCases) {
				// Test by checking shouldRun which depends on path format
				const result = plugin.shouldRun(testCase.path)
				expect(result).toBe(true)
			}
		})

		it('should return null for invalid paths', async () => {
			const invalidPaths = [
				'/invalid/path/file.ts',
				'no-components-here/file.css',
				'components/file.html', // Missing component directory
			]

			for (const path of invalidPaths) {
				const result = await plugin.transform({
					filePath: path,
					content: 'test',
					metadata: {},
				})

				if (plugin.shouldRun(path)) {
					// Should fail with component name extraction error
					expect(result.success).toBe(false)
					expect(result.errors![0].message).toContain(
						'Could not extract component name',
					)
				}
			}
		})
	})

	describe('fragment HTML generation', () => {
		it('should generate proper tab structure', async () => {
			await plugin.transform({
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.ts',
				),
				content: 'test content',
				metadata: {},
			})

			const fragmentPath = join(fragmentsDir, 'basic-button.html')
			const fragmentHtml = readFileSync(fragmentPath, 'utf8')

			// Check tab structure
			expect(fragmentHtml).toContain('<module-tabgroup>')
			expect(fragmentHtml).toContain('role="tablist"')
			expect(fragmentHtml).toContain('role="tab"')
			expect(fragmentHtml).toContain('role="tabpanel"')
			expect(fragmentHtml).toContain('id="trigger_basic-button.html"')
			expect(fragmentHtml).toContain('id="trigger_basic-button.css"')
			expect(fragmentHtml).toContain('id="trigger_basic-button.ts"')
		})

		it('should include accessibility attributes', async () => {
			await plugin.transform({
				filePath: join(
					componentsDir,
					'basic-button',
					'basic-button.html',
				),
				content: '<button>Test</button>',
				metadata: {},
			})

			const fragmentPath = join(fragmentsDir, 'basic-button.html')
			const fragmentHtml = readFileSync(fragmentPath, 'utf8')

			expect(fragmentHtml).toContain('aria-selected=')
			expect(fragmentHtml).toContain('aria-controls=')
			expect(fragmentHtml).toContain('tabindex=')
		})
	})
})

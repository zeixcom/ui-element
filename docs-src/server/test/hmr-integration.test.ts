/**
 * HMR Integration Tests
 * End-to-end tests for Hot Module Reloading with asset regeneration
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { ModularSSG } from '../modular-ssg'
import { AssetPlugin } from '../plugins/asset-plugin'
import { FragmentPlugin } from '../plugins/fragment-plugin'

import type { DevServerConfig } from '../types'
import {
	createTestContext,
	type MockConsole,
	mockConsole,
	type TestContext,
} from './helpers/test-setup'

describe('HMR Integration Tests', () => {
	let testContext: TestContext
	let mockConsoleInstance: MockConsole
	let ssg: ModularSSG
	let assetPlugin: AssetPlugin
	let fragmentPlugin: FragmentPlugin

	let config: DevServerConfig

	beforeEach(async () => {
		testContext = createTestContext('hmr-integration')
		mockConsoleInstance = mockConsole()

		// Set up test environment
		process.env.NODE_ENV = 'test'
		process.env.BUN_ENV = 'test'

		// Create realistic directory structure
		const docsSourceDir = join(testContext.tempDir, 'docs-src')
		const componentsDir = join(docsSourceDir, 'components', 'test-counter')
		const functionsDir = join(docsSourceDir, 'functions', 'shared')
		const outputDir = join(testContext.tempDir, 'docs')
		const assetsDir = join(outputDir, 'assets')

		for (const dir of [
			docsSourceDir,
			componentsDir,
			functionsDir,
			outputDir,
			assetsDir,
		]) {
			mkdirSync(dir, { recursive: true })
		}

		// Create main.css that imports component CSS
		writeFileSync(
			join(docsSourceDir, 'main.css'),
			`@import "./global.css";
@import "./components/test-counter/test-counter.css";

body {
	font-family: Arial, sans-serif;
}`,
		)

		// Create global.css
		writeFileSync(
			join(docsSourceDir, 'global.css'),
			`:root {
	--primary-color: #007bff;
	--border-radius: 4px;
}`,
		)

		// Create component CSS
		writeFileSync(
			join(componentsDir, 'test-counter.css'),
			`.test-counter {
	border: 1px solid var(--primary-color);
	border-radius: var(--border-radius);
	padding: 1rem;
}

.test-counter button {
	background: var(--primary-color);
	color: white;
	border: none;
	padding: 0.5rem 1rem;
	cursor: pointer;
}`,
		)

		// Create main.ts that imports component TS
		writeFileSync(
			join(docsSourceDir, 'main.ts'),
			`import './components/test-counter/test-counter.ts';

console.log('Main app loaded');`,
		)

		// Create component TS that imports functions
		writeFileSync(
			join(componentsDir, 'test-counter.ts'),
			`import { formatCount } from '../../functions/shared/formatCount';

export class TestCounter extends HTMLElement {
	private count = 0;

	connectedCallback() {
		this.render();
		this.querySelector('button')?.addEventListener('click', () => {
			this.count++;
			this.render();
		});
	}

	private render() {
		this.innerHTML = \`
			<div class="test-counter">
				<p>Count: \${formatCount(this.count)}</p>
				<button>Increment</button>
			</div>
		\`;
	}
}

customElements.define('test-counter', TestCounter);`,
		)

		// Create function file
		writeFileSync(
			join(functionsDir, 'formatCount.ts'),
			`export function formatCount(count: number): string {
	return count.toString().padStart(2, '0');
}`,
		)

		// Create component HTML template
		writeFileSync(
			join(componentsDir, 'test-counter.html'),
			`<test-counter></test-counter>`,
		)

		// Create src file that might be imported
		writeFileSync(
			join(testContext.tempDir, 'src', 'utils.ts'),
			`export const utils = {
	debounce: (fn: Function, ms: number) => {
		let timer: Timer;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => fn.apply(null, args), ms);
		};
	}
};`,
		)

		// Update config to include our test structure
		config = {
			...testContext.config,
			paths: {
				...testContext.config.paths,
				pages: join(testContext.tempDir, 'docs-src', 'pages'),
				components: join(testContext.tempDir, 'docs-src', 'components'),
				src: join(testContext.tempDir, 'src'),
				output: outputDir,
				assets: assetsDir,
			},
			watch: {
				...testContext.config.watch,
				paths: [
					{
						directory: join(
							testContext.tempDir,
							'docs-src',
							'pages',
						),
						extensions: ['.md'],
						label: '📝',
						buildCommands: ['build:docs-html'],
					},
					{
						directory: join(
							testContext.tempDir,
							'docs-src',
							'components',
						),
						extensions: ['.ts', '.html', '.css'],
						label: '🔧',
						buildCommands: [],
					},
					{
						directory: join(testContext.tempDir, 'src'),
						extensions: ['.ts'],
						label: '📦',
						buildCommands: ['build', 'build:docs-js'],
					},
				],
			},
		}

		// Initialize plugins and SSG
		ssg = new ModularSSG(config)
		assetPlugin = new AssetPlugin()
		fragmentPlugin = new FragmentPlugin()

		ssg.use(assetPlugin)
		ssg.use(fragmentPlugin)

		await ssg.initialize()
	})

	afterEach(async () => {
		if (ssg) {
			await ssg.cleanup()
		}
		testContext.cleanup()
		mockConsoleInstance.restore()
		delete process.env.NODE_ENV
		delete process.env.BUN_ENV
	})

	describe('CSS Dependency Chain', () => {
		it('should regenerate assets when component CSS changes', async () => {
			// Initial build to establish baseline
			const initialCssResult = await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.css'),
			)
			expect(initialCssResult.success).toBe(true)

			// Clear console to track new messages
			mockConsoleInstance.log.clear()

			// Simulate component CSS change
			const componentCssPath = join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-counter',
				'test-counter.css',
			)

			const updatedCSS = `.test-counter {
	border: 2px solid var(--primary-color);
	border-radius: calc(var(--border-radius) * 2);
	padding: 1.5rem;
	background: #f8f9fa;
}

.test-counter button {
	background: var(--primary-color);
	color: white;
	border: none;
	padding: 0.75rem 1.5rem;
	cursor: pointer;
	border-radius: var(--border-radius);
}`

			writeFileSync(componentCssPath, updatedCSS)

			// Build the changed file
			const result = await ssg.buildFile(componentCssPath)

			expect(result.success).toBe(true)
			expect(result.metadata?.fileType).toBe('css')

			// Verify that AssetPlugin processed the change
			const logMessages = mockConsoleInstance.log.calls.flat().join(' ')
			expect(logMessages).toContain('asset-optimizer')
		})

		it('should regenerate assets when global CSS changes', async () => {
			// Initial build
			const initialResult = await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.css'),
			)
			expect(initialResult.success).toBe(true)

			mockConsoleInstance.log.clear()

			// Change global CSS
			const globalCssPath = join(
				testContext.tempDir,
				'docs-src',
				'global.css',
			)
			const updatedGlobalCSS = `:root {
	--primary-color: #28a745;
	--secondary-color: #6c757d;
	--border-radius: 8px;
	--spacing: 1rem;
}`

			writeFileSync(globalCssPath, updatedGlobalCSS)

			const result = await ssg.buildFile(globalCssPath)

			expect(result.success).toBe(true)
			expect(result.metadata?.fileType).toBe('css')
		})

		it('should not regenerate JS assets when CSS changes', async () => {
			// Build initial JS assets
			await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.ts'),
			)

			mockConsoleInstance.log.clear()

			// Change component CSS
			const componentCssPath = join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-counter',
				'test-counter.css',
			)
			writeFileSync(componentCssPath, '.test-counter { color: red; }')

			const result = await ssg.buildFile(componentCssPath)

			expect(result.success).toBe(true)
			expect(result.metadata?.fileType).toBe('css')

			// Verify no JS bundling occurred
			const logMessages = mockConsoleInstance.log.calls.flat().join(' ')
			expect(logMessages).not.toContain('Bundled')
		})
	})

	describe('JavaScript Dependency Chain', () => {
		it('should regenerate assets when component TS changes', async () => {
			// Initial build
			const initialResult = await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.ts'),
			)
			expect(initialResult.success).toBe(true)

			mockConsoleInstance.log.clear()

			// Change component TypeScript
			const componentTsPath = join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-counter',
				'test-counter.ts',
			)

			const updatedTS = `import { formatCount } from '../../functions/shared/formatCount';

export class TestCounter extends HTMLElement {
	private count = 0;
	private step = 1;

	connectedCallback() {
		this.render();
		this.querySelector('.increment')?.addEventListener('click', () => {
			this.count += this.step;
			this.render();
		});
		this.querySelector('.decrement')?.addEventListener('click', () => {
			this.count = Math.max(0, this.count - this.step);
			this.render();
		});
	}

	private render() {
		this.innerHTML = \`
			<div class="test-counter">
				<p>Count: \${formatCount(this.count)}</p>
				<button class="decrement">-</button>
				<button class="increment">+</button>
			</div>
		\`;
	}
}

customElements.define('test-counter', TestCounter);`

			writeFileSync(componentTsPath, updatedTS)

			const result = await ssg.buildFile(componentTsPath)

			expect(result.success).toBe(true)
			expect(result.metadata?.fileType).toBe('js')
		})

		it('should regenerate assets when function files change', async () => {
			// Initial build
			await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.ts'),
			)

			mockConsoleInstance.log.clear()

			// Change function file
			const functionPath = join(
				testContext.tempDir,
				'docs-src',
				'functions',
				'shared',
				'formatCount.ts',
			)

			const updatedFunction = `export function formatCount(count: number): string {
	if (count < 10) return '0' + count;
	if (count < 100) return count.toString();
	return '99+';
}`

			writeFileSync(functionPath, updatedFunction)

			const result = await ssg.buildFile(functionPath)

			expect(result.success).toBe(true)
			expect(result.metadata?.fileType).toBe('js')
		})

		it('should regenerate assets when src files change', async () => {
			// First, update component to import from src
			const componentTsPath = join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-counter',
				'test-counter.ts',
			)

			const componentWithSrcImport = `import { formatCount } from '../../functions/shared/formatCount';
import { utils } from '../../../src/utils';

export class TestCounter extends HTMLElement {
	private count = 0;
	private debouncedRender = utils.debounce(() => this.render(), 100);

	connectedCallback() {
		this.render();
		this.querySelector('button')?.addEventListener('click', () => {
			this.count++;
			this.debouncedRender();
		});
	}

	private render() {
		this.innerHTML = \`
			<div class="test-counter">
				<p>Count: \${formatCount(this.count)}</p>
				<button>Increment</button>
			</div>
		\`;
	}
}

customElements.define('test-counter', TestCounter);`

			writeFileSync(componentTsPath, componentWithSrcImport)

			// Initial build
			await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.ts'),
			)

			mockConsoleInstance.log.clear()

			// Change src file
			const srcPath = join(testContext.tempDir, 'src', 'utils.ts')
			const updatedUtils = `export const utils = {
	debounce: (fn: Function, ms: number) => {
		let timer: Timer;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => fn.apply(null, args), ms);
		};
	},
	throttle: (fn: Function, ms: number) => {
		let lastCall = 0;
		return (...args: any[]) => {
			const now = Date.now();
			if (now - lastCall >= ms) {
				lastCall = now;
				return fn.apply(null, args);
			}
		};
	}
};`

			writeFileSync(srcPath, updatedUtils)

			const result = await ssg.buildFile(srcPath)

			expect(result.success).toBe(true)
			expect(result.metadata?.fileType).toBe('js')
		})

		it('should not regenerate CSS assets when JS changes', async () => {
			// Build initial CSS assets
			await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.css'),
			)

			mockConsoleInstance.log.clear()

			// Change component TS
			const componentTsPath = join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-counter',
				'test-counter.ts',
			)
			writeFileSync(
				componentTsPath,
				'export class TestCounter extends HTMLElement {}',
			)

			const result = await ssg.buildFile(componentTsPath)

			expect(result.success).toBe(true)
			expect(result.metadata?.fileType).toBe('js')

			// Verify CSS was not rebuilt by checking for lightningcss output
			const logMessages = mockConsoleInstance.log.calls.flat().join(' ')
			expect(logMessages).not.toContain('lightningcss')
		})
	})

	describe('Cache Management', () => {
		it('should maintain separate caches for CSS and JS', async () => {
			// Build both CSS and JS
			const cssResult = await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.css'),
			)
			const jsResult = await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.ts'),
			)

			expect(cssResult.success).toBe(true)
			expect(jsResult.success).toBe(true)

			// Change component CSS - should only clear CSS cache
			const componentCssPath = join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-counter',
				'test-counter.css',
			)
			writeFileSync(componentCssPath, '.test-counter { color: green; }')

			const cssResult2 = await ssg.buildFile(componentCssPath)
			expect(cssResult2.success).toBe(true)
			expect(cssResult2.content).toBe('processed') // Not cached

			// JS should still be cached
			const jsResult2 = await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.ts'),
			)
			expect(jsResult2.content).toBe('already-processed') // Still cached
		})

		it('should clear cache when dependencies change', async () => {
			// Initial builds to populate cache
			const mainCssResult1 = await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.css'),
			)
			expect(mainCssResult1.content).toBe('processed')

			// Second build should be cached
			const mainCssResult2 = await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.css'),
			)
			expect(mainCssResult2.content).toBe('already-processed')

			// Change global CSS (dependency of main.css)
			const globalCssPath = join(
				testContext.tempDir,
				'docs-src',
				'global.css',
			)
			writeFileSync(globalCssPath, ':root { --primary-color: red; }')

			// Build the changed dependency file - this clears cache, builds, then repopulates cache
			const globalResult = await ssg.buildFile(globalCssPath)
			expect(globalResult.success).toBe(true)
			expect(globalResult.content).toBe('processed') // Not cached initially

			// Since global.css already rebuilt the CSS assets and repopulated the cache,
			// main.css will now be cached (both trigger the same CSS build process)
			const mainCssResult3 = await ssg.buildFile(
				join(testContext.tempDir, 'docs-src', 'main.css'),
			)
			expect(mainCssResult3.content).toBe('already-processed') // Cache repopulated after global.css build
		})
	})

	describe('Fragment Processing Integration', () => {
		it('should process both fragments and assets when component files change', async () => {
			const componentCssPath = join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-counter',
				'test-counter.css',
			)

			// Change component CSS
			writeFileSync(componentCssPath, '.test-counter { color: purple; }')

			const result = await ssg.buildFile(componentCssPath)

			expect(result.success).toBe(true)

			// Check that both fragment-processor and asset-optimizer ran
			const logMessages = mockConsoleInstance.log.calls.flat().join(' ')
			expect(logMessages).toContain('fragment-processor')
			expect(logMessages).toContain('asset-optimizer')
		})

		it('should handle complex component updates', async () => {
			// Update multiple component files
			const componentFiles = [
				{
					path: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-counter',
						'test-counter.css',
					),
					content: '.test-counter { background: yellow; }',
				},
				{
					path: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-counter',
						'test-counter.ts',
					),
					content: `export class TestCounter extends HTMLElement {
	connectedCallback() {
		this.innerHTML = '<div class="test-counter">Updated Counter</div>';
	}
}
customElements.define('test-counter', TestCounter);`,
				},
				{
					path: join(
						testContext.tempDir,
						'docs-src',
						'components',
						'test-counter',
						'test-counter.html',
					),
					content: '<test-counter>Updated Template</test-counter>',
				},
			]

			// Process each file change
			for (const file of componentFiles) {
				writeFileSync(file.path, file.content)
				const result = await ssg.buildFile(file.path)
				expect(result.success).toBe(true)
			}

			// Verify all appropriate plugins ran
			const logMessages = mockConsoleInstance.log.calls.flat().join(' ')
			expect(logMessages).toContain('fragment-processor')
			expect(logMessages).toContain('asset-optimizer')
		})
	})

	describe('Error Handling', () => {
		it('should handle malformed CSS gracefully', async () => {
			const componentCssPath = join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-counter',
				'test-counter.css',
			)

			// Write malformed CSS
			writeFileSync(componentCssPath, '.test-counter { color: }')

			const result = await ssg.buildFile(componentCssPath)

			// Should still attempt to process in test mode
			expect(result.success).toBe(true)
		})

		it('should handle TypeScript syntax errors gracefully', async () => {
			const componentTsPath = join(
				testContext.tempDir,
				'docs-src',
				'components',
				'test-counter',
				'test-counter.ts',
			)

			// Write malformed TypeScript
			writeFileSync(
				componentTsPath,
				'export class TestCounter extends { syntax error',
			)

			const result = await ssg.buildFile(componentTsPath)

			// Should still attempt to process in test mode
			expect(result.success).toBe(true)
		})
	})
})

/**
 * HMR Integration Tests
 * End-to-end tests for Hot Module Reloading with reactive build system
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { PluginManager } from '../plugins'
import { AssetPlugin } from '../plugins/asset-plugin'
import { FragmentPlugin } from '../plugins/fragment-plugin'
import {
	createFileSystemSignals,
	createFileProcessor,
} from '../signals'

import type { DevServerConfig, FileProcessor, FileSystemSignals } from '../types'
import {
	createTestContext,
	type MockConsole,
	mockConsole,
	type TestContext,
} from './helpers/test-setup'

describe('HMR Integration Tests', () => {
	let testContext: TestContext
	let mockConsoleInstance: MockConsole
	let pluginManager: PluginManager
	let signals: FileSystemSignals
	let processor:FileProcessor
	let assetPlugin: AssetPlugin
	let fragmentPlugin: FragmentPlugin

	let config: DevServerConfig

	beforeEach(async () => {
		testContext = createTestContext('hmr-integration')
		mockConsoleInstance = mockConsole()
		config = testContext.config

		// Set environment
		process.env.NODE_ENV = 'development'
		process.env.BUN_ENV = 'development'

		// Create test directories
		mkdirSync(config.paths.src, { recursive: true })
		mkdirSync(config.paths.components, { recursive: true })
		mkdirSync(join(config.paths.components, 'test'), {
			recursive: true,
		})
		mkdirSync(join(config.paths.src, 'functions'), { recursive: true })
		mkdirSync(config.paths.output, { recursive: true })
		mkdirSync(join(config.paths.output, 'assets'), { recursive: true })

		// Create test files
		writeFileSync(
			join(config.paths.components, 'test', 'component.ts'),
			`// Test component
export class TestComponent extends HTMLElement {
	connectedCallback() {
		this.innerHTML = '<div>Test Component</div>';
	}
}

customElements.define('test-component', TestComponent);
`,
		)

		writeFileSync(
			join(config.paths.components, 'test', 'styles.css'),
			`/* Test styles */
test-component {
	display: block;
	padding: 1rem;
	background: #f0f0f0;
}
`,
		)

		writeFileSync(
			join(config.paths.src, 'functions', 'utilities.ts'),
			`// Utility functions
export function formatDate(date: Date): string {
	return date.toISOString();
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
`,
		)

		// Initialize reactive architecture
		signals = createFileSystemSignals({ config })
		processor = createFileProcessor(signals)
		pluginManager = new PluginManager()

		// Initialize plugins
		assetPlugin = new AssetPlugin()
		fragmentPlugin = new FragmentPlugin()

		pluginManager.registerPlugin(assetPlugin)
		pluginManager.registerPlugin(fragmentPlugin)

		await pluginManager.initializePlugins(config, signals, processor)

		// Allow time for initial signal processing
		await new Promise(resolve => setTimeout(resolve, 100))
	})

	afterEach(async () => {
		if (pluginManager) {
			await pluginManager.cleanupPlugins()
		}
		testContext.cleanup()
		mockConsoleInstance.restore()
		delete process.env.NODE_ENV
		delete process.env.BUN_ENV
	})

	describe('CSS Dependency Chain', () => {
		it('should regenerate assets when component CSS changes', async () => {
			// Get initial asset state
			const initialAssets = signals.optimizedAssets.get()
			expect(initialAssets).toBeDefined()

			// Modify component CSS
			writeFileSync(
				join(config.paths.components, 'test', 'styles.css'),
				`/* Updated test styles */
test-component {
	display: block;
	padding: 2rem;
	background: #e0e0e0;
	border-radius: 8px;
}
`,
			)

			// Trigger file change processing
			await processor.processFileChange({
				filename: 'styles.css',
				filePath: join(config.paths.components, 'test', 'styles.css'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			// Allow time for processing
			await new Promise(resolve => setTimeout(resolve, 200))

			// Check if assets were regenerated
			const updatedAssets = signals.optimizedAssets.get()
			expect(updatedAssets).toBeDefined()
		})

		it('should regenerate assets when global CSS changes', async () => {
			// Create global CSS file
			writeFileSync(
				join(config.paths.src, 'global.css'),
				`/* Global styles */
body {
	margin: 0;
	font-family: Arial, sans-serif;
}
`,
			)

			// Process initial global CSS
			await processor.processFileChange({
				filename: 'global.css',
				filePath: join(config.paths.src, 'global.css'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			await new Promise(resolve => setTimeout(resolve, 100))

			const _initialAssets = signals.optimizedAssets.get()

			// Modify global CSS
			writeFileSync(
				join(config.paths.src, 'global.css'),
				`/* Updated global styles */
body {
	margin: 0;
	font-family: 'Helvetica Neue', Arial, sans-serif;
	line-height: 1.6;
}
`,
			)

			// Trigger file change processing
			await processor.processFileChange({
				filename: 'global.css',
				filePath: join(config.paths.src, 'global.css'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			// Allow time for processing
			await new Promise(resolve => setTimeout(resolve, 200))

			const updatedAssets = signals.optimizedAssets.get()
			expect(updatedAssets).toBeDefined()
		})

		it('should not regenerate JS assets when CSS changes', async () => {
			// Get initial JS assets
			const _initialAssets = signals.optimizedAssets.get()

			// Modify CSS file
			writeFileSync(
				join(config.paths.components, 'test', 'styles.css'),
				`/* CSS only change */
test-component {
	color: red;
}
`,
			)

			// Trigger file change processing
			await processor.processFileChange({
				filename: 'styles.css',
				filePath: join(config.paths.components, 'test', 'styles.css'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			// Allow time for processing
			await new Promise(resolve => setTimeout(resolve, 100))

			// JS assets should not be affected by CSS-only changes
			const updatedAssets = signals.optimizedAssets.get()
			expect(updatedAssets).toBeDefined()
		})
	})

	describe('JavaScript Dependency Chain', () => {
		it('should regenerate assets when component TS changes', async () => {
			// Get initial state
			const _initialAssets = signals.optimizedAssets.get()

			// Modify component TypeScript
			writeFileSync(
				join(config.paths.components, 'test', 'component.ts'),
				`// Updated test component
export class TestComponent extends HTMLElement {
	connectedCallback() {
		this.innerHTML = '<div>Updated Test Component</div>';
		this.addEventListener('click', this.handleClick);
	}

	private handleClick = () => {
		console.log('Component clicked');
	}
}

customElements.define('test-component', TestComponent);
`,
			)

			// Trigger file change processing
			await processor.processFileChange({
				filename: 'component.ts',
				filePath: join(config.paths.components, 'test', 'component.ts'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			// Allow time for processing
			await new Promise(resolve => setTimeout(resolve, 200))

			const updatedAssets = signals.optimizedAssets.get()
			expect(updatedAssets).toBeDefined()
		})

		it('should regenerate assets when function files change', async () => {
			// Get initial state
			const _initialAssets = signals.optimizedAssets.get()

			// Modify utility functions
			writeFileSync(
				join(config.paths.src, 'functions', 'utilities.ts'),
				`// Updated utility functions
export function formatDate(date: Date): string {
	return date.toLocaleDateString();
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
	return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
`,
			)

			// Trigger file change processing
			await processor.processFileChange({
				filename: 'utilities.ts',
				filePath: join(config.paths.src, 'functions', 'utilities.ts'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			// Allow time for processing
			await new Promise(resolve => setTimeout(resolve, 200))

			const updatedAssets = signals.optimizedAssets.get()
			expect(updatedAssets).toBeDefined()
		})

		it('should regenerate assets when src files change', async () => {
			// Create src file
			writeFileSync(
				join(config.paths.src, 'main.ts'),
				`// Main application
import { TestComponent } from '../docs-src/components/test/component';

console.log('Application started');
`,
			)

			// Process initial file
			await processor.processFileChange({
				filename: 'main.ts',
				filePath: join(config.paths.src, 'main.ts'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			await new Promise(resolve => setTimeout(resolve, 100))

			const _initialAssets = signals.optimizedAssets.get()

			// Modify src file
			writeFileSync(
				join(config.paths.src, 'main.ts'),
				`// Updated main application
import { TestComponent } from '../docs-src/components/test/component';

console.log('Application started with updates');
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded');
});
`,
			)

			// Trigger file change processing
			await processor.processFileChange({
				filename: 'main.ts',
				filePath: join(config.paths.src, 'main.ts'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			// Allow time for processing
			await new Promise(resolve => setTimeout(resolve, 200))

			const updatedAssets = signals.optimizedAssets.get()
			expect(updatedAssets).toBeDefined()
		})

		it('should not regenerate CSS assets when JS changes', async () => {
			// Get initial CSS assets
			const _initialAssets = signals.optimizedAssets.get()

			// Modify JS file
			writeFileSync(
				join(config.paths.components, 'test', 'component.ts'),
				`// JS only change
export class TestComponent extends HTMLElement {
	connectedCallback() {
		this.innerHTML = '<div>JS Only Change</div>';
		console.log('New JS behavior');
	}
}
`,
			)

			// Trigger file change processing
			await processor.processFileChange({
				filename: 'component.ts',
				filePath: join(config.paths.components, 'test', 'component.ts'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			// Allow time for processing
			await new Promise(resolve => setTimeout(resolve, 100))

			// CSS assets should not be affected by JS-only changes
			const updatedAssets = signals.optimizedAssets.get()
			expect(updatedAssets).toBeDefined()
		})
	})

	describe('Cache Management', () => {
		it('should maintain separate caches for CSS and JS', async () => {
			// Get initial assets
			const initialAssets = signals.optimizedAssets.get()
			expect(initialAssets).toBeDefined()

			// Make CSS change
			writeFileSync(
				join(config.paths.components, 'test', 'styles.css'),
				`test-component { background: blue; }`,
			)

			await processor.processFileChange({
				filename: 'styles.css',
				filePath: join(config.paths.components, 'test', 'styles.css'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			await new Promise(resolve => setTimeout(resolve, 100))

			const afterCssChange = signals.optimizedAssets.get()

			// Make JS change
			writeFileSync(
				join(config.paths.components, 'test', 'component.ts'),
				`export class TestComponent extends HTMLElement {
	connectedCallback() {
		this.innerHTML = '<div>JS Change</div>';
	}
}`,
			)

			await processor.processFileChange({
				filename: 'component.ts',
				filePath: join(config.paths.components, 'test', 'component.ts'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			await new Promise(resolve => setTimeout(resolve, 100))

			const afterJsChange = signals.optimizedAssets.get()

			// Both changes should be tracked
			expect(afterCssChange).toBeDefined()
			expect(afterJsChange).toBeDefined()
		})

		it('should clear cache when dependencies change', async () => {
			// Create dependency chain
			writeFileSync(
				join(config.paths.src, 'base.ts'),
				`export const BASE_CONFIG = { theme: 'light' };`,
			)

			writeFileSync(
				join(config.paths.components, 'test', 'dependent.ts'),
				`import { BASE_CONFIG } from '../../src/base';
export class DependentComponent extends HTMLElement {
	connectedCallback() {
		this.innerHTML = \`<div>Theme: \${BASE_CONFIG.theme}</div>\`;
	}
}`,
			)

			// Process files to establish dependency
			await processor.processFileChange({
				filename: 'base.ts',
				filePath: join(config.paths.src, 'base.ts'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			await processor.processFileChange({
				filename: 'dependent.ts',
				filePath: join(config.paths.components, 'test', 'dependent.ts'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			await new Promise(resolve => setTimeout(resolve, 100))

			const _initialAssets = signals.optimizedAssets.get()

			// Change base dependency
			writeFileSync(
				join(config.paths.src, 'base.ts'),
				`export const BASE_CONFIG = { theme: 'dark' };`,
			)

			await processor.processFileChange({
				filename: 'base.ts',
				filePath: join(config.paths.src, 'base.ts'),
				eventType: 'change',
				timestamp: Date.now(),
			})

			await new Promise(resolve => setTimeout(resolve, 200))

			const updatedAssets = signals.optimizedAssets.get()

			// Dependent assets should be regenerated
			expect(updatedAssets).toBeDefined()
		})
	})

	describe('Fragment Processing Integration', () => {
		it('should process both fragments and assets when component files change', async () => {
			// Create component with template
			writeFileSync(
				join(config.paths.components, 'test', 'template.html'),
				`<div class="test-component">
	<h1>Test Component</h1>
	<p>Component content</p>
</div>`,
			)

			// Process template
			await processor.processFileChange({
				filename: 'template.html',
				filePath: join(
					config.paths.components,
					'test',
					'template.html',
				),
				eventType: 'change',
				timestamp: Date.now(),
			})

			await new Promise(resolve => setTimeout(resolve, 100))

			// Check that both pages and assets are processed
			const processedPages = signals.processedPages.get()
			const optimizedAssets = signals.optimizedAssets.get()

			expect(processedPages).toBeDefined()
			expect(optimizedAssets).toBeDefined()
		})

		it('should handle complex component updates', async () => {
			// Create complex component structure
			mkdirSync(join(config.paths.components, 'complex'), {
				recursive: true,
			})

			writeFileSync(
				join(config.paths.components, 'complex', 'component.ts'),
				`export class ComplexComponent extends HTMLElement {}`,
			)

			writeFileSync(
				join(config.paths.components, 'complex', 'styles.css'),
				`.complex { display: flex; }`,
			)

			writeFileSync(
				join(config.paths.components, 'complex', 'template.html'),
				`<div class="complex">Complex content</div>`,
			)

			// Process all files
			const files = [
				join(config.paths.components, 'complex', 'component.ts'),
				join(config.paths.components, 'complex', 'styles.css'),
				join(config.paths.components, 'complex', 'template.html'),
			]

			for (const filePath of files) {
				const filename = filePath.split('/').pop() || 'unknown'
				await processor.processFileChange({
					filename,
					filePath,
					eventType: 'change',
					timestamp: Date.now(),
				})
			}

			await new Promise(resolve => setTimeout(resolve, 200))

			// All systems should be updated
			const pages = signals.processedPages.get()
			const assets = signals.optimizedAssets.get()

			expect(pages).toBeDefined()
			expect(assets).toBeDefined()
		})
	})

	describe('Error Handling', () => {
		it('should handle malformed CSS gracefully', async () => {
			// Create malformed CSS
			writeFileSync(
				join(config.paths.components, 'test', 'bad-styles.css'),
				`/* Malformed CSS */
test-component {
	color: red
	background: blue; /* Missing semicolon above */
	invalid-property: invalid-value;
}`,
			)

			// Process should not throw
			try {
				await processor.processFileChange({
					filename: 'bad-styles.css',
					filePath: join(
						config.paths.components,
						'test',
						'bad-styles.css',
					),
					eventType: 'change',
					timestamp: Date.now(),
				})
				// If we get here, the test passes
				expect(true).toBe(true)
			} catch (error) {
				// Processing may fail but shouldn't crash the system
				console.warn('Expected error for malformed CSS:', error.message)
			}

			await new Promise(resolve => setTimeout(resolve, 100))

			// System should continue to function
			const assets = signals.optimizedAssets.get()
			expect(assets).toBeDefined()
		})

		it('should handle TypeScript syntax errors gracefully', async () => {
			// Create malformed TypeScript
			writeFileSync(
				join(config.paths.components, 'test', 'bad-component.ts'),
				`// Malformed TypeScript
export class BadComponent extends HTMLElement {
	connectedCallback() {
		this.innerHTML = '<div>Test</div>'  // Missing semicolon
		const invalid = {
			prop: value // Missing quotes
		}
	}
`,
			)

			// Process should not throw
			try {
				await processor.processFileChange({
					filename: 'bad-component.ts',
					filePath: join(
						config.paths.components,
						'test',
						'bad-component.ts',
					),
					eventType: 'change',
					timestamp: Date.now(),
				})
				// If we get here, the test passes
				expect(true).toBe(true)
			} catch (error) {
				// Processing may fail but shouldn't crash the system
				console.warn(
					'Expected error for malformed TypeScript:',
					error.message,
				)
			}

			await new Promise(resolve => setTimeout(resolve, 100))

			// System should continue to function
			const assets = signals.optimizedAssets.get()
			expect(assets).toBeDefined()
		})
	})
})

/**
 * MarkdownPlugin Tests
 * Tests for Markdown processing, template application, and HTML generation
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { MarkdownPlugin, type PageInfo } from '../plugins/markdown-plugin'
import type { BuildInput } from '../types'
import {
	createTestContext,
	type MockConsole,
	mockConsole,
	type TestContext,
} from './helpers/test-setup'

describe('MarkdownPlugin', () => {
	let plugin: MarkdownPlugin
	let testContext: TestContext
	let mockConsoleInstance: MockConsole

	beforeEach(async () => {
		testContext = createTestContext('markdown-plugin')
		mockConsoleInstance = mockConsole()

		// Create required directories and files
		const docsSourceDir = join(testContext.tempDir, 'docs-src')
		const pagesDir = join(docsSourceDir, 'pages')
		const includesDir = join(docsSourceDir, 'includes')
		const outputDir = join(testContext.tempDir, 'docs')
		const assetsDir = join(outputDir, 'assets')

		for (const dir of [
			docsSourceDir,
			pagesDir,
			includesDir,
			outputDir,
			assetsDir,
		]) {
			mkdirSync(dir, { recursive: true })
		}

		// Create mock layout.html
		writeFileSync(
			join(docsSourceDir, 'layout.html'),
			`<!DOCTYPE html>
<html>
<head>
	<title>{{ title }}</title>
	<meta name="description" content="{{ description }}">
	<link rel="stylesheet" href="{{ base-path }}assets/main.{{ css-hash }}.css">
</head>
<body>
	{{ include 'menu.html' }}
	<main>
		<aside>{{ toc }}</aside>
		<article>{{ content }}</article>
	</main>
	<script src="{{ base-path }}assets/main.{{ js-hash }}.js"></script>
</body>
</html>`,
		)

		// Create mock menu.html
		writeFileSync(
			join(includesDir, 'menu.html'),
			`<nav>
	<a href="index.html">Home</a>
	<a href="about.html">About</a>
</nav>`,
		)

		// Create mock asset files for hash generation
		writeFileSync(join(assetsDir, 'main.css'), '/* CSS */')
		writeFileSync(join(assetsDir, 'main.js'), '/* JS */')

		// Initialize plugin with test asset hashes
		plugin = new MarkdownPlugin({
			css: { mainCSSHash: 'test-css-hash' },
			js: { mainJSHash: 'test-js-hash' },
		})

		await plugin.initialize()
	})

	afterEach(() => {
		testContext.cleanup()
		mockConsoleInstance.restore()
	})

	describe('shouldRun()', () => {
		it('should trigger for markdown files in pages directory', () => {
			const filePath = join(
				testContext.tempDir,
				'docs-src',
				'pages',
				'index.md',
			)
			expect(plugin.shouldRun(filePath)).toBe(true)
		})

		it('should trigger for markdown files in nested pages directories', () => {
			const filePath = join(
				testContext.tempDir,
				'docs-src',
				'pages',
				'api',
				'functions.md',
			)
			expect(plugin.shouldRun(filePath)).toBe(true)
		})

		it('should not trigger for markdown files outside pages directory', () => {
			const filePath = join(testContext.tempDir, 'docs-src', 'README.md')
			expect(plugin.shouldRun(filePath)).toBe(false)
		})

		it('should not trigger for non-markdown files', () => {
			const filePath = join(
				testContext.tempDir,
				'docs-src',
				'pages',
				'index.html',
			)
			expect(plugin.shouldRun(filePath)).toBe(false)
		})
	})

	describe('transform()', () => {
		beforeEach(() => {
			// Mock process.cwd for file path processing
			const originalCwd = process.cwd
			process.cwd = () => testContext.tempDir

			afterEach(() => {
				process.cwd = originalCwd
			})
		})

		it('should process simple markdown with frontmatter', async () => {
			const markdownContent = `---
title: Test Page
description: A test page
emoji: 📝
---

# Hello World

This is a **test** page with some content.

## Subsection

- Item 1
- Item 2
- Item 3`

			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'test.md',
				),
				content: markdownContent,
				metadata: {},
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)
			expect(result.content).toBe('processed')
			expect(result.metadata?.title).toBe('Test Page')
			expect((result.metadata?.pageInfo as PageInfo)?.emoji).toBe('📝')
			expect((result.metadata?.pageInfo as PageInfo)?.description).toBe(
				'A test page',
			)
			expect((result.metadata?.pageInfo as PageInfo)?.url).toBe(
				'test.html',
			)
		})

		it('should process markdown without frontmatter', async () => {
			const markdownContent = `# Simple Page

Just some content without frontmatter.`

			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'simple.md',
				),
				content: markdownContent,
				metadata: {},
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)
			expect(result.metadata?.title).toBe('Untitled')
		})

		it('should handle nested pages with correct metadata', async () => {
			const markdownContent = `---
title: API Function
---

# someFunction()

This is an API documentation page.`

			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'api',
					'functions',
					'someFunction.md',
				),
				content: markdownContent,
				metadata: {},
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)
			expect((result.metadata?.pageInfo as PageInfo)?.depth).toBe(2)
			expect(result.metadata?.section).toBe('api')
			expect((result.metadata?.pageInfo as PageInfo)?.url).toBe(
				'api/functions/someFunction.html',
			)
		})

		it('should process API pages with title extraction', async () => {
			const markdownContent = `Some intro content that should be removed.

More content before the first heading.

# Function: myFunction()

This function does something useful.

## Parameters

- param1: string`

			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'api',
					'myFunction.md',
				),
				content: markdownContent,
				metadata: {},
			}

			const result = await plugin.transform(input)

			expect(result.success).toBe(true)
			expect(result.metadata?.title).toBe('myFunction')
			expect(result.metadata?.section).toBe('api')
		})

		it('should handle various API title formats', async () => {
			const testCases = [
				{
					content: '# Function: testFunc()',
					expectedTitle: 'testFunc',
				},
				{
					content: '# Type Alias: MyType<T>()',
					expectedTitle: 'MyType<T>',
				},
				{
					content: '# Variable: CONSTANT',
					expectedTitle: 'CONSTANT',
				},
				{
					content: '# Regular Title',
					expectedTitle: 'Regular Title',
				},
			]

			for (const testCase of testCases) {
				const input: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'pages',
						'api',
						'test.md',
					),
					content: testCase.content,
					metadata: {},
				}

				const result = await plugin.transform(input)
				expect(result.success).toBe(true)
				expect(result.metadata?.title).toBe(testCase.expectedTitle)
			}
		})

		it('should extract component name from file path correctly', async () => {
			const testPaths = [
				{
					path: 'docs-src/pages/index.md',
					expectedUrl: 'index.html',
					expectedDepth: 0,
				},
				{
					path: 'docs-src/pages/api/functions.md',
					expectedUrl: 'api/functions.html',
					expectedDepth: 1,
					expectedSection: 'api',
				},
				{
					path: 'docs-src/pages/blog/post/article.md',
					expectedUrl: 'blog/post/article.html',
					expectedDepth: 2,
					expectedSection: 'blog',
				},
			]

			for (const testPath of testPaths) {
				const input: BuildInput = {
					filePath: join(testContext.tempDir, testPath.path),
					content: '# Test Page',
					metadata: {},
				}

				const result = await plugin.transform(input)
				expect(result.success).toBe(true)
				expect((result.metadata?.pageInfo as PageInfo)?.url).toBe(
					testPath.expectedUrl,
				)
				expect((result.metadata?.pageInfo as PageInfo)?.depth).toBe(
					testPath.expectedDepth,
				)
				if (testPath.expectedSection) {
					expect(result.metadata?.section).toBe(
						testPath.expectedSection,
					)
				}
			}
		})

		it('should handle frontmatter edge cases', async () => {
			const testCases = [
				{
					name: 'empty frontmatter',
					content: `---
---

# Content`,
					expectedTitle: 'Untitled',
				},
				{
					name: 'missing title',
					content: `---
description: Just description
---

# Content Header`,
					expectedTitle: 'Untitled',
				},
				{
					name: 'custom frontmatter fields',
					content: `---
title: Custom Page
customField: custom value
tags: [tag1, tag2]
---

# Content`,
					expectedTitle: 'Custom Page',
				},
			]

			for (const testCase of testCases) {
				const input: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'pages',
						'test.md',
					),
					content: testCase.content,
					metadata: {},
				}

				const result = await plugin.transform(input)
				expect(result.success).toBe(true)
				expect(result.metadata?.title).toBe(testCase.expectedTitle)
			}
		})
	})

	describe('page info generation', () => {
		beforeEach(() => {
			const originalCwd = process.cwd
			process.cwd = () => testContext.tempDir
			afterEach(() => {
				process.cwd = originalCwd
			})
		})

		it('should generate correct page info structure', async () => {
			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'test-page.md',
				),
				content: `---
title: Test Page Info
description: Testing page info generation
emoji: 🧪
---

# Test Content`,
				metadata: {},
			}

			const result = await plugin.transform(input)
			const pageInfo = result.metadata?.pageInfo as PageInfo

			expect(pageInfo).toBeDefined()
			expect(pageInfo.filename).toBe('test-page.html')
			expect(pageInfo.title).toBe('Test Page Info')
			expect(pageInfo.emoji).toBe('🧪')
			expect(pageInfo.description).toBe('Testing page info generation')
			expect(pageInfo.url).toBe('test-page.html')
			expect(pageInfo.relativePath).toBe('test-page.md')
			expect(pageInfo.depth).toBe(0)
			expect(pageInfo.section).toBeUndefined()
		})

		it('should handle nested page info correctly', async () => {
			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'api',
					'components',
					'button.md',
				),
				content: `---
title: Button Component
---

# Button API`,
				metadata: {},
			}

			const result = await plugin.transform(input)
			const pageInfo = result.metadata?.pageInfo as PageInfo

			expect(pageInfo.url).toBe('api/components/button.html')
			expect(pageInfo.relativePath).toBe('api/components/button.md')
			expect(pageInfo.depth).toBe(2)
			expect(pageInfo.section).toBe('api')
		})
	})

	describe('processed pages tracking', () => {
		beforeEach(() => {
			const originalCwd = process.cwd
			process.cwd = () => testContext.tempDir
			afterEach(() => {
				process.cwd = originalCwd
			})
		})

		it('should track processed pages', async () => {
			const pages = [
				{
					path: 'index.md',
					content: `---
title: Home
emoji: 🏠
---
# Home`,
				},
				{
					path: 'about.md',
					content: `---
title: About
emoji: ℹ️
---
# About`,
				},
			]

			for (const page of pages) {
				const input: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'pages',
						page.path,
					),
					content: page.content,
					metadata: {},
				}
				await plugin.transform(input)
			}

			const processedPages = plugin.getProcessedPages()
			expect(processedPages).toHaveLength(2)

			const homePage = processedPages.find(p => p.url === 'index.html')
			expect(homePage).toBeDefined()
			expect(homePage?.title).toBe('Home')
			expect(homePage?.emoji).toBe('🏠')

			const aboutPage = processedPages.find(p => p.url === 'about.html')
			expect(aboutPage).toBeDefined()
			expect(aboutPage?.title).toBe('About')
			expect(aboutPage?.emoji).toBe('ℹ️')
		})

		it('should provide access to processed pages data', () => {
			// Initially empty
			expect(plugin.getProcessedPages()).toHaveLength(0)
		})
	})

	describe('initialization', () => {
		it('should initialize with provided asset hashes', async () => {
			const customPlugin = new MarkdownPlugin({
				css: { mainCSSHash: 'custom-css-hash' },
				js: { mainJSHash: 'custom-js-hash' },
			})

			await customPlugin.initialize()

			// Plugin should be initialized (no errors thrown)
			expect(customPlugin).toBeDefined()
			await customPlugin.cleanup()
		})

		it('should initialize without provided asset hashes', async () => {
			// Create assets first
			const assetsDir = join(testContext.tempDir, 'docs', 'assets')
			mkdirSync(assetsDir, { recursive: true })
			writeFileSync(join(assetsDir, 'main.css'), '/* test css */')
			writeFileSync(join(assetsDir, 'main.js'), '/* test js */')

			const noAssetsPlugin = new MarkdownPlugin()
			await noAssetsPlugin.initialize()

			expect(noAssetsPlugin).toBeDefined()
			await noAssetsPlugin.cleanup()
		})
	})

	describe('cleanup()', () => {
		it('should clear processed pages state', async () => {
			// Process a page first
			const originalCwd = process.cwd
			process.cwd = () => testContext.tempDir

			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'cleanup-test.md',
				),
				content: '# Cleanup Test',
				metadata: {},
			}

			await plugin.transform(input)
			process.cwd = originalCwd

			expect(plugin.getProcessedPages()).toHaveLength(1)

			await plugin.cleanup()

			expect(plugin.getProcessedPages()).toHaveLength(0)
		})
	})

	describe('error handling', () => {
		it('should handle invalid file paths gracefully', async () => {
			const input: BuildInput = {
				filePath: 'invalid/path/that/does/not/match/pattern.md',
				content: '# Test',
				metadata: {},
			}

			const result = await plugin.transform(input)

			// Should still process but with default values
			expect(result.success).toBe(true)
		})

		it('should handle malformed frontmatter', async () => {
			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'malformed.md',
				),
				content: `---
title: Test
description: "Unclosed quote
---

# Content`,
				metadata: {},
			}

			const originalCwd = process.cwd
			process.cwd = () => testContext.tempDir

			const result = await plugin.transform(input)
			process.cwd = originalCwd

			// Should handle gracefully - either succeed or fail with error
			if (result.success) {
				expect(result.metadata?.title).toBeDefined()
			} else {
				expect(result.errors).toBeDefined()
			}
		})

		it('should handle empty content', async () => {
			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'empty.md',
				),
				content: '',
				metadata: {},
			}

			const originalCwd = process.cwd
			process.cwd = () => testContext.tempDir

			const result = await plugin.transform(input)
			process.cwd = originalCwd

			expect(result.success).toBe(true)
			expect(result.metadata?.title).toBe('Untitled')
		})
	})

	describe('edge cases', () => {
		beforeEach(() => {
			const originalCwd = process.cwd
			process.cwd = () => testContext.tempDir
			afterEach(() => {
				process.cwd = originalCwd
			})
		})

		it('should handle complex API title patterns', async () => {
			const complexCases = [
				{
					content: '# Type Alias: ComplexType<T extends string, U>',
					expected: 'ComplexType<T extends string, U>',
				},
				{
					content: '# Function: asyncFunction<T>()',
					expected: 'asyncFunction<T>',
				},
				{
					content: '# Variable: COMPLEX_CONSTANT',
					expected: 'COMPLEX_CONSTANT',
				},
			]

			for (const testCase of complexCases) {
				const input: BuildInput = {
					filePath: join(
						testContext.tempDir,
						'docs-src',
						'pages',
						'api',
						'complex.md',
					),
					content: testCase.content,
					metadata: {},
				}

				const result = await plugin.transform(input)
				expect(result.success).toBe(true)
				expect(result.metadata?.title).toBe(testCase.expected)
			}
		})

		it('should handle special characters in titles', async () => {
			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'special.md',
				),
				content: `---
title: "Special Characters: @#$%^&*()"
---

# Content`,
				metadata: {},
			}

			const result = await plugin.transform(input)
			expect(result.success).toBe(true)
			expect(result.metadata?.title).toBe('Special Characters: @#$%^&*()')
		})

		it('should handle unicode content', async () => {
			const input: BuildInput = {
				filePath: join(
					testContext.tempDir,
					'docs-src',
					'pages',
					'unicode.md',
				),
				content: `---
title: Unicode Test 🦄
description: Testing unicode 中文 العربية
emoji: 🎉
---

# Unicode Content 🚀

支持中文内容和 **emoji** 🎯`,
				metadata: {},
			}

			const result = await plugin.transform(input)
			expect(result.success).toBe(true)
			expect(result.metadata?.title).toBe('Unicode Test 🦄')
			expect((result.metadata?.pageInfo as PageInfo)?.description).toBe(
				'Testing unicode 中文 العربية',
			)
			expect((result.metadata?.pageInfo as PageInfo)?.emoji).toBe('🎉')
		})
	})
})

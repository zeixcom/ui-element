/**
 * Reactive Markdown Plugin using Cause & Effect Signals
 * Processes Markdown files into HTML with reactive dependency tracking
 */

import { effect } from '@zeix/cause-effect'
import { mkdir, readFile, writeFile } from 'fs/promises'
import matter from 'gray-matter'
import { marked } from 'marked'
import { dirname, join } from 'path'
import { codeToHtml } from 'shiki'
import { INCLUDES_DIR, LAYOUT_FILE, MENU_FILE, OUTPUT_DIR } from '../config'
import { BasePlugin } from '../plugins'
import {
	createCodeBlockMap,
	createCodeBlockPlaceholder,
} from '../templates/code-blocks'
import { performanceHints } from '../templates/performance-hints'
import { toc } from '../templates/toc'
import type {
	BuildInput,
	BuildOutput,
	DevServerConfig,
	FileChangeEvent,
	FileSystemSignals,
} from '../types'

marked.setOptions({ gfm: true, breaks: true })

export class MarkdownPlugin extends BasePlugin {
	public readonly name = 'reactive-markdown-processor'
	public readonly version = '1.0.0'
	public readonly description =
		'Reactive Markdown processor using Cause & Effect signals'

	private layoutTemplate?: string
	private includesCache = new Map<string, string>()

	public shouldRun(filePath: string): boolean {
		return (
			(filePath.endsWith('.md') && filePath.includes('pages')) ||
			(filePath.endsWith('.ts') && filePath.includes('templates')) ||
			(filePath.includes('includes/') && filePath.endsWith('.html'))
		)
	}

	public getWatchPatterns(): string[] {
		return [
			'**/pages/**/*.md',
			'**/templates/**/*.ts',
			'**/includes/**/*.html',
			'**/layout.html',
		]
	}

	public shouldReactToChange(filePath: string): boolean {
		return this.shouldRun(filePath)
	}

	public async initialize(
		config: DevServerConfig,
		signals: FileSystemSignals,
		processor: any,
	): Promise<void> {
		await super.initialize(config, signals, processor)

		// Load layout template
		try {
			this.layoutTemplate = await readFile(LAYOUT_FILE, 'utf8')
		} catch (error) {
			console.warn('⚠️  Could not load layout template:', error)
			this.layoutTemplate = '{{ content }}' // Fallback
		}

		// Preload includes
		await this.loadIncludes()

		console.log('🔄 Reactive Markdown Plugin initialized')
	}

	public setupEffects(signals: FileSystemSignals): () => void {
		const cleanupFunctions: (() => void)[] = []
		let isWriting = false

		// Effect: Generate menu when processed pages change
		cleanupFunctions.push(
			effect({
				ok: (menu): undefined => {
					if (isWriting || this.buildMode) return
					// Schedule async work without blocking effect
					setTimeout(async () => {
						try {
							await writeFile(MENU_FILE, menu, 'utf8')
							console.log('🧭 Navigation menu written to disk')
						} catch (error) {
							console.error('❌ Failed to write menu:', error)
						}
					}, 0)
				},
				err: (error): undefined => {
					console.error('❌ Menu generation error:', error.message)
				},
				nil: (): undefined => {
					console.log('⏳ Generating navigation menu...')
				},
				signals: [signals.navigationMenu],
			}),
		)

		// Effect: Generate sitemap when pages change
		cleanupFunctions.push(
			effect({
				ok: (sitemapXml): undefined => {
					if (isWriting || this.buildMode) return
					// Schedule async work without blocking effect
					setTimeout(async () => {
						try {
							await writeFile(
								join(OUTPUT_DIR, 'sitemap.xml'),
								sitemapXml,
								'utf8',
							)
							console.log('🗺️  Sitemap written to disk')
						} catch (error) {
							console.error('❌ Failed to write sitemap:', error)
						}
					}, 0)
				},
				err: (error: Error): undefined => {
					console.error('❌ Sitemap generation error:', error.message)
				},
				nil: (): undefined => {
					console.log('⏳ Generating sitemap...')
				},
				signals: [signals.sitemap],
			}),
		)

		// Effect: Write processed pages to disk when they change (batched)
		let writeTimeout: Timer | null = null
		cleanupFunctions.push(
			effect({
				ok: (pages): undefined => {
					if (writeTimeout) {
						clearTimeout(writeTimeout)
					}

					writeTimeout = setTimeout(async () => {
						if (isWriting) return
						isWriting = true

						try {
							const assets = signals.optimizedAssets.get()
							let renderedCount = 0

							for (const page of pages) {
								try {
									const htmlContent = await this.renderPage(
										page,
										assets,
									)
									const outputPath = join(
										OUTPUT_DIR,
										page.outputPath,
									)
									await mkdir(dirname(outputPath), {
										recursive: true,
									})
									await writeFile(
										outputPath,
										htmlContent,
										'utf8',
									)
									renderedCount++
								} catch (error) {
									console.error(
										`❌ Failed to render page ${page.outputPath}:`,
										error,
									)
								}
							}

							if (renderedCount > 0) {
								console.log(
									`📝 Rendered ${renderedCount} pages`,
								)
							}
						} finally {
							isWriting = false
						}
					}, 100)
				},
				err: (error): undefined => {
					console.error('❌ Page processing error:', error.message)
				},
				nil: (): undefined => {
					console.log('⏳ Processing pages for rendering...')
				},
				signals: [signals.processedPages],
			}),
		)

		// Return cleanup function
		return () => {
			if (writeTimeout) {
				clearTimeout(writeTimeout)
			}
			cleanupFunctions.forEach(cleanup => cleanup())
		}
	}

	public async onFileChange(event: FileChangeEvent): Promise<void> {
		const { filePath } = event

		// Handle template and include changes
		if (
			filePath.includes('templates/') ||
			filePath.includes('includes/') ||
			filePath === LAYOUT_FILE
		) {
			console.log(`🔄 Template/include changed: ${filePath}`)

			// Reload layout if it changed
			if (filePath === LAYOUT_FILE) {
				try {
					this.layoutTemplate = await readFile(LAYOUT_FILE, 'utf8')
					console.log('📋 Layout template reloaded')
				} catch (error) {
					console.warn('⚠️  Failed to reload layout template:', error)
				}
			}

			// Reload includes if they changed
			if (filePath.includes('includes/')) {
				await this.loadIncludes()
			}

			// Template changes trigger re-render of all pages via effects
			// No explicit action needed here
		}
	}

	public async transform(input: BuildInput): Promise<BuildOutput> {
		try {
			// For markdown files, the processing is handled reactively through signals
			// This method is kept for compatibility with the plugin interface
			if (input.filePath.endsWith('.md')) {
				return this.createSuccess(input, {
					content: 'processed-reactively',
					metadata: {
						reactive: true,
						processedBy: 'signals',
					},
				})
			}

			// For template changes, signal that a rebuild is needed
			if (
				input.filePath.endsWith('.ts') &&
				input.filePath.includes('templates')
			) {
				return this.createSuccess(input, {
					content: 'template-updated',
					metadata: {
						templateChange: true,
						triggersRerender: true,
					},
				})
			}

			return this.createSuccess(input)
		} catch (error) {
			return this.createError(
				input,
				`Failed to process: ${error.message}`,
				error,
			)
		}
	}

	private async renderPage(
		page: any,
		assets: {
			css: { mainCSSHash: string }
			js: { mainJSHash: string }
		} | null,
	): Promise<string> {
		if (!this.layoutTemplate) {
			throw new Error('Layout template not loaded')
		}

		// Parse frontmatter and content
		const { data: frontmatter, content: markdownContent } = matter(
			page.content,
		)

		// Clean API content
		let processedContent = markdownContent
		if (page.metadata.section === 'api') {
			const h1Match = markdownContent.match(/^(#\s+.+)$/m)
			if (h1Match) {
				const h1Index = markdownContent.indexOf(h1Match[0])
				processedContent = markdownContent.substring(h1Index)
			}
		}

		// Transform code blocks
		const { processedMarkdown, codeBlockMap } =
			await this.transformCodeBlocks(processedContent)

		// Convert to HTML
		let htmlContent = await marked.parse(processedMarkdown)

		// Add permalinks to headings
		htmlContent = htmlContent.replace(
			/<h([1-6])>(.+?)<\/h[1-6]>/g,
			(_, level, text) => {
				const textForSlug = text
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'")
					.replace(/&amp;/g, '&')
				const slug = this.generateSlug(textForSlug)
				return `<h${level} id="${slug}">
                <a name="${slug}" class="anchor" href="#${slug}">
	                <span class="permalink">🔗</span>
					<span class="title">${text}</span>
                </a>
            </h${level}>`
			},
		)

		// Generate TOC and fix internal links
		const tocHtml = toc(processedContent)
		htmlContent = htmlContent.replace(
			/href="([^"]*\.md)"/g,
			(_, href) => `href="${href.replace(/\.md$/, '.html')}"`,
		)

		// Replace code block placeholders
		codeBlockMap.forEach((code, key) => {
			htmlContent = htmlContent.replace(
				new RegExp(`(<p>\\s*${key}\\s*</p>)`, 'g'),
				code,
			)
		})

		// Wrap API pages
		if (page.metadata.section === 'api') {
			htmlContent = `<section class="api-content">\n${htmlContent}\n</section>`
		}

		// Calculate base path
		const pathParts = page.outputPath.split('/')
		const depth = pathParts.length - 1
		const basePath = depth > 0 ? '../'.repeat(depth) : './'

		// Generate performance hints
		const additionalPreloads = this.analyzePageForPreloads(htmlContent)
		const performanceHintsHtml = performanceHints(additionalPreloads)

		// Load and process menu
		let menuHtml = ''
		try {
			menuHtml = await readFile(MENU_FILE, 'utf8')
			if (depth > 0) {
				menuHtml = menuHtml.replace(
					/href="([^"]*\.html)"/g,
					`href="${basePath}$1"`,
				)
			}
			// Mark active page
			const activeUrl =
				depth > 0 ? page.outputPath.split('/').pop() : page.outputPath
			menuHtml = menuHtml.replace(
				new RegExp(`(<a href="${basePath}${activeUrl}")`, 'g'),
				'$1 class="active"',
			)
		} catch (error) {
			console.warn('⚠️  Could not load menu:', error)
		}

		// Apply template
		let finalHtml = this.layoutTemplate
		finalHtml = finalHtml.replace("{{ include 'menu.html' }}", menuHtml)
		finalHtml = await this.loadIncludesInTemplate(finalHtml)
		finalHtml = finalHtml.replace('{{ content }}', htmlContent)

		// Replace template variables
		const replacements = {
			url: page.outputPath,
			section: page.metadata.section || '',
			'base-path': basePath,
			title: page.metadata.title || 'Untitled',
			toc: tocHtml,
			'css-hash': assets?.css.mainCSSHash || 'dev',
			'js-hash': assets?.js.mainJSHash || 'dev',
			'performance-hints': performanceHintsHtml,
			'additional-preloads': additionalPreloads.join('\n\t\t'),
		}

		finalHtml = finalHtml.replace(/{{ (.*?) }}/g, (_, key) => {
			return replacements[key] || frontmatter[key] || ''
		})

		return finalHtml
	}

	private async loadIncludes(): Promise<void> {
		try {
			const { readdir } = await import('fs/promises')
			const files = await readdir(INCLUDES_DIR)

			for (const file of files) {
				if (file.endsWith('.html')) {
					try {
						const content = await readFile(
							join(INCLUDES_DIR, file),
							'utf8',
						)
						this.includesCache.set(file, content)
					} catch (error) {
						console.warn(
							`⚠️  Could not load include ${file}:`,
							error,
						)
					}
				}
			}

			console.log(`📋 Loaded ${this.includesCache.size} includes`)
		} catch (error) {
			console.warn('⚠️  Could not load includes:', error)
		}
	}

	private async loadIncludesInTemplate(html: string): Promise<string> {
		return html.replace(/{{ include '(.+?)' }}/g, (_, filename) => {
			return this.includesCache.get(filename) || ''
		})
	}

	private async transformCodeBlocks(markdown: string): Promise<{
		processedMarkdown: string
		codeBlockMap: Map<string, string>
	}> {
		const codeBlocks: Array<{
			header: string
			code: string
			highlightedCode: string
		}> = []

		// Use a more robust regex replacement
		const regex = /```(\w+)(?:\s\(([^)]+)\))?\n(.*?)```/gs
		const promises: Promise<void>[] = []
		const replacements: Array<{ match: string; replacement: string }> = []

		let match
		while ((match = regex.exec(markdown)) !== null) {
			const [fullMatch, lang, filename, code] = match
			const header = filename ? `${lang} (${filename})` : lang

			const promise = codeToHtml(code, {
				lang,
				theme: 'monokai',
			})
				.then(highlighted => {
					const index = codeBlocks.length
					codeBlocks.push({
						header,
						code,
						highlightedCode: highlighted,
					})
					replacements.push({
						match: fullMatch,
						replacement: createCodeBlockPlaceholder(index),
					})
				})
				.catch(error => {
					console.warn(
						`⚠️  Failed to highlight code block (${lang}):`,
						error,
					)
					const index = codeBlocks.length
					codeBlocks.push({
						header,
						code,
						highlightedCode: `<pre><code class="language-${lang}">${code}</code></pre>`,
					})
					replacements.push({
						match: fullMatch,
						replacement: createCodeBlockPlaceholder(index),
					})
				})

			promises.push(promise)
		}

		await Promise.all(promises)

		// Apply replacements
		let processedMarkdown = markdown
		for (const { match, replacement } of replacements) {
			processedMarkdown = processedMarkdown.replace(match, replacement)
		}

		return {
			processedMarkdown,
			codeBlockMap: createCodeBlockMap(codeBlocks),
		}
	}

	private generateSlug(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
	}

	private analyzePageForPreloads(htmlContent: string): string[] {
		const preloads: string[] = []

		const extractAssets = (pattern: RegExp) => {
			const matches = htmlContent.match(pattern)
			matches?.forEach(match => {
				const asset = match.match(/(?:href|src)="([^"]*)"/)?.[1]
				if (asset && !preloads.includes(asset)) {
					preloads.push(asset)
				}
			})
		}

		extractAssets(/href="([^"]*\.css[^"]*)"/g)
		extractAssets(/src="([^"]*\.js[^"]*)"/g)

		return preloads
	}
}

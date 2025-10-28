import { mkdir, readdir, readFile, writeFile } from 'fs/promises'
import matter from 'gray-matter'
import { marked } from 'marked'
import { dirname, join } from 'path'
import { codeToHtml } from 'shiki'
import {
	ASSETS_DIR,
	BASE_URL,
	INCLUDES_DIR,
	LAYOUT_FILE,
	MENU_FILE,
	OUTPUT_DIR,
} from '../../config'
import { generateAssetHash } from '../../config-manager'
import {
	createCodeBlockMap,
	createCodeBlockPlaceholder,
} from '../../templates/code-blocks'
import { menu } from '../../templates/menu'
import { performanceHints } from '../../templates/performance-hints'
import { sitemap } from '../../templates/sitemap'
import { toc } from '../../templates/toc'
import type { BuildInput, BuildOutput } from '../../types'
import { BaseBuildPlugin } from '../modular-ssg'

marked.setOptions({ gfm: true, breaks: true })

export interface PageInfo {
	filename: string
	title: string
	emoji: string
	description: string
	url: string
	section?: string
	relativePath: string
	depth: number
}

interface MarkdownPluginState {
	processedPages: PageInfo[]
	assetHashes: { css: string; js: string }
	templateDependencies: string[]
}

export class MarkdownPlugin extends BaseBuildPlugin {
	public readonly name = 'markdown-processor'
	public readonly version = '1.0.0'
	public readonly description =
		'Processes Markdown files into HTML with full template support'

	private state: MarkdownPluginState = {
		processedPages: [],
		assetHashes: { css: 'dev', js: 'dev' },
		templateDependencies: [],
	}

	constructor(
		private assetOptimizationResults?: {
			css: { mainCSSHash: string }
			js: { mainJSHash: string }
		},
	) {
		super()
	}

	public shouldRun(filePath: string): boolean {
		return (
			(filePath.endsWith('.md') && filePath.includes('pages')) ||
			(filePath.endsWith('.ts') && filePath.includes('templates'))
		)
	}

	public async initialize(): Promise<void> {
		if (this.assetOptimizationResults) {
			this.state.assetHashes.css =
				this.assetOptimizationResults.css.mainCSSHash
			this.state.assetHashes.js =
				this.assetOptimizationResults.js.mainJSHash
		} else {
			try {
				this.state.assetHashes.css = generateAssetHash(
					join(ASSETS_DIR, 'main.css'),
				)
				this.state.assetHashes.js = generateAssetHash(
					join(ASSETS_DIR, 'main.js'),
				)
			} catch {
				// Use fallback values
			}
		}

		// Discover template dependencies
		await this.discoverTemplateDependencies()
	}

	public async transform(input: BuildInput): Promise<BuildOutput> {
		try {
			// Handle template file changes - rebuild all markdown files
			if (
				input.filePath.endsWith('.ts') &&
				input.filePath.includes('templates')
			) {
				console.log(
					`🔄 Template changed: ${input.filePath}, rebuilding all pages...`,
				)
				await this.rebuildAllPages()

				return this.createSuccess(input, {
					content: 'template-updated',
					dependencies: this.state.templateDependencies,
					metadata: {
						templateChange: true,
						affectedFiles: this.state.processedPages.length,
					},
				})
			}

			// Handle markdown file processing
			const pageInfo = await this.processMarkdownFile(input)
			this.state.processedPages.push(pageInfo)

			return this.createSuccess(input, {
				content: 'processed',
				dependencies: this.state.templateDependencies,
				metadata: {
					pageInfo,
					title: pageInfo.title,
					section: pageInfo.section,
					url: pageInfo.url,
				},
			})
		} catch (error) {
			return this.createError(
				input,
				`Failed to process markdown: ${error.message}`,
			)
		}
	}

	private async processMarkdownFile(input: BuildInput): Promise<PageInfo> {
		const relativePath = input.filePath
			.replace(process.cwd() + '/docs-src/pages/', '')
			.replace(/\\/g, '/')

		const { data: frontmatter, content } = matter(input.content)

		const pathParts = relativePath.split('/')
		const section = pathParts.length > 1 ? pathParts[0] : undefined
		const depth = pathParts.length - 1

		// Clean API content by removing everything above the first H1
		let processedContent = content
		if (section === 'api') {
			const h1Match = content.match(/^(#\s+.+)$/m)
			if (h1Match) {
				const h1Index = content.indexOf(h1Match[0])
				processedContent = content.substring(h1Index)
			}
		}

		// Transform code blocks and convert to HTML
		const { processedMarkdown, codeBlockMap } =
			await this.transformCodeBlocks(processedContent)
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
		if (section === 'api') {
			htmlContent = `<section class="api-content">\n${htmlContent}\n</section>`
		}

		const url = relativePath.replace('.md', '.html')
		const basePath = depth > 0 ? '../'.repeat(depth) : './'

		// Extract title
		let title = frontmatter.title
		if (!title && section === 'api') {
			const headingMatch = processedContent.match(
				/^#\s+(Function|Type Alias|Variable):\s*(.+?)(?:\(\))?$/m,
			)
			if (headingMatch) {
				title = headingMatch[2].trim()
			} else {
				const fallbackMatch = processedContent.match(/^#\s+(.+)$/m)
				if (fallbackMatch) {
					title = fallbackMatch[1].replace(/\(.*?\)$/, '').trim()
				}
			}
		}

		const additionalPreloads = this.analyzePageForPreloads(htmlContent)
		const performanceHintsHtml = performanceHints(additionalPreloads)

		const finalHtml = await this.applyTemplate({
			htmlContent,
			tocHtml,
			url,
			title: title || 'Untitled',
			frontmatter,
			section,
			basePath,
			depth,
			performanceHints: performanceHintsHtml,
			additionalPreloads,
		})

		const outputPath = join(OUTPUT_DIR, url)
		await mkdir(dirname(outputPath), { recursive: true })
		await writeFile(outputPath, finalHtml, 'utf8')

		return {
			filename: url,
			title: title || 'Untitled',
			emoji: frontmatter.emoji || '📄',
			description: frontmatter.description || '',
			url,
			section,
			relativePath,
			depth,
		}
	}

	private async applyTemplate(params: {
		htmlContent: string
		tocHtml: string
		url: string
		title: string
		frontmatter: any
		section?: string
		basePath: string
		depth: number
		performanceHints: string
		additionalPreloads: string[]
	}): Promise<string> {
		const {
			htmlContent,
			tocHtml,
			url,
			title,
			frontmatter,
			section,
			basePath,
			depth,
			performanceHints,
			additionalPreloads,
		} = params

		let layout = await readFile(LAYOUT_FILE, 'utf8')
		let menuHtml = await readFile(MENU_FILE, 'utf8')

		// Fix menu links for depth
		if (depth > 0) {
			menuHtml = menuHtml.replace(
				/href="([^"]*\.html)"/g,
				`href="${basePath}$1"`,
			)
		}

		// Mark active page
		const activeUrl = depth > 0 ? url.split('/').pop() : url
		menuHtml = menuHtml.replace(
			new RegExp(`(<a href="${basePath}${activeUrl}")`, 'g'),
			'$1 class="active"',
		)

		layout = layout.replace("{{ include 'menu.html' }}", menuHtml)
		layout = await this.loadIncludes(layout)
		layout = layout.replace('{{ content }}', htmlContent)

		// Replace template variables
		return layout.replace(/{{ (.*?) }}/g, (_, key) => {
			const replacements = {
				url,
				section: section || '',
				'base-path': basePath,
				title,
				toc: tocHtml,
				'css-hash': this.state.assetHashes.css,
				'js-hash': this.state.assetHashes.js,
				'performance-hints': performanceHints,
				'additional-preloads': additionalPreloads.join('\n\t\t'),
			}
			return replacements[key] || frontmatter[key] || ''
		})
	}

	private async loadIncludes(html: string): Promise<string> {
		return await this.replaceAsync(
			html,
			/{{ include '(.+?)' }}/g,
			async (_, filename) => {
				try {
					return await readFile(join(INCLUDES_DIR, filename), 'utf8')
				} catch {
					return ''
				}
			},
		)
	}

	public async generateMenu(): Promise<void> {
		const menuHtml = menu(this.state.processedPages)
		await writeFile(MENU_FILE, menuHtml, 'utf8')
	}

	public async generateSitemap(): Promise<void> {
		const sitemapXml = sitemap(this.state.processedPages, BASE_URL)
		await writeFile(join(OUTPUT_DIR, 'sitemap.xml'), sitemapXml, 'utf8')
	}

	private generateSlug(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
	}

	private async replaceAsync(
		str: string,
		regex: RegExp,
		replacer: (...args: any[]) => Promise<string>,
	): Promise<string> {
		const promises: Promise<string>[] = []
		str.replace(regex, (match, ...args) => {
			promises.push(replacer(match, ...args))
			return match
		})
		const data = await Promise.all(promises)
		return str.replace(regex, () => data.shift()!)
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

		const processedMarkdown = await this.replaceAsync(
			markdown,
			/```(\w+)(?:\s\(([^)]+)\))?\n(.*?)```/gs,
			async (_, lang, filename, code) => {
				const header = filename ? `${lang} (${filename})` : lang
				const highlighted = await codeToHtml(code, {
					lang,
					theme: 'monokai',
				})

				codeBlocks.push({ header, code, highlightedCode: highlighted })
				return createCodeBlockPlaceholder(codeBlocks.length - 1)
			},
		)

		return {
			processedMarkdown,
			codeBlockMap: createCodeBlockMap(codeBlocks),
		}
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

	public getProcessedPages(): PageInfo[] {
		return [...this.state.processedPages]
	}

	public async cleanup(): Promise<void> {
		this.state.processedPages.length = 0
		this.state.templateDependencies.length = 0
	}

	/**
	 * Discover all template dependencies
	 */
	private async discoverTemplateDependencies(): Promise<void> {
		try {
			const templatesDir = join(
				process.cwd(),
				'docs-src/server/templates',
			)
			const templateFiles = await readdir(templatesDir)

			this.state.templateDependencies = templateFiles
				.filter(file => file.endsWith('.ts'))
				.map(file => join(templatesDir, file))

			console.log(
				`📋 Discovered ${this.state.templateDependencies.length} template dependencies`,
			)
		} catch (error) {
			console.warn('⚠️  Could not discover template dependencies:', error)
			this.state.templateDependencies = []
		}
	}

	/**
	 * Rebuild all processed pages when templates change
	 */
	private async rebuildAllPages(): Promise<void> {
		const pagesToRebuild = [...this.state.processedPages]
		this.state.processedPages.length = 0

		for (const pageInfo of pagesToRebuild) {
			try {
				// Find the original markdown file path
				const markdownPath = join(
					process.cwd(),
					'docs-src/pages',
					pageInfo.relativePath,
				)

				// Read and reprocess the file
				const content = await readFile(markdownPath, 'utf8')
				const input: BuildInput = {
					filePath: markdownPath,
					content,
					metadata: {},
				}

				const rebuiltPageInfo = await this.processMarkdownFile(input)
				this.state.processedPages.push(rebuiltPageInfo)

				console.log(`✅ Rebuilt page: ${pageInfo.url}`)
			} catch (error) {
				console.error(
					`❌ Failed to rebuild page ${pageInfo.url}:`,
					error,
				)
			}
		}

		// Regenerate menu and sitemap with updated pages
		await this.generateMenu()
		await this.generateSitemap()
	}
}

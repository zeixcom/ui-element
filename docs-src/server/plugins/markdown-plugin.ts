import { mkdir, readFile, writeFile } from 'fs/promises'
import matter from 'gray-matter'
import { marked } from 'marked'
import { dirname, join } from 'path'
import {
	ASSETS_DIR,
	generateAssetHash,
	INCLUDES_DIR,
	LAYOUT_FILE,
	MENU_FILE,
	OUTPUT_DIR,
	PAGE_ORDER,
} from '../config.js'
import { generateSlug } from '../generate-slug.js'
import { generateTOC } from '../generate-toc.js'
import { BaseBuildPlugin } from '../modular-ssg.js'
import {
	analyzePageForPreloads,
	generateAllPerformanceHints,
} from '../preload-hints.js'
import { replaceAsync } from '../replace-async.js'
import { transformCodeBlocks } from '../transform-codeblocks.js'
import type { BuildInput, BuildOutput, DevServerConfig } from '../types.js'

// Configure marked for GitHub Flavored Markdown
marked.setOptions({
	gfm: true, // Enables tables, task lists, and strikethroughs
	breaks: true, // Allows line breaks without needing double spaces
})

interface PageInfo {
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
	assetHashes: {
		css: string
		js: string
	}
}

export class MarkdownPlugin extends BaseBuildPlugin {
	public readonly name = 'markdown-processor'
	public readonly version = '1.0.0'
	public readonly description =
		'Processes Markdown files into HTML with full template support'

	private state: MarkdownPluginState = {
		processedPages: [],
		assetHashes: {
			css: 'dev',
			js: 'dev',
		},
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
		return filePath.endsWith('.md') && filePath.includes('pages')
	}

	public async initialize(_config: DevServerConfig): Promise<void> {
		console.log(`🔧 Initializing ${this.name}...`)

		// Initialize asset hashes
		if (this.assetOptimizationResults) {
			this.state.assetHashes.css =
				this.assetOptimizationResults.css.mainCSSHash
			this.state.assetHashes.js =
				this.assetOptimizationResults.js.mainJSHash
		} else {
			// Fallback to basic asset hashing
			try {
				this.state.assetHashes.css = generateAssetHash(
					join(ASSETS_DIR, 'main.css'),
				)
				this.state.assetHashes.js = generateAssetHash(
					join(ASSETS_DIR, 'main.js'),
				)
			} catch {
				console.warn(
					'⚠️ Could not generate asset hashes, using fallback',
				)
			}
		}

		console.log(`✅ ${this.name} initialized`)
	}

	public async transform(input: BuildInput): Promise<BuildOutput> {
		try {
			const pageInfo = await this.processMarkdownFile(input)

			// Store processed page info for menu and sitemap generation
			this.state.processedPages.push(pageInfo)

			return this.createSuccess(input, {
				content: 'processed', // The actual HTML content is written to disk
				metadata: {
					pageInfo,
					title: pageInfo.title,
					section: pageInfo.section,
					url: pageInfo.url,
				},
			})
		} catch (error) {
			console.error(
				`❌ MarkdownPlugin error processing ${input.filePath}:`,
				error,
			)
			return this.createError(
				input,
				`Failed to process markdown: ${error.message}`,
			)
		}
	}

	/**
	 * Process a single markdown file into HTML
	 */
	private async processMarkdownFile(input: BuildInput): Promise<PageInfo> {
		const filePath = input.filePath
		const relativePath = filePath
			.replace(process.cwd() + '/docs-src/pages/', '')
			.replace(/\\/g, '/')

		console.log(`📂 Processing: ${relativePath}`)

		// Parse frontmatter and Markdown content
		const { data: frontmatter, content } = matter(input.content)

		// Determine section and depth early for API processing
		const pathParts = relativePath.split('/')
		const section = pathParts.length > 1 ? pathParts[0] : undefined
		const depth = pathParts.length - 1

		// Clean up API content: remove everything above the first H1 heading
		let processedContent = content
		if (section === 'api') {
			const h1Match = content.match(/^(#\s+.+)$/m)
			if (h1Match) {
				const h1Index = content.indexOf(h1Match[0])
				processedContent = content.substring(h1Index)
				console.log(
					`🧹 Cleaned API content: removed ${h1Index} characters before H1`,
				)
			}
		}

		// Convert Markdown content to HTML and process code blocks
		const { processedMarkdown, codeBlockMap } =
			await transformCodeBlocks(processedContent)

		// Convert Markdown to HTML first
		let htmlContent = await marked.parse(processedMarkdown)

		// Post-process HTML to add permalinks to headings
		htmlContent = htmlContent.replace(
			/<h([1-6])>(.+?)<\/h[1-6]>/g,
			(_match, level, text) => {
				// For slug generation, decode common HTML entities to match TOC slugs
				const textForSlug = text
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'")
					.replace(/&amp;/g, '&')

				const slug = generateSlug(textForSlug)

				return `<h${level} id="${slug}">
                <a name="${slug}" class="anchor" href="#${slug}">
	                <span class="permalink">🔗</span>
					<span class="title">${text}</span>
                </a>
            </h${level}>`
			},
		)

		// Generate TOC from markdown content (before HTML conversion)
		const tocHtml = await generateTOC(processedContent)

		// Fix internal .md links to .html
		htmlContent = htmlContent.replace(
			/href="([^"]*\.md)"/g,
			(_match, href) => `href="${href.replace(/\.md$/, '.html')}"`,
		)

		// Replace placeholders with actual Shiki code blocks
		codeBlockMap.forEach((code, key) => {
			htmlContent = htmlContent.replace(
				new RegExp(`(<p>\\s*${key}\\s*</p>)`, 'g'),
				code,
			)
		})

		// Wrap API pages in a section tag for layout purposes
		if (section === 'api') {
			htmlContent = `<section class="api-content">\n${htmlContent}\n</section>`
		}

		// Generate output URL (preserve directory structure)
		const url = relativePath.replace('.md', '.html')

		// Calculate base href for assets and navigation
		const basePath = depth > 0 ? '../'.repeat(depth) : './'

		// Generate performance hints for this page
		const performanceHints = generateAllPerformanceHints(
			url,
			basePath,
			this.state.assetHashes.js,
		)

		// Analyze page content for additional preloads
		const additionalPreloads = await analyzePageForPreloads(
			htmlContent,
			basePath,
		)

		// Extract title from first heading if no frontmatter title (common for API docs)
		let title = frontmatter.title
		if (!title && section === 'api') {
			const headingMatch = processedContent.match(
				/^#\s+(Function|Type Alias|Variable):\s*(.+?)(?:\(\))?$/m,
			)
			if (headingMatch) {
				title = headingMatch[2].trim() // Extract the actual function/type name
			} else {
				// Fallback to generic heading extraction
				const fallbackMatch = processedContent.match(/^#\s+(.+)$/m)
				if (fallbackMatch) {
					title = fallbackMatch[1].replace(/\(.*?\)$/, '').trim()
				}
			}
		}

		// Apply template and generate final HTML
		const finalHtml = await this.applyTemplate({
			htmlContent,
			tocHtml,
			url,
			title: title || 'Untitled',
			frontmatter,
			section,
			basePath,
			depth,
			performanceHints,
			additionalPreloads,
		})

		// Ensure output directory exists and save output file
		const outputPath = join(OUTPUT_DIR, url)
		await mkdir(dirname(outputPath), { recursive: true })
		await writeFile(outputPath, finalHtml, 'utf8')

		console.log(`✅ Generated: ${url}`)

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

	/**
	 * Apply template layout to processed content
	 */
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

		// Load layout template
		let layout: string
		try {
			layout = await readFile(LAYOUT_FILE, 'utf8')
		} catch (error) {
			throw new Error(`Failed to load layout template: ${error.message}`)
		}

		// Load and process menu
		let menuHtml = await readFile(MENU_FILE, 'utf8')

		// Fix menu links to be relative to current page depth
		if (depth > 0) {
			menuHtml = menuHtml.replace(
				/href="([^"]*\.html)"/g,
				`href="${basePath}$1"`,
			)
		}

		// Mark active page in main menu
		const activeUrl = depth > 0 ? url.split('/').pop() : url
		menuHtml = menuHtml.replace(
			new RegExp(`(<a href="${basePath}${activeUrl}")`, 'g'),
			'$1 class="active"',
		)
		layout = layout.replace("{{ include 'menu.html' }}", menuHtml)

		// 1️⃣ Process remaining includes
		layout = await this.loadIncludes(layout)

		// 2️⃣ Replace {{ content }} SECOND
		layout = layout.replace('{{ content }}', htmlContent)

		// 3️⃣ Replace frontmatter placeholders LAST
		layout = layout.replace(/{{ (.*?) }}/g, (_, key) => {
			if (key === 'url') return url
			if (key === 'section') return section || ''
			if (key === 'base-path') return basePath
			if (key === 'title') return title
			if (key === 'toc') return tocHtml
			if (key === 'css-hash') return this.state.assetHashes.css
			if (key === 'js-hash') return this.state.assetHashes.js
			if (key === 'performance-hints') return performanceHints
			if (key === 'additional-preloads')
				return additionalPreloads.join('\n\t\t')

			return frontmatter[key] || ''
		})

		return layout
	}

	/**
	 * Load HTML includes
	 */
	private async loadIncludes(html: string): Promise<string> {
		return await replaceAsync(
			html,
			/{{ include '(.+?)' }}/g,
			async (_, filename) => {
				const includePath = join(INCLUDES_DIR, filename)
				try {
					return await readFile(includePath, 'utf8')
				} catch {
					console.warn(`⚠️ Warning: Missing include file: ${filename}`)
					return ''
				}
			},
		)
	}

	/**
	 * Generate menu from processed pages
	 */
	public async generateMenu(): Promise<void> {
		// Get only root pages (no section)
		const rootPages = this.state.processedPages.filter(p => !p.section)

		// Sort pages according to the PAGE_ORDER array
		rootPages.sort(
			(a, b) =>
				PAGE_ORDER.indexOf(a.filename.replace('.html', '')) -
				PAGE_ORDER.indexOf(b.filename.replace('.html', '')),
		)

		const menuHtml = `
<section-menu>
	<nav>
		<h2 class="visually-hidden">Main Menu</h2>
		<ol>
			${rootPages
				.map(
					page => `
				<li>
					<a href="${page.url}">
						<span class="icon">${page.emoji}</span>
						<strong>${page.title}</strong>
						<small>${page.description}</small>
					</a>
				</li>`,
				)
				.join('\n')}
		</ol>
	</nav>
</section-menu>`

		await writeFile(MENU_FILE, menuHtml, 'utf8')
		console.log('✅ Generated: menu.html')
	}

	/**
	 * Generate sitemap from all processed pages
	 */
	public async generateSitemap(): Promise<void> {
		const now = new Date().toISOString()
		const baseUrl = 'https://zeixcom.github.io/le-truc'

		const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${this.state.processedPages
		.map(page => {
			// Determine priority based on page type and depth
			let priority = '0.5'
			if (page.url === 'index.html') {
				priority = '1.0'
			} else if (!page.section) {
				// Root pages get higher priority
				priority = '0.8'
			} else if (
				page.section === 'api' &&
				page.relativePath.includes('README.md')
			) {
				// API overview page
				priority = '0.7'
			} else if (page.section === 'blog') {
				// Blog posts
				priority = '0.6'
			}

			return `	<url>
		<loc>${baseUrl}/${page.url}</loc>
		<lastmod>${now}</lastmod>
		<priority>${priority}</priority>
	</url>`
		})
		.join('\n')}
</urlset>`

		const sitemapPath = join(OUTPUT_DIR, 'sitemap.xml')
		await writeFile(sitemapPath, sitemapXml, 'utf8')
		console.log('✅ Generated: sitemap.xml')
	}

	/**
	 * Get processed pages for use by other systems
	 */
	public getProcessedPages(): PageInfo[] {
		return [...this.state.processedPages]
	}

	public async cleanup(): Promise<void> {
		this.state.processedPages.length = 0
		console.log(`🧹 Cleaned up ${this.name}`)
	}
}

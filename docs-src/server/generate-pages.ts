import { mkdir, readdir, readFile, stat, writeFile } from 'fs/promises'
import matter from 'gray-matter'
import { marked } from 'marked'
import { join } from 'path'

import {
	ASSETS_DIR,
	generateAssetHash,
	INCLUDES_DIR,
	LAYOUT_FILE,
	MENU_FILE,
	OUTPUT_DIR,
	PAGES_DIR,
} from './config'
import { buildOptimizedAssets } from './build-optimized-assets'
import {
	generateAllPerformanceHints,
	generateLazyLoadingScript,
	analyzePageForPreloads,
} from './preload-hints'
import { generateMenu } from './generate-menu'
import { generateSitemap } from './generate-sitemap'
import { generateSlug } from './generate-slug'
import { generateTOC } from './generate-toc'
import { replaceAsync } from './replace-async'
import { transformCodeBlocks } from './transform-codeblocks'

marked.setOptions({
	gfm: true, // Enables tables, task lists, and strikethroughs
	breaks: true, // Allows line breaks without needing double spaces
})

type PageInfo = {
	filename: string
	title: string
	emoji: string
	description: string
	url: string
	section?: string
	relativePath: string
	depth: number
}

// Recursively find all .md files in a directory
const findMarkdownFiles = async (
	dir: string,
	basePath: string = '',
): Promise<string[]> => {
	const files: string[] = []
	const entries = await readdir(dir)

	for (const entry of entries) {
		const fullPath = join(dir, entry)
		const relativePath = basePath ? join(basePath, entry) : entry
		const stats = await stat(fullPath)

		if (stats.isDirectory()) {
			// Recursively process subdirectories
			const subFiles = await findMarkdownFiles(fullPath, relativePath)
			files.push(...subFiles)
		} else if (entry.endsWith('.md')) {
			files.push(relativePath)
		}
	}

	return files
}

// Utility to ensure directory exists
const ensureDir = async (filePath: string): Promise<void> => {
	const dir = join(filePath, '..')
	try {
		await mkdir(dir, { recursive: true })
	} catch (error) {
		// Directory might already exist, which is fine
		if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
			throw error
		}
	}
}

// Function to load HTML includes
const loadIncludes = async (html: string): Promise<string> => {
	return await replaceAsync(
		html,
		/{{ include '(.+?)' }}/g,
		async (_, filename) => {
			const includePath = join(INCLUDES_DIR, filename)
			try {
				// console.log(`📄 Loading include: ${filename}`);
				return await readFile(includePath, 'utf8')
			} catch {
				console.warn(`⚠️ Warning: Missing include file: ${filename}`)
				return ''
			}
		},
	)
}

// Enhanced processMarkdownFile to handle nested paths
const processMarkdownFile = async (relativePath: string): Promise<PageInfo> => {
	const filePath = join(PAGES_DIR, relativePath)
	const mdContent = await readFile(filePath, 'utf8')

	console.log(`📂 Processing: ${relativePath}`)

	// Parse frontmatter and Markdown content
	const { data: frontmatter, content } = matter(mdContent)
	// console.log(`📝 Frontmatter:`, frontmatter);

	// Determine section and depth early for API processing
	const pathParts = relativePath.split(/[/\\]/) // Handle both Unix and Windows paths
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
	// console.log(`📜 Converted Markdown to HTML:`, htmlContent);

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

	// Get asset optimization results or fallback to basic hashing
	let cssHash = 'dev'
	let jsHash = 'dev'

	if (OPTIMIZATION_RESULTS) {
		// Use optimization results
		cssHash = OPTIMIZATION_RESULTS.css.mainCSSHash
		jsHash = OPTIMIZATION_RESULTS.js.mainJSHash
	} else {
		// Fallback to basic asset hashing
		try {
			cssHash = generateAssetHash(join(ASSETS_DIR, 'main.css'))
			jsHash = generateAssetHash(join(ASSETS_DIR, 'main.js'))
		} catch {
			console.warn('⚠️ Could not generate asset hashes, using fallback')
		}
	}

	// Generate performance hints for this page
	const performanceHints = generateAllPerformanceHints(url, basePath, jsHash)

	// Analyze page content for additional preloads
	const additionalPreloads = await analyzePageForPreloads(htmlContent, basePath)

	// Generate lazy loading script
	const lazyLoadingScript = generateLazyLoadingScript()



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

	// Load layout template
	const layoutFile = LAYOUT_FILE

	let layout: string
	try {
		layout = await readFile(layoutFile, 'utf8')
	} catch {
		// Fallback to regular layout if optimized doesn't exist
		layout = await readFile(LAYOUT_FILE, 'utf8')
		console.log(`📄 Using regular layout for ${url}`)
	}
	// console.log(`📄 Layout before processing:`, layout);

	// Use regex to match the correct <li> by href and add class="active"
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
	layout = await loadIncludes(layout)
	// console.log(`📎 After Includes Processing:`, layout);

	// 2️⃣ Replace {{ content }} SECOND
	layout = layout.replace('{{ content }}', htmlContent)
	// console.log(`✅ After Content Injection:`, layout);

	// 3️⃣ Replace frontmatter placeholders LAST
	layout = layout.replace(/{{ (.*?) }}/g, (_, key) => {
		if (key === 'url') return url
		if (key === 'section') return section || ''
		if (key === 'base-path') return basePath
		if (key === 'title') return title || ''
		if (key === 'toc') return tocHtml
		if (key === 'css-hash') return cssHash
		if (key === 'js-hash') return jsHash
		if (key === 'performance-hints') return performanceHints
		if (key === 'additional-preloads') return additionalPreloads.join('\n\t\t')
		if (key === 'lazy-loading-script') return lazyLoadingScript
		return frontmatter[key] || ''
	})

	// Ensure output directory exists and save output file
	const outputPath = join(OUTPUT_DIR, url)
	await ensureDir(outputPath)
	await writeFile(outputPath, layout, 'utf8')

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

// Global variables to store optimization results
let OPTIMIZATION_RESULTS: {
	css: { mainCSSPath: string; mainCSSHash: string }
	js: { mainJSPath: string; mainJSHash: string }
} | null = null

// Main function
const run = async () => {
	console.log('🔄 Building optimized assets first...')

	// Build optimized assets before processing pages
	try {
		OPTIMIZATION_RESULTS = await buildOptimizedAssets()
		console.log('✅ Asset optimization completed')
	} catch (error) {
		console.warn('⚠️ Asset optimization failed, continuing with regular build:', error)
	}

	console.log('🔄 Discovering markdown files...')

	// Find all .md files recursively
	const markdownFiles = await findMarkdownFiles(PAGES_DIR)
	console.log(`📝 Found ${markdownFiles.length} markdown files`)

	// Process all Markdown files
	const pages = await Promise.all(markdownFiles.map(processMarkdownFile))

	// Generate main menu (only root pages)
	await generateMenu(pages.filter(p => !p.section))

	// Generate sitemap with all pages
	await generateSitemap(pages)

	console.log('✨ All pages generated!')
}

run()

import { join } from 'path'
import { mkdir, readFile, readdir, stat, writeFile } from 'fs/promises'
import matter from 'gray-matter'
import { marked } from 'marked'

import {
	INCLUDES_DIR,
	LAYOUT_FILE,
	MENU_FILE,
	OUTPUT_DIR,
	PAGES_DIR,
} from './config'
import { generateApiMenu } from './generate-api-menu'
import { generateBlogMenu } from './generate-blog-menu'
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

	// Convert Markdown content to HTML and process code blocks
	const { processedMarkdown, codeBlockMap } =
		await transformCodeBlocks(content)

	// Convert Markdown to HTML first
	let htmlContent = await marked.parse(processedMarkdown)
	// console.log(`📜 Converted Markdown to HTML:`, htmlContent);

	// Post-process HTML to add permalinks to headings
	htmlContent = htmlContent.replace(
		/<h([1-6])>(.+?)<\/h[1-6]>/g,
		(_match, level, text) => {
			const slug = generateSlug(text)

			return `<h${level} id="${slug}">
                <a name="${slug}" class="anchor" href="#${slug}">
	                <span class="permalink">🔗</span>
                </a>
                ${text}
            </h${level}>`
		},
	)

	// Generate TOC from processed HTML content (after heading anchors are added)
	const tocHtml = await generateTOC(htmlContent)

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

	// Generate output URL (preserve directory structure)
	const url = relativePath.replace('.md', '.html')

	// Determine section and depth
	const pathParts = relativePath.split(/[/\\]/) // Handle both Unix and Windows paths
	const section = pathParts.length > 1 ? pathParts[0] : undefined
	const depth = pathParts.length - 1

	// Calculate base href for assets and navigation
	const basePath = depth > 0 ? '../'.repeat(depth) : './'

	// Extract title from first heading if no frontmatter title (common for API docs)
	let title = frontmatter.title
	if (!title && section === 'api') {
		const headingMatch = content.match(
			/^#\s+(Function|Type Alias|Variable):\s*(.+?)(?:\(\))?$/m,
		)
		if (headingMatch) {
			title = headingMatch[2].trim() // Extract the actual function/type name
		} else {
			// Fallback to generic heading extraction
			const fallbackMatch = content.match(/^#\s+(.+)$/m)
			if (fallbackMatch) {
				title = fallbackMatch[1].replace(/\(.*?\)$/, '').trim()
			}
		}
	}

	// Load layout template
	let layout = await readFile(LAYOUT_FILE, 'utf8')
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

	// Handle section-specific includes
	if (section === 'api') {
		// Load and process API menu with active state
		try {
			const apiMenuPath = join(INCLUDES_DIR, 'api-menu.html')
			let apiMenuHtml = await readFile(apiMenuPath, 'utf8')
			// Mark current page as active in API menu
			const currentPageInMenu = url.replace('api/', '')
			apiMenuHtml = apiMenuHtml.replace(
				new RegExp(`(<a href="${currentPageInMenu}")`, 'g'),
				'$1 class="active"',
			)
			layout = layout.replace('{{ sidebar }}', apiMenuHtml)
		} catch {
			layout = layout.replace('{{ sidebar }}', '')
		}
	} else if (section === 'blog') {
		// Load and process blog menu with active state
		try {
			const blogMenuPath = join(INCLUDES_DIR, 'blog-menu.html')
			let blogMenuHtml = await readFile(blogMenuPath, 'utf8')
			// Mark current page as active in blog menu
			const currentPageInMenu = url.replace('blog/', '')
			blogMenuHtml = blogMenuHtml.replace(
				new RegExp(`(<a href="${currentPageInMenu}")`, 'g'),
				'$1 class="active"',
			)
			layout = layout.replace('{{ sidebar }}', blogMenuHtml)
		} catch {
			layout = layout.replace('{{ sidebar }}', '')
		}
	} else {
		layout = layout.replace('{{ sidebar }}', '')
	}

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
		if (key === 'has-sidebar')
			return section === 'api' || section === 'blog' ? 'has-sidebar' : ''
		if (key === 'base-path') return basePath
		if (key === 'title') return title || ''
		if (key === 'toc') return tocHtml
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

// Main function
const run = async () => {
	console.log('🔄 Discovering markdown files...')

	// Find all .md files recursively
	const markdownFiles = await findMarkdownFiles(PAGES_DIR)
	console.log(`📝 Found ${markdownFiles.length} markdown files`)

	// Process all Markdown files
	const pages = await Promise.all(markdownFiles.map(processMarkdownFile))

	// Separate pages by section
	const rootPages = pages.filter(p => !p.section)
	const apiPages = pages.filter(p => p.section === 'api')
	const blogPages = pages.filter(p => p.section === 'blog')

	// Generate main menu (only root pages)
	await generateMenu(rootPages)

	// Generate section-specific menus
	if (apiPages.length > 0) {
		await generateApiMenu(apiPages)
	}

	if (blogPages.length > 0) {
		await generateBlogMenu(blogPages)
	}

	// Generate sitemap with all pages
	await generateSitemap(pages)

	console.log('✨ All pages generated!')
}

run()

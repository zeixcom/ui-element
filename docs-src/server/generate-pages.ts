import { join } from 'path'
import { readFile, readdir, writeFile } from 'fs/promises'
import matter from 'gray-matter'
import { marked } from 'marked'

import {
	INCLUDES_DIR,
	LAYOUT_FILE,
	MENU_FILE,
	OUTPUT_DIR,
	PAGES_DIR,
} from './config'
import { generateMenu } from './generate-menu'
import { generateSitemap } from './generate-sitemap'
import { replaceAsync } from './replace-async'
import { transformCodeBlocks } from './transform-code-blocks'

marked.setOptions({
	gfm: true, // Enables tables, task lists, and strikethroughs
	breaks: true, // Allows line breaks without needing double spaces
})

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

const processMarkdownFile = async (filename: string) => {
	const filePath = join(PAGES_DIR, filename)
	const mdContent = await readFile(filePath, 'utf8')

	console.log(`📂 Processing: ${filename}`)

	// Parse frontmatter and Markdown content
	const { data: frontmatter, content } = matter(mdContent)
	// console.log(`📝 Frontmatter:`, frontmatter);

	// Convert Markdown content to HTML and process code blocks
	const { processedMarkdown, codeBlockMap } =
		await transformCodeBlocks(content)

	// Override headings to add permalinks
	const renderer = {
		heading({ tokens, depth }) {
			const text = this.parser.parseInline(tokens)
			const slug = text
				.toLowerCase()
				.replace(/[^\w\- ]+/g, '')
				.trim()
				.replace(/\s+/g, '-')

			return `
	            <h${depth} id="${slug}">
	                <a name="${slug}" class="anchor" href="#${slug}">
		                <span class="permalink">🔗</span>
	                </a>
	                ${text}
	            </h${depth}>`
		},
	}

	marked.use({ renderer })
	let htmlContent = await marked.parse(processedMarkdown)
	// console.log(`📜 Converted Markdown to HTML:`, htmlContent);

	// Replace placeholders with actual Shiki code blocks
	codeBlockMap.forEach((code, key) => {
		htmlContent = htmlContent.replace(
			new RegExp(`(<p>\\s*${key}\\s*</p>)`, 'g'),
			code,
		)
	})

	// Load layout template
	let layout = await readFile(LAYOUT_FILE, 'utf8')
	// console.log(`📄 Layout before processing:`, layout);

	// Use regex to match the correct <li> by href and add class="active"
	let menuHtml = await readFile(MENU_FILE, 'utf8')
	const url = filename.replace('.md', '.html')
	menuHtml = menuHtml.replace(
		new RegExp(`(<a href="${url}")`, 'g'),
		'$1 class="active"',
	)
	layout = layout.replace("{{ include 'menu.html' }}", menuHtml)

	// 1️⃣ Process includes FIRST
	layout = await loadIncludes(layout)
	// console.log(`📎 After Includes Processing:`, layout);

	// 2️⃣ Replace {{ content }} SECOND
	layout = layout.replace('{{ content }}', htmlContent)
	// console.log(`✅ After Content Injection:`, layout);

	// 3️⃣ Replace frontmatter placeholders LAST
	layout = layout.replace(/{{ (.*?) }}/g, (_, key) => {
		// console.log(`🔍 Replacing: {{ ${key} }} →`, frontmatter[key] || '');
		if (key === 'url') return url
		return frontmatter[key] || ''
	})

	// Save output file
	await writeFile(join(OUTPUT_DIR, url), layout, 'utf8')

	console.log(`✅ Generated: ${url}`)

	return {
		filename: url,
		title: frontmatter.title || 'Untitled',
		emoji: frontmatter.emoji || '📄',
		description: frontmatter.description || '',
		url,
	}
}

// Main function
const run = async () => {
	// console.log('🔄 Checking for page list changes...');

	const files = await readdir(PAGES_DIR)
	const mdFiles = files.filter(file => file.endsWith('.md'))

	// Process all Markdown files
	const pages = await Promise.all(mdFiles.map(processMarkdownFile))

	await generateMenu(pages)
	await generateSitemap(pages)

	console.log('✨ All pages generated!')
}

run()

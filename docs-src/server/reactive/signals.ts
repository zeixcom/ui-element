/**
 * Reactive Filesystem Signals - Simplified
 * Core reactive architecture with minimal indirection
 */

import { batch, computed, effect, state } from '@zeix/cause-effect'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import {
	BASE_URL,
	COMPONENTS_DIR,
	INCLUDES_DIR,
	LAYOUT_FILE,
	PAGES_DIR,
	TEMPLATE_DIR,
} from './config'
import type {
	FileChangeEvent,
	FileProcessor,
	FileSystemOptions,
	FileSystemSignals,
	ProcessedPage,
} from './types'

// ============================================================================
// File Path Utilities
// ============================================================================

const isMarkdownFile = (path: string): boolean =>
	path.endsWith('.md') && path.includes(PAGES_DIR.replace('./', ''))

const isTemplateFile = (path: string): boolean =>
	(path.endsWith('.ts') && path.includes(TEMPLATE_DIR.replace('./', ''))) ||
	path.includes(INCLUDES_DIR.replace('./', '')) ||
	path === LAYOUT_FILE.replace('./', '')

const isComponentFile = (path: string): boolean =>
	path.includes(COMPONENTS_DIR.replace('./', ''))

// ============================================================================
// Content Processing Utilities
// ============================================================================

const parseFrontmatter = (content: string) => {
	const match = content.match(/^---\n(.*?)\n---/s)
	if (!match) return {}

	const frontmatter = match[1]
	const getValue = (key: string): string => {
		const match = frontmatter.match(new RegExp(`${key}:\\s*(.+)`, 'i'))
		return match ? match[1].trim().replace(/['"]/g, '') : ''
	}

	return {
		title: getValue('title') || 'Untitled',
		emoji: getValue('emoji') || '📄',
		description: getValue('description') || '',
		order: parseInt(getValue('order') || '0', 10),
		draft: getValue('draft').toLowerCase() === 'true',
	}
}

const extractApiTitle = (content: string): string => {
	const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, '').trim()
	const apiMatch = withoutFrontmatter.match(
		/^#\s+(Function|Type Alias|Variable):\s*(.+?)(?:\(\))?$/m,
	)
	if (apiMatch) return apiMatch[2].trim()

	const headingMatch = withoutFrontmatter.match(/^#\s+(.+)$/m)
	return headingMatch ? headingMatch[1].replace(/\(.*?\)$/, '').trim() : 'Untitled'
}

const createProcessedPage = (
	filePath: string,
	fileInfo: { content: string; lastModified: number },
): ProcessedPage => {
	const relativePath = filePath
		.replace(join(process.cwd(), PAGES_DIR) + '/', '')
		.replace(/\\/g, '/')

	const pathParts = relativePath.split('/')
	const section = pathParts.length > 1 ? pathParts[0] : undefined
	const url = relativePath.replace('.md', '.html')

	const frontmatter = parseFrontmatter(fileInfo.content)
	let title = frontmatter.title

	// Extract API titles if needed
	if (section === 'api' && title === 'Untitled') {
		title = extractApiTitle(fileInfo.content)
	}

	return {
		filePath,
		outputPath: url,
		metadata: {
			title,
			emoji: frontmatter.emoji,
			description: frontmatter.description,
			url,
			section,
			order: frontmatter.order,
			draft: frontmatter.draft,
			created: new Date(fileInfo.lastModified),
			updated: new Date(fileInfo.lastModified),
		},
		content: fileInfo.content,
		dependencies: [],
		hash: generateHash(fileInfo.content),
	}
}

// ============================================================================
// HTML Generation
// ============================================================================

const generateNavigationMenu = (pages: ProcessedPage[]): string => {
	const visiblePages = pages.filter(page => !page.metadata.draft)
	const sections = new Map<string, ProcessedPage[]>()

	// Group by section
	for (const page of visiblePages) {
		const section = page.metadata.section || 'main'
		if (!sections.has(section)) sections.set(section, [])
		sections.get(section)!.push(page)
	}

	const sortedSections = Array.from(sections.entries()).sort(([a], [b]) =>
		a === 'main' ? -1 : b === 'main' ? 1 : a.localeCompare(b)
	)

	let html = '<nav class="menu">\n'

	for (const [sectionName, sectionPages] of sortedSections) {
		if (sectionName === 'main') {
			html += '\t<ul class="main-pages">\n'
			for (const page of sectionPages) {
				const { title, emoji, url } = page.metadata
				html += `\t\t<li><a href="${url}" data-section="main">${emoji} ${title}</a></li>\n`
			}
			html += '\t</ul>\n'
		} else {
			html += `\t<div class="menu-section" data-section="${sectionName}">\n`
			html += `\t\t<h3>${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h3>\n`
			html += '\t\t<ul>\n'
			for (const page of sectionPages) {
				const { title, emoji, url } = page.metadata
				html += `\t\t\t<li><a href="${url}" data-section="${sectionName}">${emoji} ${title}</a></li>\n`
			}
			html += '\t\t</ul>\n'
			html += '\t</div>\n'
		}
	}

	return html + '</nav>'
}

const generateSitemap = (pages: ProcessedPage[], baseUrl: string): string => {
	const publishedPages = pages
		.filter(page => !page.metadata.draft)
		.sort((a, b) => {
			const aIsMain = !a.metadata.section || a.metadata.section === 'main'
			const bIsMain = !b.metadata.section || b.metadata.section === 'main'
			if (aIsMain && !bIsMain) return -1
			if (!aIsMain && bIsMain) return 1
			return (a.metadata.order || 999) - (b.metadata.order || 999)
		})

	let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

	for (const page of publishedPages) {
		const url = `${baseUrl}/${page.metadata.url}`.replace(/([^:]\/)\/+/g, '$1')
		const priority = getSitemapPriority(page)
		const changefreq = getSitemapChangeFreq(page)

		xml += '\t<url>\n'
		xml += `\t\t<loc>${url}</loc>\n`
		if (page.metadata.updated) {
			xml += `\t\t<lastmod>${page.metadata.updated.toISOString().split('T')[0]}</lastmod>\n`
		}
		xml += `\t\t<changefreq>${changefreq}</changefreq>\n`
		xml += `\t\t<priority>${priority}</priority>\n`
		xml += '\t</url>\n'
	}

	return xml + '</urlset>'
}

// ============================================================================
// Core Signal Factory
// ============================================================================

export const createFileSystemSignals = (options: FileSystemOptions): FileSystemSignals => {
	const { baseUrl = BASE_URL } = options

	// Input signals
	const markdownFiles = state(new Map<string, { content: string; lastModified: number }>())
	const templateFiles = state(new Map<string, { content: string; lastModified: number }>())
	const componentFiles = state(new Map<string, { content: string; lastModified: number }>())
	const assetFiles = state(new Map<string, { hash: string; lastModified: number }>())
	const optimizedAssets = state<{
		css: { mainCSSHash: string }
		js: { mainJSHash: string }
	}>({ css: { mainCSSHash: '' }, js: { mainJSHash: '' } })

	// Derived signals
	const processedPages = computed(() => {
		const mdFiles = markdownFiles.get()
		const pages: ProcessedPage[] = []

		for (const [filePath, fileInfo] of mdFiles.entries()) {
			try {
				pages.push(createProcessedPage(filePath, fileInfo))
			} catch (error) {
				console.error(`❌ Error processing ${filePath}:`, error)
			}
		}

		return pages.sort((a, b) => {
			if (a.metadata.order !== b.metadata.order) {
				return (a.metadata.order || 999) - (b.metadata.order || 999)
			}
			if (a.metadata.section !== b.metadata.section) {
				return (a.metadata.section || '').localeCompare(b.metadata.section || '')
			}
			return (a.metadata.title || '').localeCompare(b.metadata.title || '')
		})
	})

	const navigationMenu = computed(() => {
		const pages = processedPages.get()
		return Array.isArray(pages) ? generateNavigationMenu(pages) : '<nav class="menu">\n</nav>'
	})

	const sitemap = computed(() => {
		const pages = processedPages.get()
		return Array.isArray(pages)
			? generateSitemap(pages, baseUrl)
			: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>'
	})

	const dependencyGraph = computed(() => {
		const graph = new Map<string, Set<string>>()
		const pages = processedPages.get()
		const templates = templateFiles.get()

		if (Array.isArray(pages)) {
			for (const page of pages) {
				const dependencies = new Set<string>()
				for (const [templatePath] of templates.entries()) {
					dependencies.add(templatePath)
				}
				const assets = optimizedAssets.get()
				if (assets) {
					dependencies.add('css-assets')
					dependencies.add('js-assets')
				}
				graph.set(page.filePath, dependencies)
			}
		}

		return graph
	})

	return {
		markdownFiles,
		templateFiles,
		componentFiles,
		assetFiles,
		optimizedAssets,
		processedPages,
		navigationMenu,
		sitemap,
		dependencyGraph,
	}
}

// ============================================================================
// File Processor Factory
// ============================================================================

export const createFileProcessor = (signals: FileSystemSignals): FileProcessor => {
	const updateFileInSignal = (
		signal: any,
		filePath: string,
		content: string,
		lastModified: number,
	) => {
		const files = new Map(signal.get())
		files.set(filePath, { content, lastModified })
		signal.set(files)
	}

	const removeFileFromSignal = (signal: any, filePath: string) => {
		const files = new Map(signal.get())
		files.delete(filePath)
		signal.set(files)
	}

	const updateFile = (filePath: string, content: string, lastModified: number) => {
		batch(() => {
			const normalized = filePath.replace(/\\/g, '/')
			if (isMarkdownFile(normalized)) {
				updateFileInSignal(signals.markdownFiles, filePath, content, lastModified)
			} else if (isTemplateFile(normalized)) {
				updateFileInSignal(signals.templateFiles, filePath, content, lastModified)
			} else if (isComponentFile(normalized)) {
				updateFileInSignal(signals.componentFiles, filePath, content, lastModified)
			}
		})
	}

	const removeFile = (filePath: string) => {
		batch(() => {
			const normalized = filePath.replace(/\\/g, '/')
			if (isMarkdownFile(normalized)) {
				removeFileFromSignal(signals.markdownFiles, filePath)
			} else if (isTemplateFile(normalized)) {
				removeFileFromSignal(signals.templateFiles, filePath)
			} else if (isComponentFile(normalized)) {
				removeFileFromSignal(signals.componentFiles, filePath)
			}
		})
	}

	const processFileChange = async (event: FileChangeEvent): Promise<void> => {
		try {
			if (event.eventType === 'delete') {
				removeFile(event.filePath)
				console.log(`🗑️  Removed: ${event.filePath}`)
			} else {
				const stats = await stat(event.filePath)
				const content = await readFile(event.filePath, 'utf8')
				updateFile(event.filePath, content, stats.mtimeMs)
				console.log(`📝 Updated: ${event.filePath}`)
			}
		} catch (error) {
			console.error(`❌ Failed to process ${event.filePath}:`, error)
		}
	}

	const setupEffects = (): (() => void) => {
		const cleanups = [
			effect({
				ok: (pages): undefined => console.log(`📋 Processed ${pages.length} pages`),
				err: (error): undefined => console.error('❌ Page processing error:', error.message),
				signals: [signals.processedPages],
			}),
			effect({
				ok: (menu): undefined => console.log(`🧭 Menu generated (${menu.length} chars)`),
				err: (error): undefined => console.error('❌ Menu generation error:', error.message),
				signals: [signals.navigationMenu],
			}),
			effect({
				ok: (xml): undefined => console.log(`🗺️ Sitemap: ${(xml.match(/<url>/g) || []).length} URLs`),
				err: (error): undefined => console.error('❌ Sitemap generation error:', error.message),
				signals: [signals.sitemap],
			}),
		]

		return () => cleanups.forEach(cleanup => cleanup())
	}

	return {
		signals,
		updateFile,
		removeFile,
		updateAssets: (assets) => signals.optimizedAssets.set(assets),
		processFileChange,
		setupEffects,
	}
}

// ============================================================================
// Utility Functions
// ============================================================================

const generateHash = (content: string): string => {
	let hash = 0
	for (let i = 0; i < content.length; i++) {
		const char = content.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash
	}
	return hash.toString(36)
}

const getSitemapPriority = (page: ProcessedPage): string => {
	const { section, url } = page.metadata
	if (url === 'index.html') return '1.0'
	if (!section || section === 'main') return '0.9'
	if (section === 'getting-started' || section === 'components') return '0.8'
	if (section === 'api' || section === 'examples') return '0.7'
	if (section === 'blog') return '0.6'
	return '0.5'
}

const getSitemapChangeFreq = (page: ProcessedPage): string => {
	const { section } = page.metadata
	if (section === 'blog') return 'weekly'
	if (section === 'api' || section === 'examples') return 'monthly'
	return 'monthly'
}

import { join } from 'path'
import { writeFile } from 'fs/promises'

import { INCLUDES_DIR } from './config'

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

const API_MENU_FILE = join(INCLUDES_DIR, 'api-menu.html')

// Generate API-specific navigation with active state placeholder
export const generateApiMenu = async (pages: PageInfo[]) => {
	// Categorize API pages
	const categories = {
		overview: pages.filter(p =>
			p.relativePath.includes('README.md') ||
			p.relativePath.includes('globals.md')
		),
		functions: pages.filter(p => p.relativePath.includes('/functions/')),
		types: pages.filter(p => p.relativePath.includes('/type-aliases/')),
		variables: pages.filter(p => p.relativePath.includes('/variables/')),
		other: pages.filter(p =>
			!p.relativePath.includes('README.md') &&
			!p.relativePath.includes('globals.md') &&
			!p.relativePath.includes('/functions/') &&
			!p.relativePath.includes('/type-aliases/') &&
			!p.relativePath.includes('/variables/')
		)
	}

	let html = '<aside class="api-navigation">\n'
	html += '  <nav class="api-menu">\n'

	// Overview section
	if (categories.overview.length > 0) {
		html += '    <section>\n'
		html += '      <h3>Overview</h3>\n'
		html += '      <ul>\n'
		categories.overview
			.sort((a, b) => {
				// README first, then globals, then alphabetical
				if (a.relativePath.includes('README.md')) return -1
				if (b.relativePath.includes('README.md')) return 1
				if (a.relativePath.includes('globals.md')) return -1
				if (b.relativePath.includes('globals.md')) return 1
				return a.title.localeCompare(b.title)
			})
			.forEach(page => {
				const displayTitle = page.relativePath.includes('README.md')
					? 'API Reference'
					: page.title
				// Convert absolute API URLs to relative paths
				const relativeUrl = page.url.startsWith('api/') ? page.url.replace('api/', '') : page.url
				html += `        <li><a href="${relativeUrl}">${displayTitle}</a></li>\n`
			})
		html += '      </ul>\n'
		html += '    </section>\n'
	}

	// Functions
	if (categories.functions.length > 0) {
		html += '    <section>\n'
		html += '      <h3>Functions</h3>\n'
		html += '      <ul>\n'
		categories.functions
			.sort((a, b) => a.title.localeCompare(b.title))
			.forEach(page => {
				const relativeUrl = page.url.startsWith('api/') ? page.url.replace('api/', '') : page.url
				html += `        <li><a href="${relativeUrl}">${page.title}()</a></li>\n`
			})
		html += '      </ul>\n'
		html += '    </section>\n'
	}

	// Type Aliases
	if (categories.types.length > 0) {
		html += '    <section>\n'
		html += '      <h3>Types</h3>\n'
		html += '      <ul>\n'
		categories.types
			.sort((a, b) => a.title.localeCompare(b.title))
			.forEach(page => {
				const relativeUrl = page.url.startsWith('api/') ? page.url.replace('api/', '') : page.url
				html += `        <li><a href="${relativeUrl}">${page.title}</a></li>\n`
			})
		html += '      </ul>\n'
		html += '    </section>\n'
	}

	// Variables
	if (categories.variables.length > 0) {
		html += '    <section>\n'
		html += '      <h3>Variables</h3>\n'
		html += '      <ul>\n'
		categories.variables
			.sort((a, b) => a.title.localeCompare(b.title))
			.forEach(page => {
				const relativeUrl = page.url.startsWith('api/') ? page.url.replace('api/', '') : page.url
				html += `        <li><a href="${relativeUrl}">${page.title}</a></li>\n`
			})
		html += '      </ul>\n'
		html += '    </section>\n'
	}

	// Other pages
	if (categories.other.length > 0) {
		html += '    <section>\n'
		html += '      <h3>Other</h3>\n'
		html += '      <ul>\n'
		categories.other
			.sort((a, b) => a.title.localeCompare(b.title))
			.forEach(page => {
				const relativeUrl = page.url.startsWith('api/') ? page.url.replace('api/', '') : page.url
				html += `        <li><a href="${relativeUrl}">${page.title}</a></li>\n`
			})
		html += '      </ul>\n'
		html += '    </section>\n'
	}

	html += '  </nav>\n'
	html += '</aside>\n'

	await writeFile(API_MENU_FILE, html, 'utf8')
	console.log('✅ Generated: api-menu.html')
}

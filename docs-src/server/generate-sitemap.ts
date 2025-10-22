import { writeFile } from 'fs/promises'
import { join } from 'path'

import { OUTPUT_DIR } from './config'

const SITEMAP_FILE = join(OUTPUT_DIR, 'sitemap.xml')

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

// Function to generate a sitemap.xml
export const generateSitemap = async (pages: PageInfo[]) => {
	const now = new Date().toISOString()
	const baseUrl = 'https://zeixcom.github.io/le-truc'

	const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${pages
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

	await writeFile(SITEMAP_FILE, sitemapXml, 'utf8')
	console.log('✅ Generated: sitemap.xml')
}

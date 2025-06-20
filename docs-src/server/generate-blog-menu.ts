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

const BLOG_MENU_FILE = join(INCLUDES_DIR, 'blog-menu.html')

// Generate blog-specific navigation
export const generateBlogMenu = async (pages: PageInfo[]) => {
	let html = '<aside class="blog-navigation">\n'
	html += '  <nav class="blog-menu">\n'
	html += '    <section>\n'
	html += '      <h3>Blog Posts</h3>\n'
	html += '      <ul>\n'

	pages
		.sort((a, b) => {
			// Sort by title alphabetically for now
			// You could add frontmatter date field for chronological sorting
			return a.title.localeCompare(b.title)
		})
		.forEach(page => {
			html += '        <li>\n'
			// Convert absolute blog URLs to relative paths
			const relativeUrl = page.url.startsWith('blog/') ? page.url.replace('blog/', '') : page.url
			html += `          <a href="${relativeUrl}">\n`

			if (page.emoji) {
				html += `            <span class="emoji">${page.emoji}</span>\n`
			}

			html += `            <span class="title">${page.title}</span>\n`

			if (page.description) {
				html += `            <span class="description">${page.description}</span>\n`
			}

			html += '          </a>\n'
			html += '        </li>\n'
		})

	html += '      </ul>\n'
	html += '    </section>\n'
	html += '  </nav>\n'
	html += '</aside>\n'

	await writeFile(BLOG_MENU_FILE, html, 'utf8')
	console.log('✅ Generated: blog-menu.html')
}

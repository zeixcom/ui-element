import { writeFile } from 'fs/promises'

import { MENU_FILE, PAGE_ORDER } from './config'

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

// Function to generate a menu
export const generateMenu = async (pages: PageInfo[]) => {
	// Sort pages according to the PAGE_ORDER array
	pages.sort(
		(a, b) =>
			PAGE_ORDER.indexOf(a.filename.replace('.html', '')) -
			PAGE_ORDER.indexOf(b.filename.replace('.html', '')),
	)

	const menuHtml = `
<section-menu>
	<nav>
		<h2 class="visually-hidden">Main Menu</h2>
		<ol>
			${pages
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

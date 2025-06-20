import { writeFile } from 'fs/promises'

import { MENU_FILE, PAGE_ORDER } from './config'

// Function to generate a menu
export const generateMenu = async pages => {
	// Sort pages according to the PAGE_ORDER array
	pages.sort(
		(a, b) =>
			PAGE_ORDER.indexOf(a.filename.replace('.html', '')) -
			PAGE_ORDER.indexOf(b.filename.replace('.html', '')),
	)

	const menuHtml = `
	<nav class="breakout">
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
	</nav>`

	await writeFile(MENU_FILE, menuHtml, 'utf8')
	console.log('✅ Generated: menu.html')
}

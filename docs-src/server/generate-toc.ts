export const generateTOC = async (htmlContent: string): Promise<string> => {
	// Extract H2 headings from HTML content
	const h2Headings: Record<string, string> = {}

	// Match H2 headings with IDs from the processed HTML (handles multi-line)
	const h2Matches = htmlContent.match(/<h2 id="([^"]+)"[^>]*>[\s\S]*?<\/h2>/g)

	if (!h2Matches || h2Matches.length === 0) {
		return '' // Return empty string if no H2 headings found
	}

	// Process each H2 heading to extract slug and title pairs
	h2Matches.forEach(match => {
		const idMatch = match.match(/id="([^"]+)"/)
		// Extract text after closing </a> tag until closing </h2> tag
		const titleMatch = match.match(/<\/a>\s*([\s\S]*?)\s*<\/h2>/)

		if (idMatch && titleMatch) {
			const slug = idMatch[1]
			const title = titleMatch[1]
				.replace(/<[^>]*>/g, '') // Strip any remaining HTML tags
				.replace(/\s+/g, ' ') // Normalize whitespace
				.trim()
			h2Headings[slug] = title
		}
	})

	// Generate TOC HTML
	return `
<module-toc>
	<nav>
		<h2>In this Page</h2>
		<ol>
			${Object.keys(h2Headings)
				.map(
					slug =>
						`<li><a href="#${slug}">${h2Headings[slug]}</a></li>`,
				)
				.join('\n\t\t\t')}
		</ol>
	</nav>
</module-toc>`
}

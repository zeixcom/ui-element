import { generateSlug } from './generate-slug'

export const generateTOC = async (markdownContent: string): Promise<string> => {
	// Extract H2 headings directly from markdown content
	const h2Headings: Record<string, string> = {}

	// Match H2 headings from markdown (## Heading)
	const h2Matches = markdownContent.match(/^## (.+)$/gm)

	if (!h2Matches || h2Matches.length === 0) {
		return '' // Return empty string if no H2 headings found
	}

	// Process each H2 heading to extract slug and title pairs
	h2Matches.forEach(match => {
		// Extract heading text (remove ## prefix)
		const headingText = match.replace(/^## /, '').trim()

		// Generate slug using the same logic as the heading processor
		const slug = generateSlug(headingText)

		// Clean the heading text - remove markdown formatting
		const cleanTitle = headingText
			.replace(/`([^`]+)`/g, '$1') // Remove backticks but keep content
			.replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
			.replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
			.trim()

		if (cleanTitle) {
			h2Headings[slug] = cleanTitle
		}
	})

	// Generate TOC HTML with proper escaping
	return `
<module-toc>
	<nav>
		<h2>In This Page</h2>
		<ol>
			${Object.keys(h2Headings)
				.map(
					slug =>
						`<li><a href="#${slug}">${h2Headings[slug]}</a></li>`,
				)
				.join('\n')}
		</ol>
	</nav>
</module-toc>`
}

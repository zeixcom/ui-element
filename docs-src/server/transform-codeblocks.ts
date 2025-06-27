import { codeToHtml } from 'shiki'

import { replaceAsync } from './replace-async'

// Initialize Shiki syntax highlighter (singleton instance)
export const highlightedCode = async (
	code: string,
	lang: string,
): Promise<string> => {
	return await codeToHtml(code, {
		lang,
		theme: 'monokai',
	})
}

// Function to transform Markdown-style code blocks into `<module-codeblock>` components
export const transformCodeBlocks = async (
	markdown: string,
): Promise<{
	processedMarkdown: string
	codeBlockMap: Map<string, string>
}> => {
	const codeBlockMap = new Map() // Store transformed code blocks
	let codeCounter = 0

	const processedMarkdown = await replaceAsync(
		markdown,
		/```(\w+)(?:\s\(([^)]+)\))?\n(.*?)```/gs,
		async (_, lang, filename, code) => {
			// Count lines before transformation
			const collapsed = code.split('\n').length > 10

			// Apply syntax highlighting
			const highlighted = await highlightedCode(code, lang)

			const placeholder = `{{ codeblock-${codeCounter++} }}`
			codeBlockMap.set(
				placeholder,
				`
<module-codeblock${collapsed ? ' collapsed' : ''} language="${lang}" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
	<p class="meta">
		${filename ? `<span class="file">${filename}</span>` : ''}
		<span class="language">${lang}</span>
	</p>
	${highlighted}
	<basic-button class="copy">
		<button type="button" class="secondary small">
			<span class="label">Copy</span>
		</button>
	</basic-button>
	${collapsed ? `<button type="button" class="overlay">Expand</button>` : ''}
</module-codeblock>
`.trim(),
			)

			return placeholder
		},
	)

	return { processedMarkdown, codeBlockMap }
}

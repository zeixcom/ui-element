// Generate preload hints based on current page
export const generatePreloadHints = (
	currentPath: string,
	basePath: string = './',
): string[] => {
	const hints: string[] = []

	// Always preload the most likely next pages
	const nextPages = getNextLikelyPages(currentPath)

	for (const page of nextPages) {
		hints.push(
			`<link rel="prefetch" href="${basePath}${page}" as="document">`,
		)
	}

	// Preload critical fonts if any
	// hints.push(`<link rel="preload" href="${basePath}assets/fonts/main.woff2" as="font" type="font/woff2" crossorigin>`)

	return hints
}

// Determine likely next pages based on current location
const getNextLikelyPages = (currentPath: string): string[] => {
	const path = currentPath.replace(/^\//, '').replace(/\.html$/, '')

	switch (path) {
		case '':
		case 'index':
			return ['getting-started.html', 'components.html']

		case 'getting-started':
			return ['components.html', 'styling.html', 'examples.html']

		case 'components':
			return ['styling.html', 'data-flow.html', 'examples.html']

		case 'styling':
			return ['data-flow.html', 'examples.html']

		case 'data-flow':
			return ['examples.html', 'api.html']

		case 'examples':
			return ['api.html', 'components.html']

		case 'blog':
			return ['index.html', 'examples.html']

		case 'api':
			return ['examples.html', 'components.html']

		case 'about':
			return ['index.html', 'getting-started.html']

		default:
			// For API sub-pages or unknown pages, suggest common destinations
			if (path.startsWith('api/')) {
				return ['api.html', 'examples.html', 'components.html']
			}
			return ['index.html']
	}
}

// Generate DNS prefetch hints for external resources
export const generateDNSPrefetchHints = (): string[] => {
	return [
		'<link rel="dns-prefetch" href="//fonts.googleapis.com">',
		'<link rel="dns-prefetch" href="//fonts.gstatic.com">',
		'<link rel="dns-prefetch" href="//cdn.jsdelivr.net">',
	]
}

// Generate preconnect hints for critical external resources
export const generatePreconnectHints = (): string[] => {
	return [
		'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
	]
}

// Generate module preload hints for JavaScript
export const generateModulePreloadHints = (
	basePath: string = './',
	jsHash: string,
): string[] => {
	return [
		`<link rel="modulepreload" href="${basePath}assets/main.${jsHash}.js">`,
	]
}

// Generate all performance hints for a page
export const generateAllPerformanceHints = (
	currentPath: string,
	basePath: string = './',
	jsHash: string = '',
): string => {
	const hints = [
		...generateDNSPrefetchHints(),
		...generatePreconnectHints(),
		...generateModulePreloadHints(basePath, jsHash),
		...generatePreloadHints(currentPath, basePath),
	]

	return hints.join('\n\t\t')
}

// Analyze page content to determine additional resources to preload
export const analyzePageForPreloads = async (
	htmlContent: string,
	basePath: string = './',
): Promise<string[]> => {
	const preloads: string[] = []

	// Look for images that should be preloaded
	const imageMatches = htmlContent.match(
		/<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
	)
	if (imageMatches) {
		// Preload the first few images (likely above the fold)
		const firstImages = imageMatches.slice(0, 3)
		for (const img of firstImages) {
			const srcMatch = img.match(/src=["']([^"']+)["']/)
			if (srcMatch?.[1]) {
				const src = srcMatch[1]
				if (!src.startsWith('http') && !src.startsWith('//')) {
					preloads.push(
						`<link rel="preload" href="${basePath}${src}" as="image">`,
					)
				}
			}
		}
	}

	// Look for critical inline SVGs or icons
	const svgMatches = htmlContent.match(/<svg[^>]*>/gi)
	if (svgMatches && svgMatches.length > 0) {
		// Preload common icon sets if detected
		preloads.push(
			`<link rel="preload" href="${basePath}assets/icons.svg" as="image">`,
		)
	}

	return preloads
}

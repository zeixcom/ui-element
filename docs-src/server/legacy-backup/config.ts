import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

export const PAGES_DIR = './docs-src/pages'
export const LAYOUT_FILE = './docs-src/layout.html'
export const INCLUDES_DIR = './docs-src/includes'
export const MENU_FILE = join(INCLUDES_DIR, 'menu.html')
export const OUTPUT_DIR = './docs'

// Define the directory for code examples
export const COMPONENTS_DIR = './docs-src/components'
export const FRAGMENTS_DIR = './docs/examples'

// Asset versioning and caching configuration
export const ASSETS_DIR = './docs/assets'
export const CACHE_MAX_AGE = 31536000 // 1 year in seconds

// Generate content hash for asset versioning
export const generateAssetHash = (input: string | Buffer): string => {
	try {
		const content = typeof input === 'string' ? readFileSync(input) : input
		return createHash('sha256')
			.update(content)
			.digest('hex')
			.substring(0, 8)
	} catch {
		return 'dev'
	}
}

// Define a manual order for the menu
export const PAGE_ORDER = [
	'index',
	'getting-started',
	'components',
	'styling',
	'data-flow',
	'examples',
	'blog',
	'api',
	'about',
]

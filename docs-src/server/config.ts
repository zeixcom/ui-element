import { join } from 'path'

export const PAGES_DIR = './docs-src/pages'
export const LAYOUT_FILE = './docs-src/layout.html'
export const INCLUDES_DIR = './docs-src/includes'
export const MENU_FILE = join(INCLUDES_DIR, 'menu.html')
export const OUTPUT_DIR = './docs'

// Define the directory for code examples
export const COMPONENTS_DIR = './docs-src/components'
export const FRAGMENTS_DIR = './docs/examples'

// Define a manual order for the menu
export const PAGE_ORDER = [
	'index',
	'getting-started',
	'building-components',
	'styling-components',
	'data-flow',
	'examples-recipes',
	'patterns-techniques',
	'api-reference',
	'about-community',
]

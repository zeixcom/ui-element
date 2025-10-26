/**
 * Development server configuration
 */
import type { DevServerConfig } from './types'

// Path constants
export const PAGES_DIR = './docs-src/pages'
export const COMPONENTS_DIR = './docs-src/components'
export const FRAGMENTS_DIR = './docs-src/fragments'
export const SRC_DIR = './src'
export const OUTPUT_DIR = './docs'
export const ASSETS_DIR = './docs/assets'
export const INCLUDES_DIR = './docs-src/includes'
export const LAYOUT_FILE = './docs-src/layout.html'
export const MENU_FILE = './docs-src/includes/menu.html'

// Page ordering configuration
export const PAGE_ORDER = [
	'index',
	'getting-started',
	'components',
	'styling',
	'data-flow',
	'examples',
	'api',
	'blog',
	'about',
]

// Default configuration
export const DEFAULT_CONFIG: DevServerConfig = {
	server: {
		port: 3000,
		host: 'localhost',
		development: true,
	},
	paths: {
		pages: PAGES_DIR,
		components: COMPONENTS_DIR,
		src: SRC_DIR,
		output: OUTPUT_DIR,
		assets: ASSETS_DIR,
		includes: INCLUDES_DIR,
		layout: LAYOUT_FILE,
	},
	build: {
		optimizeLayout: true,
		generateSourceMaps: true,
		minify: true,
		cacheMaxAge: 31536000, // 1 year
	},
	watch: {
		debounceDelay: 300,
		paths: [
			{
				directory: PAGES_DIR,
				extensions: ['.md'],
				label: '📝',
				buildCommands: ['build:docs-html'],
			},
			{
				directory: COMPONENTS_DIR,
				extensions: ['.ts', '.html', '.css'],
				label: '🔧',
				buildCommands: [], // Will be determined dynamically
			},
			{
				directory: SRC_DIR,
				extensions: ['.ts'],
				label: '📦',
				buildCommands: ['build', 'build:docs-js', 'build:docs-api'],
			},
		],
	},
	assets: {
		compression: {
			enabled: true,
			brotli: true,
			gzip: true,
		},
		versioning: {
			enabled: true,
			hashLength: 8,
		},
	},
}

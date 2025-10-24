import { execSync } from 'child_process'
import { existsSync, writeFileSync } from 'fs'
import { mkdir, readdir, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { ASSETS_DIR, generateAssetHash } from '../config.js'
import { BaseBuildPlugin } from '../modular-ssg.js'
import type { BuildInput, BuildOutput, DevServerConfig } from '../types.js'

interface OptimizedAssets {
	css: {
		mainCSSPath: string
		mainCSSHash: string
	}
	js: {
		mainJSPath: string
		mainJSHash: string
	}
}

export class AssetPlugin extends BaseBuildPlugin {
	public readonly name = 'asset-optimizer'
	public readonly version = '1.0.0'
	public readonly description =
		'Optimizes and versions CSS and JavaScript assets'

	private optimizedAssets: OptimizedAssets | null = null
	private processedFiles = new Set<string>()

	public shouldRun(filePath: string): boolean {
		return (
			(filePath.endsWith('.css') && filePath.includes('main.css')) ||
			(filePath.endsWith('.ts') && filePath.includes('main.ts'))
		)
	}

	public async initialize(_config: DevServerConfig): Promise<void> {
		console.log(`🔧 Initializing ${this.name}...`)
		await this.ensureAssetsDir()
		console.log(`✅ ${this.name} initialized`)
	}

	public async transform(input: BuildInput): Promise<BuildOutput> {
		try {
			const isCSS = input.filePath.endsWith('.css')
			const isTS = input.filePath.endsWith('.ts')

			// Skip if we've already processed this type of file
			const fileType = isCSS ? 'css' : 'js'
			if (this.processedFiles.has(fileType)) {
				return this.createSuccess(input, {
					content: 'already-processed',
					metadata: {
						fileType,
						skipped: true,
					},
				})
			}

			if (isCSS) {
				const cssResult = await this.buildOptimizedCSS()
				this.processedFiles.add('css')

				return this.createSuccess(input, {
					content: 'processed',
					metadata: {
						fileType: 'css',
						outputPath: cssResult.mainCSSPath,
						hash: cssResult.mainCSSHash,
					},
				})
			}

			if (isTS) {
				const jsResult = await this.buildOptimizedJS()
				this.processedFiles.add('js')

				return this.createSuccess(input, {
					content: 'processed',
					metadata: {
						fileType: 'js',
						outputPath: jsResult.mainJSPath,
						hash: jsResult.mainJSHash,
					},
				})
			}

			return this.createError(
				input,
				'Unsupported file type for asset optimization',
			)
		} catch (error) {
			console.error(
				`❌ AssetPlugin error processing ${input.filePath}:`,
				error,
			)
			return this.createError(
				input,
				`Failed to optimize asset: ${error.message}`,
			)
		}
	}

	/**
	 * Build all optimized assets at once
	 */
	public async buildAllAssets(): Promise<OptimizedAssets> {
		console.log('🔄 Building all optimized assets...')

		// Clean up old versioned assets first
		await this.cleanOldVersionedAssets()

		const [cssAssets, jsAssets] = await Promise.all([
			this.buildOptimizedCSS(),
			this.buildOptimizedJS(),
		])

		this.optimizedAssets = {
			css: cssAssets,
			js: jsAssets,
		}

		// Generate service worker with the hashes
		await this.generateServiceWorker(
			cssAssets.mainCSSHash,
			jsAssets.mainJSHash,
		)

		console.log('✨ Optimized assets built successfully!')
		return this.optimizedAssets
	}

	/**
	 * Get the current optimized assets
	 */
	public getOptimizedAssets(): OptimizedAssets | null {
		return this.optimizedAssets
	}

	/**
	 * Ensure assets directory exists
	 */
	private async ensureAssetsDir(): Promise<void> {
		try {
			await mkdir(ASSETS_DIR, { recursive: true })
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
				throw error
			}
		}
	}

	/**
	 * Clean up old versioned assets
	 */
	private async cleanOldVersionedAssets(): Promise<void> {
		try {
			const files = await readdir(ASSETS_DIR)
			const versionedFiles = files.filter(file =>
				/^main\.[a-f0-9]+\.(css|js|js\.map)$/.test(file),
			)

			if (versionedFiles.length > 0) {
				console.log(
					`🧹 Cleaning ${versionedFiles.length} old versioned assets...`,
				)
				await Promise.all(
					versionedFiles.map(file =>
						unlink(join(ASSETS_DIR, file)).catch(() => {
							// File might not exist, ignore
						}),
					),
				)
			}
		} catch (error) {
			// Directory might not exist yet, that's fine
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
				console.warn('⚠️ Warning: Could not clean old assets:', error)
			}
		}
	}

	/**
	 * Build CSS using lightningcss
	 */
	private async buildCSSWithLightning(): Promise<void> {
		console.log('🔄 Building CSS with lightningcss...')

		try {
			// Use the existing lightningcss command from package.json
			execSync(
				'lightningcss --minify --bundle --targets ">= 0.25%" docs-src/main.css -o ./docs/assets/main.css',
				{
					stdio: 'inherit',
				},
			)
			console.log('✅ CSS built with lightningcss')
		} catch (error) {
			// In test environments, lightningcss might not be available
			const isTestEnv =
				process.env.NODE_ENV === 'test' ||
				process.env.BUN_ENV === 'test'
			if (isTestEnv && error.status === 127) {
				console.warn(
					'⚠️ lightningcss not available in test environment, skipping CSS build',
				)
				return
			}
			console.error('❌ Failed to build CSS with lightningcss:', error)
			throw error
		}
	}

	/**
	 * Create optimized CSS assets
	 */
	private async buildOptimizedCSS(): Promise<{
		mainCSSPath: string
		mainCSSHash: string
	}> {
		await this.ensureAssetsDir()

		// First build the main CSS using lightningcss
		await this.buildCSSWithLightning()

		const originalCSSPath = join(ASSETS_DIR, 'main.css')
		const isTestEnv =
			process.env.NODE_ENV === 'test' || process.env.BUN_ENV === 'test'

		// In test environments, create a dummy CSS file if it doesn't exist
		if (isTestEnv && !existsSync(originalCSSPath)) {
			writeFileSync(originalCSSPath, '/* Test CSS */', 'utf8')
		}

		// Generate content hash for the main CSS file
		const mainCSSHash = generateAssetHash(originalCSSPath)

		// Create versioned filename for main CSS
		const versionedCSSPath = join(ASSETS_DIR, `main.${mainCSSHash}.css`)
		const mainCSSPath = `assets/main.${mainCSSHash}.css`

		// Copy main CSS to versioned filename
		execSync(`cp "${originalCSSPath}" "${versionedCSSPath}"`)

		console.log(`✅ Built versioned CSS: ${versionedCSSPath}`)

		return {
			mainCSSPath,
			mainCSSHash,
		}
	}

	/**
	 * Build JavaScript using bun
	 */
	private async buildJSWithBun(): Promise<void> {
		console.log('🔄 Building JS with bun...')

		try {
			// Use the existing bun command from package.json
			execSync(
				'bun build docs-src/main.ts --outdir ./docs/assets/ --minify --define process.env.DEV_MODE=false --sourcemap=external',
				{
					stdio: 'inherit',
				},
			)
			console.log('✅ JS built with bun')
		} catch (error) {
			const isTestEnv =
				process.env.NODE_ENV === 'test' ||
				process.env.BUN_ENV === 'test'
			if (isTestEnv) {
				console.warn('⚠️ Skipping JS build in test environment')
				return
			}
			console.error('❌ Failed to build JS with bun:', error)
			throw error
		}
	}

	/**
	 * Create optimized JS assets
	 */
	private async buildOptimizedJS(): Promise<{
		mainJSPath: string
		mainJSHash: string
	}> {
		await this.ensureAssetsDir()

		// First build the main JS using bun
		await this.buildJSWithBun()

		const originalJSPath = join(ASSETS_DIR, 'main.js')
		const isTestEnv =
			process.env.NODE_ENV === 'test' || process.env.BUN_ENV === 'test'

		// In test environments, create a dummy JS file if it doesn't exist
		if (isTestEnv && !existsSync(originalJSPath)) {
			writeFileSync(originalJSPath, '/* Test JS */', 'utf8')
		}

		// Generate content hash for the main JS file
		const mainJSHash = generateAssetHash(originalJSPath)

		// Create versioned filename for main JS
		const versionedJSPath = join(ASSETS_DIR, `main.${mainJSHash}.js`)
		const mainJSPath = `assets/main.${mainJSHash}.js`

		// Copy main JS to versioned filename
		execSync(`cp "${originalJSPath}" "${versionedJSPath}"`)

		// Also copy sourcemap if it exists
		try {
			const sourceMapPath = join(ASSETS_DIR, 'main.js.map')
			const versionedSourceMapPath = join(
				ASSETS_DIR,
				`main.${mainJSHash}.js.map`,
			)
			execSync(`cp "${sourceMapPath}" "${versionedSourceMapPath}"`)
			console.log(
				`✅ Built versioned JS sourcemap: ${versionedSourceMapPath}`,
			)
		} catch {
			// Sourcemap might not exist, that's okay
		}

		console.log(`✅ Built versioned JS: ${versionedJSPath}`)

		return {
			mainJSPath,
			mainJSHash,
		}
	}

	/**
	 * Generate service worker for advanced caching
	 */
	private async generateServiceWorker(
		cssHash: string,
		jsHash: string,
	): Promise<void> {
		const swContent = `// Le Truc Docs Service Worker
const CACHE_NAME = 'le-truc-docs-v${Date.now()}';

// Assets to cache on install
const STATIC_ASSETS = [
	'/',
	'/index.html',
	'/assets/main.${cssHash}.css',
	'/assets/main.${jsHash}.js',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(cache => cache.addAll(STATIC_ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys()
			.then(cacheNames => {
				return Promise.all(
					cacheNames
						.filter(cacheName => cacheName !== CACHE_NAME)
						.map(cacheName => caches.delete(cacheName))
				);
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;

	// Only handle GET requests
	if (request.method !== 'GET') return;

	// Skip cross-origin requests
	if (!request.url.startsWith(self.location.origin)) return;

	event.respondWith(
		caches.match(request)
			.then(cachedResponse => {
				if (cachedResponse) {
					return cachedResponse;
				}

				return fetch(request)
					.then(response => {
						// Don't cache non-successful responses
						if (!response.ok) return response;

						// Clone the response
						const responseToCache = response.clone();

						// Cache static assets
						if (request.url.includes('/assets/') || request.url.endsWith('.html')) {
							caches.open(CACHE_NAME)
								.then(cache => cache.put(request, responseToCache));
						}

						return response;
					});
			})
	);
});`

		const swPath = join('./docs', 'sw.js')
		await writeFile(swPath, swContent, 'utf8')
		console.log(`✅ Generated service worker: ${swPath}`)
	}

	public async cleanup(): Promise<void> {
		this.processedFiles.clear()
		this.optimizedAssets = null
		console.log(`🧹 Cleaned up ${this.name}`)
	}

	public async getDependencies(_filePath: string): Promise<string[]> {
		// CSS and JS assets don't typically have build-time dependencies
		// that we need to track for rebuild purposes
		return []
	}
}

import { execSync } from 'child_process'
import { mkdir, readdir, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { ASSETS_DIR, generateAssetHash } from './config'

// Clean up old versioned assets
const cleanOldVersionedAssets = async (): Promise<void> => {
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

// Ensure assets directory exists
const ensureAssetsDir = async (): Promise<void> => {
	try {
		await mkdir(ASSETS_DIR, { recursive: true })
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
			throw error
		}
	}
}

// Build CSS using lightningcss (leveraging existing setup)
const buildCSSWithLightning = async (): Promise<void> => {
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
		console.error('❌ Failed to build CSS with lightningcss:', error)
		throw error
	}
}

// Create optimized CSS assets
export const buildOptimizedCSS = async (): Promise<{
	mainCSSPath: string
	mainCSSHash: string
}> => {
	await ensureAssetsDir()

	// First build the main CSS using lightningcss
	await buildCSSWithLightning()

	const originalCSSPath = join(ASSETS_DIR, 'main.css')

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

// Build JavaScript using bun (leveraging existing setup)
const buildJSWithBun = async (): Promise<void> => {
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
		console.error('❌ Failed to build JS with bun:', error)
		throw error
	}
}

// Create optimized JS assets
export const buildOptimizedJS = async (): Promise<{
	mainJSPath: string
	mainJSHash: string
}> => {
	await ensureAssetsDir()

	// First build the main JS using bun
	await buildJSWithBun()

	const originalJSPath = join(ASSETS_DIR, 'main.js')

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

// Generate service worker for advanced caching
export const generateServiceWorker = async (
	cssHash: string,
	jsHash: string,
): Promise<void> => {
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

// Main build function
export const buildOptimizedAssets = async (): Promise<{
	css: {
		mainCSSPath: string
		mainCSSHash: string
	}
	js: {
		mainJSPath: string
		mainJSHash: string
	}
}> => {
	console.log('🔄 Building optimized assets...')

	// Clean up old versioned assets first
	await cleanOldVersionedAssets()

	const [cssAssets, jsAssets] = await Promise.all([
		buildOptimizedCSS(),
		buildOptimizedJS(),
	])

	// Generate service worker with the hashes
	await generateServiceWorker(cssAssets.mainCSSHash, jsAssets.mainJSHash)

	console.log('✨ Optimized assets built successfully!')

	return {
		css: cssAssets,
		js: jsAssets,
	}
}

if (import.meta.main) {
	buildOptimizedAssets().catch(console.error)
}

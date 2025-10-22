import { ServerWebSocket } from 'bun'
import { exec } from 'child_process'
import { watch } from 'fs/promises'
import { resolve } from 'path'
import { promisify } from 'util'
import { brotliCompressSync, gzipSync } from 'zlib'

const execAsync = promisify(exec)
const sockets = new Set<ServerWebSocket>()

// Track ongoing rebuilds to prevent duplicates
let isRebuilding = false
let pendingRebuild = false

// Function to rebuild docs and notify clients (now takes buildCommands)
async function rebuildDocs(
	buildCommands: string[] = ['build:docs-js', 'build:docs-html'],
) {
	if (isRebuilding) {
		pendingRebuild = true
		return
	}

	isRebuilding = true
	console.log(`\n🔄 Rebuilding docs with: ${buildCommands.join(', ')}`)
	const startTime = performance.now()

	try {
		for (const cmd of buildCommands) {
			console.log(`▶️ Running: bun run ${cmd}`)
			await execAsync(`bun run ${cmd}`)
		}
		const duration = (performance.now() - startTime).toFixed(2)
		console.log(`✨ Docs rebuilt successfully in ${duration}ms!`)

		// Notify all connected clients to reload
		sockets.forEach(socket => {
			socket.send('reload')
		})
	} catch (error) {
		console.error('❌ Error rebuilding docs:', error)
	} finally {
		isRebuilding = false
		if (pendingRebuild) {
			pendingRebuild = false
			setTimeout(() => rebuildDocs(buildCommands), 100)
		}
	}
}

// Track recent file changes to prevent duplicate processing
const fileDebounceTimers = new Map<string, NodeJS.Timeout>()
const FILE_DEBOUNCE_DELAY = 300 // ms

// Watch for changes in markdown files and components
async function watchDocs() {
	console.log(
		'👀 Watching for changes in docs-src/pages, docs-src/components, and src...',
	)

	// Define watch configurations
	const watchConfigs = [
		{
			path: 'docs-src/pages',
			extensions: ['.md'],
			label: '📝',
		},
		{
			path: 'docs-src/components',
			extensions: ['.ts', '.html', '.css'],
			label: '🔧',
		},
		{
			path: 'src',
			extensions: ['.ts'],
			label: '📦',
		},
	]

	// Map file changes to build commands
	function getBuildCommands(filePath: string): string[] {
		if (filePath.startsWith('docs-src/components/')) {
			if (filePath.endsWith('.ts')) return ['build:docs-js']
			if (filePath.endsWith('.css')) return ['build:docs-css']
			if (filePath.endsWith('.html')) return ['build:docs-html']
			if (filePath.endsWith('.md')) return ['build:docs-html']
		}
		if (
			filePath.startsWith('docs-src/pages/') &&
			filePath.endsWith('.md')
		) {
			return ['build:docs-html']
		}
		if (filePath.startsWith('src/') && filePath.endsWith('.ts')) {
			return ['build', 'build:docs-js', 'build:docs-api']
		}
		return []
	}

	// Generic file change handler
	const handleFileChange = async (
		event: any,
		config: (typeof watchConfigs)[0],
	) => {
		const filename = event.filename
		const eventType = event.eventType || event.type || 'unknown'
		if (
			!filename ||
			!config.extensions.some(ext => filename.endsWith(ext))
		) {
			return
		}

		// Use absolute file path as debounce key
		const absFilePath = `${config.path}/${filename}`
		const debounceKey = absFilePath

		if (fileDebounceTimers.has(debounceKey)) {
			clearTimeout(fileDebounceTimers.get(debounceKey))
		}
		fileDebounceTimers.set(
			debounceKey,
			setTimeout(async () => {
				fileDebounceTimers.delete(debounceKey)
				const buildCommands = getBuildCommands(absFilePath)
				console.log(
					`\n${config.label} Debounced change [${eventType}]: ${absFilePath}`,
				)
				if (buildCommands.length === 0) {
					console.log('⚠️ No build command mapped for this change.')
					return
				}
				console.log(`🔨 Will run: ${buildCommands.join(', ')}`)
				await rebuildDocs(buildCommands)
			}, FILE_DEBOUNCE_DELAY),
		)
	}

	// Start all watchers (one per directory)
	const watchers = watchConfigs.map(config =>
		(async () => {
			const watcher = watch(config.path, { recursive: true })
			for await (const event of watcher) {
				await handleFileChange(event, config)
			}
		})(),
	)

	Promise.all(watchers).catch(console.error)
}

// Start the watcher
watchDocs().catch(console.error)

const server = Bun.serve({
	port: 3000,
	websocket: {
		open(ws: ServerWebSocket) {
			console.log('🔌 Client connected')
			sockets.add(ws)
		},
		close(ws: ServerWebSocket) {
			console.log('🔌 Client disconnected')
			sockets.delete(ws)
		},
		message(_ws: ServerWebSocket, message: string) {
			console.log('📨 Received message:', message)
		},
	},
	async fetch(req) {
		const url = new URL(req.url)
		const path = url.pathname

		// Handle WebSocket upgrade
		if (path === '/ws') {
			const upgraded = server.upgrade(req)
			if (!upgraded) {
				return new Response('Upgrade failed', { status: 400 })
			}
			return new Response()
		}

		// Handle Chrome DevTools workspace configuration
		if (path === '/.well-known/appspecific/com.chrome.devtools.json') {
			const projectRoot = resolve('.')
			const config = {
				version: 1,
				workspace: {
					root: projectRoot,
					uuid: 'le-truc-docs-workspace',
				},
			}

			return new Response(JSON.stringify(config, null, 2), {
				headers: {
					'Content-Type': 'application/json; charset=UTF-8',
					'X-Content-Type-Options': 'nosniff',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
				},
			})
		}

		// Check if client accepts compression (moved up before HTML handling)
		const acceptEncoding = req.headers.get('accept-encoding') || ''
		const supportsGzip = acceptEncoding.includes('gzip')
		const supportsBrotli = acceptEncoding.includes('br')

		// Inject the reload script into HTML responses
		if (path.endsWith('.html') || path === '/') {
			try {
				let content = await Bun.file(
					`./docs${path === '/' ? '/index.html' : path}`,
				).text()
				const reloadScript = `
					<script>
						const ws = new WebSocket('ws://' + window.location.host + '/ws');
						ws.onmessage = (event) => {
							if (event.data === 'reload') {
								console.log('🔄 Reloading page...');
								window.location.reload();
							}
						};
					</script>
				`
				content = content.replace('</body>', `${reloadScript}</body>`)

				// Apply compression for HTML content
				const headers: HeadersInit = {
					'Content-Type': 'text/html; charset=UTF-8',
					'X-Content-Type-Options': 'nosniff',
				}

				if (supportsBrotli) {
					const compressed = brotliCompressSync(
						Buffer.from(content, 'utf8'),
					)
					return new Response(compressed, {
						headers: {
							...headers,
							'Content-Encoding': 'br',
							Vary: 'Accept-Encoding',
						},
					})
				} else if (supportsGzip) {
					const compressed = gzipSync(Buffer.from(content, 'utf8'))
					return new Response(compressed, {
						headers: {
							...headers,
							'Content-Encoding': 'gzip',
							Vary: 'Accept-Encoding',
						},
					})
				}

				return new Response(content, { headers })
			} catch (error) {
				console.warn(`⚠️ Not found: ${path}, Error: ${error.message}`)
				return new Response('Fallback response')
			}
		}

		// Handle source file serving for DevTools workspace sync
		if (path.startsWith('/src/') || path.startsWith('/docs-src/')) {
			try {
				const filePath = `.${path}`
				const file = Bun.file(filePath)

				// Determine content type for source files
				const getSourceType = (path: string) => {
					const ext = path.split('.').pop()
					switch (ext) {
						case 'ts':
							return 'application/typescript; charset=UTF-8'
						case 'js':
							return 'application/javascript; charset=UTF-8'
						case 'css':
							return 'text/css; charset=UTF-8'
						case 'html':
							return 'text/html; charset=UTF-8'
						case 'md':
							return 'text/markdown; charset=UTF-8'
						case 'json':
							return 'application/json; charset=UTF-8'
						default:
							return 'text/plain; charset=UTF-8'
					}
				}

				const headers: HeadersInit = {
					'Content-Type': getSourceType(path),
					'X-Content-Type-Options': 'nosniff',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
				}

				return new Response(await file.bytes(), { headers })
			} catch {
				console.warn(`⚠️ Source file not found: ${path}`)
				return new Response('Source file not found', { status: 404 })
			}
		}

		// Handle other static files
		const type = (path: string) => {
			const ext = path.split('.').pop()
			switch (ext) {
				case 'js':
					return 'application/javascript; charset=UTF-8'
				case 'css':
					return 'text/css; charset=UTF-8'
				case 'json':
					return 'application/json; charset=UTF-8'
				case 'png':
					return 'image/png'
				default:
					return 'text/html; charset=UTF-8'
			}
		}

		// Generate cache headers based on path
		const getCacheHeaders = (path: string): Record<string, string> => {
			// Check if this is a versioned asset (contains hash)
			const isVersionedAsset =
				/\.(css|js)\?v=[a-f0-9]+$/.test(path) ||
				/\/main\.[a-f0-9]+\.(css|js)$/.test(path)

			if (isVersionedAsset) {
				// Long cache for versioned assets (1 year)
				return {
					'Cache-Control': 'public, max-age=31536000, immutable',
					'X-Content-Type-Options': 'nosniff',
				}
			}

			// Check if this is an asset in /assets/ directory
			if (path.startsWith('/assets/')) {
				return {
					'Cache-Control': 'public, max-age=31536000, immutable',
					'X-Content-Type-Options': 'nosniff',
				}
			}

			// Default headers for other files
			return {
				'X-Content-Type-Options': 'nosniff',
			}
		}

		try {
			if (!path.match(/\.(js|css|png|ico)$/)) {
				console.log(`🌐 Serving: ${path}`)
			}

			const cacheHeaders = getCacheHeaders(path)
			const headers: HeadersInit = {
				'Content-Type': type(path),
				...cacheHeaders,
			}

			// Check if file should be compressed (text files)
			const shouldCompress =
				path.match(/\.(html|css|js|json|xml|txt|md)$/) ||
				type(path).startsWith('text/') ||
				type(path).includes('javascript') ||
				type(path).includes('json')

			if (shouldCompress && (supportsBrotli || supportsGzip)) {
				const fileContent = await Bun.file(`./docs${path}`).bytes()

				if (supportsBrotli) {
					const compressed = brotliCompressSync(fileContent)
					return new Response(compressed, {
						headers: {
							...headers,
							'Content-Encoding': 'br',
							Vary: 'Accept-Encoding',
						},
					})
				} else if (supportsGzip) {
					const compressed = gzipSync(fileContent)
					return new Response(compressed, {
						headers: {
							...headers,
							'Content-Encoding': 'gzip',
							Vary: 'Accept-Encoding',
						},
					})
				}
			}

			return new Response(await Bun.file(`./docs${path}`).bytes(), {
				headers,
			})
		} catch (error) {
			console.warn(`⚠️ Not found: ${path}, Error: ${error.message}`)
			return new Response('Fallback response')
		}
	},
})

console.log(`\n🚀 Server started at http://localhost:${server.port}`)
console.log('♨️  Hot Module Reloading is enabled\n')

export {}

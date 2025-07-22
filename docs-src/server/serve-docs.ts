import { exec } from 'child_process'
import { promisify } from 'util'
import { ServerWebSocket } from 'bun'
import { watch } from 'fs/promises'

const execAsync = promisify(exec)
const sockets = new Set<ServerWebSocket>()

// Track ongoing rebuilds to prevent duplicates
let isRebuilding = false
let pendingRebuild = false

// Function to rebuild docs and notify clients (now takes buildCommands)
async function rebuildDocs(
	buildCommands: string[] = ['build:docs-js', 'build:docs-html']
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
		'👀 Watching for changes in docs-src/pages, docs-src/components, and src...'
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
		config: (typeof watchConfigs)[0]
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
				console.log(`\n${config.label} Debounced change [${eventType}]: ${absFilePath}`)
				if (buildCommands.length === 0) {
					console.log('⚠️ No build command mapped for this change.')
					return
				}
				console.log(`🔨 Will run: ${buildCommands.join(', ')}`)
				await rebuildDocs(buildCommands)
			}, FILE_DEBOUNCE_DELAY)
		)
	}

	// Start all watchers (one per directory)
	const watchers = watchConfigs.map(config =>
		(async () => {
			const watcher = watch(config.path, { recursive: true })
			for await (const event of watcher) {
				await handleFileChange(event, config)
			}
		})()
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

		// Inject the reload script into HTML responses
		if (path.endsWith('.html') || path === '/') {
			try {
				let content = await Bun.file(
					`./docs${path === '/' ? '/index.html' : path}`
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
				return new Response(content, {
					headers: { 'Content-Type': 'text/html; charset=UTF-8' },
				})
			} catch (error) {
				console.warn(`⚠️ Not found: ${path}, Error: ${error.message}`)
				return new Response('Fallback response')
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
				case 'png':
					return 'image/png'
				default:
					return 'text/html; charset=UTF-8'
			}
		}

		try {
			if (!path.match(/\.(js|css|png|ico)$/)) {
				console.log(`🌐 Serving: ${path}`)
			}
			return new Response(await Bun.file(`./docs${path}`).bytes(), {
				headers: { 'Content-Type': type(path) },
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

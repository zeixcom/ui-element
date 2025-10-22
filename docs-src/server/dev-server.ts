/**
 * Development Server leveraging Bun 1.3's new frontend capabilities
 */

import { ServerWebSocket } from 'bun'
import { exec } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'
import { brotliCompressSync, gzipSync } from 'zlib'
import { EventEmitter } from './event-emitter.js'
import { ModularSSG } from './modular-ssg.js'
import { SmartFileWatcher } from './smart-file-watcher.js'
import type {
	DevServerConfig,
	IEventEmitter,
	RequestContext,
	ResponseOptions,
	ServerContext,
} from './types.js'

const execAsync = promisify(exec)

/**
 * Development Server with Bun 1.3 features
 */
export class DevServer {
	private server: any = null
	private context: ServerContext
	private eventEmitter: IEventEmitter = new EventEmitter()

	constructor(private config: DevServerConfig) {
		this.context = {
			config,
			sockets: new Set<ServerWebSocket>(),
			buildSystem: new ModularSSG(config, this.eventEmitter),
			watcher: new SmartFileWatcher(config, this.eventEmitter),
			isRebuilding: false,
			pendingRebuild: false,
		}

		this.setupEventHandlers()
	}

	/**
	 * Start the development server
	 */
	public async start(): Promise<void> {
		try {
			console.log('🚀 Starting Development Server with Bun 1.3...')

			// Start file watcher
			await this.context.watcher.start()

			// Create Bun server with enhanced features
			this.server = Bun.serve({
				port: this.config.server.port,
				hostname: this.config.server.host,
				development: this.config.server.development,

				// WebSocket configuration
				websocket: {
					open: (ws: ServerWebSocket) => this.handleWebSocketOpen(ws),
					close: (ws: ServerWebSocket) =>
						this.handleWebSocketClose(ws),
					message: (ws: ServerWebSocket, message: string) =>
						this.handleWebSocketMessage(ws, message),
				},

				// Request handler
				fetch: (req: Request) => this.handleRequest(req),
			})

			console.log(
				`✅ Server started at http://${this.config.server.host}:${this.config.server.port}`,
			)
			console.log('♨️  Hot Module Reloading is enabled')
			console.log(`📁 Serving from: ${this.config.paths.output}`)

			this.eventEmitter.emit('server:ready', {
				port: this.config.server.port,
				host: this.config.server.host || 'localhost',
			})
		} catch (error) {
			console.error('❌ Failed to start server:', error)
			this.eventEmitter.emit('server:error', {
				error: error as any,
			})
			throw error
		}
	}

	/**
	 * Stop the development server
	 */
	public async stop(): Promise<void> {
		console.log('🛑 Stopping development server...')

		try {
			// Stop file watcher
			await this.context.watcher.stop()

			// Close all WebSocket connections
			for (const socket of this.context.sockets) {
				socket.close()
			}
			this.context.sockets.clear()

			// Stop server
			if (this.server) {
				this.server.stop?.()
				this.server = null
			}

			console.log('✅ Server stopped')
		} catch (error) {
			console.error('❌ Error stopping server:', error)
			throw error
		}
	}

	/**
	 * Get server statistics
	 */
	public getStats() {
		return {
			server: {
				isRunning: !!this.server,
				port: this.config.server.port,
				connectedClients: this.context.sockets.size,
			},
			watcher: {
				watchedPaths: this.context.watcher.getWatchedPaths().length,
				isActive: this.context.watcher.isWatching(),
			},
			buildSystem: {
				pluginCount: this.context.buildSystem.getPlugins().length,
			},
		}
	}

	/**
	 * Setup event handlers
	 */
	private setupEventHandlers(): void {
		this.eventEmitter.on('file:changed', async ({ buildCommands }) => {
			await this.handleFileChange(buildCommands)
		})

		this.eventEmitter.on('build:complete', ({ duration }) => {
			console.log(
				`✨ Build completed successfully in ${duration.toFixed(2)}ms`,
			)
			this.notifyClients('reload')
		})

		this.eventEmitter.on('build:error', ({ error, files }) => {
			console.error('❌ Build failed:', error.message)
			this.notifyClients('build-error', {
				message: error.message,
				files,
			})
		})

		this.eventEmitter.on('client:connected', ({ clientCount }) => {
			console.log(`🔌 Client connected (${clientCount} total)`)
		})

		this.eventEmitter.on('client:disconnected', ({ clientCount }) => {
			console.log(`🔌 Client disconnected (${clientCount} remaining)`)
		})
	}

	/**
	 * Handle WebSocket connections
	 */
	private handleWebSocketOpen(ws: ServerWebSocket): void {
		this.context.sockets.add(ws)
		this.eventEmitter.emit('client:connected', {
			socket: ws,
			clientCount: this.context.sockets.size,
		})
	}

	/**
	 * Handle WebSocket disconnections
	 */
	private handleWebSocketClose(ws: ServerWebSocket): void {
		this.context.sockets.delete(ws)
		this.eventEmitter.emit('client:disconnected', {
			socket: ws,
			clientCount: this.context.sockets.size,
		})
	}

	/**
	 * Handle WebSocket messages
	 */
	private handleWebSocketMessage(ws: ServerWebSocket, message: string): void {
		try {
			const data = JSON.parse(message)
			console.log('📨 WebSocket message:', data)

			// Handle different message types
			switch (data.type) {
				case 'ping':
					ws.send(
						JSON.stringify({ type: 'pong', timestamp: Date.now() }),
					)
					break
				case 'build-request':
					this.handleBuildRequest(data.files || [])
					break
				default:
					console.warn(
						'⚠️  Unknown WebSocket message type:',
						data.type,
					)
			}
		} catch (error) {
			console.warn('⚠️  Invalid WebSocket message:', message, error)
		}
	}

	/**
	 * Handle HTTP requests
	 */
	private async handleRequest(req: Request): Promise<Response> {
		const context = this.createRequestContext(req)

		try {
			// Handle WebSocket upgrade
			if (context.path === '/ws') {
				const success = this.server.upgrade(req)
				if (success) {
					return new Response()
				}
				return new Response('WebSocket upgrade failed', { status: 400 })
			}

			// Handle Chrome DevTools workspace configuration
			if (
				context.path ===
				'/.well-known/appspecific/com.chrome.devtools.json'
			) {
				return this.handleDevToolsConfig()
			}

			// Handle source file serving for debugging
			if (this.isSourcePath(context.path)) {
				return this.handleSourceFile(context)
			}

			// Handle HTML files with HMR injection
			if (this.isHTMLPath(context.path)) {
				return this.handleHTMLFile(context)
			}

			// Handle static assets
			return this.handleStaticFile(context)
		} catch (error) {
			console.error(`❌ Request error for ${context.path}:`, error)
			return this.createErrorResponse(error, context)
		}
	}

	/**
	 * Create request context from HTTP request
	 */
	private createRequestContext(req: Request): RequestContext {
		const url = new URL(req.url)
		const acceptEncoding = req.headers.get('accept-encoding') || ''

		return {
			url,
			path: url.pathname,
			method: req.method,
			headers: req.headers,
			acceptsGzip: acceptEncoding.includes('gzip'),
			acceptsBrotli: acceptEncoding.includes('br'),
		}
	}

	/**
	 * Handle Chrome DevTools configuration
	 */
	private handleDevToolsConfig(): Response {
		const config = {
			version: 1,
			workspace: {
				root: process.cwd(),
				uuid: 'ui-element-docs-workspace',
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

	/**
	 * Handle source file requests for debugging
	 */
	private async handleSourceFile(context: RequestContext): Promise<Response> {
		const filePath = resolve(`.${context.path}`)

		if (!existsSync(filePath)) {
			return new Response('Source file not found', { status: 404 })
		}

		try {
			const file = Bun.file(filePath)
			const content = await file.bytes()

			return new Response(content, {
				headers: {
					'Content-Type': this.getSourceContentType(context.path),
					'X-Content-Type-Options': 'nosniff',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
				},
			})
		} catch (_error) {
			return new Response('Error reading source file', { status: 500 })
		}
	}

	/**
	 * Handle HTML files with HMR injection
	 */
	private async handleHTMLFile(context: RequestContext): Promise<Response> {
		const filePath = resolve(
			this.config.paths.output,
			context.path === '/' ? 'index.html' : context.path.slice(1),
		)

		if (!existsSync(filePath)) {
			return new Response('Page not found', { status: 404 })
		}

		try {
			let content = await Bun.file(filePath).text()

			// Inject HMR script
			const hmrScript = this.generateHMRScript()
			content = content.replace('</body>', `${hmrScript}</body>`)

			return this.createResponse(content, context, {
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
					'X-Content-Type-Options': 'nosniff',
				},
				cache: 'no-cache',
			})
		} catch (_error) {
			return new Response('Error reading HTML file', { status: 500 })
		}
	}

	/**
	 * Handle static file serving
	 */
	private async handleStaticFile(context: RequestContext): Promise<Response> {
		const filePath = resolve(
			this.config.paths.output,
			context.path.slice(1),
		)

		if (!existsSync(filePath)) {
			return new Response('File not found', { status: 404 })
		}

		try {
			const file = Bun.file(filePath)
			const content = await file.bytes()

			const isVersionedAsset = this.isVersionedAsset(context.path)
			const cacheControl = isVersionedAsset ? 'immutable' : 'default'

			return this.createResponse(content, context, {
				headers: {
					'Content-Type': this.getContentType(context.path),
					'X-Content-Type-Options': 'nosniff',
				},
				cache: cacheControl,
			})
		} catch (_error) {
			return new Response('Error reading file', { status: 500 })
		}
	}

	/**
	 * Create HTTP response with compression and caching
	 */
	private createResponse(
		content: string | Uint8Array,
		context: RequestContext,
		options: ResponseOptions = {},
	): Response {
		const buffer =
			typeof content === 'string'
				? Buffer.from(content, 'utf8')
				: Buffer.from(content)

		const headers = new Headers(options.headers || {})

		// Apply caching headers
		this.applyCacheHeaders(headers, context.path, options.cache)

		// Apply compression if supported and beneficial
		if (this.shouldCompress(context.path, buffer.length)) {
			if (
				options.compression !== 'none' &&
				context.acceptsBrotli &&
				this.config.assets.compression.brotli
			) {
				const compressed = brotliCompressSync(buffer)
				headers.set('Content-Encoding', 'br')
				headers.set('Vary', 'Accept-Encoding')
				return new Response(compressed, {
					status: options.status || 200,
					headers,
				})
			} else if (
				options.compression !== 'none' &&
				context.acceptsGzip &&
				this.config.assets.compression.gzip
			) {
				const compressed = gzipSync(buffer)
				headers.set('Content-Encoding', 'gzip')
				headers.set('Vary', 'Accept-Encoding')
				return new Response(compressed, {
					status: options.status || 200,
					headers,
				})
			}
		}

		return new Response(buffer, {
			status: options.status || 200,
			headers,
		})
	}

	/**
	 * Create error response
	 */
	private createErrorResponse(
		error: any,
		_context: RequestContext,
	): Response {
		const message = `Server Error: ${error.message || 'Unknown error'}`
		return new Response(message, {
			status: 500,
			headers: {
				'Content-Type': 'text/plain; charset=UTF-8',
			},
		})
	}

	/**
	 * Apply appropriate cache headers
	 */
	private applyCacheHeaders(
		headers: Headers,
		path: string,
		cacheMode?: string,
	): void {
		if (cacheMode === 'no-cache') {
			headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
		} else if (cacheMode === 'immutable' || this.isVersionedAsset(path)) {
			headers.set(
				'Cache-Control',
				`public, max-age=${this.config.build.cacheMaxAge}, immutable`,
			)
		}
		// Default: no explicit cache headers for development
	}

	/**
	 * Generate HMR script for client-side reloading
	 */
	private generateHMRScript(): string {
		return `
<script>
(function() {
	console.log('🔥 HMR Client initialized');

	const ws = new WebSocket('ws://' + window.location.host + '/ws');
	let reconnectAttempts = 0;
	const maxReconnectAttempts = 5;

	ws.onopen = function() {
		console.log('🔌 Connected to dev server');
		reconnectAttempts = 0;
	};

	ws.onmessage = function(event) {
		const data = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);

		if (data === 'reload') {
			console.log('🔄 Reloading page...');
			window.location.reload();
		} else {
			try {
				const parsed = JSON.parse(data);
				if (parsed.type === 'build-error') {
					console.error('❌ Build error:', parsed.message);
					// Could show an overlay or notification here
				}
			} catch (e) {
				// Ignore non-JSON messages
			}
		}
	};

	ws.onclose = function() {
		console.log('🔌 Disconnected from dev server');
		if (reconnectAttempts < maxReconnectAttempts) {
			setTimeout(() => {
				console.log('🔄 Attempting to reconnect...');
				reconnectAttempts++;
				location.reload();
			}, 1000 * Math.pow(2, reconnectAttempts));
		}
	};

	ws.onerror = function(error) {
		console.error('❌ WebSocket error:', error);
	};

	// Send periodic ping to keep connection alive
	setInterval(() => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: 'ping' }));
		}
	}, 30000);
})();
</script>
`
	}

	/**
	 * Handle file changes by triggering builds
	 */
	private async handleFileChange(buildCommands: string[]): Promise<void> {
		if (this.context.isRebuilding) {
			this.context.pendingRebuild = true
			return
		}

		this.context.isRebuilding = true
		const startTime = performance.now()

		try {
			this.eventEmitter.emit('build:start', {
				files: ['changed'],
				commands: buildCommands,
			})

			console.log(
				`🔄 Executing build commands: ${buildCommands.join(', ')}`,
			)

			for (const command of buildCommands) {
				console.log(`▶️  Running: bun run ${command}`)
				await execAsync(`bun run ${command}`)
			}

			const duration = performance.now() - startTime
			this.eventEmitter.emit('build:complete', {
				results: [],
				duration,
			})
		} catch (error) {
			this.eventEmitter?.emit('build:error', {
				error: error as any,
				files: [],
			})
		} finally {
			this.context.isRebuilding = false
			if (this.context.pendingRebuild) {
				this.context.pendingRebuild = false
				// Re-trigger with a small delay
				setTimeout(() => this.handleFileChange(buildCommands), 100)
			}
		}
	}

	/**
	 * Handle manual build requests
	 */
	private async handleBuildRequest(files: string[]): Promise<void> {
		if (files.length === 0) {
			console.log('🔧 Manual full build requested')
			await this.handleFileChange([
				'build:docs-js',
				'build:docs-css',
				'build:docs-html',
			])
		} else {
			console.log(`🔧 Manual build requested for: ${files.join(', ')}`)
			// Determine build commands for specific files
			// This would be more sophisticated in a real implementation
			await this.handleFileChange(['build:docs-html'])
		}
	}

	/**
	 * Notify all connected clients
	 */
	private notifyClients(type: string, data?: any): void {
		const message = JSON.stringify({ type, ...data })
		let notified = 0

		for (const socket of this.context.sockets) {
			try {
				socket.send(type === 'reload' ? 'reload' : message)
				notified++
			} catch (error) {
				console.warn('⚠️  Failed to notify client:', error)
				this.context.sockets.delete(socket)
			}
		}

		if (notified > 0) {
			console.log(`📡 Notified ${notified} clients`)
		}
	}

	/**
	 * Utility methods
	 */

	private isSourcePath(path: string): boolean {
		return path.startsWith('/src/') || path.startsWith('/docs-src/')
	}

	private isHTMLPath(path: string): boolean {
		return path.endsWith('.html') || path === '/'
	}

	private isVersionedAsset(path: string): boolean {
		return (
			/\.(css|js)\?v=[a-f0-9]+$/.test(path) ||
			/\/main\.[a-f0-9]+\.(css|js)$/.test(path) ||
			path.startsWith('/assets/')
		)
	}

	private shouldCompress(path: string, size: number): boolean {
		// Only compress if compression is enabled and file is large enough
		if (!this.config.assets.compression.enabled || size < 1024) {
			return false
		}

		return !!(
			path.match(/\.(html|css|js|json|xml|txt|md|svg)$/) ||
			this.getContentType(path).includes('text/') ||
			this.getContentType(path).includes('application/json') ||
			this.getContentType(path).includes('application/javascript')
		)
	}

	private getContentType(path: string): string {
		const ext = path.split('.').pop()?.toLowerCase()
		switch (ext) {
			case 'html':
				return 'text/html; charset=UTF-8'
			case 'css':
				return 'text/css; charset=UTF-8'
			case 'js':
				return 'application/javascript; charset=UTF-8'
			case 'json':
				return 'application/json; charset=UTF-8'
			case 'png':
				return 'image/png'
			case 'jpg':
			case 'jpeg':
				return 'image/jpeg'
			case 'svg':
				return 'image/svg+xml'
			case 'woff':
				return 'font/woff'
			case 'woff2':
				return 'font/woff2'
			default:
				return 'text/plain; charset=UTF-8'
		}
	}

	private getSourceContentType(path: string): string {
		const ext = path.split('.').pop()?.toLowerCase()
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
}

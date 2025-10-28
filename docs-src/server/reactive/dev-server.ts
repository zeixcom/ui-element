/**
 * Reactive Development Server - Phase 2
 * Enhanced dev server with full Cause & Effect integration
 */

import { effect } from '@zeix/cause-effect'
import { ServerWebSocket, serve } from 'bun'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { DEFAULT_CONFIG, OUTPUT_DIR } from './config'
import { ConfigManager } from './config-manager'
import { EventEmitter } from './event-emitter'
import { FileWatcher } from './file-watcher'
import { PluginManager } from './plugins'
import { AssetPlugin } from './plugins/asset-plugin'
import { FragmentPlugin } from './plugins/fragment-plugin'
import { MarkdownPlugin } from './plugins/markdown-plugin'
import { createFileProcessor, createFileSystemSignals } from './signals'
import type { DevServerConfig, FileProcessor, FileSystemSignals } from './types'

/**
 * Enhanced Reactive Development Server
 * Integrates all Phase 2 reactive components with HMR and WebSocket communication
 */
export class DevServer {
	private config: DevServerConfig
	private signals: FileSystemSignals
	private processor: FileProcessor
	private pluginManager: PluginManager
	private eventEmitter: EventEmitter
	private fileWatcher: FileWatcher | null = null
	private server: any = null
	private clients = new Set<ServerWebSocket>()
	private effectCleanup: (() => void) | null = null

	constructor(config?: Partial<DevServerConfig>) {
		this.config = { ...DEFAULT_CONFIG, ...config }
		this.eventEmitter = new EventEmitter()

		// Initialize reactive architecture
		this.signals = createFileSystemSignals({ config: this.config })
		this.processor = createFileProcessor(this.signals)
		this.pluginManager = new PluginManager()

		console.log('🚀 Reactive Development Server initialized')
	}

	async start(): Promise<void> {
		console.log('⚙️ Starting reactive development server...')

		try {
			// Initialize plugins
			await this.initializePlugins()

			// Set up file watcher
			await this.setupFileWatcher()

			// Set up reactive effects
			this.setupReactiveEffects()

			// Start HTTP server
			await this.startServer()

			console.log(
				`✅ Reactive dev server running at http://${this.config.server.host}:${this.config.server.port}`,
			)
		} catch (error) {
			console.error('❌ Failed to start reactive dev server:', error)
			throw error
		}
	}

	async stop(): Promise<void> {
		console.log('🛑 Stopping reactive development server...')

		// Clean up effects
		if (this.effectCleanup) {
			this.effectCleanup()
			this.effectCleanup = null
		}

		// Stop file watcher
		if (this.fileWatcher) {
			await this.fileWatcher.stop()
			this.fileWatcher = null
		}

		// Close all client connections
		for (const client of this.clients) {
			client.close()
		}
		this.clients.clear()

		// Stop HTTP server
		if (this.server) {
			this.server.stop()
			this.server = null
		}

		// Clean up plugins
		await this.pluginManager.cleanupPlugins()

		console.log('✅ Reactive dev server stopped')
	}

	private async initializePlugins(): Promise<void> {
		console.log('📦 Initializing reactive plugins...')

		// Register reactive plugins
		this.pluginManager.registerPlugin(new MarkdownPlugin())
		this.pluginManager.registerPlugin(new FragmentPlugin())
		this.pluginManager.registerPlugin(new AssetPlugin())

		// Initialize all plugins
		await this.pluginManager.initializePlugins(
			this.config,
			this.signals,
			this.processor,
		)

		console.log('✅ Reactive plugins initialized')
	}

	private async setupFileWatcher(): Promise<void> {
		this.fileWatcher = new FileWatcher(
			this.config,
			this.eventEmitter,
			this.processor,
			this.signals,
		)

		// Set up event handlers
		this.eventEmitter.on('file:changed', async ({ event }) => {
			console.log(`📝 File changed: ${event.filePath}`)

			// Process file change through plugin manager
			await this.pluginManager.processFileChange(event)

			// Notify clients of changes
			this.notifyClients({
				type: 'file-changed',
				data: {
					filePath: event.filePath,
					eventType: event.eventType,
					timestamp: event.timestamp,
				},
			})
		})

		await this.fileWatcher.start()
		console.log('👀 Reactive file watcher started')
	}

	private setupReactiveEffects(): void {
		const cleanupFunctions: (() => void)[] = []

		// Effect: Hot reload CSS when assets change
		cleanupFunctions.push(
			effect({
				ok: (assets): undefined => {
					if (assets?.css) {
						this.notifyClients({
							type: 'css-updated',
							data: {
								cssHash: assets.css.mainCSSHash,
								timestamp: Date.now(),
							},
						})
						console.log(
							`🎨 CSS updated: ${assets.css.mainCSSHash.slice(0, 8)}...`,
						)
					}
				},
				err: (error): undefined => {
					console.error('❌ Asset update error:', error.message)
					this.notifyClients({
						type: 'error',
						data: {
							message: `Asset error: ${error.message}`,
							timestamp: Date.now(),
						},
					})
				},
				signals: [this.signals.optimizedAssets],
			}),
		)

		// Effect: Full reload when pages change
		cleanupFunctions.push(
			effect({
				ok: (pages): undefined => {
					this.notifyClients({
						type: 'pages-updated',
						data: {
							pageCount: pages.length,
							timestamp: Date.now(),
						},
					})
					console.log(`📄 Pages updated: ${pages.length} total`)
				},
				err: (error): undefined => {
					console.error('❌ Page processing error:', error.message)
					this.notifyClients({
						type: 'error',
						data: {
							message: `Page error: ${error.message}`,
							timestamp: Date.now(),
						},
					})
				},
				signals: [this.signals.processedPages],
			}),
		)

		// Effect: Update navigation when menu changes
		cleanupFunctions.push(
			effect({
				ok: (menu): undefined => {
					this.notifyClients({
						type: 'menu-updated',
						data: {
							menuLength: menu.length,
							timestamp: Date.now(),
						},
					})
				},
				err: (error): undefined => {
					console.error('❌ Menu generation error:', error.message)
				},
				signals: [this.signals.navigationMenu],
			}),
		)

		this.effectCleanup = () => {
			cleanupFunctions.forEach(cleanup => cleanup())
		}

		console.log('⚡ Reactive effects configured')
	}

	private async startServer(): Promise<void> {
		this.server = serve({
			port: this.config.server.port,
			hostname: this.config.server.host,

			fetch: async (request, server) => {
				const url = new URL(request.url)

				// Handle WebSocket upgrades
				if (server.upgrade(request)) {
					return
				}

				// Handle static file requests
				return await this.handleRequest(url)
			},

			websocket: {
				open: ws => {
					this.clients.add(ws)
					console.log(
						`🔌 Client connected (${this.clients.size} total)`,
					)

					// Send initial state
					ws.send(
						JSON.stringify({
							type: 'connected',
							data: {
								message: 'Connected to reactive dev server',
								timestamp: Date.now(),
							},
						}),
					)
				},

				close: ws => {
					this.clients.delete(ws)
					console.log(
						`🔌 Client disconnected (${this.clients.size} total)`,
					)
				},

				message: (ws, message) => {
					try {
						const data = JSON.parse(message.toString())
						this.handleWebSocketMessage(ws, data)
					} catch (error) {
						console.error('❌ Invalid WebSocket message:', error)
					}
				},
			},
		})

		console.log(
			`🌐 HTTP server started on ${this.config.server.host}:${this.config.server.port}`,
		)
	}

	private async handleRequest(url: URL): Promise<Response> {
		const pathname = url.pathname === '/' ? '/index.html' : url.pathname

		try {
			// Serve static files from output directory
			const filePath = join(OUTPUT_DIR, pathname.substring(1))
			const content = await readFile(filePath)

			// Determine content type
			const contentType = this.getContentType(pathname)

			// Add cache headers for assets
			const headers: HeadersInit = {
				'Content-Type': contentType,
			}

			if (pathname.includes('/assets/')) {
				headers['Cache-Control'] = 'public, max-age=31536000'
			} else {
				headers['Cache-Control'] = 'no-cache'
			}

			return new Response(content, { headers })
		} catch (_error) {
			// Return 404 for missing files
			return new Response('Not Found', { status: 404 })
		}
	}

	private handleWebSocketMessage(ws: ServerWebSocket, message: any): void {
		switch (message.type) {
			case 'ping':
				ws.send(
					JSON.stringify({
						type: 'pong',
						data: { timestamp: Date.now() },
					}),
				)
				break

			case 'get-stats': {
				const stats = this.getServerStats()
				ws.send(
					JSON.stringify({
						type: 'stats',
						data: stats,
					}),
				)
				break
			}

			default:
				console.warn('❓ Unknown WebSocket message type:', message.type)
		}
	}

	private notifyClients(message: any): void {
		const messageStr = JSON.stringify(message)
		for (const client of this.clients) {
			try {
				client.send(messageStr)
			} catch (error) {
				console.warn('⚠️ Failed to send message to client:', error)
				this.clients.delete(client)
			}
		}
	}

	private getContentType(pathname: string): string {
		if (pathname.endsWith('.html')) return 'text/html'
		if (pathname.endsWith('.css')) return 'text/css'
		if (pathname.endsWith('.js')) return 'application/javascript'
		if (pathname.endsWith('.json')) return 'application/json'
		if (pathname.endsWith('.svg')) return 'image/svg+xml'
		if (pathname.endsWith('.png')) return 'image/png'
		if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg'))
			return 'image/jpeg'
		if (pathname.endsWith('.woff') || pathname.endsWith('.woff2'))
			return 'font/woff2'
		return 'application/octet-stream'
	}

	public getServerStats() {
		const watcherStats = this.fileWatcher?.getStats() || {
			watchedPaths: 0,
			activeTimers: 0,
			lastChange: 0,
			isActive: false,
			trackedFiles: 0,
		}

		return {
			server: {
				uptime: process.uptime(),
				connectedClients: this.clients.size,
				host: this.config.server.host,
				port: this.config.server.port,
			},
			signals: {
				markdownFiles: this.signals.markdownFiles.get().size,
				templateFiles: this.signals.templateFiles.get().size,
				componentFiles: this.signals.componentFiles.get().size,
				processedPages: this.signals.processedPages.get().length,
				dependencyGraph: this.signals.dependencyGraph.get().size,
			},
			watcher: watcherStats,
			memory: process.memoryUsage(),
		}
	}
}

/**
 * Create and start reactive development server
 */
export async function createReactiveDevServer(
	config?: Partial<DevServerConfig>,
): Promise<DevServer> {
	const server = new DevServer(config)
	await server.start()
	return server
}

/**
 * CLI entry point for reactive dev server
 */
export async function main(): Promise<void> {
	try {
		const configManager = new ConfigManager()
		const config = await configManager.load(DEFAULT_CONFIG)

		const server = await createReactiveDevServer(config)

		// Handle graceful shutdown
		process.on('SIGINT', async () => {
			console.log('\n🛑 Shutting down reactive dev server...')
			await server.stop()
			process.exit(0)
		})

		console.log('🎯 Reactive development server is ready!')
		console.log('Press Ctrl+C to stop')
	} catch (error) {
		console.error('💥 Failed to start reactive dev server:', error)
		process.exit(1)
	}
}

// Run if this file is executed directly
if (import.meta.main) {
	main()
}

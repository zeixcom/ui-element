#!/usr/bin/env bun

/**
 * Phase 3: Reactive Documentation Development Server
 * Updated to use the new reactive build system with Cause & Effect signals
 */

import { existsSync } from 'fs'
import { DEFAULT_CONFIG } from './config'
import { ConfigManager } from './config-manager'
import { DevServer } from './dev-server'
import type { DevServerConfig } from './types'

/**
 * Main application class - Phase 3 Migration
 */
class DevServerApp {
	private server: DevServer | null = null
	private config: DevServerConfig | null = null

	/**
	 * Initialize and start the reactive development server
	 */
	public async start(): Promise<void> {
		try {
			console.log('🚀 Phase 3: Reactive Documentation Development Server')
			console.log('   Powered by Cause & Effect Signals + Bun')
			console.log('')

			// Load configuration
			console.log('⚙️  Loading configuration...')
			const configManager = new ConfigManager()
			this.config = await configManager.load(DEFAULT_CONFIG)

			console.log(`✅ Configuration loaded`)
			console.log(`   📁 Pages: ${this.config.paths.pages}`)
			console.log(`   🔧 Components: ${this.config.paths.components}`)
			console.log(`   📦 Source: ${this.config.paths.src}`)
			console.log(`   📤 Output: ${this.config.paths.output}`)
			console.log('')

			// Validate required directories exist
			this.validateDirectories()

			// Create and start reactive server
			console.log('⚡ Initializing reactive architecture...')
			this.server = new DevServer(this.config)
			await this.server.start()

			// Setup graceful shutdown
			this.setupGracefulShutdown()

			console.log('')
			console.log('🎉 Reactive server is ready!')
			console.log(
				`   🌐 Open: http://${this.config.server.host}:${this.config.server.port}`,
			)
			console.log('   ⚡ Reactive signals active')
			console.log('   👀 Smart dependency tracking enabled')
			console.log('   🔄 Hot module replacement ready')
			console.log('')
			console.log('Press Ctrl+C to stop the server')
		} catch (error) {
			console.error(
				'\n❌ Failed to start reactive server:',
				error.message,
			)

			if (error.name === 'ConfigValidationError') {
				console.error(`   Configuration error: ${error.message}`)
				process.exit(1)
			}

			if (error.name === 'ReactiveInitializationError') {
				console.error(`   Reactive system error: ${error.message}`)
				console.error(
					'   💡 Check that all reactive plugins are properly configured',
				)
				process.exit(1)
			}

			console.error('\nStacktrace:', error.stack)
			process.exit(1)
		}
	}

	/**
	 * Stop the reactive development server
	 */
	public async stop(): Promise<void> {
		if (this.server) {
			console.log('\n🛑 Shutting down reactive server...')
			await this.server.stop()
			this.server = null
		}
	}

	/**
	 * Get reactive server statistics
	 */
	public getStats() {
		return this.server?.getServerStats() || null
	}

	/**
	 * Validate that required directories exist
	 */
	private validateDirectories(): void {
		const requiredDirs = [
			{ path: this.config!.paths.pages, name: 'Pages directory' },
			{
				path: this.config!.paths.components,
				name: 'Components directory',
			},
			{ path: this.config!.paths.includes, name: 'Includes directory' },
		]

		const requiredFiles = [
			{ path: this.config!.paths.layout, name: 'Layout template' },
		]

		let hasError = false

		for (const { path, name } of requiredDirs) {
			if (!existsSync(path)) {
				console.error(`❌ ${name} not found: ${path}`)
				hasError = true
			}
		}

		for (const { path, name } of requiredFiles) {
			if (!existsSync(path)) {
				console.error(`❌ ${name} not found: ${path}`)
				hasError = true
			}
		}

		if (hasError) {
			console.error(
				"\n💡 Make sure you're running this from the project root directory.",
			)
			console.error(
				'💡 Also ensure all reactive plugins are properly installed.',
			)
			process.exit(1)
		}
	}

	/**
	 * Setup graceful shutdown handlers
	 */
	private setupGracefulShutdown(): void {
		const shutdown = async (signal: string) => {
			console.log(
				`\n📡 Received ${signal}, shutting down reactive server gracefully...`,
			)
			await this.stop()
			process.exit(0)
		}

		process.on('SIGINT', () => shutdown('SIGINT'))
		process.on('SIGTERM', () => shutdown('SIGTERM'))
		process.on('SIGQUIT', () => shutdown('SIGQUIT'))

		// Handle uncaught errors
		process.on('uncaughtException', error => {
			console.error('\n💥 Uncaught Exception in reactive server:', error)
			process.exit(1)
		})

		process.on('unhandledRejection', (reason, promise) => {
			console.error(
				'\n💥 Unhandled Rejection in reactive server at:',
				promise,
				'reason:',
				reason,
			)
			process.exit(1)
		})
	}
}

/**
 * CLI interface for reactive development server
 */
async function main() {
	const args = process.argv.slice(2)

	// Simple argument parsing
	const options = {
		port: 3000,
		host: 'localhost',
		help: false,
		stats: false,
		debug: false,
	}

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]
		switch (arg) {
			case '--port':
			case '-p': {
				const port = parseInt(args[++i], 10)
				if (!isNaN(port) && port > 0 && port < 65536) {
					options.port = port
				} else {
					console.error('❌ Invalid port number')
					process.exit(1)
				}
				break
			}

			case '--host':
			case '-h':
				options.host = args[++i]
				break

			case '--help':
				options.help = true
				break

			case '--stats':
				options.stats = true
				break

			case '--debug':
				options.debug = true
				break

			default:
				if (arg.startsWith('-')) {
					console.error(`❌ Unknown option: ${arg}`)
					console.error('Use --help for usage information')
					process.exit(1)
				}
		}
	}

	if (options.help) {
		console.log(`
Phase 3: Reactive Documentation Development Server

USAGE:
    bun run serve:docs [OPTIONS]

OPTIONS:
    -p, --port <PORT>     Server port (default: 3000)
    -h, --host <HOST>     Server host (default: localhost)
    --stats               Show reactive server statistics
    --debug               Enable debug mode for reactive signals
    --help                Show this help message

EXAMPLES:
    bun run serve:docs
    bun run serve:docs --port 8080
    bun run serve:docs --host 0.0.0.0 --port 3001
    bun run serve:docs --stats --debug

ENVIRONMENT VARIABLES:
    DEV_SERVER_PORT       Override default port
    DEV_SERVER_HOST       Override default host
    OPTIMIZE_LAYOUT       Enable/disable layout optimization (true/false)
    DEV_MODE             Enable/disable development mode (true/false)
    REACTIVE_DEBUG       Enable reactive system debugging (true/false)

PHASE 3 FEATURES:
    ⚡ Reactive signals with automatic dependency tracking
    🔄 Smart file watching with minimal rebuilds
    📊 Real-time performance metrics
    🎯 Optimized hot module replacement
    📈 Memory-efficient caching
`)
		process.exit(0)
	}

	// Override config with CLI options
	if (options.port !== 3000) {
		process.env.DEV_SERVER_PORT = options.port.toString()
	}
	if (options.host !== 'localhost') {
		process.env.DEV_SERVER_HOST = options.host
	}
	if (options.debug) {
		process.env.REACTIVE_DEBUG = 'true'
	}

	// Create and start the reactive application
	const app = new DevServerApp()

	if (options.stats) {
		// Show periodic reactive statistics
		setInterval(() => {
			const stats = app.getStats()
			if (stats) {
				console.log('\n📊 Reactive Server Statistics:')
				console.log(
					`   🌐 Running: http://${stats.server.host}:${stats.server.port}`,
				)
				console.log(`   ⏱️  Uptime: ${Math.round(stats.server.uptime)}s`)
				console.log(
					`   👥 Connected clients: ${stats.server.connectedClients}`,
				)
				console.log('')
				console.log('   ⚡ Reactive Signals:')
				console.log(
					`     📝 Markdown files: ${stats.signals.markdownFiles}`,
				)
				console.log(
					`     🎨 Template files: ${stats.signals.templateFiles}`,
				)
				console.log(
					`     🧩 Component files: ${stats.signals.componentFiles}`,
				)
				console.log(
					`     📄 Processed pages: ${stats.signals.processedPages}`,
				)
				console.log(
					`     🕸️  Dependency graph: ${stats.signals.dependencyGraph}`,
				)
				console.log('')
				console.log('   👀 File Watcher:')
				console.log(
					`     📁 Watched paths: ${stats.watcher.watchedPaths}`,
				)
				console.log(`     ⚡ Active: ${stats.watcher.isActive}`)
				console.log(
					`     📊 Tracked files: ${stats.watcher.trackedFiles}`,
				)
				console.log('')
				console.log('   💾 Memory Usage:')
				console.log(
					`     🏠 RSS: ${Math.round(stats.memory.rss / 1024 / 1024)}MB`,
				)
				console.log(
					`     📦 Heap Used: ${Math.round(stats.memory.heapUsed / 1024 / 1024)}MB`,
				)
				console.log('')
			}
		}, 30000) // Every 30 seconds
	}

	await app.start()
}

// Run if this is the main module
if (import.meta.main) {
	main().catch(error => {
		console.error('💥 Fatal error in reactive server:', error)
		process.exit(1)
	})
}

export { DevServerApp }

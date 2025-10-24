#!/usr/bin/env bun

/**
 * Documentation Development Server
 * Modern dev server with Bun 1.3+ file watching and HMR capabilities
 */

import { existsSync } from 'fs'
import { ConfigManager } from './config.js'
import { DevServer } from './dev-server.js'
import type { DevServerConfig } from './types.js'

/**
 * Main application class
 */
class DevServerApp {
	private server: DevServer | null = null
	private config: DevServerConfig | null = null

	/**
	 * Initialize and start the development server
	 */
	public async start(): Promise<void> {
		try {
			console.log('🚀 Documentation Development Server')
			console.log('   Powered by Bun 1.3+ with Smart File Watching')
			console.log('')

			// Load configuration
			console.log('⚙️  Loading configuration...')
			const configManager = new ConfigManager()
			this.config = await configManager.load()

			console.log(`✅ Configuration loaded`)
			console.log(`   📁 Pages: ${this.config.paths.pages}`)
			console.log(`   🔧 Components: ${this.config.paths.components}`)
			console.log(`   📦 Source: ${this.config.paths.src}`)
			console.log(`   📤 Output: ${this.config.paths.output}`)
			console.log('')

			// Validate required directories exist
			this.validateDirectories()

			// Create and start server
			this.server = new DevServer(this.config)
			await this.server.start()

			// Setup graceful shutdown
			this.setupGracefulShutdown()

			console.log('')
			console.log('🎉 Server is ready!')
			console.log(
				`   🌐 Open: http://${this.config.server.host}:${this.config.server.port}`,
			)
			console.log('   👀 Watching for file changes...')
			console.log('   ⚡ Hot reloading enabled')
			console.log('')
			console.log('Press Ctrl+C to stop the server')
		} catch (error) {
			console.error('\n❌ Failed to start server:', error.message)

			if (error.name === 'ConfigValidationError') {
				console.error(`   Configuration error: ${error.message}`)
				process.exit(1)
			}

			console.error('\nStacktrace:', error.stack)
			process.exit(1)
		}
	}

	/**
	 * Stop the development server
	 */
	public async stop(): Promise<void> {
		if (this.server) {
			console.log('\n🛑 Shutting down server...')
			await this.server.stop()
			this.server = null
		}
	}

	/**
	 * Get server statistics
	 */
	public getStats() {
		return this.server?.getStats() || null
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
			process.exit(1)
		}
	}

	/**
	 * Setup graceful shutdown handlers
	 */
	private setupGracefulShutdown(): void {
		const shutdown = async (signal: string) => {
			console.log(`\n📡 Received ${signal}, shutting down gracefully...`)
			await this.stop()
			process.exit(0)
		}

		process.on('SIGINT', () => shutdown('SIGINT'))
		process.on('SIGTERM', () => shutdown('SIGTERM'))
		process.on('SIGQUIT', () => shutdown('SIGQUIT'))

		// Handle uncaught errors
		process.on('uncaughtException', error => {
			console.error('\n💥 Uncaught Exception:', error)
			process.exit(1)
		})

		process.on('unhandledRejection', (reason, promise) => {
			console.error(
				'\n💥 Unhandled Rejection at:',
				promise,
				'reason:',
				reason,
			)
			process.exit(1)
		})
	}
}

/**
 * CLI interface for development server
 */
async function main() {
	const args = process.argv.slice(2)

	// Simple argument parsing
	const options = {
		port: 3000,
		host: 'localhost',
		help: false,
		stats: false,
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
Documentation Development Server

USAGE:
    bun run serve:docs [OPTIONS]

OPTIONS:
    -p, --port <PORT>     Server port (default: 3000)
    -h, --host <HOST>     Server host (default: localhost)
    --stats               Show server statistics
    --help                Show this help message

EXAMPLES:
    bun run serve:docs
    bun run serve:docs --port 8080
    bun run serve:docs --host 0.0.0.0 --port 3001
    bun run serve:docs --stats

ENVIRONMENT VARIABLES:
    DEV_SERVER_PORT       Override default port
    DEV_SERVER_HOST       Override default host
    OPTIMIZE_LAYOUT       Enable/disable layout optimization (true/false)
    DEV_MODE             Enable/disable development mode (true/false)
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

	// Create and start the application
	const app = new DevServerApp()

	if (options.stats) {
		// Show periodic statistics
		setInterval(() => {
			const stats = app.getStats()
			if (stats) {
				console.log('\n📊 Server Statistics:')
				console.log(`   🌐 Running: ${stats.server.isRunning}`)
				console.log(`   📡 Port: ${stats.server.port}`)
				console.log(
					`   👥 Connected clients: ${stats.server.connectedClients}`,
				)
				console.log(
					`   👀 Watched paths: ${stats.watcher.watchedPaths}`,
				)
				console.log(
					`   👀 Watched paths: ${stats.watcher.watchedPaths}`,
				)
				console.log(`   ⚡ Watcher active: ${stats.watcher.isActive}`)
				console.log(`   📦 Plugins: ${stats.buildSystem.pluginCount}`)
				console.log(
					`   🔄 Build system ready: ${stats.buildSystem.pluginCount > 0}`,
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
		console.error('💥 Fatal error:', error)
		process.exit(1)
	})
}

export { DevServerApp }

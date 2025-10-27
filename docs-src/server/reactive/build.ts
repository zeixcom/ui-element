#!/usr/bin/env bun

/**
 * Reactive Build System Integration
 * Demonstrates Phase 1 of the Cause & Effect migration plan
 */

import { DEFAULT_CONFIG } from './config'
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
 * Reactive build system that uses Cause & Effect signals
 * for dependency tracking and automatic rebuilding
 */
class BuildSystem {
	private config: DevServerConfig
	private signals: FileSystemSignals
	private processor: FileProcessor
	private pluginManager: PluginManager
	private eventEmitter: EventEmitter
	private fileWatcher: FileWatcher | null = null
	private effectCleanup: (() => void) | null = null

	constructor(config: DevServerConfig) {
		this.config = config
		this.eventEmitter = new EventEmitter()

		// Initialize reactive signals
		this.signals = createFileSystemSignals({ config })
		this.processor = createFileProcessor(this.signals)
		this.pluginManager = new PluginManager()

		console.log('🚀 Reactive Build System initialized')
	}

	async initialize(): Promise<void> {
		console.log('⚙️ Initializing reactive build system...')

		// Build assets first (other plugins may need asset hashes)
		console.log('🔧 Building optimized assets...')
		const assetPlugin = new AssetPlugin()
		const optimizedAssets = await assetPlugin.buildAllAssets()

		// Update signals with asset information
		this.processor.updateAssets(optimizedAssets)

		// Register plugins with reactive system
		console.log('📦 Registering reactive plugins...')

		// Reactive Markdown Plugin
		this.pluginManager.registerPlugin(new MarkdownPlugin())

		// Legacy plugins wrapped in reactive adapters
		this.pluginManager.registerPlugin(new FragmentPlugin())

		this.pluginManager.registerPlugin(assetPlugin)

		// Initialize all plugins
		await this.pluginManager.initializePlugins(
			this.config,
			this.signals,
			this.processor,
		)

		// Set up file watcher
		this.fileWatcher = new FileWatcher(
			this.config,
			this.eventEmitter,
			this.processor,
			this.signals,
		)

		// Set up reactive effects
		this.effectCleanup = this.processor.setupEffects()

		// Set up event handlers
		this.setupEventHandlers()

		console.log('✅ Reactive build system initialized')
	}

	async build(): Promise<void> {
		const startTime = performance.now()
		console.log('🔄 Starting reactive build...')

		try {
			// Start file watcher to populate initial state
			if (this.fileWatcher) {
				await this.fileWatcher.start()
			}

			// The reactive system will automatically process files and generate outputs
			// Wait a moment for initial processing
			await new Promise(resolve => setTimeout(resolve, 100))

			const pages = this.signals.processedPages.get()
			const menu = this.signals.navigationMenu.get()
			const sitemap = this.signals.sitemap.get()

			const duration = performance.now() - startTime
			console.log('\n📊 Reactive Build Summary:')
			console.log(`✅ Processed pages: ${pages.length}`)
			console.log(
				`🧭 Navigation menu: ${menu.length > 0 ? 'Generated' : 'Empty'}`,
			)
			console.log(
				`🗺️ Sitemap: ${sitemap.length > 0 ? 'Generated' : 'Empty'}`,
			)
			console.log(`⏱️  Build time: ${duration.toFixed(2)}ms`)

			this.emitBuildComplete(pages.length, duration)
		} catch (error) {
			console.error('❌ Reactive build failed:', error)
			throw error
		}
	}

	async watch(): Promise<void> {
		if (!this.fileWatcher) {
			throw new Error('File watcher not initialized')
		}

		console.log('👀 Starting reactive watch mode...')

		// File watcher is already started in build()
		console.log('🎯 Watching for file changes... (Press Ctrl+C to stop)')

		// Set up graceful shutdown
		process.on('SIGINT', async () => {
			console.log('\n🛑 Stopping reactive watch mode...')
			await this.cleanup()
			process.exit(0)
		})

		// Keep process alive
		return new Promise(() => {
			// Process stays alive listening for file changes
		})
	}

	async cleanup(): Promise<void> {
		console.log('🧹 Cleaning up reactive build system...')

		// Stop file watcher
		if (this.fileWatcher) {
			await this.fileWatcher.stop()
			this.fileWatcher = null
		}

		// Cleanup effects
		if (this.effectCleanup) {
			this.effectCleanup()
			this.effectCleanup = null
		}

		// Cleanup plugins
		await this.pluginManager.cleanupPlugins()

		console.log('✅ Reactive build system cleaned up')
	}

	private setupEventHandlers(): void {
		// Handle file changes
		this.eventEmitter.on('file:changed', async ({ event }) => {
			console.log(`🔄 Processing file change: ${event.filePath}`)

			try {
				// The reactive system automatically handles the change through signals
				// Just notify plugins about the change
				await this.pluginManager.processFileChange(event)

				const stats = this.getStats()
				console.log(
					`📊 Current state: ${stats.trackedFiles} files, ${stats.processedPages} pages`,
				)
			} catch (error) {
				console.error('❌ Error processing file change:', error)
			}
		})

		// Handle build errors
		this.eventEmitter.on('build:error', ({ error, files }) => {
			console.error(
				`❌ Build error in files [${files.join(', ')}]:`,
				error.message,
			)
		})
	}

	private emitBuildComplete(_pageCount: number, duration: number): void {
		this.eventEmitter.emit('build:complete', {
			results: [], // In reactive system, results are handled by signals
			duration,
		})
	}

	getStats(): {
		trackedFiles: number
		processedPages: number
		dependencies: number
		watcherActive: boolean
	} {
		const mdFiles = this.signals.markdownFiles.get().size
		const templateFiles = this.signals.templateFiles.get().size
		const componentFiles = this.signals.componentFiles.get().size
		const pages = this.signals.processedPages.get().length
		const dependencies = this.signals.dependencyGraph.get().size

		return {
			trackedFiles: mdFiles + templateFiles + componentFiles,
			processedPages: pages,
			dependencies,
			watcherActive: this.fileWatcher?.isWatching() || false,
		}
	}

	// Compatibility method for legacy code
	async buildFile(filePath: string): Promise<void> {
		console.log(`🔄 Building single file: ${filePath}`)
		// In reactive system, individual file builds are handled automatically
		// through signal updates when the file is modified
	}
}

/**
 * Main entry point for reactive build system
 */
async function main() {
	const startTime = performance.now()
	console.log('🚀 Starting reactive build system...')

	try {
		// Load configuration
		const config = await new ConfigManager().load(DEFAULT_CONFIG)
		console.log(
			`📋 Configuration loaded for ${config.server.development ? 'development' : 'production'} mode`,
		)

		// Initialize reactive build system
		const buildSystem = new BuildSystem(config)
		await buildSystem.initialize()

		// Handle CLI arguments
		const args = process.argv.slice(2)
		const isWatch = args.includes('--watch')
		const showStats = args.includes('--stats')

		// Run build
		await buildSystem.build()

		// Show stats if requested
		if (showStats) {
			const stats = buildSystem.getStats()
			console.log('\n📈 Reactive Build Statistics:')
			console.log(`  Tracked files: ${stats.trackedFiles}`)
			console.log(`  Processed pages: ${stats.processedPages}`)
			console.log(`  Dependencies: ${stats.dependencies}`)
			console.log(`  Watcher active: ${stats.watcherActive}`)
		}

		// Start watch mode if requested
		if (isWatch) {
			await buildSystem.watch()
		} else {
			// Clean up and exit
			await buildSystem.cleanup()

			const duration = performance.now() - startTime
			console.log(`\n⏱️  Total time: ${duration.toFixed(2)}ms`)
			console.log('✨ Reactive build completed successfully!')
		}
	} catch (error) {
		console.error('❌ Reactive build failed with error:', error)
		process.exit(1)
	}
}

// Export for testing and integration
export { BuildSystem }

// Run if this file is executed directly
if (import.meta.main) {
	main().catch(error => {
		console.error('💥 Fatal error:', error)
		process.exit(1)
	})
}

#!/usr/bin/env bun

import { DEFAULT_CONFIG } from './config'
import { ConfigManager } from './config-manager'
import { ModularSSG } from './modular-ssg'
import { AssetPlugin } from './plugins/asset-plugin'
import { FragmentPlugin } from './plugins/fragment-plugin'
import { MarkdownPlugin } from './plugins/markdown-plugin'

/**
 * Unified build script using plugin architecture
 * Replaces standalone build scripts with cohesive plugin-based system
 */
async function main() {
	const startTime = performance.now()
	console.log('🚀 Starting unified build process...')

	try {
		// Load configuration
		const config = await new ConfigManager().load(DEFAULT_CONFIG)
		console.log(
			`📋 Configuration loaded for ${config.server.development ? 'development' : 'production'} mode`,
		)

		// Initialize ModularSSG
		const ssg = new ModularSSG(config)

		// Build assets first (other plugins may need asset hashes)
		console.log('🔧 Building optimized assets...')
		const assetPlugin = new AssetPlugin()
		const optimizedAssets = await assetPlugin.buildAllAssets()

		// Register plugins in order
		console.log('📦 Registering plugins...')

		// MarkdownPlugin - processes .md files to HTML
		ssg.use(new MarkdownPlugin(optimizedAssets))

		// FragmentPlugin - processes component fragments
		ssg.use(new FragmentPlugin())

		// AssetPlugin - handles asset optimization (already built above)
		ssg.use(assetPlugin)

		// Initialize all plugins
		await ssg.initialize()

		// Build everything
		console.log('🔄 Building all content...')
		const results = await ssg.build()

		// Process results
		const successful = results.filter(r => r.success)
		const failed = results.filter(r => !r.success)

		// Generate menu and sitemap from MarkdownPlugin
		console.log('🧭 Generating navigation and sitemap...')
		const markdownPlugin = ssg
			.getPlugins()
			.find(p => p.name === 'markdown-processor') as MarkdownPlugin
		if (markdownPlugin) {
			await markdownPlugin.generateMenu()
			await markdownPlugin.generateSitemap()
		}

		// Process all fragments
		console.log('🧩 Processing component fragments...')
		const fragmentPlugin = ssg
			.getPlugins()
			.find(p => p.name === 'fragment-processor') as FragmentPlugin
		if (fragmentPlugin) {
			await fragmentPlugin.processAllComponents()
		}

		// Report results
		const duration = performance.now() - startTime
		console.log('\n📊 Build Summary:')
		console.log(`✅ Successful builds: ${successful.length}`)

		if (failed.length > 0) {
			console.log(`❌ Failed builds: ${failed.length}`)
			failed.forEach(result => {
				console.log(
					`   • ${result.filePath}: ${result.errors?.[0]?.message || 'Unknown error'}`,
				)
			})
		}

		console.log(`⏱️  Total build time: ${duration.toFixed(2)}ms`)
		console.log(
			`🎯 Assets optimized: CSS hash ${optimizedAssets.css.mainCSSHash.slice(0, 8)}..., JS hash ${optimizedAssets.js.mainJSHash.slice(0, 8)}...`,
		)

		// Cleanup
		await ssg.cleanup()

		if (failed.length > 0) {
			console.error(`\n❌ Build completed with ${failed.length} errors`)
			process.exit(1)
		}

		console.log('\n✨ Build completed successfully!')
	} catch (error) {
		console.error('❌ Build failed with error:', error)
		process.exit(1)
	}
}

// Handle CLI arguments
const args = process.argv.slice(2)
const isWatch = args.includes('--watch')
const isVerbose = args.includes('--verbose')

if (isVerbose) {
	console.log('🔍 Verbose mode enabled')
}

async function runWithWatch() {
	console.log('👀 Starting watch mode...')
	console.log('💡 For full development experience, use: bun run serve:docs')

	// Import dependencies for watch mode
	const { SmartFileWatcher } = await import('./smart-file-watcher.js')
	const { EventEmitter } = await import('./event-emitter.js')

	// Load config and create event emitter
	const config = await new ConfigManager().load(DEFAULT_CONFIG)
	const eventEmitter = new EventEmitter()

	// Set up file watcher
	const watcher = new SmartFileWatcher(config, eventEmitter)

	// Listen for file changes
	eventEmitter.on('file:changed', async data => {
		console.log(`\n🔄 File changed: ${data.event.filePath}`)
		try {
			await main()
		} catch (error) {
			console.error('❌ Build failed:', error)
		}
	})

	// Start watching
	await watcher.start()
	console.log('🎯 Watching for file changes... (Press Ctrl+C to stop)')

	// Keep process alive
	process.on('SIGINT', async () => {
		console.log('\n🛑 Stopping watch mode...')
		await watcher.stop()
		process.exit(0)
	})

	// Run initial build
	await main()
}

if (isWatch) {
	runWithWatch().catch(error => {
		console.error('💥 Watch mode error:', error)
		process.exit(1)
	})
} else {
	main().catch(error => {
		console.error('💥 Fatal error:', error)
		process.exit(1)
	})
}

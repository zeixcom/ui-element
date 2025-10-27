/**
 * Core Build System with Effect Orchestration
 *
 * This is the main build entry point that orchestrates all build effects
 * using Cause & Effect signals for reactive incremental builds.
 */

import { effect } from '@zeix/cause-effect'
import { performance } from 'perf_hooks'
import { fileSignals } from './file-signals'
import { fileWatcher } from './file-watcher'
import type { BuildOptions, BuildResult } from './types'

// ============================================================================
// Build Configuration
// ============================================================================

export interface BuildOptions {
	/** Enable watch mode for development */
	watch: boolean
	/** Enable verbose logging */
	verbose: boolean
	/** Production mode optimizations */
	production: boolean
	/** Force full rebuild */
	force: boolean
	/** Specific files to build (if not provided, builds all) */
	files?: string[]
	/** Skip certain build steps */
	skip?: string[]
}

export interface BuildResult {
	success: boolean
	duration: number
	filesProcessed: number
	errors: Error[]
	warnings: string[]
	stats: {
		menuGenerated: boolean
		assetsBuilt: boolean
		fragmentsGenerated: boolean
		pagesProcessed: number
		sitemapGenerated: boolean
		serviceWorkerGenerated: boolean
	}
}

// ============================================================================
// Build Effects Registry
// ============================================================================

type BuildEffect = () => () => void // Returns cleanup function

const buildEffects = new Map<string, BuildEffect>()

/**
 * Register a build effect
 */
export function registerBuildEffect(name: string, effect: BuildEffect): void {
	buildEffects.set(name, effect)
}

/**
 * Get all registered build effects
 */
export function getBuildEffects(): Map<string, BuildEffect> {
	return new Map(buildEffects)
}

// ============================================================================
// Build Orchestrator Class
// ============================================================================

export class BuildOrchestrator {
	private activeEffects = new Map<string, () => void>()
	private isBuilding = false
	private buildStats: BuildResult['stats'] = {
		menuGenerated: false,
		assetsBuilt: false,
		fragmentsGenerated: false,
		pagesProcessed: 0,
		sitemapGenerated: false,
		serviceWorkerGenerated: false,
	}

	/**
	 * Initialize the build system
	 */
	public async initialize(): Promise<void> {
		console.log('Initializing build system...')

		// Initialize file tracking
		await fileSignals.initializeFileTracking()

		// Load build effects
		await this.loadBuildEffects()

		console.log('Build system initialized')
	}

	/**
	 * Load all build effects
	 */
	private async loadBuildEffects(): Promise<void> {
		// Dynamically import all effects
		const effectModules = [
			'./effects/menu',
			'./effects/assets',
			'./effects/fragments',
			'./effects/markdown',
			'./effects/sitemap',
			'./effects/service-worker',
		]

		for (const modulePath of effectModules) {
			try {
				const module = await import(modulePath)
				if (module.default) {
					const effectName = modulePath.split('/').pop()!
					registerBuildEffect(effectName, module.default)
				}
			} catch (error) {
				console.warn(`Failed to load effect ${modulePath}:`, error)
			}
		}

		console.log(`Loaded ${buildEffects.size} build effects`)
	}

	/**
	 * Run a full build
	 */
	public async build(
		options: Partial<BuildOptions> = {},
	): Promise<BuildResult> {
		const startTime = performance.now()
		const opts: BuildOptions = {
			watch: false,
			verbose: false,
			production: false,
			force: false,
			...options,
		}

		if (this.isBuilding) {
			throw new Error('Build already in progress')
		}

		this.isBuilding = true
		const errors: Error[] = []
		const warnings: string[] = []

		try {
			console.log('Starting build...')

			// Force full rebuild if requested
			if (opts.force) {
				await this.forceFullRebuild()
			}

			// Set up reactive effects
			this.setupBuildEffects(opts)

			// Wait for initial build to complete
			console.log('Waiting for build completion...')
			await this.waitForBuildCompletion()

			// Get final stats
			const filesProcessed = fileSignals.processedFiles.get().size

			const duration = performance.now() - startTime

			console.log(`Build completed in ${duration.toFixed(2)}ms`)
			console.log(`Processed ${filesProcessed} files`)

			return {
				success: errors.length === 0,
				duration,
				filesProcessed,
				errors,
				warnings,
				stats: { ...this.buildStats },
			}
		} catch (error) {
			errors.push(error as Error)
			return {
				success: false,
				duration: performance.now() - startTime,
				filesProcessed: 0,
				errors,
				warnings,
				stats: { ...this.buildStats },
			}
		} finally {
			this.isBuilding = false

			// Clean up effects if not in watch mode
			if (!opts.watch) {
				this.cleanupEffects()
			}
		}
	}

	/**
	 * Set up all build effects
	 */
	private setupBuildEffects(options: BuildOptions): void {
		console.log('Setting up build effects...')

		for (const [name, effectFn] of buildEffects) {
			// Skip effects if requested
			if (options.skip?.includes(name)) {
				continue
			}

			try {
				const cleanup = effectFn()
				this.activeEffects.set(name, cleanup)

				if (options.verbose) {
					console.log(`✓ Set up effect: ${name}`)
				}
			} catch (error) {
				console.error(`Failed to set up effect ${name}:`, error)
			}
		}

		console.log(`Set up ${this.activeEffects.size} build effects`)
	}

	/**
	 * Wait for build completion by monitoring build queue
	 */
	private async waitForBuildCompletion(): Promise<void> {
		return new Promise(resolve => {
			let resolved = false
			const queue = fileSignals.buildQueue.get()

			console.log(`Initial build queue size: ${queue.size}`)

			// If queue is already empty, resolve immediately
			if (queue.size === 0) {
				console.log('Build queue is empty, resolving immediately')
				resolve()
				return
			}

			const cleanup = effect(() => {
				if (resolved) return

				const currentQueue = fileSignals.buildQueue.get()
				console.log(`Build queue size: ${currentQueue.size}`)

				// Build is complete when queue is empty
				if (currentQueue.size === 0) {
					console.log('Build queue empty, build complete')
					resolved = true
					cleanup()
					resolve()
				}
			})

			// Timeout after 10 seconds for initial testing
			setTimeout(() => {
				if (!resolved) {
					console.log('Build timeout reached, completing anyway')
					resolved = true
					cleanup()
					resolve()
				}
			}, 10000)
		})
	}

	/**
	 * Force a full rebuild by adding all files to build queue
	 */
	private async forceFullRebuild(): Promise<void> {
		console.log('Forcing full rebuild...')

		const sourceFiles = fileSignals.sourceFiles.get()
		console.log(`Adding ${sourceFiles.size} files to build queue`)

		for (const filePath of sourceFiles.keys()) {
			fileSignals.addToBuildQueue(filePath)
		}

		const queueSize = fileSignals.buildQueue.get().size
		console.log(`Build queue now has ${queueSize} files`)
	}

	/**
	 * Start watch mode
	 */
	public async startWatch(
		options: Partial<BuildOptions> = {},
	): Promise<void> {
		const watchOptions: BuildOptions = {
			...options,
			watch: true,
		}

		// Run initial build
		const result = await this.build(watchOptions)

		if (!result.success) {
			console.error('Initial build failed:', result.errors)
			return
		}

		// Start file watcher
		await fileWatcher.start()

		console.log('👀 Watching for changes...')

		// Set up graceful shutdown
		process.on('SIGINT', async () => {
			console.log('\n🛑 Shutting down...')
			await this.stop()
			process.exit(0)
		})
	}

	/**
	 * Stop the build system
	 */
	public async stop(): Promise<void> {
		console.log('Stopping build system...')

		// Stop file watcher
		await fileWatcher.stop()

		// Clean up effects
		this.cleanupEffects()

		console.log('Build system stopped')
	}

	/**
	 * Clean up all active effects
	 */
	private cleanupEffects(): void {
		for (const [name, cleanup] of this.activeEffects) {
			try {
				cleanup()
			} catch (error) {
				console.error(`Error cleaning up effect ${name}:`, error)
			}
		}
		this.activeEffects.clear()
	}

	/**
	 * Get build statistics
	 */
	public getStats(): Record<string, unknown> {
		return {
			isBuilding: this.isBuilding,
			activeEffects: Array.from(this.activeEffects.keys()),
			buildStats: { ...this.buildStats },
			...fileSignals.getDebugInfo(),
			...fileWatcher.getStats(),
		}
	}

	/**
	 * Update build stats
	 */
	public updateStats(update: Partial<BuildResult['stats']>): void {
		this.buildStats = { ...this.buildStats, ...update }
	}
}

// ============================================================================
// Command Line Interface
// ============================================================================

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): BuildOptions {
	const options: BuildOptions = {
		watch: false,
		verbose: false,
		production: false,
		force: false,
	}

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]
		switch (arg) {
			case '--watch':
			case '-w':
				options.watch = true
				break
			case '--verbose':
			case '-v':
				options.verbose = true
				break
			case '--production':
			case '--prod':
				options.production = true
				break
			case '--force':
			case '-f':
				options.force = true
				break
			case '--skip': {
				const skipEffects = args[i + 1]?.split(',')
				if (skipEffects) {
					options.skip = skipEffects
					i++ // Skip next argument
				}
				break
			}
			case '--files': {
				const files = args[i + 1]?.split(',')
				if (files) {
					options.files = files
					i++ // Skip next argument
				}
				break
			}
		}
	}

	return options
}

/**
 * Main CLI entry point
 */
export async function main(
	args: string[] = process.argv.slice(2),
): Promise<void> {
	const options = parseArgs(args)
	const orchestrator = new BuildOrchestrator()

	try {
		await orchestrator.initialize()

		if (options.watch) {
			await orchestrator.startWatch(options)
		} else {
			const result = await orchestrator.build(options)

			if (result.success) {
				console.log('✅ Build completed successfully')
				process.exit(0)
			} else {
				console.error('❌ Build failed')
				for (const error of result.errors) {
					console.error(error.message)
				}
				process.exit(1)
			}
		}
	} catch (error) {
		console.error('💥 Build system error:', error)
		process.exit(1)
	}
}

// ============================================================================
// Global Instance
// ============================================================================

/**
 * Global build orchestrator instance
 */
export const buildOrchestrator = new BuildOrchestrator()

// Run CLI if this file is executed directly
if (import.meta.main) {
	main()
}

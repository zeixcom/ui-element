/**
 * Modular Static Site Generator with plugin-based architecture
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { mkdir } from 'fs/promises'
import { dirname, resolve } from 'path'
import type {
	BuildInput,
	BuildOutput,
	BuildPlugin,
	DevServerConfig,
	IEventEmitter,
	IModularSSG,
} from './types.js'

/**
 * Plugin-based Static Site Generator
 */
export class ModularSSG implements IModularSSG {
	private plugins: BuildPlugin[] = []
	private dependencyGraph = new Map<string, string[]>()
	private buildInProgress = new Set<string>()

	constructor(
		private config: DevServerConfig,
		private eventEmitter?: IEventEmitter,
	) {}

	/**
	 * Register a plugin
	 */
	public use(plugin: BuildPlugin): ModularSSG {
		console.log(`📦 Registering plugin: ${plugin.name}`)
		this.plugins.push(plugin)
		return this
	}

	/**
	 * Initialize all plugins
	 */
	public async initialize(): Promise<void> {
		console.log('🔧 Initializing SSG plugins...')

		for (const plugin of this.plugins) {
			if (plugin.initialize) {
				try {
					await plugin.initialize(this.config)
					console.log(`✅ Initialized plugin: ${plugin.name}`)
				} catch (error) {
					console.error(
						`❌ Failed to initialize plugin ${plugin.name}:`,
						error,
					)
					throw error
				}
			}
		}
	}

	/**
	 * Build all applicable files or specific changed files
	 */
	public async build(changedFiles?: string[]): Promise<BuildOutput[]> {
		const startTime = performance.now()
		const results: BuildOutput[] = []

		try {
			this.eventEmitter?.emit('build:start', {
				files: changedFiles || ['all'],
				commands: this.getApplicablePlugins().map(p => p.name),
			})

			if (changedFiles && changedFiles.length > 0) {
				// Incremental build for specific files
				for (const filePath of changedFiles) {
					const result = await this.buildFile(filePath)
					results.push(result)
				}
			} else {
				// Full build - discover all files
				await this.buildAll(results)
			}

			const duration = performance.now() - startTime
			console.log(`✨ Build completed in ${duration.toFixed(2)}ms`)

			this.eventEmitter?.emit('build:complete', {
				results,
				duration,
			})

			return results
		} catch (error) {
			const buildError = new Error(`Build failed: ${error.message}`)
			this.eventEmitter?.emit('build:error', {
				error: buildError as any,
				files: changedFiles || [],
			})
			throw buildError
		}
	}

	/**
	 * Build a specific file
	 */
	public async buildFile(filePath: string): Promise<BuildOutput> {
		const absolutePath = resolve(filePath)

		// Prevent concurrent builds of the same file
		if (this.buildInProgress.has(absolutePath)) {
			return {
				success: false,
				errors: [
					{
						message: `Build already in progress for ${filePath}`,
						file: filePath,
					},
				],
			}
		}

		this.buildInProgress.add(absolutePath)

		try {
			// Check if file exists
			if (!existsSync(absolutePath)) {
				return {
					success: false,
					errors: [
						{
							message: `File not found: ${filePath}`,
							file: filePath,
						},
					],
				}
			}

			// Find applicable plugins
			const applicablePlugins = this.plugins.filter(plugin =>
				plugin.shouldRun(absolutePath),
			)

			if (applicablePlugins.length === 0) {
				console.warn(`⚠️  No plugins found for: ${filePath}`)
				return {
					success: true,
					filePath: absolutePath,
				}
			}

			// Read file content
			const content = readFileSync(absolutePath, 'utf-8')
			const input: BuildInput = {
				filePath: absolutePath,
				content,
				metadata: {},
			}

			// Process through applicable plugins
			let result: BuildOutput = {
				success: true,
				filePath: absolutePath,
				content,
			}

			for (const plugin of applicablePlugins) {
				try {
					console.log(`🔄 Processing ${filePath} with ${plugin.name}`)
					const pluginResult = await plugin.transform({
						...input,
						content: result.content || input.content,
						metadata: result.metadata || input.metadata,
					})

					// Merge results
					result = this.mergeResults(result, pluginResult)

					if (!result.success) {
						console.error(
							`❌ Plugin ${plugin.name} failed for ${filePath}`,
						)
						break
					}
				} catch (error) {
					console.error(`❌ Plugin ${plugin.name} error:`, error)
					result.success = false
					result.errors = result.errors || []
					result.errors.push({
						message: `Plugin ${plugin.name} error: ${error.message}`,
						file: filePath,
					})
					break
				}
			}

			// Update dependency graph
			if (result.dependencies) {
				this.dependencyGraph.set(absolutePath, result.dependencies)
			}

			return result
		} finally {
			this.buildInProgress.delete(absolutePath)
		}
	}

	/**
	 * Get all registered plugins
	 */
	public getPlugins(): BuildPlugin[] {
		return [...this.plugins]
	}

	/**
	 * Get plugins applicable to a specific file
	 */
	public getApplicablePlugins(filePath?: string): BuildPlugin[] {
		if (!filePath) {
			return this.plugins
		}

		const absolutePath = resolve(filePath)
		return this.plugins.filter(plugin => plugin.shouldRun(absolutePath))
	}

	/**
	 * Get the current dependency graph
	 */
	public getDependencyGraph(): Map<string, string[]> {
		return new Map(this.dependencyGraph)
	}

	/**
	 * Cleanup all plugins
	 */
	public async cleanup(): Promise<void> {
		console.log('🧹 Cleaning up SSG plugins...')

		for (const plugin of this.plugins) {
			if (plugin.cleanup) {
				try {
					await plugin.cleanup()
					console.log(`✅ Cleaned up plugin: ${plugin.name}`)
				} catch (error) {
					console.warn(
						`⚠️  Error cleaning up plugin ${plugin.name}:`,
						error,
					)
				}
			}
		}

		this.plugins.length = 0
		this.dependencyGraph.clear()
		this.buildInProgress.clear()
	}

	/**
	 * Build all discoverable files
	 */
	private async buildAll(_results: BuildOutput[]): Promise<void> {
		// This would typically discover files from configured directories
		// For now, we'll focus on the plugin architecture
		console.log(
			'📁 Full build not yet implemented - use incremental builds',
		)
	}

	/**
	 * Merge two build results
	 */
	private mergeResults(
		base: BuildOutput,
		addition: BuildOutput,
	): BuildOutput {
		return {
			success: base.success && addition.success,
			filePath: addition.filePath || base.filePath,
			content: addition.content || base.content,
			metadata: {
				...base.metadata,
				...addition.metadata,
			},
			errors: [...(base.errors || []), ...(addition.errors || [])],
			warnings: [...(base.warnings || []), ...(addition.warnings || [])],
			dependencies: [
				...(base.dependencies || []),
				...(addition.dependencies || []),
			],
			stats: addition.stats || base.stats,
		}
	}

	/**
	 * Write output to file system
	 */
	public async writeOutput(result: BuildOutput): Promise<void> {
		if (!result.success || !result.content || !result.filePath) {
			return
		}

		const outputPath = this.getOutputPath(result.filePath)

		try {
			// Ensure output directory exists
			await mkdir(dirname(outputPath), { recursive: true })

			// Write the file
			writeFileSync(outputPath, result.content, 'utf-8')

			console.log(`💾 Written: ${outputPath}`)
		} catch (error) {
			console.error(`❌ Failed to write ${outputPath}:`, error)
			throw error
		}
	}

	/**
	 * Determine output path for a given input file
	 */
	private getOutputPath(inputPath: string): string {
		const absoluteInput = resolve(inputPath)

		// Map source directories to output directories
		if (absoluteInput.startsWith(resolve(this.config.paths.pages))) {
			// Pages go to root of output directory
			const relativePath = absoluteInput.replace(
				resolve(this.config.paths.pages),
				'',
			)
			return resolve(this.config.paths.output, relativePath.slice(1))
		}

		if (absoluteInput.startsWith(resolve(this.config.paths.components))) {
			// Components go to examples directory
			const relativePath = absoluteInput.replace(
				resolve(this.config.paths.components),
				'',
			)
			return resolve(
				this.config.paths.output,
				'examples',
				relativePath.slice(1),
			)
		}

		// Default: maintain relative structure
		return resolve(this.config.paths.output, inputPath)
	}

	/**
	 * Get build statistics
	 */
	public getStats(): {
		pluginCount: number
		dependencyCount: number
		buildsInProgress: number
		lastBuildTime?: number
	} {
		return {
			pluginCount: this.plugins.length,
			dependencyCount: this.dependencyGraph.size,
			buildsInProgress: this.buildInProgress.size,
		}
	}
}

/**
 * Base class for build plugins
 */
export abstract class BaseBuildPlugin implements BuildPlugin {
	public abstract readonly name: string
	public readonly version?: string
	public readonly description?: string

	constructor(protected config?: any) {}

	public abstract shouldRun(filePath: string): boolean
	public abstract transform(input: BuildInput): Promise<BuildOutput>

	public async initialize?(_config: DevServerConfig): Promise<void> {
		// Default implementation - can be overridden
	}

	public async cleanup?(): Promise<void> {
		// Default implementation - can be overridden
	}

	public async getDependencies?(_filePath: string): Promise<string[]> {
		return []
	}

	/**
	 * Helper to create successful build output
	 */
	protected createSuccess(
		input: BuildInput,
		overrides: Partial<BuildOutput> = {},
	): BuildOutput {
		return {
			success: true,
			filePath: input.filePath,
			content: input.content,
			metadata: input.metadata,
			dependencies: [],
			...overrides,
		}
	}

	/**
	 * Helper to create failed build output
	 */
	protected createError(
		input: BuildInput,
		message: string,
		line?: number,
		column?: number,
	): BuildOutput {
		return {
			success: false,
			filePath: input.filePath,
			errors: [
				{
					message,
					file: input.filePath,
					line,
					column,
				},
			],
		}
	}
}

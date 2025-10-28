/**
 * Reactive Plugin Interfaces and Base Classes using Cause & Effect
 * Evolution of the existing plugin system to support reactive architecture
 */

import type {
	BuildInput,
	BuildOutput,
	BuildPlugin,
	DevServerConfig,
	FileChangeEvent,
	FileProcessor,
	FileSystemSignals,
} from './types'

// ============================================================================
// Base Reactive Plugin Class
// ============================================================================

export abstract class BasePlugin implements BuildPlugin {
	public readonly reactive = true as const
	protected config?: DevServerConfig
	protected signals?: FileSystemSignals
	protected processor?: FileProcessor
	private effectCleanup?: () => void

	abstract readonly name: string
	abstract readonly version: string
	abstract readonly description: string

	abstract shouldRun(filePath: string): boolean
	abstract transform(input: BuildInput): Promise<BuildOutput>

	async initialize(
		config: DevServerConfig,
		signals: FileSystemSignals,
		processor: FileProcessor,
	): Promise<void> {
		this.config = config
		this.signals = signals
		this.processor = processor

		// Set up reactive effects
		this.effectCleanup = this.setupEffects(signals)
	}

	async cleanup(): Promise<void> {
		if (this.effectCleanup) {
			this.effectCleanup()
			this.effectCleanup = undefined
		}
	}

	/**
	 * Override this method to set up reactive effects
	 */
	setupEffects(_signals: FileSystemSignals): () => void {
		// Default implementation - no effects
		return () => {}
	}

	/**
	 * Override this method to handle file changes reactively
	 */
	async onFileChange(
		_event: FileChangeEvent,
		_signals: FileSystemSignals,
	): Promise<void> {
		// Default implementation - no special handling
	}

	/**
	 * Override this method to specify watch patterns
	 */
	getWatchPatterns(): string[] {
		return ['**/*']
	}

	/**
	 * Override this method to control reactive behavior
	 */
	shouldReactToChange(filePath: string, _eventType: string): boolean {
		return this.shouldRun(filePath)
	}

	/**
	 * Helper method to create success output
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
	 * Helper method to create error output
	 */
	protected createError(
		input: BuildInput,
		message: string,
		error?: Error,
	): BuildOutput {
		return {
			success: false,
			filePath: input.filePath,
			errors: [
				{
					message,
					file: input.filePath,
					stack: error?.stack,
				},
			],
		}
	}
}

// ============================================================================
// Plugin Manager for Reactive System
// ============================================================================

/**
 * Manager for reactive plugins
 */
export class PluginManager {
	public plugins: BuildPlugin[] = []
	private signals?: FileSystemSignals
	private processor?: FileProcessor

	registerPlugin(plugin: BuildPlugin): void {
		this.plugins.push(plugin)
	}

	async initializePlugins(
		config: DevServerConfig,
		signals: FileSystemSignals,
		processor: FileProcessor,
	): Promise<void> {
		this.signals = signals
		this.processor = processor

		for (const plugin of this.plugins) {
			if (plugin.initialize) {
				await plugin.initialize(config, signals, processor)
			}
		}
	}

	async cleanupPlugins(): Promise<void> {
		for (const plugin of this.plugins) {
			if (plugin.cleanup) {
				await plugin.cleanup()
			}
		}
		this.plugins = []
	}

	getApplicablePlugins(filePath?: string): BuildPlugin[] {
		if (!filePath) return this.plugins

		return this.plugins.filter(plugin => plugin.shouldRun(filePath))
	}

	async processFileChange(event: FileChangeEvent): Promise<void> {
		if (!this.signals || !this.processor) {
			throw new Error('Plugin manager not initialized')
		}

		// First, update the signals with the file change
		await this.processor.processFileChange(event)

		// Then, notify plugins that handle this file type
		const applicablePlugins = this.plugins.filter(plugin =>
			plugin.shouldReactToChange?.(event.filePath, event.eventType),
		)

		for (const plugin of applicablePlugins) {
			if (plugin.onFileChange) {
				try {
					await plugin.onFileChange(event, this.signals)
				} catch (error) {
					console.error(
						`Error in plugin ${plugin.name} handling file change:`,
						error,
					)
				}
			}
		}
	}
}

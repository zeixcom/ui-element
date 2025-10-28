/**
 * Reactive File Watcher with Cause & Effect Signal Integration
 * Monitors file system changes and updates reactive signals automatically
 */

import { watch } from 'fs'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import type {
	DevServerConfig,
	FileChangeEvent,
	FileProcessor,
	FileSystemSignals,
	IEventEmitter,
	WatcherState,
	WatchPathConfig,
} from './types'

export class FileWatcher {
	private state: WatcherState = {
		isActive: false,
		lastChange: 0,
		debounceTimers: new Map(),
		watchedPaths: new Set(),
	}

	private watchers = new Map<string, ReturnType<typeof watch>>()
	private processor: FileProcessor
	private signals: FileSystemSignals

	constructor(
		private config: DevServerConfig,
		private eventEmitter: IEventEmitter,
		processor: FileProcessor,
		signals: FileSystemSignals,
	) {
		this.processor = processor
		this.signals = signals
	}

	async start(): Promise<void> {
		if (this.state.isActive) {
			console.log('🔍 File watcher already active')
			return
		}

		console.log('🎯 Starting reactive file watcher...')

		// Watch configured paths
		for (const pathConfig of this.config.watch.paths) {
			await this.addPath(pathConfig)
		}

		// Add additional reactive paths
		const reactivePaths: WatchPathConfig[] = [
			{
				directory: join(process.cwd(), 'docs-src/pages'),
				extensions: ['.md'],
				label: 'Markdown Files',
				buildCommands: ['process-markdown'],
			},
			{
				directory: join(process.cwd(), 'docs-src/server/templates'),
				extensions: ['.ts'],
				label: 'Template Files',
				buildCommands: ['rebuild-all'],
			},
			{
				directory: join(process.cwd(), 'docs-src/includes'),
				extensions: ['.html'],
				label: 'Include Files',
				buildCommands: ['rebuild-all'],
			},
			{
				directory: join(process.cwd(), 'docs-src/components'),
				extensions: ['.ts', '.html', '.css'],
				label: 'Component Files',
				buildCommands: ['process-components'],
			},
		]

		for (const pathConfig of reactivePaths) {
			await this.addPath(pathConfig)
		}

		// Populate initial file states
		await this.scanInitialFiles()

		this.state.isActive = true
		console.log(
			`👀 Reactive file watcher started with ${this.watchers.size} watchers`,
		)
	}

	async stop(): Promise<void> {
		if (!this.state.isActive) {
			return
		}

		console.log('⏹️ Stopping reactive file watcher...')

		// Clear debounce timers
		for (const timer of this.state.debounceTimers.values()) {
			clearTimeout(timer)
		}
		this.state.debounceTimers.clear()

		// Close watchers
		for (const watcher of this.watchers.values()) {
			watcher.close()
		}
		this.watchers.clear()
		this.state.watchedPaths.clear()

		this.state.isActive = false
		console.log('✅ Reactive file watcher stopped')
	}

	async addPath(config: WatchPathConfig): Promise<void> {
		const { directory, extensions, label } = config

		if (this.watchers.has(directory)) {
			console.log(`⚠️ Already watching ${directory}`)
			return
		}

		try {
			const watcher = watch(
				directory,
				{ recursive: true },
				(eventType, filename) => {
					if (!filename) return

					const filePath = join(directory, filename)
					const ext = '.' + filename.split('.').pop()

					// Filter by extensions
					if (extensions.length > 0 && !extensions.includes(ext)) {
						return
					}

					// Create file change event
					const event: FileChangeEvent = {
						filename,
						eventType: eventType as 'rename' | 'change',
						filePath,
						timestamp: Date.now(),
					}

					// Debounce the change
					this.debounceFileChange(event, config)
				},
			)

			watcher.on('error', error => {
				console.error(`❌ File watcher error for ${directory}:`, error)
				this.eventEmitter.emit('server:error', {
					error: {
						name: 'WatchError',
						message: `File watcher error: ${error.message}`,
						code: 'WATCH_ERROR',
					} as any,
				})
			})

			this.watchers.set(directory, watcher)
			this.state.watchedPaths.add(directory)

			console.log(`👀 Watching ${label} in ${directory}`)
		} catch (error) {
			console.error(`❌ Failed to watch ${directory}:`, error)
		}
	}

	async removePath(directory: string): Promise<void> {
		const watcher = this.watchers.get(directory)
		if (watcher) {
			watcher.close()
			this.watchers.delete(directory)
			this.state.watchedPaths.delete(directory)
			console.log(`⏹️ Stopped watching ${directory}`)
		}
	}

	private debounceFileChange(
		event: FileChangeEvent,
		config: WatchPathConfig,
	): void {
		const debounceKey = event.filePath
		const debounceDelay = this.config.watch.debounceDelay || 100

		// Clear existing timer
		const existingTimer = this.state.debounceTimers.get(debounceKey)
		if (existingTimer) {
			clearTimeout(existingTimer)
		}

		// Set new timer
		const timer = setTimeout(async () => {
			this.state.debounceTimers.delete(debounceKey)
			await this.handleFileChange(event, config)
		}, debounceDelay)

		this.state.debounceTimers.set(debounceKey, timer)
	}

	private async handleFileChange(
		event: FileChangeEvent,
		config: WatchPathConfig,
	): Promise<void> {
		this.state.lastChange = event.timestamp

		try {
			console.log(`📝 File ${event.eventType}: ${event.filePath}`)

			// Process the change through reactive signals
			await this.processor.processFileChange(event)

			// Emit the file change event
			this.eventEmitter.emit('file:changed', {
				event,
				buildCommands: config.buildCommands,
			})

			console.log(`✅ Reactive signals updated for: ${event.filePath}`)
		} catch (error) {
			console.error(
				`❌ Error processing file change ${event.filePath}:`,
				error,
			)

			this.eventEmitter.emit('build:error', {
				error: {
					name: 'FileChangeError',
					message: `Failed to process file change: ${error.message}`,
					code: 'FILE_CHANGE_ERROR',
				} as any,
				files: [event.filePath],
			})
		}
	}

	private async scanInitialFiles(): Promise<void> {
		console.log('🔍 Scanning initial files for reactive signals...')

		const scanDirectory = async (
			directory: string,
			extensions: string[],
		) => {
			try {
				const { readdir } = await import('fs/promises')
				const entries = await readdir(directory, {
					withFileTypes: true,
					recursive: true,
				})

				for (const entry of entries) {
					if (entry.isFile()) {
						const filePath = join(
							entry.parentPath || directory,
							entry.name,
						)
						const ext = '.' + entry.name.split('.').pop()

						if (
							extensions.length === 0 ||
							extensions.includes(ext)
						) {
							try {
								const content = await readFile(filePath, 'utf8')
								const stats = await stat(filePath)

								this.processor.updateFile(
									filePath,
									content,
									stats.mtimeMs,
								)
							} catch (error) {
								console.warn(
									`⚠️ Could not read initial file ${filePath}:`,
									error,
								)
							}
						}
					}
				}
			} catch (error) {
				console.warn(`⚠️ Could not scan directory ${directory}:`, error)
			}
		}

		// Scan all watched directories
		for (const config of this.config.watch.paths) {
			await scanDirectory(config.directory, config.extensions)
		}

		// Scan reactive-specific directories
		const reactiveDirs = [
			{
				dir: join(process.cwd(), 'docs-src/pages'),
				exts: ['.md'],
			},
			{
				dir: join(process.cwd(), 'docs-src/server/templates'),
				exts: ['.ts'],
			},
			{
				dir: join(process.cwd(), 'docs-src/server/includes'),
				exts: ['.html'],
			},
			{
				dir: join(process.cwd(), 'docs-src/components'),
				exts: ['.ts', '.html', '.css'],
			},
		]

		for (const { dir, exts } of reactiveDirs) {
			await scanDirectory(dir, exts)
		}

		const mdFiles = this.signals.markdownFiles.get().size
		const templateFiles = this.signals.templateFiles.get().size
		const componentFiles = this.signals.componentFiles.get().size

		console.log(
			`📊 Initial scan complete: ${mdFiles} markdown, ${templateFiles} templates, ${componentFiles} components`,
		)
	}

	getWatchedPaths(): string[] {
		return Array.from(this.state.watchedPaths)
	}

	isWatching(): boolean {
		return this.state.isActive
	}

	getStats(): {
		watchedPaths: number
		activeTimers: number
		lastChange: number
		isActive: boolean
		trackedFiles: number
	} {
		const mdFiles = this.signals.markdownFiles.get().size
		const templateFiles = this.signals.templateFiles.get().size
		const componentFiles = this.signals.componentFiles.get().size

		return {
			watchedPaths: this.state.watchedPaths.size,
			activeTimers: this.state.debounceTimers.size,
			lastChange: this.state.lastChange,
			isActive: this.state.isActive,
			trackedFiles: mdFiles + templateFiles + componentFiles,
		}
	}
}

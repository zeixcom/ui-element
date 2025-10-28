/**
 * Smart File Watcher leveraging Bun 1.3's native file watching capabilities
 */

import { existsSync, statSync } from 'fs'
import { watch } from 'fs/promises'
import { resolve } from 'path'
import type {
	DevServerConfig,
	FileChangeEvent,
	IEventEmitter,
	ISmartFileWatcher,
	WatcherState,
	WatchPathConfig,
} from '../types'

/**
 * Enhanced file watcher with smart debouncing and change detection
 */
export class SmartFileWatcher implements ISmartFileWatcher {
	private watchers = new Map<string, AsyncIterableIterator<any>>()
	private state: WatcherState = {
		isActive: false,
		lastChange: 0,
		debounceTimers: new Map<string, Timer>(),
		watchedPaths: new Set<string>(),
	}

	private fileStats = new Map<string, { size: number; mtime: number }>()
	private eventEmitter: IEventEmitter | null = null

	constructor(
		private config: DevServerConfig,
		eventEmitter?: IEventEmitter,
	) {
		this.eventEmitter = eventEmitter || null
	}

	/**
	 * Start watching all configured paths
	 */
	public async start(): Promise<void> {
		if (this.state.isActive) {
			console.warn('⚠️  File watcher is already active')
			return
		}

		console.log(
			'👀 Starting Smart File Watcher with Bun 1.3 native watchers...',
		)

		try {
			// Start watching each configured path
			for (const pathConfig of this.config.watch.paths) {
				await this.addPath(pathConfig)
			}

			this.state.isActive = true
			console.log(`✅ Watching ${this.watchers.size} directories`)

			this.eventEmitter?.emit('server:ready', {
				port: this.config.server.port,
				host: this.config.server.host || 'localhost',
			})
		} catch (error) {
			console.error('❌ Failed to start file watcher:', error)
			throw error
		}
	}

	/**
	 * Stop all file watchers
	 */
	public async stop(): Promise<void> {
		console.log('🛑 Stopping file watcher...')

		// Clear all debounce timers
		for (const timer of this.state.debounceTimers.values()) {
			clearTimeout(timer)
		}
		this.state.debounceTimers.clear()

		// Stop all watchers
		for (const [path, watcher] of this.watchers.entries()) {
			try {
				if (
					'return' in watcher &&
					typeof watcher.return === 'function'
				) {
					await watcher.return()
				}
			} catch (error) {
				console.warn(`⚠️  Error stopping watcher for ${path}:`, error)
			}
		}

		this.watchers.clear()
		this.state.watchedPaths.clear()
		this.state.isActive = false
		this.fileStats.clear()

		console.log('✅ File watcher stopped')
	}

	/**
	 * Add a new path to watch
	 */
	public async addPath(config: WatchPathConfig): Promise<void> {
		const absolutePath = resolve(config.directory)

		if (!existsSync(absolutePath)) {
			console.warn(`⚠️  Directory does not exist: ${absolutePath}`)
			return
		}

		if (this.state.watchedPaths.has(absolutePath)) {
			console.warn(`⚠️  Already watching: ${absolutePath}`)
			return
		}

		try {
			console.log(`${config.label} Watching: ${absolutePath}`)

			// Use Bun's native watch with optimized settings
			const watcher = watch(absolutePath, {
				recursive: true,
			})

			// Start the async iteration in the background
			this.startWatching(watcher, config, absolutePath)

			this.watchers.set(absolutePath, watcher)
			this.state.watchedPaths.add(absolutePath)
		} catch (error) {
			console.error(`❌ Failed to watch ${absolutePath}:`, error)
			throw error
		}
	}

	/**
	 * Remove a path from watching
	 */
	public async removePath(directory: string): Promise<void> {
		const absolutePath = resolve(directory)
		const watcher = this.watchers.get(absolutePath)

		if (watcher) {
			try {
				if (
					'return' in watcher &&
					typeof watcher.return === 'function'
				) {
					await watcher.return()
				}
			} catch (error) {
				console.warn(
					`⚠️  Error stopping watcher for ${absolutePath}:`,
					error,
				)
			}
		}

		this.watchers.delete(absolutePath)
		this.state.watchedPaths.delete(absolutePath)

		// Clear any pending debounce timers for this path
		for (const [key, timer] of this.state.debounceTimers.entries()) {
			if (key.startsWith(absolutePath)) {
				clearTimeout(timer)
				this.state.debounceTimers.delete(key)
			}
		}
	}

	/**
	 * Get list of currently watched paths
	 */
	public getWatchedPaths(): string[] {
		return Array.from(this.state.watchedPaths)
	}

	/**
	 * Check if watcher is active
	 */
	public isWatching(): boolean {
		return this.state.isActive
	}

	/**
	 * Start the async watching process for a specific watcher
	 */
	private async startWatching(
		watcher: AsyncIterableIterator<any>,
		config: WatchPathConfig,
		watchPath: string,
	): Promise<void> {
		try {
			for await (const event of watcher) {
				await this.handleFileChange(event, config, watchPath)
			}
		} catch (error) {
			if (this.state.isActive) {
				console.error(`❌ Watcher error for ${watchPath}:`, error)
				this.eventEmitter?.emit('server:error', {
					error: {
						message: `Watcher error: ${error.message}`,
						code: 'WATCH_ERROR',
						statusCode: 500,
					} as any,
				})
			}
		}
	}

	/**
	 * Handle individual file change events
	 */
	private async handleFileChange(
		event: any,
		config: WatchPathConfig,
		watchPath: string,
	): Promise<void> {
		if (!event?.filename) return

		const filename = event.filename
		const eventType = event.eventType || 'change'

		// Check if file matches watched extensions
		const matchesExtension = config.extensions.some(ext =>
			filename.endsWith(ext),
		)

		if (!matchesExtension) return

		const fullPath = resolve(watchPath, filename)
		const relativePath = fullPath.replace(process.cwd() + '/', '')

		// Skip hidden files and common ignore patterns
		if (this.shouldIgnoreFile(filename)) {
			return
		}

		// Create file change event
		const fileChangeEvent: FileChangeEvent = {
			filename,
			eventType: this.normalizeEventType(eventType),
			filePath: relativePath,
			timestamp: Date.now(),
		}

		// Smart change detection - check if file actually changed
		if (await this.hasFileActuallyChanged(fullPath, fileChangeEvent)) {
			await this.debounceAndProcess(fileChangeEvent, config)
		}
	}

	/**
	 * Normalize different event types across platforms
	 */
	private normalizeEventType(
		eventType: string,
	): FileChangeEvent['eventType'] {
		switch (eventType.toLowerCase()) {
			case 'rename':
			case 'renamed':
				return 'rename'
			case 'change':
			case 'changed':
			case 'modified':
				return 'change'
			default:
				return 'change'
		}
	}

	/**
	 * Check if file should be ignored
	 */
	private shouldIgnoreFile(filename: string): boolean {
		const ignorePatterns = [
			/^\./, // Hidden files
			/~$/, // Temporary files
			/\.tmp$/, // Temporary files
			/\.swp$/, // Vim swap files
			/\.DS_Store$/, // macOS metadata
			/thumbs\.db$/i, // Windows thumbnails
		]

		return ignorePatterns.some(pattern => pattern.test(filename))
	}

	/**
	 * Check if file has actually changed using stat information
	 */
	private async hasFileActuallyChanged(
		fullPath: string,
		event: FileChangeEvent,
	): Promise<boolean> {
		try {
			// For delete events, always process
			if (event.eventType === 'rename') {
				// In Node.js fs.watch, 'rename' can indicate file deletion
				if (!existsSync(fullPath)) {
					this.fileStats.delete(fullPath)
					return true
				}
			}

			// Check if file exists
			if (!existsSync(fullPath)) {
				this.fileStats.delete(fullPath)
				return event.eventType === 'delete'
			}

			const stats = statSync(fullPath)
			const newStat = {
				size: stats.size,
				mtime: stats.mtimeMs,
			}

			const oldStat = this.fileStats.get(fullPath)

			// If we haven't seen this file before, it's a change
			if (!oldStat) {
				this.fileStats.set(fullPath, newStat)
				return true
			}

			// Check if size or modification time changed
			const hasChanged =
				oldStat.size !== newStat.size || oldStat.mtime !== newStat.mtime

			if (hasChanged) {
				this.fileStats.set(fullPath, newStat)
			}

			return hasChanged
		} catch (error) {
			// If we can't stat the file, assume it changed
			console.warn(`⚠️  Could not stat file ${fullPath}:`, error.message)
			return true
		}
	}

	/**
	 * Debounce file changes and process them
	 */
	private async debounceAndProcess(
		event: FileChangeEvent,
		config: WatchPathConfig,
	): Promise<void> {
		const debounceKey = event.filePath

		// Clear existing timer for this file
		const existingTimer = this.state.debounceTimers.get(debounceKey)
		if (existingTimer) {
			clearTimeout(existingTimer)
		}

		// Create new debounced timer
		const timer = setTimeout(async () => {
			this.state.debounceTimers.delete(debounceKey)

			try {
				await this.processFileChange(event, config)
			} catch (error: any) {
				console.error(
					`❌ Error processing file change for ${event.filePath}:`,
					error,
				)
				this.eventEmitter?.emit('build:error', {
					error: {
						message: `File processing error: ${error.message}`,
					} as any,
					files: [event.filePath],
				})
			}
		}, this.config.watch.debounceDelay)

		this.state.debounceTimers.set(debounceKey, timer)
	}

	/**
	 * Process a file change event
	 */
	private async processFileChange(
		event: FileChangeEvent,
		config: WatchPathConfig,
	): Promise<void> {
		console.log(
			`\n${config.label} Change detected [${event.eventType}]: ${event.filePath}`,
		)

		// Emit file change event directly - plugins will determine what to do
		this.eventEmitter?.emit('file:changed', {
			event,
		})

		this.state.lastChange = Date.now()
	}

	/**
	 * Get watcher statistics
	 */
	public getStats(): {
		watchedPaths: number
		activeTimers: number
		lastChange: number
		isActive: boolean
		trackedFiles: number
	} {
		return {
			watchedPaths: this.state.watchedPaths.size,
			activeTimers: this.state.debounceTimers.size,
			lastChange: this.state.lastChange,
			isActive: this.state.isActive,
			trackedFiles: this.fileStats.size,
		}
	}
}

/**
 * File Watcher with Debouncing and Pattern Matching
 *
 * This module provides efficient file system monitoring with:
 * - Debounced change detection to avoid rapid fire events
 * - Pattern-based filtering for relevant file types
 * - Integration with reactive signals
 * - Bun's native file watching capabilities
 */

import type { FSWatcher } from 'fs'
import { watch } from 'fs'
import { extname, join, relative } from 'path'
import { fileSignals } from './file-signals'
import type { FileChangeEvent } from './types'

export interface WatcherOptions {
	extensions: string[]
	recursive?: boolean
	ignore?: string[]
	debounceDelay?: number
	maxConcurrentEvents?: number
	enableLogging?: boolean
}

export function watchFiles(directory: string, options: WatcherOptions) {
	console.log('Watching files in directory:', directory)

	const watcher = watch(
		directory,
		{ recursive: options.recursive, persistent: true },
		(event, filename) => {
			if (!filename) return

			const filePath = join(directory, filename)
			const fileExt = extname(filePath)

			if (!options.extensions.includes(fileExt)) return

			const eventSignal = fileSignals.get(filePath)
			if (!eventSignal) return

			eventSignal.emit(event)
		},
	)

	const stop = () => {
		watcher.close()
		console.log('File watcher stopped:', directory)
	}

	return stop
}

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface WatchPattern {
	directory: string
	extensions: string[]
	recursive?: boolean
	ignore?: string[]
}

export interface WatcherStats {
	totalWatchers: number
	totalEvents: number
	activeTimers: number
	lastEventTime: number
}

// ============================================================================
// File Pattern Utilities
// ============================================================================

/**
 * Check if file path matches any of the watch patterns
 */
export function matchesWatchPattern(
	filePath: string,
	patterns: WatchPattern[],
): WatchPattern | null {
	for (const pattern of patterns) {
		// Check if file is in the directory
		const relativePath = relative(pattern.directory, filePath)
		if (relativePath.startsWith('..')) continue

		// Check extension
		if (pattern.extensions.length > 0) {
			const ext = extname(filePath)
			if (!pattern.extensions.includes(ext)) continue
		}

		// Check ignore patterns
		if (pattern.ignore && pattern.ignore.length > 0) {
			const shouldIgnore = pattern.ignore.some(ignorePattern => {
				if (ignorePattern.includes('*')) {
					// Simple glob matching
					const regex = new RegExp(ignorePattern.replace(/\*/g, '.*'))
					return regex.test(relativePath)
				}
				return relativePath.includes(ignorePattern)
			})
			if (shouldIgnore) continue
		}

		return pattern
	}
	return null
}

/**
 * Determine file change event type based on file existence and previous state
 */
export function determineEventType(
	filePath: string,
	eventType: string,
	fileExists: boolean,
): FileChangeEvent['eventType'] {
	switch (eventType) {
		case 'rename':
			return fileExists ? 'create' : 'delete'
		case 'change':
			return 'change'
		default:
			return 'change'
	}
}

// ============================================================================
// Debouncer Class
// ============================================================================

class EventDebouncer {
	private timers = new Map<string, Timer>()
	private pendingEvents = new Map<string, FileChangeEvent>()
	private readonly delay: number
	private readonly maxConcurrent: number

	constructor(delay: number = 100, maxConcurrent: number = 10) {
		this.delay = delay
		this.maxConcurrent = maxConcurrent
	}

	/**
	 * Debounce file change events to avoid rapid-fire processing
	 */
	public debounce(
		event: FileChangeEvent,
		callback: (event: FileChangeEvent) => Promise<void>,
	): void {
		const key = event.filePath

		// Clear existing timer
		const existingTimer = this.timers.get(key)
		if (existingTimer) {
			clearTimeout(existingTimer)
		}

		// Update pending event (latest wins)
		this.pendingEvents.set(key, event)

		// Set new timer
		const timer = setTimeout(async () => {
			const pendingEvent = this.pendingEvents.get(key)
			if (pendingEvent) {
				this.timers.delete(key)
				this.pendingEvents.delete(key)

				try {
					await callback(pendingEvent)
				} catch (error) {
					console.error(
						`Error processing file event for ${key}:`,
						error,
					)
				}
			}
		}, this.delay)

		this.timers.set(key, timer)

		// Prevent memory leaks by limiting concurrent events
		if (this.timers.size > this.maxConcurrent) {
			console.warn(
				`File watcher has ${this.timers.size} pending events, which exceeds maxConcurrent (${this.maxConcurrent})`,
			)
		}
	}

	/**
	 * Get number of active timers
	 */
	public getActiveTimers(): number {
		return this.timers.size
	}

	/**
	 * Clear all pending timers
	 */
	public clear(): void {
		for (const timer of this.timers.values()) {
			clearTimeout(timer)
		}
		this.timers.clear()
		this.pendingEvents.clear()
	}
}

// ============================================================================
// File Watcher Class
// ============================================================================

export class FileWatcher {
	private watchers = new Map<string, FSWatcher>()
	private patterns: WatchPattern[] = []
	private debouncer: EventDebouncer
	private options: WatcherOptions
	private stats: WatcherStats = {
		totalWatchers: 0,
		totalEvents: 0,
		activeTimers: 0,
		lastEventTime: 0,
	}
	private isActive = false

	constructor(options: Partial<WatcherOptions> = {}) {
		this.options = {
			debounceDelay: 100,
			maxConcurrentEvents: 50,
			enableLogging: false,
			...options,
		}

		this.debouncer = new EventDebouncer(
			this.options.debounceDelay,
			this.options.maxConcurrentEvents,
		)
	}

	// ============================================================================
	// Pattern Management
	// ============================================================================

	/**
	 * Add watch pattern
	 */
	public addPattern(pattern: WatchPattern): void {
		this.patterns.push(pattern)
		if (this.isActive) {
			this.watchDirectory(pattern)
		}
	}

	/**
	 * Remove watch pattern
	 */
	public removePattern(directory: string): void {
		this.patterns = this.patterns.filter(p => p.directory !== directory)

		const watcher = this.watchers.get(directory)
		if (watcher) {
			watcher.close()
			this.watchers.delete(directory)
			this.stats.totalWatchers--
		}
	}

	/**
	 * Get all current patterns
	 */
	public getPatterns(): readonly WatchPattern[] {
		return [...this.patterns]
	}

	// ============================================================================
	// Watching Operations
	// ============================================================================

	/**
	 * Start watching all configured patterns
	 */
	public async start(): Promise<void> {
		if (this.isActive) {
			console.warn('File watcher is already active')
			return
		}

		this.log('Starting file watcher...')
		this.isActive = true

		for (const pattern of this.patterns) {
			this.watchDirectory(pattern)
		}

		this.log(`Watching ${this.patterns.length} directories`)
	}

	/**
	 * Stop all watchers
	 */
	public async stop(): Promise<void> {
		if (!this.isActive) {
			return
		}

		this.log('Stopping file watcher...')
		this.isActive = false

		// Close all watchers
		for (const [directory, watcher] of this.watchers) {
			try {
				watcher.close()
			} catch (error) {
				console.error(`Error closing watcher for ${directory}:`, error)
			}
		}

		this.watchers.clear()
		this.debouncer.clear()
		this.stats.totalWatchers = 0

		this.log('File watcher stopped')
	}

	/**
	 * Watch a specific directory according to pattern
	 */
	private watchDirectory(pattern: WatchPattern): void {
		try {
			const watcher = watch(
				pattern.directory,
				{ recursive: pattern.recursive ?? true },
				(eventType, filename) => {
					this.handleFileEvent(eventType, filename, pattern)
				},
			)

			this.watchers.set(pattern.directory, watcher)
			this.stats.totalWatchers++

			this.log(
				`Watching ${pattern.directory} for ${pattern.extensions.join(', ')}`,
			)
		} catch (error) {
			console.error(
				`Failed to watch directory ${pattern.directory}:`,
				error,
			)
		}
	}

	/**
	 * Handle raw file system events
	 */
	private async handleFileEvent(
		eventType: string | null,
		filename: string | null,
		pattern: WatchPattern,
	): Promise<void> {
		if (!filename || !eventType) return

		const filePath = join(pattern.directory, filename)

		// Check if file matches pattern
		if (!matchesWatchPattern(filePath, [pattern])) {
			return
		}

		// Check if file exists
		let fileExists = false
		try {
			const { existsSync } = await import('fs')
			fileExists = existsSync(filePath)
		} catch {
			// File might be temporarily inaccessible
		}

		// Create file change event
		const changeEvent: FileChangeEvent = {
			filename,
			eventType: determineEventType(filePath, eventType, fileExists),
			filePath,
			timestamp: Date.now(),
		}

		// Update stats
		this.stats.totalEvents++
		this.stats.lastEventTime = changeEvent.timestamp
		this.stats.activeTimers = this.debouncer.getActiveTimers()

		this.log(
			`File ${changeEvent.eventType}: ${relative(process.cwd(), filePath)}`,
		)

		// Debounce and process
		this.debouncer.debounce(changeEvent, async event => {
			await this.processFileEvent(event)
		})
	}

	/**
	 * Process debounced file change event
	 */
	private async processFileEvent(event: FileChangeEvent): Promise<void> {
		try {
			// Emit to signals system
			fileSignals.emitFileChange(event)

			// Update file tracking
			if (event.eventType === 'delete') {
				fileSignals.removeFile(event.filePath)
			} else {
				await fileSignals.updateFile(event.filePath)
			}

			this.log(`Processed ${event.eventType} for ${event.filename}`)
		} catch (error) {
			console.error(
				`Error processing file event for ${event.filePath}:`,
				error,
			)
		}
	}

	// ============================================================================
	// Utility Methods
	// ============================================================================

	/**
	 * Get watcher statistics
	 */
	public getStats(): WatcherStats {
		return {
			...this.stats,
			activeTimers: this.debouncer.getActiveTimers(),
		}
	}

	/**
	 * Check if watcher is active
	 */
	public isWatching(): boolean {
		return this.isActive
	}

	/**
	 * Get list of watched directories
	 */
	public getWatchedDirectories(): string[] {
		return Array.from(this.watchers.keys())
	}

	/**
	 * Force process a file (bypass debouncing)
	 */
	public async forceProcessFile(filePath: string): Promise<void> {
		const event: FileChangeEvent = {
			filename: require('path').basename(filePath),
			eventType: 'change',
			filePath,
			timestamp: Date.now(),
		}

		await this.processFileEvent(event)
	}

	/**
	 * Log message if logging is enabled
	 */
	private log(message: string): void {
		if (this.options.enableLogging) {
			console.log(`[FileWatcher] ${message}`)
		}
	}
}

// ============================================================================
// Default Patterns
// ============================================================================

import { COMPONENTS_DIR, OUTPUT_DIR, PAGES_DIR, SRC_DIR } from './config'

/**
 * Default watch patterns for the documentation build system
 */
export const defaultWatchPatterns: WatchPattern[] = [
	{
		directory: PAGES_DIR,
		extensions: ['.md'],
		recursive: true,
		ignore: ['node_modules', '.git', 'dist'],
	},
	{
		directory: COMPONENTS_DIR,
		extensions: ['.html', '.css', '.ts'],
		recursive: true,
		ignore: ['*.test.html', 'node_modules'],
	},
	{
		directory: SRC_DIR,
		extensions: ['.ts'],
		recursive: true,
		ignore: ['node_modules', 'dist', '*.test.ts'],
	},
	{
		directory: './docs-src',
		extensions: ['.css', '.ts', '.html'],
		recursive: false, // Only root files
		ignore: ['node_modules'],
	},
]

// ============================================================================
// Global Instance
// ============================================================================

/**
 * Global file watcher instance
 */
export const fileWatcher = new FileWatcher({
	debounceDelay: 100,
	maxConcurrentEvents: 50,
	enableLogging: process.env.NODE_ENV === 'development',
})

// Set up default patterns
for (const pattern of defaultWatchPatterns) {
	fileWatcher.addPattern(pattern)
}

/**
 * TypeScript types and interfaces for the dev server architecture
 */

import type { ServerWebSocket } from 'bun'

// ============================================================================
// Core Configuration Types
// ============================================================================

export interface DevServerConfig {
	/** Server configuration */
	server: {
		port: number
		host?: string
		development: boolean
	}

	/** Directory paths */
	paths: {
		pages: string
		components: string
		src: string
		output: string
		assets: string
		includes: string
		layout: string
	}

	/** Build configuration */
	build: {
		optimizeLayout: boolean
		generateSourceMaps: boolean
		minify: boolean
		cacheMaxAge: number
	}

	/** File watching configuration */
	watch: {
		debounceDelay: number
		paths: WatchPathConfig[]
	}

	/** Asset optimization */
	assets: {
		compression: {
			enabled: boolean
			brotli: boolean
			gzip: boolean
		}
		versioning: {
			enabled: boolean
			hashLength: number
		}
	}
}

export interface WatchPathConfig {
	directory: string
	extensions: string[]
	label: string
	buildCommands: string[]
}

// ============================================================================
// Build System Types
// ============================================================================

export interface BuildInput {
	filePath: string
	content: string
	metadata?: Record<string, unknown>
	changedFiles?: string[]
}

export interface BuildOutput {
	success: boolean
	filePath?: string
	content?: string
	metadata?: Record<string, unknown>
	errors?: BuildErrorInfo[]
	warnings?: BuildWarningInfo[]
	dependencies?: string[]
	stats?: BuildStats
}

export interface BuildErrorInfo {
	message: string
	file?: string
	line?: number
	column?: number
	stack?: string
}

export interface BuildWarningInfo {
	message: string
	file?: string
	line?: number
	column?: number
}

export interface BuildStats {
	startTime: number
	endTime: number
	duration: number
	inputSize?: number
	outputSize?: number
}

export interface BuildPlugin {
	name: string
	version?: string
	description?: string

	/** Check if plugin should process this file */
	shouldRun(filePath: string): boolean

	/** Transform the input */
	transform(input: BuildInput): Promise<BuildOutput>

	/** Optional: Initialize plugin */
	initialize?(config: DevServerConfig): Promise<void>

	/** Optional: Cleanup plugin */
	cleanup?(): Promise<void>

	/** Optional: Get plugin dependencies */
	getDependencies?(filePath: string): Promise<string[]>
}

// ============================================================================
// File System Types
// ============================================================================

export interface FileChangeEvent {
	filename: string
	eventType: 'rename' | 'change' | 'create' | 'delete'
	filePath: string
	timestamp: number
}

export interface WatcherState {
	isActive: boolean
	lastChange: number
	debounceTimers: Map<string, Timer>
	watchedPaths: Set<string>
}

// ============================================================================
// Server Types
// ============================================================================

export interface ServerContext {
	config: DevServerConfig
	sockets: Set<ServerWebSocket>
	buildSystem: IModularSSG
	watcher: ISmartFileWatcher
	isRebuilding: boolean
	pendingRebuild: boolean
}

export interface RequestContext {
	url: URL
	path: string
	method: string
	headers: Headers
	acceptsGzip: boolean
	acceptsBrotli: boolean
}

export interface ResponseOptions {
	status?: number
	headers?: HeadersInit
	compression?: 'none' | 'gzip' | 'brotli'
	cache?: 'no-cache' | 'immutable' | 'default'
}

// ============================================================================
// Content Processing Types
// ============================================================================

export interface PageMetadata {
	title?: string
	description?: string
	emoji?: string
	url?: string
	section?: string
	order?: number
	draft?: boolean
	tags?: string[]
	created?: Date
	updated?: Date
}

export interface ProcessedPage {
	filePath: string
	outputPath: string
	metadata: PageMetadata
	content: string
	toc?: TableOfContentsEntry[]
	dependencies: string[]
	hash: string
}

export interface TableOfContentsEntry {
	id: string
	title: string
	level: number
	anchor: string
	children?: TableOfContentsEntry[]
}

export interface CodeBlock {
	language: string
	code: string
	filename?: string
	collapsed?: boolean
	copyable?: boolean
	lineNumbers?: boolean
}

export interface ComponentFragment {
	name: string
	files: {
		html?: string
		css?: string
		typescript?: string
	}
	metadata?: Record<string, unknown>
}

// ============================================================================
// Asset Processing Types
// ============================================================================

export interface AssetInfo {
	filePath: string
	outputPath: string
	hash: string
	size: number
	compressed?: {
		gzip?: { size: number; ratio: number }
		brotli?: { size: number; ratio: number }
	}
	preloadHints?: string[]
}

export interface OptimizedAssets {
	css: AssetInfo[]
	js: AssetInfo[]
	images: AssetInfo[]
	fonts: AssetInfo[]
}

// ============================================================================
// Plugin-Specific Types
// ============================================================================

export interface MarkdownPluginOptions {
	frontmatter: boolean
	toc: boolean
	permalinks: boolean
	syntaxHighlighting: {
		theme: string
		languages: string[]
	}
	customExtensions: {
		codeBlocks: boolean
		internalLinks: boolean
		apiCleanup: boolean
	}
}

export interface CodeBlockPluginOptions {
	collapsible: boolean
	copyable: boolean
	lineNumbers: boolean
	maxLinesBeforeCollapse: number
	highlighter: 'shiki' | 'prism'
	theme: string
}

export interface AssetPluginOptions {
	minify: boolean
	sourceMaps: boolean
	compression: {
		brotli: boolean
		gzip: boolean
	}
	versioning: boolean
	optimization: {
		images: boolean
		css: boolean
		js: boolean
	}
}

// ============================================================================
// Error Types
// ============================================================================

export class DevServerError extends Error {
	constructor(
		message: string,
		public code: string,
		public file?: string,
		public line?: number,
		public column?: number,
	) {
		super(message)
		this.name = 'DevServerError'
	}
}

export class BuildErrorClass extends DevServerError {
	constructor(
		message: string,
		file?: string,
		line?: number,
		column?: number,
	) {
		super(message, 'BUILD_ERROR', file, line, column)
		this.name = 'BuildErrorClass'
	}
}

export class WatchErrorClass extends DevServerError {
	constructor(message: string, file?: string) {
		super(message, 'WATCH_ERROR', file)
		this.name = 'WatchErrorClass'
	}
}

export class ServerErrorClass extends DevServerError {
	constructor(
		message: string,
		public statusCode: number = 500,
	) {
		super(message, 'SERVER_ERROR')
		this.name = 'ServerErrorClass'
	}
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
	Partial<Pick<T, K>>

// Forward declarations for classes (defined in other modules)
export interface ISmartFileWatcher {
	start(): Promise<void>
	stop(): Promise<void>
	addPath(config: WatchPathConfig): Promise<void>
	removePath(directory: string): Promise<void>
	getWatchedPaths(): string[]
	isWatching(): boolean
	getStats(): {
		watchedPaths: number
		activeTimers: number
		lastChange: number
		isActive: boolean
		trackedFiles: number
	}
}

export interface IModularSSG {
	use(plugin: BuildPlugin): IModularSSG
	build(changedFiles?: string[]): Promise<BuildOutput[]>
	buildFile(filePath: string): Promise<BuildOutput>
	getPlugins(): BuildPlugin[]
	getApplicablePlugins(filePath?: string): BuildPlugin[]
	getDependencyGraph(): Map<string, string[]>
	initialize(): Promise<void>
	cleanup(): Promise<void>
	writeOutput(result: BuildOutput): Promise<void>
	getStats(): {
		pluginCount: number
		dependencyCount: number
		buildsInProgress: number
		lastBuildTime?: number
	}
}

// ============================================================================
// Event Types
// ============================================================================

export interface ServerEvents {
	'build:start': { files: string[]; commands: string[] }
	'build:complete': { results: BuildOutput[]; duration: number }
	'build:error': { error: BuildErrorClass; files: string[] }
	'file:changed': { event: FileChangeEvent; buildCommands: string[] }
	'client:connected': { socket: ServerWebSocket; clientCount: number }
	'client:disconnected': { socket: ServerWebSocket; clientCount: number }
	'server:ready': { port: number; host: string }
	'server:error': { error: ServerErrorClass }
}

export type EventHandler<T = unknown> = (data: T) => void | Promise<void>

export interface IEventEmitter {
	on<K extends keyof ServerEvents>(
		event: K,
		handler: EventHandler<ServerEvents[K]>,
	): void
	off<K extends keyof ServerEvents>(
		event: K,
		handler: EventHandler<ServerEvents[K]>,
	): void
	emit<K extends keyof ServerEvents>(event: K, data: ServerEvents[K]): void
}

import { type Computed, computed, type State, state } from '@zeix/cause-effect'
import { basename, dirname, extname, join, relative } from 'path'
import {
	COMPONENTS_DIR,
	FUNCTIONS_DIR,
	INPUT_DIR,
	PAGES_DIR,
	SRC_DIR,
	TEMPLATES_DIR,
} from './config'
import { extractFrontmatter, getRelativePath, watchFiles } from './io'
import type {
	ComponentFile,
	FileChangeEvent,
	FileInfo,
	PageInfo,
	PageMetadata,
	ProcessedFile,
} from './types'

export const markdownFiles: {
	sources: State<Map<string, FileInfo>>
	processed: Computed<Map<string, FileInfo & { metadata: PageMetadata }>>
	pageInfos: Computed<PageInfo[]>
} = (() => {
	const sources = watchFiles(PAGES_DIR, {
		recursive: true,
		extensions: ['.md'],
		ignore: ['README.md'],
	})

	const processed = computed(async () => {
		const files = new Map<string, FileInfo & { metadata: PageMetadata }>()
		for (const [path, fileInfo] of sources.get()) {
			if (!fileInfo) continue
			const { metadata, content } = extractFrontmatter(fileInfo.content)
			files.set(path, {
				...fileInfo,
				content, // Content without frontmatter
				metadata,
			})
		}
		return files
	})

	const pageInfos = computed(async () => {
		const pageInfos: PageInfo[] = []
		const files = processed.get()
		for (const [path, file] of files) {
			const relativePath = getRelativePath(PAGES_DIR, path)
			if (!relativePath) continue
			pageInfos.push({
				url: relativePath.replace('.md', '.html'),
				title: file.metadata.title || file.filename.replace('.md', ''),
				emoji: file.metadata.emoji || '📄',
				description: file.metadata.description || '',
				filename: file.filename,
				relativePath,
				lastModified: file.lastModified,
				section: relativePath.split('/').slice(1).join('/'),
			})
		}
		return pageInfos
	})

	return {
		sources,
		processed,
		pageInfos,
	}
})()

export const libraryScripts = (() => {
	const sources = watchFiles(SRC_DIR, {
		recursive: true,
		extensions: ['.ts'],
	})

	return {
		sources,
	}
})()

export const docsScripts = (() => {
	const sources = watchFiles(INPUT_DIR, {
		recursive: false,
		extensions: ['.ts'],
	})

	return {
		sources,
	}
})()

export const componentScripts = (() => {
	const sources = watchFiles(COMPONENTS_DIR, {
		recursive: true,
		extensions: ['.ts'],
	})

	return {
		sources,
	}
})()

export const templateScripts = (() => {
	const sources = watchFiles(TEMPLATES_DIR, {
		recursive: true,
		extensions: ['.ts'],
	})

	return {
		sources,
	}
})()

export const docsStyles = (() => {
	const sources = watchFiles(INPUT_DIR, {
		recursive: false,
		extensions: ['.css'],
	})

	return {
		sources,
	}
})()

export const componentStyles = (() => {
	const sources = watchFiles(COMPONENTS_DIR, {
		recursive: true,
		extensions: ['.css'],
	})

	return {
		sources,
	}
})()

export const componentMarkup = (() => {
	const sources = watchFiles(COMPONENTS_DIR, {
		recursive: true,
		extensions: ['.html'],
		ignore: ['.test.html'],
	})

	return {
		sources,
	}
})()

/**
 * Check if file has changed based on modification time and hash
 */
export function hasFileChanged(
	current: FileInfo | null,
	previous: FileInfo | null,
): boolean {
	if (!current && !previous) return false
	if (!current || !previous) return true

	// Quick check: modification time
	if (current.lastModified !== previous.lastModified) return true

	// Thorough check: content hash
	if (current.hash !== previous.hash) return true

	return false
}

// ============================================================================
// Reactive File Signals
// ============================================================================

/**
 * Core file tracking signals
 */
export class FileSignals {
	// Raw file content tracking
	public readonly sourceFiles = state<Map<string, FileInfo>>(new Map())
	public readonly assetFiles = state<Map<string, FileInfo>>(new Map())

	// Processed file results
	public readonly processedFiles = state<Map<string, ProcessedFile>>(
		new Map(),
	)

	// Build queue for incremental processing
	public readonly buildQueue = state<Set<string>>(new Set())

	// File change events
	public readonly fileChanges = state<FileChangeEvent | null>(null)

	// Computed signals for derived data
	public readonly markdownFiles: Computed<
		Map<string, FileInfo & { metadata: PageMetadata }>
	>
	public readonly componentFiles: Computed<Map<string, ComponentFile>>
	public readonly dependencyGraph: Computed<Map<string, Set<string>>>
	public readonly staleFiles: Computed<Set<string>>

	constructor() {
		// Computed: Markdown files with extracted metadata
		this.markdownFiles = computed(() => {
			const files = new Map<
				string,
				FileInfo & { metadata: PageMetadata }
			>()
			const sources = this.sourceFiles.get()

			for (const [path, fileInfo] of sources) {
				if (path.endsWith('.md') && fileInfo.exists) {
					const { metadata, content } = extractFrontmatter(
						fileInfo.content,
					)
					files.set(path, {
						...fileInfo,
						content, // Content without frontmatter
						metadata,
					})
				}
			}

			return files
		})

		// Computed: Component files grouped by component name
		this.componentFiles = computed(() => {
			const components = new Map<string, ComponentFile>()
			const sources = this.sourceFiles.get()

			for (const [path, fileInfo] of sources) {
				if (!path.includes('/components/') || !fileInfo.exists) continue

				const relativePath = relative(COMPONENTS_DIR, path)
				const componentName =
					dirname(relativePath) === '.'
						? basename(relativePath, extname(relativePath))
						: dirname(relativePath)

				if (!components.has(componentName)) {
					components.set(componentName, {
						name: componentName,
						lastModified: 0,
					})
				}

				const component = components.get(componentName)!
				const ext = extname(path)

				if (ext === '.html') {
					component.html = fileInfo
				} else if (ext === '.css') {
					component.css = fileInfo
				} else if (ext === '.ts') {
					component.typescript = fileInfo
				}

				// Update component's last modified time
				component.lastModified = Math.max(
					component.lastModified,
					fileInfo.lastModified,
				)
			}

			return components
		})

		// Computed: Dependency graph for incremental builds
		this.dependencyGraph = computed(() => {
			const graph = new Map<string, Set<string>>()
			const processed = this.processedFiles.get()

			for (const [path, file] of processed) {
				graph.set(path, new Set(file.dependencies))
			}

			return graph
		})

		// Computed: Files that need rebuilding based on dependencies
		this.staleFiles = computed(() => {
			const stale = new Set<string>()
			const queue = this.buildQueue.get()
			const graph = this.dependencyGraph.get()

			// Add files in build queue
			for (const file of queue) {
				stale.add(file)
			}

			// Add dependent files
			for (const [file, dependencies] of graph) {
				for (const dep of dependencies) {
					if (queue.has(dep)) {
						stale.add(file)
					}
				}
			}

			return stale
		})
	}

	// ============================================================================
	// File Operations
	// ============================================================================

	/**
	 * Update or add a file to the tracking system
	 */
	public async updateFile(filePath: string): Promise<void> {
		const fileInfo = await createFileInfo(filePath)
		if (!fileInfo) return

		const current = this.sourceFiles.get()
		const previous = current.get(filePath)

		if (hasFileChanged(fileInfo, previous || null)) {
			const updated = new Map(current)
			updated.set(filePath, fileInfo)
			this.sourceFiles.set(updated)

			// Add to build queue
			this.addToBuildQueue(filePath)
		}
	}

	/**
	 * Remove a file from tracking
	 */
	public removeFile(filePath: string): void {
		const current = this.sourceFiles.get()
		if (current.has(filePath)) {
			const updated = new Map(current)
			updated.delete(filePath)
			this.sourceFiles.set(updated)

			// Add to build queue for cleanup
			this.addToBuildQueue(filePath)
		}
	}

	/**
	 * Add file to build queue
	 */
	public addToBuildQueue(filePath: string): void {
		const current = this.buildQueue.get()
		if (!current.has(filePath)) {
			const updated = new Set(current)
			updated.add(filePath)
			this.buildQueue.set(updated)
		}
	}

	/**
	 * Remove file from build queue
	 */
	public removeFromBuildQueue(filePath: string): void {
		const current = this.buildQueue.get()
		if (current.has(filePath)) {
			const updated = new Set(current)
			updated.delete(filePath)
			this.buildQueue.set(updated)
		}
	}

	/**
	 * Clear build queue
	 */
	public clearBuildQueue(): void {
		this.buildQueue.set(new Set())
	}

	/**
	 * Emit file change event
	 */
	public emitFileChange(event: FileChangeEvent): void {
		this.fileChanges.set(event)
	}

	/**
	 * Update processed file result
	 */
	public updateProcessedFile(filePath: string, result: ProcessedFile): void {
		const current = this.processedFiles.get()
		const updated = new Map(current)
		updated.set(filePath, result)
		this.processedFiles.set(updated)
	}

	/**
	 * Get all files matching a pattern
	 */
	public getFilesByPattern(pattern: RegExp): FileInfo[] {
		const files: FileInfo[] = []
		const sources = this.sourceFiles.get()

		for (const [path, fileInfo] of sources) {
			if (pattern.test(path) && fileInfo.exists) {
				files.push(fileInfo)
			}
		}

		return files
	}

	/**
	 * Get file dependencies
	 */
	public getFileDependencies(filePath: string): string[] {
		const processed = this.processedFiles.get()
		const file = processed.get(filePath)
		return file ? file.dependencies : []
	}

	/**
	 * Check if any file in a set has changed
	 */
	public hasAnyFileChanged(filePaths: string[]): boolean {
		const queue = this.buildQueue.get()
		return filePaths.some(path => queue.has(path))
	}

	// ============================================================================
	// Batch Operations
	// ============================================================================

	/**
	 * Scan directory and update all files
	 */
	public async scanDirectory(
		directoryPath: string,
		extensions: string[] = [],
	): Promise<void> {
		try {
			const { readdir } = await import('fs/promises')
			const entries = await readdir(directoryPath, {
				withFileTypes: true,
				recursive: true,
			})

			for (const entry of entries) {
				if (entry.isFile()) {
					const fullPath = join(directoryPath, entry.name)

					// Filter by extensions if provided
					if (extensions.length > 0) {
						const ext = extname(entry.name)
						if (!extensions.includes(ext)) continue
					}

					await this.updateFile(fullPath)
				}
			}
		} catch (error) {
			console.error(`Error scanning directory ${directoryPath}:`, error)
		}
	}

	/**
	 * Initialize file tracking for all configured directories
	 */
	public async initializeFileTracking(): Promise<void> {
		console.log('Initializing file tracking...')

		const scanTasks = [
			this.scanDirectory(PAGES_DIR, ['.md']),
			this.scanDirectory(COMPONENTS_DIR, ['.html', '.css', '.ts']),
			this.scanDirectory(SRC_DIR, ['.ts']),
		]

		await Promise.all(scanTasks)

		const files = this.sourceFiles.get()
		console.log(`Tracking ${files.size} files`)

		// Debug: Show some tracked files
		const markdownFiles = Array.from(files.keys()).filter(path =>
			path.endsWith('.md'),
		)
		console.log(
			`Markdown files (${markdownFiles.length}):`,
			markdownFiles.slice(0, 5),
		)

		// Debug: Show pages directory files specifically
		const pagesFiles = Array.from(files.keys()).filter(path =>
			path.includes('/pages/'),
		)
		console.log(
			`Pages directory files (${pagesFiles.length}):`,
			pagesFiles.slice(0, 5),
		)
	}

	// ============================================================================
	// Debug Utilities
	// ============================================================================

	/**
	 * Get debug information about current state
	 */
	public getDebugInfo(): Record<string, unknown> {
		return {
			sourceFiles: this.sourceFiles.get().size,
			processedFiles: this.processedFiles.get().size,
			buildQueue: Array.from(this.buildQueue.get()),
			markdownFiles: this.markdownFiles.get().size,
			componentFiles: this.componentFiles.get().size,
			dependencyCount: Array.from(
				this.dependencyGraph.get().values(),
			).reduce((sum, deps) => sum + deps.size, 0),
		}
	}
}

// ============================================================================
// Global Instance
// ============================================================================

/**
 * Global file signals instance
 */
export const fileSignals = new FileSignals()

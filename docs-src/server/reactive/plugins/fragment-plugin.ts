/**
 * Reactive Fragment Plugin using Cause & Effect Signals
 * Phase 2: Advanced reactive architecture with async computed signals and error handling
 */

import { computed, effect, state, UNSET } from '@zeix/cause-effect'
import { readdir, readFile, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { codeToHtml } from 'shiki'
import { COMPONENTS_DIR, FRAGMENTS_DIR } from '../config'
import { BasePlugin } from '../plugins'
import { enhancedTabGroup, type PanelType } from '../templates/fragments'
import type {
	BuildInput,
	BuildOutput,
	DevServerConfig,
	FileChangeEvent,
	FileSystemSignals,
} from '../types'

interface ComponentFragmentInfo {
	name: string
	files: { html?: string; css?: string; typescript?: string }
	panelTypes: PanelType[]
	lastModified: number
}

interface ComponentTriple {
	name: string
	htmlPath?: string
	cssPath?: string
	tsPath?: string
	lastModified: number
}

export class FragmentPlugin extends BasePlugin {
	public readonly name = 'reactive-fragment-processor'
	public readonly version = '2.0.0'
	public readonly description =
		'Reactive component fragment processor using Cause & Effect signals'

	// Internal state for component tracking
	private componentTriples = state(new Map<string, ComponentTriple>())

	// Computed signal for processed fragments (async with error handling)
	private processedFragments = computed(async signal => {
		const triples = this.componentTriples.get()
		const fragments = new Map<string, ComponentFragmentInfo>()

		for (const [componentName, triple] of triples.entries()) {
			if (signal?.aborted) {
				throw new Error('Fragment processing aborted')
			}

			try {
				const fragmentInfo = await this.processComponentTriple(
					componentName,
					triple,
					signal,
				)
				if (fragmentInfo) {
					fragments.set(componentName, fragmentInfo)
				}
			} catch (error) {
				console.error(
					`❌ Error processing component ${componentName}:`,
					error,
				)
				// Continue processing other components
			}
		}

		return fragments
	})

	public shouldRun(filePath: string): boolean {
		return (
			(filePath.includes(COMPONENTS_DIR.replace('./', '')) ||
				filePath.includes(FRAGMENTS_DIR.replace('./', ''))) &&
			(filePath.endsWith('.ts') ||
				filePath.endsWith('.html') ||
				filePath.endsWith('.css'))
		)
	}

	public getWatchPatterns(): string[] {
		return [
			`${COMPONENTS_DIR}/**/*.html`,
			`${COMPONENTS_DIR}/**/*.css`,
			`${COMPONENTS_DIR}/**/*.ts`,
		]
	}

	public shouldReactToChange(filePath: string): boolean {
		return this.shouldRun(filePath)
	}

	public async initialize(
		config: DevServerConfig,
		signals: FileSystemSignals,
		processor: any,
	): Promise<void> {
		await super.initialize(config, signals, processor)

		// Initial scan of component directories
		await this.scanComponentDirectories()

		console.log('🧩 Reactive Fragment Plugin initialized')
	}

	public setupEffects(signals: FileSystemSignals): () => void {
		const cleanupFunctions: (() => void)[] = []

		// Effect: Write processed fragments to disk with advanced error handling
		cleanupFunctions.push(
			effect({
				ok: (fragments): undefined => {
					if (this.buildMode) return
					// Schedule async work without blocking effect
					setTimeout(async () => {
						let writtenCount = 0
						for (const [name, info] of fragments.entries()) {
							try {
								const outputPath = join(
									FRAGMENTS_DIR,
									`${name}.html`,
								)

								// Generate enhanced tab group
								const fragment =
									await this.generateTabGroup(info)
								await writeFile(outputPath, fragment, 'utf8')
								writtenCount++
							} catch (error) {
								console.error(
									`❌ Failed to write fragment ${name}:`,
									error,
								)
							}
						}
						if (writtenCount > 0) {
							console.log(
								`🧩 Written ${writtenCount} component fragments`,
							)
						}
					}, 0)
				},
				err: (error): undefined => {
					console.error(
						'❌ Error processing fragments:',
						error.message,
					)
				},
				nil: (): undefined => {
					console.log('⏳ Processing component fragments...')
				},
				signals: [this.processedFragments],
			}),
		)

		// Note: Component files are handled through the file watcher
		// to avoid circular dependencies with the componentFiles signal

		return () => {
			cleanupFunctions.forEach(cleanup => cleanup())
		}
	}

	public async onFileChange(event: FileChangeEvent): Promise<void> {
		const { filePath, eventType } = event

		if (this.shouldRun(filePath)) {
			const componentName = this.extractComponentName(filePath)
			if (componentName) {
				console.log(`🧩 Component file ${eventType}: ${componentName}`)

				// Update component triples will be handled by the effect
				// that watches componentFiles signal
			}
		}
	}

	public async transform(input: BuildInput): Promise<BuildOutput> {
		try {
			const componentName = this.extractComponentName(input.filePath)
			if (!componentName) {
				return this.createError(
					input,
					'Could not extract component name from file path',
				)
			}

			// In reactive mode, processing is handled by signals
			// This method is mainly for compatibility
			return this.createSuccess(input, {
				content: 'processed-reactively',
				metadata: {
					componentName,
					reactive: true,
					outputPath: join(FRAGMENTS_DIR, `${componentName}.html`),
				},
			})
		} catch (error) {
			return this.createError(
				input,
				`Failed to process fragment: ${error.message}`,
			)
		}
	}

	private async scanComponentDirectories(): Promise<void> {
		try {
			const components = await readdir(COMPONENTS_DIR)
			const triples = new Map<string, ComponentTriple>()

			for (const componentName of components) {
				const componentPath = join(COMPONENTS_DIR, componentName)
				const stats = await stat(componentPath)

				if (stats.isDirectory()) {
					const triple = await this.scanComponentTriple(
						componentName,
						componentPath,
					)
					if (triple) {
						triples.set(componentName, triple)
					}
				}
			}

			this.componentTriples.set(triples)
			console.log(`🔍 Scanned ${triples.size} component directories`)
		} catch (error) {
			console.error('❌ Error scanning component directories:', error)
		}
	}

	private async scanComponentTriple(
		componentName: string,
		componentPath: string,
	): Promise<ComponentTriple | null> {
		const triple: ComponentTriple = {
			name: componentName,
			lastModified: 0,
		}

		const fileTypes = [
			{ ext: 'html', key: 'htmlPath' as const },
			{ ext: 'css', key: 'cssPath' as const },
			{ ext: 'ts', key: 'tsPath' as const },
		]

		let hasFiles = false

		for (const { ext, key } of fileTypes) {
			const filePath = join(componentPath, `${componentName}.${ext}`)
			if (await this.fileExists(filePath)) {
				triple[key] = filePath

				// Update last modified time
				const stats = await stat(filePath)
				triple.lastModified = Math.max(
					triple.lastModified,
					stats.mtimeMs,
				)
				hasFiles = true
			}
		}

		return hasFiles ? triple : UNSET
	}

	private updateComponentTriples(componentFiles: Map<string, any>): void {
		const triples = new Map(this.componentTriples.get())
		const componentNames = new Set<string>()

		// Extract component names from file paths
		for (const [filePath] of componentFiles.entries()) {
			const componentName = this.extractComponentName(filePath)
			if (componentName) {
				componentNames.add(componentName)
			}
		}

		// Update triples for each component
		for (const componentName of componentNames) {
			const existingTriple = triples.get(componentName)
			const newTriple: ComponentTriple = {
				name: componentName,
				lastModified: 0,
			}

			// Check for HTML file
			const htmlPath = join(
				COMPONENTS_DIR,
				componentName,
				`${componentName}.html`,
			)
			if (componentFiles.has(htmlPath)) {
				newTriple.htmlPath = htmlPath
				newTriple.lastModified = Math.max(
					newTriple.lastModified,
					componentFiles.get(htmlPath)?.lastModified || 0,
				)
			}

			// Check for CSS file
			const cssPath = join(
				COMPONENTS_DIR,
				componentName,
				`${componentName}.css`,
			)
			if (componentFiles.has(cssPath)) {
				newTriple.cssPath = cssPath
				newTriple.lastModified = Math.max(
					newTriple.lastModified,
					componentFiles.get(cssPath)?.lastModified || 0,
				)
			}

			// Check for TypeScript file
			const tsPath = join(
				COMPONENTS_DIR,
				componentName,
				`${componentName}.ts`,
			)
			if (componentFiles.has(tsPath)) {
				newTriple.tsPath = tsPath
				newTriple.lastModified = Math.max(
					newTriple.lastModified,
					componentFiles.get(tsPath)?.lastModified || 0,
				)
			}

			// Only update if there are files and something changed
			if (
				(newTriple.htmlPath || newTriple.cssPath || newTriple.tsPath) &&
				(!existingTriple ||
					newTriple.lastModified > existingTriple.lastModified)
			) {
				triples.set(componentName, newTriple)
			}
		}

		this.componentTriples.set(triples)
	}

	private async processComponentTriple(
		componentName: string,
		triple: ComponentTriple,
		signal?: AbortSignal,
	): Promise<ComponentFragmentInfo | null> {
		const panelTypes: PanelType[] = []
		const files: ComponentFragmentInfo['files'] = {}

		if (signal?.aborted) {
			throw new Error('Component processing aborted')
		}

		// Process HTML file
		if (triple.htmlPath && (await this.fileExists(triple.htmlPath))) {
			files.html = triple.htmlPath
			panelTypes.push({
				type: 'html',
				label: 'HTML',
				filePath: triple.htmlPath,
				selected: false,
			})
		}

		// Process CSS file
		if (triple.cssPath && (await this.fileExists(triple.cssPath))) {
			files.css = triple.cssPath
			panelTypes.push({
				type: 'css',
				label: 'CSS',
				filePath: triple.cssPath,
				selected: false,
			})
		}

		// Process TypeScript file
		if (triple.tsPath && (await this.fileExists(triple.tsPath))) {
			files.typescript = triple.tsPath
			panelTypes.push({
				type: 'ts',
				label: 'TypeScript',
				filePath: triple.tsPath,
				selected: false,
			})
		}

		if (panelTypes.length === 0) {
			return UNSET
		}

		// Select the last panel by default (typically TypeScript)
		panelTypes[panelTypes.length - 1].selected = true

		return {
			name: componentName,
			files,
			panelTypes,
			lastModified: triple.lastModified,
		}
	}

	private async generateTabGroup(
		info: ComponentFragmentInfo,
	): Promise<string> {
		// Generate syntax-highlighted code for all panels
		const highlightedCodes = await Promise.all(
			info.panelTypes.map(async panel => {
				try {
					const content = await readFile(panel.filePath, 'utf8')
					return await codeToHtml(content, {
						lang: panel.type,
						theme: 'monokai',
					})
				} catch (error) {
					console.error(
						`❌ Error highlighting ${panel.filePath}:`,
						error,
					)
					// Return plain text as fallback
					const content = await readFile(panel.filePath, 'utf8')
					return `<pre><code class="language-${panel.type}">${content}</code></pre>`
				}
			}),
		)

		return enhancedTabGroup(info.name, info.panelTypes, highlightedCodes)
	}

	private extractComponentName(filePath: string): string | null {
		const normalizedPath = filePath.replace(/\\/g, '/')
		const match = normalizedPath.match(/components[/]([^/]+)[/]/)
		return match ? match[1] : null
	}

	private async fileExists(path: string): Promise<boolean> {
		try {
			await stat(path)
			return true
		} catch {
			return false
		}
	}

	// Public API for compatibility
	public getProcessedFragments(): Map<string, ComponentFragmentInfo> {
		try {
			const fragments = this.processedFragments.get()
			return fragments === UNSET ? new Map() : fragments
		} catch {
			return new Map()
		}
	}

	public async getDependencies(filePath: string): Promise<string[]> {
		const componentName = this.extractComponentName(filePath)
		if (!componentName) return []

		const dependencies: string[] = []
		const fileTypes = ['html', 'css', 'ts']

		for (const ext of fileTypes) {
			const relatedFile = join(
				COMPONENTS_DIR,
				componentName,
				`${componentName}.${ext}`,
			)
			if (
				(await this.fileExists(relatedFile)) &&
				relatedFile !== filePath
			) {
				dependencies.push(relatedFile)
			}
		}

		return dependencies
	}
}

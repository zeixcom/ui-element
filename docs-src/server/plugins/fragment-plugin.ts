import { readdir, readFile, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { COMPONENTS_DIR, FRAGMENTS_DIR } from '../config.js'
import { BaseBuildPlugin } from '../modular-ssg.js'
import { highlightedCode } from '../transform-codeblocks.js'
import type { BuildInput, BuildOutput, DevServerConfig } from '../types.js'

interface PanelType {
	type: string
	label: string
	filePath: string
	selected: boolean
}

interface ComponentFragmentInfo {
	name: string
	files: {
		html?: string
		css?: string
		typescript?: string
	}
	panelTypes: PanelType[]
}

export class FragmentPlugin extends BaseBuildPlugin {
	public readonly name = 'fragment-processor'
	public readonly version = '1.0.0'
	public readonly description =
		'Processes component fragments into HTML tabbed interfaces'

	private processedComponents = new Set<string>()

	public shouldRun(filePath: string): boolean {
		return (
			filePath.includes('components') &&
			(filePath.endsWith('.ts') ||
				filePath.endsWith('.html') ||
				filePath.endsWith('.css'))
		)
	}

	public async initialize(_config: DevServerConfig): Promise<void> {
		console.log(`🔧 Initializing ${this.name}...`)
		console.log(`✅ ${this.name} initialized`)
	}

	public async transform(input: BuildInput): Promise<BuildOutput> {
		try {
			// Extract component name from file path
			const componentName = this.extractComponentName(input.filePath)
			if (!componentName) {
				return this.createError(
					input,
					'Could not extract component name from file path',
				)
			}

			// Check if we've already processed this component
			if (this.processedComponents.has(componentName)) {
				return this.createSuccess(input, {
					content: 'already-processed',
					metadata: {
						componentName,
						skipped: true,
					},
				})
			}

			// Process the entire component (all files)
			await this.processComponent(componentName)
			this.processedComponents.add(componentName)

			return this.createSuccess(input, {
				content: 'processed',
				metadata: {
					componentName,
					outputPath: join(FRAGMENTS_DIR, `${componentName}.html`),
				},
			})
		} catch (error) {
			console.error(
				`❌ FragmentPlugin error processing ${input.filePath}:`,
				error,
			)
			return this.createError(
				input,
				`Failed to process fragment: ${error.message}`,
			)
		}
	}

	/**
	 * Extract component name from file path
	 */
	private extractComponentName(filePath: string): string | null {
		const match = filePath.match(/components[/\\]([^/\\]+)[/\\]/)
		return match ? match[1] : null
	}

	/**
	 * Check if a file exists
	 */
	private async fileExists(path: string): Promise<boolean> {
		try {
			await stat(path)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Generate a single panel for the tabbed interface
	 */
	private async generatePanel(
		name: string,
		panelType: PanelType,
	): Promise<string> {
		const { type, filePath, selected } = panelType
		const hidden = selected ? '' : ' hidden'
		const content = await readFile(filePath, 'utf8')

		// Apply syntax highlighting
		const highlighted = await highlightedCode(content, type)

		return `
<div role="tabpanel" id="panel_${name}.${type}" aria-labelledby="trigger_${name}.${type}"${hidden}>
	<module-codeblock language="${type}" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
		<p class="meta">
			<span class="file">${name}.${type}</span>
			<span class="language">${type}</span>
		</p>
		${highlighted}
		<basic-button class="copy">
			<button type="button" class="secondary small">
				<span class="label">Copy</span>
			</button>
		</basic-button>
	</module-codeblock>
</div>`
	}

	/**
	 * Process a single component and generate its fragment
	 */
	private async processComponent(name: string): Promise<void> {
		console.log(`📂 Processing component: ${name}`)

		// Check which files exist for this component
		const allPanels = (
			await Promise.all(
				[
					{ type: 'html', label: 'HTML' },
					{ type: 'css', label: 'CSS' },
					{ type: 'ts', label: 'TypeScript' },
				]
					.map((panel: Partial<PanelType>) => ({
						...panel,
						filePath: join(
							COMPONENTS_DIR,
							name,
							`${name}.${panel.type}`,
						),
						selected: false,
					}))
					.map(async panel =>
						(await this.fileExists(panel.filePath)) ? panel : null,
					),
			)
		).filter(panel => panel !== null) as PanelType[]

		if (allPanels.length === 0) {
			console.warn(`⚠️ No valid files found for component: ${name}`)
			return
		}

		// Select the last panel by default (typically TypeScript)
		allPanels[allPanels.length - 1].selected = true

		// Generate panels
		const panels = await Promise.all(
			allPanels.map(panel => this.generatePanel(name, panel)),
		)

		// Generate the complete fragment with tabbed interface
		const fragment = `
<module-tabgroup>
	<div role="tablist">
		${allPanels
			.map(
				panel => `
		<button
			type="button"
			role="tab"
			id="trigger_${name}.${panel.type}"
			aria-controls="panel_${name}.${panel.type}"
			aria-selected="${String(panel.selected)}"
			tabindex="${panel.selected ? '0' : '-1'}"
		>${panel.label}</button>`,
			)
			.join('\n\t')}
	</div>
	${panels.join('\n')}
</module-tabgroup>`

		// Write the fragment to the output directory
		const outputPath = join(FRAGMENTS_DIR, `${name}.html`)
		await writeFile(outputPath, fragment, 'utf8')
		console.log(`✅ Generated: ${name}.html`)
	}

	/**
	 * Process all components in the components directory
	 */
	public async processAllComponents(): Promise<ComponentFragmentInfo[]> {
		console.log('🔄 Processing all component fragments...')

		try {
			const components = await readdir(COMPONENTS_DIR)
			const processedInfo: ComponentFragmentInfo[] = []

			for (const componentName of components) {
				const componentPath = join(COMPONENTS_DIR, componentName)
				const stats = await stat(componentPath)

				if (stats.isDirectory()) {
					await this.processComponent(componentName)
					this.processedComponents.add(componentName)

					// Gather component info
					const info: ComponentFragmentInfo = {
						name: componentName,
						files: {},
						panelTypes: [],
					}

					// Check which files exist
					const fileTypes = [
						{ ext: 'html', key: 'html' as const },
						{ ext: 'css', key: 'css' as const },
						{ ext: 'ts', key: 'typescript' as const },
					]

					for (const { ext, key } of fileTypes) {
						const filePath = join(
							componentPath,
							`${componentName}.${ext}`,
						)
						if (await this.fileExists(filePath)) {
							info.files[key] = filePath
							info.panelTypes.push({
								type: ext,
								label: ext.toUpperCase(),
								filePath,
								selected: false,
							})
						}
					}

					if (info.panelTypes.length > 0) {
						info.panelTypes[info.panelTypes.length - 1].selected =
							true
						processedInfo.push(info)
					}
				}
			}

			console.log(`✨ Processed ${processedInfo.length} components!`)
			return processedInfo
		} catch (error) {
			console.error('❌ Error processing components:', error)
			throw error
		}
	}

	/**
	 * Get list of processed components
	 */
	public getProcessedComponents(): string[] {
		return Array.from(this.processedComponents)
	}

	public async cleanup(): Promise<void> {
		this.processedComponents.clear()
		console.log(`🧹 Cleaned up ${this.name}`)
	}

	public async getDependencies(filePath: string): Promise<string[]> {
		const componentName = this.extractComponentName(filePath)
		if (!componentName) return []

		// Return all related files for this component
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

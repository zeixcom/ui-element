import { readdir, readFile, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { codeToHtml } from 'shiki'
import { COMPONENTS_DIR, FRAGMENTS_DIR } from '../../config'
import { enhancedTabGroup, type PanelType } from '../../templates/fragments'
import type { BuildInput, BuildOutput } from '../../types'
import { BaseBuildPlugin } from '../modular-ssg'

interface ComponentFragmentInfo {
	name: string
	files: { html?: string; css?: string; typescript?: string }
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

	public async initialize(): Promise<void> {}

	public async transform(input: BuildInput): Promise<BuildOutput> {
		try {
			const componentName = this.extractComponentName(input.filePath)
			if (!componentName) {
				return this.createError(
					input,
					'Could not extract component name from file path',
				)
			}

			if (this.processedComponents.has(componentName)) {
				return this.createSuccess(input, {
					content: 'already-processed',
				})
			}

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
			return this.createError(
				input,
				`Failed to process fragment: ${error.message}`,
			)
		}
	}

	private extractComponentName(filePath: string): string | null {
		const match = filePath.match(/components[/\\]([^/\\]+)[/\\]/)
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

	private async processComponent(name: string): Promise<void> {
		const panelConfigs = [
			{ type: 'html', label: 'HTML' },
			{ type: 'css', label: 'CSS' },
			{ type: 'ts', label: 'TypeScript' },
		]

		const panels = (
			await Promise.all(
				panelConfigs.map(async config => {
					const filePath = join(
						COMPONENTS_DIR,
						name,
						`${name}.${config.type}`,
					)
					return (await this.fileExists(filePath))
						? { ...config, filePath, selected: false }
						: null
				}),
			)
		).filter(Boolean) as PanelType[]

		if (panels.length === 0) return

		// Select the last panel by default (typically TypeScript)
		panels[panels.length - 1].selected = true

		// Generate syntax-highlighted code for all panels
		const highlightedCodes = await Promise.all(
			panels.map(async panel => {
				const content = await readFile(panel.filePath, 'utf8')
				return await codeToHtml(content, {
					lang: panel.type,
					theme: 'monokai',
				})
			}),
		)

		const fragment = enhancedTabGroup(name, panels, highlightedCodes)
		await writeFile(join(FRAGMENTS_DIR, `${name}.html`), fragment, 'utf8')
	}

	public async processAllComponents(): Promise<ComponentFragmentInfo[]> {
		const components = await readdir(COMPONENTS_DIR)
		const processedInfo: ComponentFragmentInfo[] = []

		for (const componentName of components) {
			const componentPath = join(COMPONENTS_DIR, componentName)
			const stats = await stat(componentPath)

			if (stats.isDirectory()) {
				await this.processComponent(componentName)
				this.processedComponents.add(componentName)

				const info: ComponentFragmentInfo = {
					name: componentName,
					files: {},
					panelTypes: [],
				}

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
					info.panelTypes[info.panelTypes.length - 1].selected = true
					processedInfo.push(info)
				}
			}
		}

		return processedInfo
	}

	public getProcessedComponents(): string[] {
		return Array.from(this.processedComponents)
	}

	public async cleanup(): Promise<void> {
		this.processedComponents.clear()
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

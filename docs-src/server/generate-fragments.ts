import { join } from 'path'
import { readFile, readdir, stat, writeFile } from 'fs/promises'
import { COMPONENTS_DIR, FRAGMENTS_DIR } from './config'
import { highlightedCode } from './transform-code-blocks'

type PanelType = {
	type: string
	label: string
	filePath: string
	selected: boolean
}

// Function to check if a file exists
const fileExists = async (path: string) => {
	try {
		await stat(path)
		return true
	} catch {
		return false
	}
}

// Function to generate accordion panels dynamically
const generatePanel = async (name: string, panelType: PanelType) => {
	const { type, filePath, selected } = panelType
	const hidden = selected ? '' : ' hidden'
	const content = await readFile(filePath, 'utf8')

	// Apply syntax highlighting
	const highlighted = await highlightedCode(content, type)

	return `
<div role="tabpanel" id="panel_${name}.${type}" aria-labelledby="trigger_${name}.${type}"${hidden}>
	<code-block language="${type}" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
		<p class="meta">
			<span class="file">${name}.${type}</span>
			<span class="language">${type}</span>
		</p>
		${highlighted}
		<input-button class="copy">
			<button type="button" class="secondary small">
				<span class="label">Copy</span>
			</button>
		</input-button>
	</code-block>
</div>`
}

// Function to process each component
const processComponent = async (name: string) => {
	const allPanels = (await Promise.all(
		[
			{ type: 'html', label: 'HTML' },
			{ type: 'css', label: 'CSS' },
			{ type: 'ts', label: 'TypeScript' },
		]
			.map((panel: Partial<PanelType>) => ({
				...panel,
				filePath: join(COMPONENTS_DIR, name, `${name}.${panel.type}`),
				selected: false,
			}))
			.map(async panel =>
				(await fileExists(panel.filePath)) ? panel : null,
			),
	)) as PanelType[]
	const panelTypes = allPanels.filter(panel => panel !== null)

	if (panelTypes.length === 0) return // Skip if no valid content

	panelTypes[panelTypes.length - 1].selected = true

	// Generate only existing panels
	const panels = await Promise.all(
		panelTypes.map(panel => generatePanel(name, panel)),
	)

	const fragment = `
<tab-group>
	<div role="tablist">
		${panelTypes
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
			.join('\n\t\t')}
	</div>
	${panels.join('\n')}
</tab-group>`

	await writeFile(join(FRAGMENTS_DIR, `${name}.html`), fragment, 'utf8')
	console.log(`✅ Generated: ${name}.html`)
}

// Main function to run the script
const run = async () => {
	console.log('🔄 Generating fragments...')
	const components = await readdir(COMPONENTS_DIR)
	await Promise.all(components.map(processComponent))
	console.log('✨ All fragments generated!')
}

run()

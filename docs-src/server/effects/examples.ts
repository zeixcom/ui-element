import { effect, match, resolve } from '@zeix/cause-effect'
import { codeToHtml } from 'shiki'
import { type PanelType, tabGroup } from '../../templates/fragments'
import { EXAMPLES_DIR } from '../config'
import {
	componentMarkup,
	componentScripts,
	componentStyles,
} from '../file-signals'
import { writeFileSyncSafe } from '../io'
import { FileInfo } from '../types'

const highlightCode = async (content: string, type: string) =>
	await codeToHtml(content, {
		lang: type,
		theme: 'monokai',
	})

const generatePanels = async (
	html: FileInfo,
	css?: FileInfo,
	ts?: FileInfo,
) => {
	const panels = [
		{
			type: 'html',
			label: 'HTML',
			filePath: html.path,
			content: await highlightCode(html.content, 'html'),
			selected: false,
		},
		css && {
			type: 'css',
			label: 'CSS',
			filePath: css.path,
			content: await highlightCode(css.content, 'css'),
			selected: false,
		},
		ts && {
			type: 'ts',
			label: 'TypeScript',
			filePath: ts.path,
			content: await highlightCode(ts.content, 'typescript'),
			selected: false,
		},
	].filter(Boolean) as PanelType[]

	// Select the last panel by default (typically TypeScript)
	panels[panels.length - 1].selected = true

	return panels
}

export const examplesEffect = () =>
	effect(() => {
		match(
			resolve({
				htmlFiles: componentMarkup.sources,
				cssFiles: componentStyles.sources,
				tsFiles: componentScripts.sources,
			}),
			{
				ok: ({ htmlFiles, cssFiles, tsFiles }) => {
					try {
						console.log('🔄 Rebuilding example fragments...')

						Array.from(htmlFiles.values()).forEach(async html => {
							const name = html.path.replace(/\.html$/, '')
							const css = cssFiles.get(name + '.css')
							const ts = tsFiles.get(name + '.ts')

							const panels = await generatePanels(html, css, ts)
							const componentName = name.split('/').pop() || name
							const outputPath = `${EXAMPLES_DIR}/${componentName}.html`
							return writeFileSyncSafe(
								outputPath,
								tabGroup(componentName, panels),
							)
						})

						console.log('Example fragments successfully rebuilt')
					} catch (error) {
						console.error(
							'Example fragments failed to rebuild:',
							String(error),
						)
					}
				},
				err: errors => {
					console.error(
						'Error in examples effect:',
						errors[0].message,
					)
				},
			},
		)
	})

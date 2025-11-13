import { effect, match, resolve } from '@zeix/cause-effect'
import { join } from 'path'
import {
	type ServiceWorkerConfig,
	serviceWorker,
} from '../../templates/service-worker'
import { OUTPUT_DIR } from '../config'
import {
	componentScripts,
	componentStyles,
	docsScripts,
	docsStyles,
	libraryScripts,
} from '../file-signals'
import { writeFileSyncSafe } from '../io'

export const serviceWorkerEffect = () =>
	effect(() => {
		match(
			resolve({
				docsStyles: docsStyles.sources,
				componentStyles: componentStyles.sources,
				docsScripts: docsScripts.sources,
				componentScripts: componentScripts.sources,
				libraryScripts: libraryScripts.sources,
			}),
			{
				ok: () => {
					try {
						console.log('🔧 Generating service worker...')

						// Generate asset hashes based on current timestamp
						// In production, these would be actual file content hashes
						const cssHash = Date.now().toString(36)
						const jsHash = Date.now().toString(36)

						const config: ServiceWorkerConfig = {
							cssHash,
							jsHash,
							cacheName: `el-truco-docs-v${Date.now()}`,
							staticAssets: ['/', '/index.html'],
						}

						const swContent = serviceWorker(config)
						const swPath = join(OUTPUT_DIR, 'sw.js')

						writeFileSyncSafe(swPath, swContent)
						console.log('🔧 Service worker generated successfully')
					} catch (error) {
						console.error(
							'Failed to generate service worker:',
							error,
						)
					}
				},
				err: errors => {
					console.error(
						'Error in service worker effect:',
						errors[0].message,
					)
					return undefined
				},
			},
		)
	})

import { effect } from '@zeix/cause-effect'
import { execSync } from 'child_process'
import { libraryScripts } from '../file-signals'

export const apiEffect = () =>
	effect({
		signals: [libraryScripts.sources],
		ok: (): undefined => {
			;(async () => {
				try {
					console.log('📚 Rebuilding API documentation...')

					// Generate API docs using TypeDoc
					execSync(
						'typedoc --plugin typedoc-plugin-markdown --out ./docs-src/pages/api/ index.ts',
						{ stdio: 'inherit' },
					)

					console.log('📚 API documentation rebuilt successfully')
				} catch (error) {
					console.error('Failed to rebuild API documentation:', error)
				}
			})()
			return undefined
		},
		err: (error: Error): undefined => {
			console.error('API reference failed to rebuild', String(error))
			return undefined
		},
	})

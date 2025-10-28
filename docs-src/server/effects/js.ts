import { effect } from '@zeix/cause-effect'
import { execSync } from 'child_process'
import { componentScripts, docsScripts, libraryScripts } from '../file-signals'

export const jsEffect = () =>
	effect({
		signals: [
			docsScripts.sources,
			libraryScripts.sources,
			componentScripts.sources,
		],
		ok: (): undefined => {
			try {
				console.log('🔧 Rebuilding JS assets...')
				execSync(
					'bun build docs-src/main.ts --outdir ./docs/assets/ --minify --define process.env.DEV_MODE=false --sourcemap=external',
					{ stdio: 'inherit' },
				)
				console.log('JS successfully rebuilt')
			} catch (error) {
				console.error('JS failed to rebuild:', String(error))
			}
		},
		err: (error: Error): undefined => {
			console.error('Error in JS effect:', error.message)
		},
	})

import { effect, enqueue } from '@zeix/cause-effect'
import { execSync } from 'child_process'
import { componentScripts, docsScripts, libraryScripts } from '../file-signals'

const JS_SYMBOL = Symbol('JS')

export const jsEffect = () =>
	effect((): undefined => {
		// Dependencies
		docsScripts.sources.get()
		libraryScripts.sources.get()
		componentScripts.sources.get()

		enqueue((): undefined => {
			execSync(
				'bun build docs-src/main.ts --outdir ./docs/assets/ --minify --define process.env.DEV_MODE=false --sourcemap=external',
				{ stdio: 'inherit' },
			)
		}, JS_SYMBOL)
			.then(() => {
				console.log('JS successfully rebuilt')
			})
			.catch(error => {
				console.error('JS failed to rebuild', String(error))
			})
	})

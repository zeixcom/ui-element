import { effect, enqueue } from '@zeix/cause-effect'
import { execSync } from 'child_process'
import { componentStyles, docsStyles } from '../file-signals'

const CSS_SYMBOL = Symbol('CSS')

export const cssEffect = () =>
	effect((): undefined => {
		// Dependencies
		docsStyles.sources.get()
		componentStyles.sources.get()

		enqueue((): undefined => {
			execSync(
				'bunx lightningcss --minify --bundle --targets ">= 0.25%" docs-src/main.css -o ./docs/assets/main.css',
				{ stdio: 'inherit' },
			)
		}, CSS_SYMBOL)
			.then(() => {
				console.log('CSS successfully rebuilt')
			})
			.catch(error => {
				console.error('CSS failed to rebuild', String(error))
			})
	})

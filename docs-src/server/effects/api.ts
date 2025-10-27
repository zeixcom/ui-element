import { effect, enqueue } from '@zeix/cause-effect'
import { libraryScripts } from '../file-signals'

const API_SYMBOL = Symbol('API')

export const apiEffect = () =>
	effect((): undefined => {
		// Dependencies
		libraryScripts.sources.get()

		enqueue((): undefined => {
			// Build API reference
		}, API_SYMBOL)
			.then(() => {
				console.log('API reference successfully rebuilt')
			})
			.catch(error => {
				console.error('API reference failed to rebuild', String(error))
			})
	})

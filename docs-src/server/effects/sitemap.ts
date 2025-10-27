import { effect, enqueue } from '@zeix/cause-effect'
import { sitemap } from '../../templates/sitemap'
import { SITEMAP_FILE } from '../config'
import { markdownFiles } from '../file-signals'
import { writeFileSyncSafe } from '../io'

const SITEMAP_SYMBOL = Symbol('SITEMAP')

export const sitemapEffect = () =>
	effect((): undefined => {
		enqueue((): undefined => {
			writeFileSyncSafe(
				SITEMAP_FILE,
				sitemap(markdownFiles.pageInfos.get()),
			)
		}, SITEMAP_SYMBOL)
			.then(() => {
				console.log('Sitemap file written successfully')
			})
			.catch(error => {
				console.error('Error writing sitemap file:', String(error))
			})
	})

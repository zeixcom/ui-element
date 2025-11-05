import { effect, match, resolve } from '@zeix/cause-effect'
import { sitemap } from '../../templates/sitemap'
import { SITEMAP_FILE } from '../config'
import { markdownFiles } from '../file-signals'
import { writeFileSyncSafe } from '../io'

export const sitemapEffect = () =>
	effect(() => {
		match(
			resolve({
				pageInfos: markdownFiles.pageInfos,
			}),
			{
				ok: ({ pageInfos }): undefined => {
					writeFileSyncSafe(SITEMAP_FILE, sitemap(pageInfos))
					console.log('Sitemap file written successfully')
				},
				err: errors => {
					console.error(
						'Error writing sitemap file:',
						String(errors[0]),
					)
				},
			},
		)
	})

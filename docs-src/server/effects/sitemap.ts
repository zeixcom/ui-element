import { effect } from '@zeix/cause-effect'
import { sitemap } from '../../templates/sitemap'
import { SITEMAP_FILE } from '../config'
import { markdownFiles } from '../file-signals'
import { writeFileSyncSafe } from '../io'
import { PageInfo } from '../types'

export const sitemapEffect = () =>
	effect({
		signals: [markdownFiles.pageInfos],
		ok: (pageInfos: PageInfo[]): undefined => {
			writeFileSyncSafe(SITEMAP_FILE, sitemap(pageInfos))
			console.log('Sitemap file written successfully')
		},
		err: (error): undefined => {
			console.error('Error writing sitemap file:', String(error))
		},
	})

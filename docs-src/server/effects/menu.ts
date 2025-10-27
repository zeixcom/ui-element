import { effect, enqueue } from '@zeix/cause-effect'
import { menu } from '../../templates/menu'
import { MENU_FILE } from '../config'
import { markdownFiles } from '../file-signals'
import { writeFileSyncSafe } from '../io'

const MENU_SYMBOL = Symbol('MENU')

export const menuEffect = () =>
	effect((): undefined => {
		enqueue((): undefined => {
			writeFileSyncSafe(
				MENU_FILE,
				menu(
					markdownFiles.pageInfos
						.get()
						.filter(info => info.section === ''),
				),
			)
		}, MENU_SYMBOL)
			.then(() => {
				console.log('Menu file written successfully')
			})
			.catch(error => {
				console.error('Error writing menu file:', String(error))
			})
	})

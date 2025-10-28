import { State, state, UNSET } from '@zeix/cause-effect'
import { existsSync, watch } from 'fs'
import { readdir } from 'fs/promises'
import { extname, join } from 'path'
import { createFileInfo } from './io'
import { FileInfo, WatcherOptions } from './types'

export function watchFiles(
	directory: string,
	options: WatcherOptions,
): State<Map<string, FileInfo>> {
	const { recursive = false, extensions = [], ignore = [] } = options
	const signal = state<Map<string, FileInfo>>(UNSET)

	const isMatching = (file: string): boolean => {
		if (ignore.some(pattern => file.includes(pattern))) return false
		if (extensions.length > 0) {
			const ext = extname(file)
			return extensions.includes(ext)
		}
		return true
	}

	;(async () => {
		const files: Map<string, FileInfo> = new Map()

		try {
			const entries = await readdir(directory, {
				withFileTypes: true,
				recursive,
			})

			for (const entry of entries) {
				if (entry.isFile() && isMatching(entry.name)) {
					const filePath = join(entry.parentPath, entry.name)
					const fileInfo = await createFileInfo(filePath, entry.name)
					files.set(filePath, fileInfo)
				}
			}
			signal.set(files)
		} catch (error) {
			console.error(`Error listing files in ${directory}:`, error)
		}
	})()

	console.log('Watching files in directory:', directory)

	watch(
		directory,
		{ recursive: options.recursive, persistent: true },
		async (event, filename) => {
			if (!filename || !isMatching(filename)) return

			const filePath = join(directory, filename)
			if (event === 'rename' && !existsSync(filePath)) {
				signal.update(files => {
					files.delete(filePath)
					return files
				})
			} else {
				const fileInfo = await createFileInfo(filePath, filename)
				signal.update(files => {
					files.set(filePath, fileInfo)
					return files
				})
			}
		},
	)

	return signal
}

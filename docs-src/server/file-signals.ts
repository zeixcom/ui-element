import { type Computed, computed, type State } from '@zeix/cause-effect'
import {
	COMPONENTS_DIR,
	INPUT_DIR,
	PAGES_DIR,
	SRC_DIR,
	TEMPLATES_DIR,
} from './config'
import { watchFiles } from './file-watcher'
import { extractFrontmatter, getRelativePath } from './io'
import type { FileInfo, PageInfo, PageMetadata } from './types'

export const markdownFiles: {
	sources: State<Map<string, FileInfo>>
	processed: Computed<Map<string, FileInfo & { metadata: PageMetadata }>>
	pageInfos: Computed<PageInfo[]>
} = (() => {
	const sources = watchFiles(PAGES_DIR, {
		recursive: true,
		extensions: ['.md'],
		ignore: ['README.md'],
	})

	const processed = computed(async () => {
		const files = new Map<string, FileInfo & { metadata: PageMetadata }>()
		for (const [path, fileInfo] of sources.get()) {
			if (!fileInfo) continue
			const { metadata, content } = extractFrontmatter(fileInfo.content)
			files.set(path, {
				...fileInfo,
				content, // Content without frontmatter
				metadata,
			})
		}
		return files
	})

	const pageInfos = computed(async () => {
		const pageInfos: PageInfo[] = []
		const files = processed.get()
		for (const [path, file] of files) {
			const relativePath = getRelativePath(PAGES_DIR, path)
			if (!relativePath) continue
			pageInfos.push({
				url: relativePath.replace('.md', '.html'),
				title: file.metadata.title || file.filename.replace('.md', ''),
				emoji: file.metadata.emoji || '📄',
				description: file.metadata.description || '',
				filename: file.filename,
				relativePath,
				lastModified: file.lastModified,
				section: relativePath.split('/').slice(1).join('/'),
			})
		}
		return pageInfos
	})

	return {
		sources,
		processed,
		pageInfos,
	}
})()

export const libraryScripts = (() => {
	const sources = watchFiles(SRC_DIR, {
		recursive: true,
		extensions: ['.ts'],
	})

	return {
		sources,
	}
})()

export const docsScripts = (() => {
	const sources = watchFiles(INPUT_DIR, {
		recursive: false,
		extensions: ['.ts'],
	})

	return {
		sources,
	}
})()

export const componentScripts = (() => {
	const sources = watchFiles(COMPONENTS_DIR, {
		recursive: true,
		extensions: ['.ts'],
	})

	return {
		sources,
	}
})()

export const templateScripts = (() => {
	const sources = watchFiles(TEMPLATES_DIR, {
		recursive: true,
		extensions: ['.ts'],
	})

	return {
		sources,
	}
})()

export const docsStyles = (() => {
	const sources = watchFiles(INPUT_DIR, {
		recursive: false,
		extensions: ['.css'],
	})

	return {
		sources,
	}
})()

export const componentStyles = (() => {
	const sources = watchFiles(COMPONENTS_DIR, {
		recursive: true,
		extensions: ['.css'],
	})

	return {
		sources,
	}
})()

export const componentMarkup = (() => {
	const sources = watchFiles(COMPONENTS_DIR, {
		recursive: true,
		extensions: ['.html'],
		ignore: ['.test.html'],
	})

	return {
		sources,
	}
})()

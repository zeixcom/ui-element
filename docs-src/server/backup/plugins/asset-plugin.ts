import { execSync } from 'child_process'
import { existsSync, writeFileSync } from 'fs'
import { mkdir, readdir, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { ASSETS_DIR } from '../../config'
import { generateAssetHash } from '../../config-manager'
import {
	type ServiceWorkerConfig,
	serviceWorker,
} from '../../templates/service-worker'
import type { BuildInput, BuildOutput } from '../../types'
import { BaseBuildPlugin } from '../modular-ssg'

interface OptimizedAssets {
	css: { mainCSSPath: string; mainCSSHash: string }
	js: { mainJSPath: string; mainJSHash: string }
}

export class AssetPlugin extends BaseBuildPlugin {
	public readonly name = 'asset-optimizer'
	public readonly version = '1.0.0'
	public readonly description =
		'Optimizes and versions CSS and JavaScript assets'

	private optimizedAssets: OptimizedAssets | null = null
	private processedFiles = new Set<string>()

	public shouldRun(filePath: string): boolean {
		const isCSSFile = filePath.endsWith('.css')
		const isTSFile = filePath.endsWith('.ts')

		// CSS files that affect the main bundle
		const shouldRebuildCSS =
			isCSSFile &&
			(filePath.includes('main.css') ||
				filePath.includes('components') ||
				filePath.includes('global.css'))

		// JS/TS files that affect the main bundle
		const shouldRebuildJS =
			isTSFile &&
			(filePath.includes('main.ts') ||
				filePath.includes('components') ||
				filePath.includes('functions') ||
				filePath.includes('/src/'))

		return shouldRebuildCSS || shouldRebuildJS
	}

	public async initialize(): Promise<void> {
		await this.ensureAssetsDir()
	}

	public async transform(input: BuildInput): Promise<BuildOutput> {
		const isCSS = input.filePath.endsWith('.css')
		const fileType = isCSS ? 'css' : 'js'

		// Clear cache for the specific file type if any dependency changes
		const isDependencyChange =
			input.filePath.includes('components') ||
			input.filePath.includes('functions') ||
			input.filePath.includes('/src/') ||
			input.filePath.includes('global.css')

		if (isDependencyChange) {
			this.processedFiles.delete(fileType)
		}

		if (this.processedFiles.has(fileType)) {
			return this.createSuccess(input, { content: 'already-processed' })
		}

		try {
			const result = isCSS
				? await this.buildOptimizedCSS()
				: await this.buildOptimizedJS()
			this.processedFiles.add(fileType)

			return this.createSuccess(input, {
				content: 'processed',
				metadata: {
					fileType,
					outputPath: result[`main${fileType.toUpperCase()}Path`],
					hash: result[`main${fileType.toUpperCase()}Hash`],
				},
			})
		} catch (error) {
			return this.createError(
				input,
				`Failed to optimize asset: ${error.message}`,
			)
		}
	}

	public async buildAllAssets(): Promise<OptimizedAssets> {
		await this.cleanOldVersionedAssets()

		const [cssAssets, jsAssets] = await Promise.all([
			this.buildOptimizedCSS(),
			this.buildOptimizedJS(),
		])

		this.optimizedAssets = { css: cssAssets, js: jsAssets }
		await this.generateServiceWorker(
			cssAssets.mainCSSHash,
			jsAssets.mainJSHash,
		)
		return this.optimizedAssets
	}

	public getOptimizedAssets(): OptimizedAssets | null {
		return this.optimizedAssets
	}

	private async ensureAssetsDir(): Promise<void> {
		try {
			await mkdir(ASSETS_DIR, { recursive: true })
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
		}
	}

	private async cleanOldVersionedAssets(): Promise<void> {
		try {
			const files = await readdir(ASSETS_DIR)
			const versionedFiles = files.filter(file =>
				/^main\.[a-f0-9]+\.(css|js|js\.map)$/.test(file),
			)

			await Promise.all(
				versionedFiles.map(file =>
					unlink(join(ASSETS_DIR, file)).catch(() => {}),
				),
			)
		} catch {
			// Directory might not exist, that's fine
		}
	}

	private async buildOptimizedCSS(): Promise<{
		mainCSSPath: string
		mainCSSHash: string
	}> {
		await this.ensureAssetsDir()
		await this.buildCSS()

		const originalPath = join(ASSETS_DIR, 'main.css')
		const isTest =
			process.env.NODE_ENV === 'test' || process.env.BUN_ENV === 'test'

		if (isTest && !existsSync(originalPath)) {
			writeFileSync(originalPath, '/* Test CSS */', 'utf8')
		}

		const hash = generateAssetHash(originalPath)
		const versionedPath = join(ASSETS_DIR, `main.${hash}.css`)

		execSync(`cp "${originalPath}" "${versionedPath}"`)

		return { mainCSSPath: `assets/main.${hash}.css`, mainCSSHash: hash }
	}

	private async buildOptimizedJS(): Promise<{
		mainJSPath: string
		mainJSHash: string
	}> {
		await this.ensureAssetsDir()
		await this.buildJS()

		const originalPath = join(ASSETS_DIR, 'main.js')
		const isTest =
			process.env.NODE_ENV === 'test' || process.env.BUN_ENV === 'test'

		if (isTest && !existsSync(originalPath)) {
			writeFileSync(originalPath, '/* Test JS */', 'utf8')
		}

		const hash = generateAssetHash(originalPath)
		const versionedPath = join(ASSETS_DIR, `main.${hash}.js`)

		execSync(`cp "${originalPath}" "${versionedPath}"`)

		// Copy sourcemap if exists
		try {
			const sourceMapPath = join(ASSETS_DIR, 'main.js.map')
			const versionedSourceMapPath = join(
				ASSETS_DIR,
				`main.${hash}.js.map`,
			)
			execSync(`cp "${sourceMapPath}" "${versionedSourceMapPath}"`)
		} catch {
			// Sourcemap might not exist
		}

		return { mainJSPath: `assets/main.${hash}.js`, mainJSHash: hash }
	}

	private async buildCSS(): Promise<void> {
		try {
			execSync(
				'bunx lightningcss --minify --bundle --targets ">= 0.25%" docs-src/main.css -o ./docs/assets/main.css',
				{ stdio: 'inherit' },
			)
		} catch (error) {
			const isTest =
				process.env.NODE_ENV === 'test' ||
				process.env.BUN_ENV === 'test'
			if (isTest && error.status === 127) return // lightningcss not available in test
			throw error
		}
	}

	private async buildJS(): Promise<void> {
		const isTest =
			process.env.NODE_ENV === 'test' || process.env.BUN_ENV === 'test'
		if (isTest) return

		execSync(
			'bun build docs-src/main.ts --outdir ./docs/assets/ --minify --define process.env.DEV_MODE=false --sourcemap=external',
			{ stdio: 'inherit' },
		)
	}

	private async generateServiceWorker(
		cssHash: string,
		jsHash: string,
	): Promise<void> {
		const config: ServiceWorkerConfig = {
			cssHash,
			jsHash,
			cacheName: `le-truc-docs-v${Date.now()}`,
			staticAssets: ['/', '/index.html'],
		}

		const swContent = serviceWorker(config)
		await writeFile(join('./docs', 'sw.js'), swContent, 'utf8')
	}

	public async cleanup(): Promise<void> {
		this.processedFiles.clear()
		this.optimizedAssets = null
	}

	public async getDependencies(_filePath: string): Promise<string[]> {
		return []
	}
}

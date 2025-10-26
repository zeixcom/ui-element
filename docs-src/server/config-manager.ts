/**
 * Configuration management system with type safety and validation
 */

import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import type { DeepPartial, DevServerConfig } from './types.js'

/**
 * Configuration validation errors
 */
export class ConfigValidationError extends Error {
	constructor(
		message: string,
		public path: string,
		public value: unknown,
	) {
		super(`Configuration validation error at '${path}': ${message}`)
		this.name = 'ConfigValidationError'
	}
}

/**
 * Validates configuration object
 */
function validateConfig(
	config: unknown,
	path = '',
): asserts config is DevServerConfig {
	if (!config || typeof config !== 'object') {
		throw new ConfigValidationError(
			'Config must be an object',
			path,
			config,
		)
	}

	const cfg = config as Record<string, unknown>

	// Validate server config
	if (!cfg.server || typeof cfg.server !== 'object') {
		throw new ConfigValidationError(
			'server config is required',
			`${path}.server`,
			cfg.server,
		)
	}

	const server = cfg.server as Record<string, unknown>
	if (
		typeof server.port !== 'number' ||
		server.port < 1 ||
		server.port > 65535
	) {
		throw new ConfigValidationError(
			'port must be a valid number between 1-65535',
			`${path}.server.port`,
			server.port,
		)
	}

	// Validate paths config
	if (!cfg.paths || typeof cfg.paths !== 'object') {
		throw new ConfigValidationError(
			'paths config is required',
			`${path}.paths`,
			cfg.paths,
		)
	}

	const paths = cfg.paths as Record<string, unknown>
	const requiredPaths = [
		'pages',
		'components',
		'src',
		'output',
		'assets',
		'includes',
		'layout',
	]

	for (const pathKey of requiredPaths) {
		if (typeof paths[pathKey] !== 'string') {
			throw new ConfigValidationError(
				`${pathKey} path must be a string`,
				`${path}.paths.${pathKey}`,
				paths[pathKey],
			)
		}
	}

	// Validate build config
	if (cfg.build && typeof cfg.build !== 'object') {
		throw new ConfigValidationError(
			'build config must be an object',
			`${path}.build`,
			cfg.build,
		)
	}

	// Validate watch config
	if (cfg.watch && typeof cfg.watch !== 'object') {
		throw new ConfigValidationError(
			'watch config must be an object',
			`${path}.watch`,
			cfg.watch,
		)
	}

	const watch = cfg.watch as Record<string, unknown>
	if (
		watch.debounceDelay !== undefined &&
		typeof watch.debounceDelay !== 'number'
	) {
		throw new ConfigValidationError(
			'debounceDelay must be a number',
			`${path}.watch.debounceDelay`,
			watch.debounceDelay,
		)
	}

	if (watch.paths && Array.isArray(watch.paths)) {
		watch.paths.forEach((pathConfig, index) => {
			if (!pathConfig || typeof pathConfig !== 'object') {
				throw new ConfigValidationError(
					'watch path config must be an object',
					`${path}.watch.paths[${index}]`,
					pathConfig,
				)
			}

			const pc = pathConfig as Record<string, unknown>
			if (typeof pc.directory !== 'string') {
				throw new ConfigValidationError(
					'directory must be a string',
					`${path}.watch.paths[${index}].directory`,
					pc.directory,
				)
			}

			if (!Array.isArray(pc.extensions)) {
				throw new ConfigValidationError(
					'extensions must be an array',
					`${path}.watch.paths[${index}].extensions`,
					pc.extensions,
				)
			}

			if (!Array.isArray(pc.buildCommands)) {
				throw new ConfigValidationError(
					'buildCommands must be an array',
					`${path}.watch.paths[${index}].buildCommands`,
					pc.buildCommands,
				)
			}
		})
	}
}

/**
 * Deep merge configuration objects
 */
function mergeConfig(
	base: DevServerConfig,
	override: DeepPartial<DevServerConfig>,
): DevServerConfig {
	const result = JSON.parse(JSON.stringify(base)) as DevServerConfig

	function deepMerge(target: any, source: any): any {
		for (const key in source) {
			if (source[key] === undefined || source[key] === null) {
				continue
			}

			if (
				typeof source[key] === 'object' &&
				!Array.isArray(source[key])
			) {
				target[key] = target[key] || {}
				deepMerge(target[key], source[key])
			} else {
				target[key] = source[key]
			}
		}
		return target
	}

	return deepMerge(result, override)
}

/**
 * Load configuration from file
 */
function loadConfigFile(configPath?: string): DeepPartial<DevServerConfig> {
	// Try to find config file
	const possiblePaths = [
		configPath,
		'./docs-src/server/dev-server.config.ts',
		'./docs-src/server/dev-server.config.js',
		'./dev-server.config.ts',
		'./dev-server.config.js',
	].filter(Boolean) as string[]

	for (const path of possiblePaths) {
		const fullPath = resolve(path)
		if (existsSync(fullPath)) {
			try {
				// For now, we'll use a simple approach - in a real implementation,
				// you might want to use dynamic imports or a more sophisticated loader
				const content = readFileSync(fullPath, 'utf-8')

				// This is a simplified approach - normally you'd want to use
				// proper module loading or transpilation for TypeScript files
				if (path.endsWith('.json')) {
					return JSON.parse(content)
				}

				console.warn(
					`⚠️  Configuration file found at ${path} but dynamic loading not implemented. Using defaults.`,
				)
			} catch (error) {
				console.warn(`⚠️  Failed to load config from ${path}:`, error)
			}
		}
	}

	return {}
}

/**
 * Resolve file system paths in configuration
 */
function resolvePaths(config: DevServerConfig): DevServerConfig {
	const resolved = { ...config }

	// Resolve all path configurations
	resolved.paths = {
		pages: resolve(config.paths.pages),
		components: resolve(config.paths.components),
		src: resolve(config.paths.src),
		output: resolve(config.paths.output),
		assets: resolve(config.paths.assets),
		includes: resolve(config.paths.includes),
		layout: resolve(config.paths.layout),
	}

	// Resolve watch paths
	resolved.watch = {
		...config.watch,
		paths: config.watch.paths.map(pathConfig => ({
			...pathConfig,
			directory: resolve(pathConfig.directory),
		})),
	}

	return resolved
}

/**
 * Validate that required files and directories exist
 */
function validateFileSystem(config: DevServerConfig): void {
	const requiredDirs = [
		config.paths.pages,
		config.paths.components,
		config.paths.includes,
	]

	const requiredFiles = [config.paths.layout]

	for (const dir of requiredDirs) {
		if (!existsSync(dir)) {
			throw new ConfigValidationError(
				`Required directory does not exist: ${dir}`,
				'paths',
				dir,
			)
		}
	}

	for (const file of requiredFiles) {
		if (!existsSync(file)) {
			throw new ConfigValidationError(
				`Required file does not exist: ${file}`,
				'paths',
				file,
			)
		}
	}
}

/**
 * Enhance watch paths with dynamic build command mapping
 */
function enhanceWatchPaths(config: DevServerConfig): DevServerConfig {
	const enhanced = { ...config }

	enhanced.watch.paths = config.watch.paths.map(pathConfig => {
		// If buildCommands are empty, determine them dynamically
		if (pathConfig.buildCommands.length === 0) {
			if (pathConfig.directory.includes('components')) {
				return {
					...pathConfig,
					buildCommands: [], // Will be determined per-file
				}
			}
		}

		return pathConfig
	})

	return enhanced
}

/**
 * Get build commands for a specific file path
 */
export function getBuildCommandsForFile(
	filePath: string,
	config: DevServerConfig,
): string[] {
	const normalizedPath = resolve(filePath)

	// Find the matching watch configuration
	for (const pathConfig of config.watch.paths) {
		if (normalizedPath.startsWith(pathConfig.directory)) {
			// If buildCommands are specified, use them
			if (pathConfig.buildCommands.length > 0) {
				return pathConfig.buildCommands
			}

			// Dynamic mapping for components directory
			if (pathConfig.directory.includes('components')) {
				if (filePath.endsWith('.ts')) return ['build:docs-js']
				if (filePath.endsWith('.css')) return ['build:docs-css']
				if (filePath.endsWith('.html')) return ['build:docs-html']
				if (filePath.endsWith('.md')) return ['build:docs-html']
			}

			break
		}
	}

	return []
}

/**
 * Main configuration loader and validator
 */
export class ConfigManager {
	private _config: DevServerConfig | null = null

	constructor(private configPath?: string) {}

	/**
	 * Load and validate configuration
	 */
	public async load(
		defaultConfig: DevServerConfig,
	): Promise<DevServerConfig> {
		if (this._config) {
			return this._config
		}

		try {
			// Start with defaults
			let config = { ...defaultConfig }

			// Load from file if available
			const fileConfig = loadConfigFile(this.configPath)
			if (Object.keys(fileConfig).length > 0) {
				config = mergeConfig(config, fileConfig)
			}

			// Load from environment variables
			const envConfig = this.loadFromEnvironment()
			if (Object.keys(envConfig).length > 0) {
				config = mergeConfig(config, envConfig)
			}

			// Resolve file system paths
			config = resolvePaths(config)

			// Enhance with dynamic features
			config = enhanceWatchPaths(config)

			// Validate configuration
			validateConfig(config)

			// Validate file system
			validateFileSystem(config)

			this._config = config
			return config
		} catch (error) {
			if (error instanceof ConfigValidationError) {
				throw error
			}
			throw new ConfigValidationError(
				`Failed to load configuration: ${error.message}`,
				'root',
				error,
			)
		}
	}

	/**
	 * Get current configuration (must call load() first)
	 */
	public get config(): DevServerConfig {
		if (!this._config) {
			throw new Error('Configuration not loaded. Call load() first.')
		}
		return this._config
	}

	/**
	 * Reload configuration
	 */
	public async reload(
		defaultConfig: DevServerConfig,
	): Promise<DevServerConfig> {
		this._config = null
		return this.load(defaultConfig)
	}

	/**
	 * Load configuration overrides from environment variables
	 */
	private loadFromEnvironment(): DeepPartial<DevServerConfig> {
		const config: DeepPartial<DevServerConfig> = {}

		// Server configuration
		if (process.env.DEV_SERVER_PORT) {
			const port = parseInt(process.env.DEV_SERVER_PORT, 10)
			if (!isNaN(port)) {
				config.server = { port }
			}
		}

		if (process.env.DEV_SERVER_HOST) {
			config.server = {
				...config.server,
				host: process.env.DEV_SERVER_HOST,
			}
		}

		// Build configuration
		if (process.env.OPTIMIZE_LAYOUT !== undefined) {
			config.build = {
				optimizeLayout: process.env.OPTIMIZE_LAYOUT !== 'false',
			}
		}

		if (process.env.DEV_MODE !== undefined) {
			config.server = {
				...config.server,
				development: process.env.DEV_MODE !== 'false',
			}
		}

		return config
	}

	/**
	 * Validate a partial configuration object
	 */
	public static validate(config: unknown): asserts config is DevServerConfig {
		validateConfig(config)
	}

	/**
	 * Create a configuration manager with custom config
	 */
	public static create(
		defaultConfig: DevServerConfig,
		config?: DeepPartial<DevServerConfig>,
	): DevServerConfig {
		const merged = mergeConfig(defaultConfig, config || {})
		validateConfig(merged)
		return resolvePaths(merged)
	}
}

// Utility functions
export function generateAssetHash(content: string, length: number = 8): string {
	return createHash('sha256').update(content).digest('hex').slice(0, length)
}

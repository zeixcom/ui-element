/**
 * File Utility Functions
 *
 * Common file system operations and utilities for the build system
 */

import { createHash } from 'crypto'
import {
	existsSync,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from 'fs'
import { mkdir, readdir, readFile, stat, writeFile } from 'fs/promises'
import { dirname, extname, join, relative } from 'path'

// ============================================================================
// File Reading and Writing
// ============================================================================

/**
 * Read file with error handling
 */
export async function readFileAsync(filePath: string): Promise<string | null> {
	try {
		return await readFile(filePath, 'utf-8')
	} catch (error) {
		console.error(`Error reading file ${filePath}:`, error)
		return null
	}
}

/**
 * Write file with directory creation
 */
export async function writeFileAsync(
	filePath: string,
	content: string,
): Promise<boolean> {
	try {
		// Ensure directory exists
		const dir = dirname(filePath)
		if (!existsSync(dir)) {
			await mkdir(dir, { recursive: true })
		}

		await writeFile(filePath, content, 'utf-8')
		return true
	} catch (error) {
		console.error(`Error writing file ${filePath}:`, error)
		return false
	}
}

/**
 * Read file synchronously with error handling
 */
export function readFileSync(filePath: string): string | null {
	try {
		return readFileSync(filePath, 'utf-8')
	} catch (error) {
		console.error(`Error reading file ${filePath}:`, error)
		return null
	}
}

/**
 * Write file synchronously with directory creation
 */
export function writeFileSyncSafe(filePath: string, content: string): boolean {
	try {
		// Ensure directory exists
		const dir = dirname(filePath)
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true })
		}

		writeFileSync(filePath, content, 'utf-8')
		return true
	} catch (error) {
		console.error(`Error writing file ${filePath}:`, error)
		return false
	}
}

// ============================================================================
// File Information and Metadata
// ============================================================================

/**
 * Get file modification time
 */
export async function getFileModTime(filePath: string): Promise<number> {
	try {
		const stats = await stat(filePath)
		return stats.mtimeMs
	} catch {
		return 0
	}
}

/**
 * Get file modification time synchronously
 */
export function getFileModTimeSync(filePath: string): number {
	try {
		const stats = statSync(filePath)
		return stats.mtimeMs
	} catch {
		return 0
	}
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
	try {
		const stats = await stat(filePath)
		return stats.size
	} catch {
		return 0
	}
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
	return existsSync(filePath)
}

/**
 * Check if path is a directory
 */
export function isDirectory(path: string): boolean {
	try {
		const stats = statSync(path)
		return stats.isDirectory()
	} catch {
		return false
	}
}

/**
 * Check if path is a file
 */
export function isFile(path: string): boolean {
	try {
		const stats = statSync(path)
		return stats.isFile()
	} catch {
		return false
	}
}

// ============================================================================
// Directory Operations
// ============================================================================

/**
 * List files in directory with optional filtering
 */
export async function listFiles(
	directory: string,
	options: {
		recursive?: boolean
		extensions?: string[]
		ignore?: string[]
	} = {},
): Promise<string[]> {
	const files: string[] = []
	const { recursive = false, extensions = [], ignore = [] } = options

	try {
		const entries = await readdir(directory, {
			withFileTypes: true,
			recursive,
		})

		for (const entry of entries) {
			const fullPath = join(directory, entry.name)

			// Skip ignored patterns
			if (ignore.some(pattern => entry.name.includes(pattern))) {
				continue
			}

			if (entry.isFile()) {
				// Filter by extensions if provided
				if (extensions.length > 0) {
					const ext = extname(entry.name)
					if (!extensions.includes(ext)) continue
				}

				files.push(fullPath)
			}
		}
	} catch (error) {
		console.error(`Error listing files in ${directory}:`, error)
	}

	return files
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<boolean> {
	try {
		await mkdir(dirPath, { recursive: true })
		return true
	} catch (error) {
		console.error(`Error creating directory ${dirPath}:`, error)
		return false
	}
}

/**
 * Ensure directory exists synchronously
 */
export function ensureDirSync(dirPath: string): boolean {
	try {
		mkdirSync(dirPath, { recursive: true })
		return true
	} catch (error) {
		console.error(`Error creating directory ${dirPath}:`, error)
		return false
	}
}

// ============================================================================
// Hash and Comparison
// ============================================================================

/**
 * Calculate file hash (SHA-256, first 16 characters)
 */
export function calculateFileHash(content: string): string {
	return createHash('sha256')
		.update(content, 'utf8')
		.digest('hex')
		.slice(0, 16)
}

/**
 * Calculate hash of file on disk
 */
export async function calculateFileHashFromDisk(
	filePath: string,
): Promise<string | null> {
	const content = await readFileAsync(filePath)
	if (content === null) return null
	return calculateFileHash(content)
}

/**
 * Compare two files by content hash
 */
export async function filesAreEqual(
	filePath1: string,
	filePath2: string,
): Promise<boolean> {
	const [hash1, hash2] = await Promise.all([
		calculateFileHashFromDisk(filePath1),
		calculateFileHashFromDisk(filePath2),
	])

	return hash1 !== null && hash2 !== null && hash1 === hash2
}

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Get relative path from one file to another
 */
export function getRelativePath(from: string, to: string): string {
	return relative(dirname(from), to)
}

/**
 * Normalize path separators for cross-platform compatibility
 */
export function normalizePath(path: string): string {
	return path.replace(/\\/g, '/')
}

/**
 * Get file extension without the dot
 */
export function getFileExtension(filePath: string): string {
	const ext = extname(filePath)
	return ext.startsWith('.') ? ext.slice(1) : ext
}

/**
 * Change file extension
 */
export function changeExtension(
	filePath: string,
	newExtension: string,
): string {
	const parsed = require('path').parse(filePath)
	return join(parsed.dir, parsed.name + '.' + newExtension.replace(/^\./, ''))
}

/**
 * Get filename without extension
 */
export function getBasename(filePath: string): string {
	const parsed = require('path').parse(filePath)
	return parsed.name
}

// ============================================================================
// File Type Detection
// ============================================================================

/**
 * Check if file is a markdown file
 */
export function isMarkdownFile(filePath: string): boolean {
	return extname(filePath).toLowerCase() === '.md'
}

/**
 * Check if file is a TypeScript file
 */
export function isTypeScriptFile(filePath: string): boolean {
	const ext = extname(filePath).toLowerCase()
	return ext === '.ts' || ext === '.tsx'
}

/**
 * Check if file is a CSS file
 */
export function isCSSFile(filePath: string): boolean {
	return extname(filePath).toLowerCase() === '.css'
}

/**
 * Check if file is an HTML file
 */
export function isHTMLFile(filePath: string): boolean {
	return extname(filePath).toLowerCase() === '.html'
}

/**
 * Check if file is a test file
 */
export function isTestFile(filePath: string): boolean {
	const fileName = require('path').basename(filePath).toLowerCase()
	return (
		fileName.includes('.test.') ||
		fileName.includes('.spec.') ||
		fileName.endsWith('-test.html')
	)
}

// ============================================================================
// Content Processing
// ============================================================================

/**
 * Extract frontmatter from markdown content
 */
export function extractFrontmatter(content: string): {
	frontmatter: Record<string, unknown>
	content: string
} {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
	const match = content.match(frontmatterRegex)

	if (!match) {
		return { frontmatter: {}, content }
	}

	try {
		// Simple YAML-like parsing
		const yamlContent = match[1]
		const frontmatter: Record<string, unknown> = {}

		const lines = yamlContent.split('\n')
		for (const line of lines) {
			const colonIndex = line.indexOf(':')
			if (colonIndex === -1) continue

			const key = line.slice(0, colonIndex).trim()
			let value: unknown = line
				.slice(colonIndex + 1)
				.trim()
				.replace(/^['"]|['"]$/g, '')

			// Try to parse as number or boolean
			if (typeof value === 'string') {
				if (value === 'true') value = true
				else if (value === 'false') value = false
				else if (/^\d+$/.test(value)) value = parseInt(value, 10)
				else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value)
			}

			frontmatter[key] = value
		}

		return { frontmatter, content: match[2] }
	} catch (error) {
		console.warn('Failed to parse frontmatter:', error)
		return { frontmatter: {}, content: match[2] || content }
	}
}

/**
 * Remove HTML tags from string
 */
export function stripHTMLTags(html: string): string {
	return html.replace(/<[^>]*>/g, '')
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text
	return text.slice(0, maxLength).trim() + '...'
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Time a function execution
 */
export async function timeAsync<T>(
	name: string,
	fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
	const start = performance.now()
	const result = await fn()
	const duration = performance.now() - start

	console.log(`${name} took ${duration.toFixed(2)}ms`)

	return { result, duration }
}

/**
 * Batch process files with concurrency limit
 */
export async function processBatch<T, R>(
	items: T[],
	processor: (item: T) => Promise<R>,
	concurrency: number = 5,
): Promise<R[]> {
	const results: R[] = []

	for (let i = 0; i < items.length; i += concurrency) {
		const batch = items.slice(i, i + concurrency)
		const batchResults = await Promise.all(batch.map(processor))
		results.push(...batchResults)
	}

	return results
}

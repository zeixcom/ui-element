/**
 * Custom Elements Manifest Configuration
 *
 * Configures the CEM analyzer to scan UIElement components in docs-src/components/
 * and generate individual manifest JSON files for each component.
 */

import { mkdirSync, readdirSync, statSync, writeFileSync } from 'fs'
import { basename, dirname, join } from 'path'
import { uiElementPlugin } from './cem-plugin/dist/index.js'

// Function to find all component TypeScript files
function findComponentFiles() {
	const componentsDir = 'docs-src/components'
	const componentFiles = []

	try {
		const componentDirs = readdirSync(componentsDir)

		for (const dir of componentDirs) {
			const dirPath = join(componentsDir, dir)

			if (statSync(dirPath).isDirectory()) {
				const files = readdirSync(dirPath)

				for (const file of files) {
					if (
						file.endsWith('.ts') &&
						!file.includes('-test') &&
						!file.includes('.test')
					) {
						componentFiles.push(join(dirPath, file))
					}
				}
			}
		}
	} catch (error) {
		console.warn('Could not read components directory:', error.message)
	}

	return componentFiles
}

// Get all component TypeScript files
const componentFiles = findComponentFiles()

export default {
	// Scan all component files
	globs: componentFiles,

	// Exclude test files and node_modules
	exclude: [
		'node_modules/**',
		'**/*-test.ts',
		'**/*.test.ts',
		'test/**',
		'dist/**',
	],

	// Output directory for manifest files
	outDir: 'docs/cem',

	// Use our UIElement plugin
	plugins: [
		uiElementPlugin({
			// Configure component detection
			componentDetection: {
				// Look for component() function calls
				functionNames: ['component'],
				// Include interfaces and type definitions
				includeInterfaces: true,
			},

			// Configure property analysis
			propertyAnalysis: {
				// Analyze reactive properties
				analyzeReactiveProps: true,
				// Include JSDoc information
				includeJSDoc: true,
				// Detect property types from initializers
				inferTypesFromInitializers: true,
			},
		}),

		// Custom plugin to generate individual manifest files per component
		{
			name: 'individual-manifests',
			moduleLinkPhase({ moduleDoc }) {
				// Generate individual manifest for this module if it has declarations
				if (moduleDoc.declarations?.length > 0) {
					// Ensure output directory exists
					mkdirSync('docs/cem', { recursive: true })

					// Extract component name from file path
					const componentName = basename(dirname(moduleDoc.path))

					// Create individual manifest for this component
					const componentManifest = {
						schemaVersion: '1.0.0',
						readme: `Component: ${componentName}`,
						modules: [moduleDoc],
					}

					// Write individual manifest file
					const manifestPath = join(
						'docs/cem',
						`${componentName}.json`,
					)
					writeFileSync(
						manifestPath,
						JSON.stringify(componentManifest, null, 2),
						'utf8',
					)
				}
			},
		},
	],

	// Lint configuration
	litelement: false,

	// Package configuration
	packagejson: true,

	// Include private members in analysis
	dev: false,
}

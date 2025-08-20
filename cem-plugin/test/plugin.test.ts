import { describe, expect, test } from 'bun:test'
import * as ts from 'typescript'
import { uiElementPlugin } from '../src/plugin.js'
import type { PluginConfig } from '../src/types.js'

// Helper function to create a TypeScript source file from code
function createSourceFile(code: string): ts.SourceFile {
	return ts.createSourceFile(
		'test.ts',
		code,
		ts.ScriptTarget.ES2022,
		true,
		ts.ScriptKind.TS,
	)
}

// Mock CEM context for most plugin hooks
function createMockCemContext() {
	return {
		typeChecker: undefined,
		deps: [] as string[],
		dev: false,
		// Add other required CEM context properties as needed
	}
}

// Mock CEM context for initialize function (needs typeChecker property)
function createMockInitializeContext() {
	return {
		typeChecker: undefined as any,
		deps: [] as string[],
		dev: false,
		// Add other required CEM context properties as needed
	}
}

describe('UIElement Plugin', () => {
	test('should create plugin with default config', () => {
		const plugin = uiElementPlugin()

		expect(plugin).toBeTruthy()
		expect(plugin.name).toBe('uielement-cem-plugin')
		expect(typeof plugin.collectPhase).toBe('function')
		expect(typeof plugin.analyzePhase).toBe('function')
		expect(typeof plugin.moduleLinkPhase).toBe('function')
		expect(typeof plugin.packageLinkPhase).toBe('function')
	})

	test('should create plugin with custom config', () => {
		const config: PluginConfig = {
			debug: true,
			componentFunctionNames: ['createComponent'],
		}
		const plugin = uiElementPlugin(config)

		expect(plugin).toBeTruthy()
		expect(plugin.name).toBe('uielement-cem-plugin')
	})

	test('should initialize plugin correctly', () => {
		const plugin = uiElementPlugin({ debug: false })
		const mockManifest = { modules: [] }
		const mockContext = createMockInitializeContext()

		// Should not throw
		expect(() => {
			plugin.initialize?.({
				ts,
				customElementsManifest: mockManifest,
				context: mockContext,
			})
		}).not.toThrow()
	})

	test('should handle collectPhase without errors', () => {
		const plugin = uiElementPlugin({ debug: false })
		const code = `
			import { component, asString } from '@zeix/ui-element'

			component('my-button', {
				label: asString('Click me')
			}, () => [])
		`
		const sourceFile = createSourceFile(code)
		const mockContext = createMockCemContext()

		// Find the component call expression
		let _componentCallNode: ts.Node | undefined
		function visit(node: ts.Node) {
			if (ts.isCallExpression(node)) {
				_componentCallNode = node
			}
			ts.forEachChild(node, visit)
		}
		visit(sourceFile)

		// Should not throw during collect phase
		expect(() => {
			plugin.collectPhase?.({
				ts,
				node: _componentCallNode!,
				context: mockContext,
			})
		}).not.toThrow()
	})

	test('should handle analyzePhase without errors', () => {
		const plugin = uiElementPlugin({ debug: false })
		const code = `
			import { component, asString } from '@zeix/ui-element'

			component('my-button', {
				label: asString('Click me')
			}, () => [])
		`
		const sourceFile = createSourceFile(code)
		const mockContext = createMockCemContext()
		const mockModuleDoc = {
			path: 'test.ts',
			declarations: [],
		}

		// First run collect phase to gather components
		let _componentCallNode: ts.Node | undefined
		function visit(node: ts.Node) {
			if (ts.isCallExpression(node)) {
				_componentCallNode = node
				plugin.collectPhase?.({
					ts,
					node,
					context: mockContext,
				})
			}
			ts.forEachChild(node, visit)
		}
		visit(sourceFile)

		// Then run analyze phase
		expect(() => {
			plugin.analyzePhase?.({
				ts,
				node: sourceFile,
				moduleDoc: mockModuleDoc,
				context: mockContext,
			})
		}).not.toThrow()
	})

	test('should handle moduleLinkPhase without errors', () => {
		const plugin = uiElementPlugin({ debug: false })
		const mockModuleDoc = {
			path: 'test.ts',
			declarations: [],
		}
		const mockContext = createMockCemContext()

		expect(() => {
			plugin.moduleLinkPhase?.({
				moduleDoc: mockModuleDoc,
				context: mockContext,
			})
		}).not.toThrow()
	})

	test('should handle packageLinkPhase without errors', () => {
		const plugin = uiElementPlugin({ debug: false })
		const mockManifest = {
			modules: [] as any[],
			plugins: [] as any[],
		}
		const mockContext = createMockCemContext()

		expect(() => {
			plugin.packageLinkPhase?.({
				customElementsManifest: mockManifest,
				context: mockContext,
			})
		}).not.toThrow()

		// Should add plugin metadata
		expect(mockManifest.plugins).toHaveLength(1)
		expect(mockManifest.plugins[0]?.name).toBe('uielement-cem-plugin')
	})

	test('should process complete component through all phases', () => {
		const plugin = uiElementPlugin({ debug: false })
		const code = `
			import { component, asBoolean, asString } from '@zeix/ui-element'

			export type MyButtonProps = {
				disabled: boolean
				label: string
			}

			export default component('my-button', {
				disabled: asBoolean(),
				label: asString('Click me')
			}, (host, { first }) => [
				first('button', setProperty('disabled')),
				first('.label', setText('label'))
			])
		`
		const sourceFile = createSourceFile(code)
		const mockContext = createMockCemContext()
		const mockManifest = {
			modules: [
				{
					path: 'test.ts',
					declarations: [] as any[],
				},
			],
			plugins: [] as any[],
		}

		// Initialize plugin
		plugin.initialize?.({
			ts,
			customElementsManifest: mockManifest,
			context: createMockInitializeContext(),
		})

		// Collect phase - find all component calls
		function collectVisit(node: ts.Node) {
			if (ts.isCallExpression(node)) {
				plugin.collectPhase?.({
					ts,
					node,
					context: mockContext,
				})
			}
			ts.forEachChild(node, collectVisit)
		}
		collectVisit(sourceFile)

		// Analyze phase - analyze found components
		plugin.analyzePhase?.({
			ts,
			node: sourceFile,
			moduleDoc: mockManifest.modules[0],
			context: mockContext,
		})

		// Module link phase - generate declarations
		plugin.moduleLinkPhase?.({
			moduleDoc: mockManifest.modules[0],
			context: mockContext,
		})

		// Package link phase - finalize manifest
		plugin.packageLinkPhase?.({
			customElementsManifest: mockManifest,
			context: mockContext,
		})

		// Verify that a declaration was created
		expect(mockManifest.modules[0]?.declarations).toHaveLength(1)
		const declaration = mockManifest.modules[0]?.declarations[0]
		expect(declaration?.tagName).toBe('my-button')
		expect(declaration?.customElement).toBe(true)
		expect(declaration?.members).toBeDefined()
		expect(declaration?.attributes).toBeDefined()
	})

	test('should handle errors gracefully with debug mode', () => {
		// Create plugin with debug mode to capture error logging
		const originalConsoleError = console.error
		const errorLogs: string[] = []
		console.error = (...args) => {
			errorLogs.push(args.join(' '))
		}

		const plugin = uiElementPlugin({ debug: true })
		const mockContext = createMockCemContext()

		try {
			// Try to process a malformed component call
			const code = `
				import { component } from '@zeix/ui-element'

				// This will cause an error during analysis
				component()  // Missing required arguments
			`
			const sourceFile = createSourceFile(code)

			// Find the malformed component call
			let _malformedCallNode: ts.Node | undefined
			function visit(node: ts.Node) {
				if (ts.isCallExpression(node)) {
					_malformedCallNode = node
				}
				ts.forEachChild(node, visit)
			}
			visit(sourceFile)

			// Process the malformed call - should handle gracefully
			plugin.collectPhase?.({
				ts,
				node: _malformedCallNode!,
				context: mockContext,
			})

			// Should not throw even with malformed input
			expect(true).toBe(true) // Test passes if no exception thrown
		} finally {
			console.error = originalConsoleError
		}
	})
})

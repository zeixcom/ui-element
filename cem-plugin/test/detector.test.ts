import { describe, expect, test } from 'bun:test'
import * as ts from 'typescript'
import { ComponentDetector } from '../src/detector.js'
import type { PluginContext } from '../src/types.js'
import { DEFAULT_CONFIG } from '../src/types.js'

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

// Helper function to find call expressions in source
function findCallExpressions(sourceFile: ts.SourceFile): ts.CallExpression[] {
	const callExpressions: ts.CallExpression[] = []

	function visit(node: ts.Node) {
		if (ts.isCallExpression(node)) {
			callExpressions.push(node)
		}
		ts.forEachChild(node, visit)
	}

	visit(sourceFile)
	return callExpressions
}

// Mock plugin context
const mockContext: PluginContext = {
	components: new Map(),
	config: DEFAULT_CONFIG,
}

describe('ComponentDetector', () => {
	const detector = new ComponentDetector(mockContext)

	describe('detectComponentCall', () => {
		test('should detect basic component call', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-button', {}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const result = detector.detectComponentCall(ts, componentCall)

			expect(result).toBeTruthy()
			expect(result?.tagName).toBe('my-button')
		})

		test('should detect component call with properties', () => {
			const code = `
				import { component, asBoolean, asString } from '@zeix/ui-element'

				component('my-button', {
					disabled: asBoolean(),
					label: asString('Click me')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const result = detector.detectComponentCall(ts, componentCall)

			expect(result).toBeTruthy()
			expect(result?.tagName).toBe('my-button')
			expect(result?.initializers).toBeTruthy()
		})

		test('should handle component call without initializers', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-button', () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const result = detector.detectComponentCall(ts, componentCall)

			expect(result).toBeTruthy()
			expect(result?.tagName).toBe('my-button')
			expect(result?.initializers.properties.size).toBe(0)
		})

		test('should reject invalid tag names', () => {
			const testCases = [
				'button', // no hyphen
				'My-Button', // uppercase
				'my_button', // underscore
				'123-button', // starts with number
				'my-', // ends with hyphen
				'-my-button', // starts with hyphen
			]

			for (const tagName of testCases) {
				const code = `
					import { component } from '@zeix/ui-element'

					component('${tagName}', {}, () => [])
				`
				const sourceFile = createSourceFile(code)
				const callExpressions = findCallExpressions(sourceFile)
				const componentCall = callExpressions[0]

				const result = detector.detectComponentCall(ts, componentCall)

				expect(result).toBeNull()
			}
		})

		test('should accept valid tag names', () => {
			const testCases = [
				'my-button',
				'custom-element',
				'multi-word-component',
				'a-b',
				'element-123',
			]

			for (const tagName of testCases) {
				const code = `
					import { component } from '@zeix/ui-element'

					component('${tagName}', {}, () => [])
				`
				const sourceFile = createSourceFile(code)
				const callExpressions = findCallExpressions(sourceFile)
				const componentCall = callExpressions[0]

				const result = detector.detectComponentCall(ts, componentCall)

				expect(result).toBeTruthy()
				expect(result?.tagName).toBe(tagName)
			}
		})

		test('should ignore non-component function calls', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				someOtherFunction('my-button', {}, () => [])
				console.log('test')
				Math.max(1, 2, 3)
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)

			for (const callExpr of callExpressions) {
				const result = detector.detectComponentCall(ts, callExpr)
				expect(result).toBeNull()
			}
		})

		test('should handle namespaced component calls', () => {
			const code = `
				import * as UIElement from '@zeix/ui-element'

				UIElement.component('my-button', {}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const result = detector.detectComponentCall(ts, componentCall)

			expect(result).toBeTruthy()
			expect(result?.tagName).toBe('my-button')
		})

		test('should extract setup function when present', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-button', {}, (host, { first }) => [
					first('button', setText('label'))
				])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const result = detector.detectComponentCall(ts, componentCall)

			expect(result).toBeTruthy()
			expect(result?.setupFunction).toBeTruthy()
			expect(ts.isArrowFunction(result!.setupFunction!)).toBe(true)
		})

		test('should handle missing setup function', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-button', {})
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const result = detector.detectComponentCall(ts, componentCall)

			expect(result).toBeTruthy()
			expect(result?.setupFunction).toBeUndefined()
		})
	})

	describe('hasComponentImport', () => {
		test('should detect named component import', () => {
			const code = `
				import { component, asString } from '@zeix/ui-element'
			`
			const sourceFile = createSourceFile(code)

			const result = ComponentDetector.hasComponentImport(
				ts,
				sourceFile,
				['component'],
			)

			expect(result).toBe(true)
		})

		test('should detect namespace import', () => {
			const code = `
				import * as UIElement from '@zeix/ui-element'
			`
			const sourceFile = createSourceFile(code)

			const result = ComponentDetector.hasComponentImport(
				ts,
				sourceFile,
				['component'],
			)

			expect(result).toBe(true)
		})

		test('should return false for no component import', () => {
			const code = `
				import { asString, asBoolean } from '@zeix/ui-element'
				import React from 'react'
			`
			const sourceFile = createSourceFile(code)

			const result = ComponentDetector.hasComponentImport(
				ts,
				sourceFile,
				['component'],
			)

			expect(result).toBe(false)
		})

		test('should handle custom component function names', () => {
			const code = `
				import { createComponent } from '@zeix/ui-element'
			`
			const sourceFile = createSourceFile(code)

			const result = ComponentDetector.hasComponentImport(
				ts,
				sourceFile,
				['createComponent'],
			)

			expect(result).toBe(true)
		})
	})
})

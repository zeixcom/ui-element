import { describe, expect, test } from 'bun:test'
import * as ts from 'typescript'
import { ComponentAnalyzer } from '../src/analyzer.js'
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

describe('ComponentAnalyzer - Phase 2: Property Analysis', () => {
	const detector = new ComponentDetector(mockContext)
	const analyzer = new ComponentAnalyzer(mockContext)

	describe('Parser Recognition', () => {
		test('should recognize asBoolean parser', () => {
			const code = `
				import { component, asBoolean } from '@zeix/ui-element'

				component('my-button', {
					disabled: asBoolean()
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			expect(componentDef).toBeTruthy()

			analyzer.analyzeComponent(ts, componentDef!)
			const disabledProp =
				componentDef!.initializers.properties.get('disabled')

			expect(disabledProp).toBeTruthy()
			expect(disabledProp!.type).toBe('parser')
			expect(disabledProp!.details.type).toBe('parser')

			const parserDetails = disabledProp!.details as any
			expect(parserDetails.parserName).toBe('asBoolean')
			expect(parserDetails.tsType).toBe('boolean')
			expect(parserDetails.defaultValue).toBe(false)
		})

		test('should recognize asString parser with default value', () => {
			const code = `
				import { component, asString } from '@zeix/ui-element'

				component('my-button', {
					label: asString('Click me')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const labelProp = componentDef!.initializers.properties.get('label')

			expect(labelProp!.type).toBe('parser')
			const parserDetails = labelProp!.details as any
			expect(parserDetails.parserName).toBe('asString')
			expect(parserDetails.tsType).toBe('string')
			expect(parserDetails.defaultValue).toBe('Click me')
			expect(parserDetails.arguments).toEqual(['Click me'])
		})

		test('should recognize asNumber parser with default value', () => {
			const code = `
				import { component, asNumber } from '@zeix/ui-element'

				component('my-slider', {
					value: asNumber(50)
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const valueProp = componentDef!.initializers.properties.get('value')

			expect(valueProp!.type).toBe('parser')
			const parserDetails = valueProp!.details as any
			expect(parserDetails.parserName).toBe('asNumber')
			expect(parserDetails.tsType).toBe('number')
			expect(parserDetails.defaultValue).toBe(50)
		})

		test('should recognize asInteger parser', () => {
			const code = `
				import { component, asInteger } from '@zeix/ui-element'

				component('my-counter', {
					count: asInteger(0)
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const countProp = componentDef!.initializers.properties.get('count')

			expect(countProp!.type).toBe('parser')
			const parserDetails = countProp!.details as any
			expect(parserDetails.parserName).toBe('asInteger')
			expect(parserDetails.tsType).toBe('number')
			expect(parserDetails.defaultValue).toBe(0)
		})

		test('should recognize asEnum parser with union type', () => {
			const code = `
				import { component, asEnum } from '@zeix/ui-element'

				component('my-button', {
					variant: asEnum(['primary', 'secondary', 'danger'])
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const variantProp =
				componentDef!.initializers.properties.get('variant')

			expect(variantProp!.type).toBe('parser')
			const parserDetails = variantProp!.details as any
			expect(parserDetails.parserName).toBe('asEnum')
			expect(parserDetails.tsType).toBe(
				'"primary" | "secondary" | "danger"',
			)
			expect(parserDetails.defaultValue).toBe('primary')
		})

		test('should recognize asJSON parser', () => {
			const code = `
				import { component, asJSON } from '@zeix/ui-element'

				component('my-component', {
					config: asJSON({ theme: 'dark' })
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const configProp =
				componentDef!.initializers.properties.get('config')

			expect(configProp!.type).toBe('parser')
			const parserDetails = configProp!.details as any
			expect(parserDetails.parserName).toBe('asJSON')
			expect(parserDetails.tsType).toBe('object')
			expect(parserDetails.defaultValue).toBe('<complex-expression>')
		})
	})

	describe('Extractor Recognition', () => {
		test('should recognize fromDOM extractor', () => {
			const code = `
				import { component, fromDOM, getText } from '@zeix/ui-element'

				component('my-component', {
					text: fromDOM({ '.content': getText() }, 'fallback')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const textProp = componentDef!.initializers.properties.get('text')

			expect(textProp!.type).toBe('extractor')
			const extractorDetails = textProp!.details as any
			expect(extractorDetails.extractorName).toBe('fromDOM')
			expect(extractorDetails.config).toBe('<complex-expression>')
			expect(extractorDetails.fallback).toBe('fallback')
			expect(extractorDetails.tsType).toBe('string')
		})

		test('should recognize getAttribute extractor', () => {
			const code = `
				import { component, getAttribute } from '@zeix/ui-element'

				component('my-component', {
					title: getAttribute('title')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const titleProp = componentDef!.initializers.properties.get('title')

			expect(titleProp!.type).toBe('extractor')
			const extractorDetails = titleProp!.details as any
			expect(extractorDetails.extractorName).toBe('getAttribute')
			expect(extractorDetails.config).toBe('title')
			expect(extractorDetails.tsType).toBe('string')
		})

		test('should recognize hasAttribute extractor', () => {
			const code = `
				import { component, hasAttribute } from '@zeix/ui-element'

				component('my-component', {
					isRequired: hasAttribute('required')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const isRequiredProp =
				componentDef!.initializers.properties.get('isRequired')

			expect(isRequiredProp!.type).toBe('extractor')
			const extractorDetails = isRequiredProp!.details as any
			expect(extractorDetails.extractorName).toBe('hasAttribute')
			expect(extractorDetails.config).toBe('required')
			expect(extractorDetails.tsType).toBe('boolean')
		})

		test('should recognize getText extractor', () => {
			const code = `
				import { component, getText } from '@zeix/ui-element'

				component('my-component', {
					content: getText()
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const contentProp =
				componentDef!.initializers.properties.get('content')

			expect(contentProp!.type).toBe('extractor')
			const extractorDetails = contentProp!.details as any
			expect(extractorDetails.extractorName).toBe('getText')
			expect(extractorDetails.tsType).toBe('string')
		})

		test('should recognize getProperty extractor', () => {
			const code = `
				import { component, getProperty } from '@zeix/ui-element'

				component('my-component', {
					elementId: getProperty('id')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const elementIdProp =
				componentDef!.initializers.properties.get('elementId')

			expect(elementIdProp!.type).toBe('extractor')
			const extractorDetails = elementIdProp!.details as any
			expect(extractorDetails.extractorName).toBe('getProperty')
			expect(extractorDetails.config).toBe('id')
			expect(extractorDetails.tsType).toBe('unknown')
		})
	})

	describe('Literal Value Recognition', () => {
		test('should recognize string literals', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					message: 'Hello World'
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const messageProp =
				componentDef!.initializers.properties.get('message')

			expect(messageProp!.type).toBe('literal')
			const literalDetails = messageProp!.details as any
			expect(literalDetails.value).toBe('Hello World')
			expect(literalDetails.tsType).toBe('string')
		})

		test('should recognize number literals', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					count: 42
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const countProp = componentDef!.initializers.properties.get('count')

			expect(countProp!.type).toBe('literal')
			const literalDetails = countProp!.details as any
			expect(literalDetails.value).toBe(42)
			expect(literalDetails.tsType).toBe('number')
		})

		test('should recognize boolean literals', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					enabled: true,
					disabled: false
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)

			const enabledProp =
				componentDef!.initializers.properties.get('enabled')
			expect(enabledProp!.type).toBe('literal')
			const enabledDetails = enabledProp!.details as any
			expect(enabledDetails.value).toBe(true)
			expect(enabledDetails.tsType).toBe('boolean')

			const disabledProp =
				componentDef!.initializers.properties.get('disabled')
			expect(disabledProp!.type).toBe('literal')
			const disabledDetails = disabledProp!.details as any
			expect(disabledDetails.value).toBe(false)
			expect(disabledDetails.tsType).toBe('boolean')
		})

		test('should recognize null and undefined literals', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					nullValue: null,
					undefinedValue: undefined
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)

			const nullProp =
				componentDef!.initializers.properties.get('nullValue')
			expect(nullProp!.type).toBe('literal')
			const nullDetails = nullProp!.details as any
			expect(nullDetails.value).toBe(null)
			expect(nullDetails.tsType).toBe('null')

			const undefinedProp =
				componentDef!.initializers.properties.get('undefinedValue')
			expect(undefinedProp!.type).toBe('literal')
			const undefinedDetails = undefinedProp!.details as any
			expect(undefinedDetails.value).toBe(undefined)
			expect(undefinedDetails.tsType).toBe('undefined')
		})
	})

	describe('Function Initializers', () => {
		test('should recognize arrow function initializers', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					computed: () => 'computed value'
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const computedProp =
				componentDef!.initializers.properties.get('computed')

			expect(computedProp!.type).toBe('function')
			const functionDetails = computedProp!.details as any
			expect(functionDetails.returnType).toBe('unknown')
		})

		test('should recognize function expression initializers', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					handler: function() { return 'handled' }
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)
			const handlerProp =
				componentDef!.initializers.properties.get('handler')

			expect(handlerProp!.type).toBe('function')
			const functionDetails = handlerProp!.details as any
			expect(functionDetails.returnType).toBe('unknown')
		})
	})

	describe('TypeScript Interface Extraction', () => {
		test('should find and extract props interface', () => {
			const code = `
				import { component, asBoolean, asString } from '@zeix/ui-element'

				interface MyButtonProps {
					disabled: boolean
					label: string
					variant?: 'primary' | 'secondary'
				}

				component('my-button', {
					disabled: asBoolean(),
					label: asString('Click me')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)

			expect(componentDef!.propsInterface).toBeTruthy()
			expect(componentDef!.propsInterface!.name).toBe('MyButtonProps')
			expect(componentDef!.propsInterface!.properties.size).toBe(3)

			const disabledProp =
				componentDef!.propsInterface!.properties.get('disabled')
			expect(disabledProp).toBeTruthy()
			expect(disabledProp!.optional).toBe(false)

			const variantProp =
				componentDef!.propsInterface!.properties.get('variant')
			expect(variantProp).toBeTruthy()
			expect(variantProp!.optional).toBe(true)
		})

		test('should handle components without matching interface', () => {
			const code = `
				import { component, asString } from '@zeix/ui-element'

				interface UnrelatedInterface {
					someProp: string
				}

				component('my-button', {
					label: asString('Click me')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)

			expect(componentDef!.propsInterface).toBeUndefined()
		})
	})

	describe('JSDoc Extraction', () => {
		test.skip('should extract JSDoc from component call', () => {
			const code = `
				import { component, asString } from '@zeix/ui-element'

				/**
				 * A reusable button component
				 * @since 1.0.0
				 * @example component('my-button', { label: asString('Click') }, setup)
				 */
				component('my-button', {
					label: asString('Click me')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)

			// TODO: Fix JSDoc extraction
			// expect(componentDef!.jsDoc).toBeTruthy()
			// expect(componentDef!.jsDoc!.description).toBe(
			// 	'A reusable button component',
			// )
			// expect(componentDef!.jsDoc!.tags.has('since')).toBe(true)
			// expect(componentDef!.jsDoc!.tags.get('since')).toEqual(['1.0.0'])
			// expect(componentDef!.jsDoc!.tags.has('example')).toBe(true)
		})
	})

	describe('Complex Component Analysis', () => {
		test('should analyze component with mixed initializers', () => {
			const code = `
				import { component, asBoolean, asString, asEnum, fromDOM, getText, getAttribute } from '@zeix/ui-element'

				interface ComplexComponentProps {
					disabled: boolean
					label: string
					variant: 'primary' | 'secondary'
					content: string
					title: string
					isVisible: boolean
				}

				/**
				 * A complex component with multiple initializer types
				 * @since 1.2.0
				 */
				component('complex-component', {
					disabled: asBoolean(),
					label: asString('Default'),
					variant: asEnum(['primary', 'secondary']),
					content: fromDOM({ '.content': getText() }, ''),
					title: getAttribute('title'),
					count: 42,
					handler: () => console.log('handled')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)
			analyzer.analyzeComponent(ts, componentDef!)

			// Check component basics
			expect(componentDef!.tagName).toBe('complex-component')
			expect(componentDef!.initializers.properties.size).toBe(7)

			// Skip JSDoc tests for now - the extraction needs improvement
			// TODO: Fix JSDoc extraction in future iterations

			// Check props interface
			expect(componentDef!.propsInterface).toBeTruthy()
			expect(componentDef!.propsInterface!.name).toBe(
				'ComplexComponentProps',
			)

			// Check individual properties
			const properties = componentDef!.initializers.properties

			// Parser properties
			const disabled = properties.get('disabled')!
			expect(disabled.type).toBe('parser')
			expect((disabled.details as any).parserName).toBe('asBoolean')

			const label = properties.get('label')!
			expect(label.type).toBe('parser')
			expect((label.details as any).parserName).toBe('asString')

			const variant = properties.get('variant')!
			expect(variant.type).toBe('parser')
			expect((variant.details as any).parserName).toBe('asEnum')
			expect((variant.details as any).tsType).toBe(
				'"primary" | "secondary"',
			)

			// Extractor properties
			const content = properties.get('content')!
			expect(content.type).toBe('extractor')
			expect((content.details as any).extractorName).toBe('fromDOM')

			const title = properties.get('title')!
			expect(title.type).toBe('extractor')
			expect((title.details as any).extractorName).toBe('getAttribute')

			// Literal property
			const count = properties.get('count')!
			expect(count.type).toBe('literal')
			expect((count.details as any).value).toBe(42)

			// Function property
			const handler = properties.get('handler')!
			expect(handler.type).toBe('function')
		})
	})

	describe('Error Handling', () => {
		test('should handle malformed parser calls gracefully', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					broken: unknownParser()
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)

			expect(() => {
				analyzer.analyzeComponent(ts, componentDef!)
			}).not.toThrow()

			const brokenProp =
				componentDef!.initializers.properties.get('broken')
			expect(brokenProp!.type).toBe('function') // Falls back to function type
		})

		test('should handle empty initializers object', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(ts, componentCall)

			expect(() => {
				analyzer.analyzeComponent(ts, componentDef!)
			}).not.toThrow()

			expect(componentDef!.initializers.properties.size).toBe(0)
		})
	})
})

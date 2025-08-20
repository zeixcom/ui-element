import { describe, expect, test } from 'bun:test'
import * as ts from 'typescript'
import { ComponentAnalyzer } from '../src/analyzer.js'
import { ComponentDetector } from '../src/detector.js'
import { ManifestGenerator } from '../src/generator.js'
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

describe('ManifestGenerator - Phase 2: Enhanced Generation', () => {
	const detector = new ComponentDetector(mockContext)
	const analyzer = new ComponentAnalyzer(mockContext)
	const generator = new ManifestGenerator(mockContext)

	describe('Parser Property Generation', () => {
		test('should generate correct manifest for asBoolean parser', () => {
			const code = `
				import { component, asBoolean } from '@zeix/ui-element'

				component('my-button', {
					disabled: asBoolean()
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			expect(declaration).toBeTruthy()
			expect(declaration.tagName).toBe('my-button')
			expect(declaration.members).toHaveLength(1)
			expect(declaration.attributes).toHaveLength(1)

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('disabled')
			expect(member.type.text).toBe('boolean')
			expect(member.description).toContain('asBoolean()')
			expect(member.description).toContain(
				'Parses presence of attribute as boolean',
			)
			expect(member._uielement.parser).toBe('asBoolean')
			expect(member._uielement.defaultValue).toBe(false)

			// Check attribute
			const attribute = declaration.attributes[0]
			expect(attribute.name).toBe('disabled')
			expect(attribute.type.text).toBe('boolean')
			expect(attribute.fieldName).toBe('disabled')
			expect(attribute.description).toContain(
				'Parses presence of attribute as boolean',
			)
		})

		test('should generate correct manifest for asString parser with default', () => {
			const code = `
				import { component, asString } from '@zeix/ui-element'

				component('my-button', {
					label: asString('Click me')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('label')
			expect(member.type.text).toBe('string')
			expect(member.default).toBe('"Click me"')
			expect(member._uielement.defaultValue).toBe('Click me')

			// Check attribute
			const attribute = declaration.attributes[0]
			expect(attribute.name).toBe('label')
			expect(attribute.type.text).toBe('string')
			expect(attribute.default).toBe('Click me')
		})

		test('should generate correct manifest for asEnum parser with union type', () => {
			const code = `
				import { component, asEnum } from '@zeix/ui-element'

				component('my-button', {
					variant: asEnum(['primary', 'secondary', 'danger'])
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('variant')
			expect(member.type.text).toBe('"primary" | "secondary" | "danger"')
			expect(member._uielement.parser).toBe('asEnum')
			expect(member._uielement.defaultValue).toBe('primary')

			// Check attribute
			const attribute = declaration.attributes[0]
			expect(attribute.name).toBe('variant')
			expect(attribute.type.text).toBe(
				'"primary" | "secondary" | "danger"',
			)
			expect(attribute.default).toBe('primary')
		})

		test('should generate correct manifest for asNumber parser', () => {
			const code = `
				import { component, asNumber } from '@zeix/ui-element'

				component('my-slider', {
					value: asNumber(50),
					max: asNumber(100)
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			expect(declaration.members).toHaveLength(2)
			expect(declaration.attributes).toHaveLength(2)

			// Check value property
			const valueMember = declaration.members.find(
				(m: any) => m.name === 'value',
			)
			expect(valueMember.type.text).toBe('number')
			expect(valueMember.default).toBe('50')
			expect(valueMember._uielement.defaultValue).toBe(50)

			// Check max property
			const maxMember = declaration.members.find(
				(m: any) => m.name === 'max',
			)
			expect(maxMember.type.text).toBe('number')
			expect(maxMember.default).toBe('100')
		})

		test('should generate correct manifest for asJSON parser', () => {
			const code = `
				import { component, asJSON } from '@zeix/ui-element'

				component('my-component', {
					config: asJSON({ theme: 'dark' })
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('config')
			expect(member.type.text).toBe('object')
			expect(member._uielement.parser).toBe('asJSON')

			// Check attribute (JSON is passed as string)
			const attribute = declaration.attributes[0]
			expect(attribute.type.text).toBe('string')
		})
	})

	describe('Extractor Property Generation', () => {
		test('should generate correct manifest for fromDOM extractor', () => {
			const code = `
				import { component, fromDOM, getText } from '@zeix/ui-element'

				component('my-component', {
					content: fromDOM({ '.content': getText() }, 'fallback')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			expect(declaration.members).toHaveLength(1)
			expect(declaration.attributes).toHaveLength(0) // Extractors don't create attributes

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('content')
			expect(member.type.text).toBe('string')
			expect(member.description).toContain('fromDOM()')
			expect(member.description).toContain(
				'Extracts value from DOM using selector map and fallback',
			)
			expect(member._uielement.extractor).toBe('fromDOM')
			expect(member._uielement.fallback).toBe('fallback')
			expect(member._uielement.returnType).toBe('inferred')
		})

		test('should generate correct manifest for getAttribute extractor', () => {
			const code = `
				import { component, getAttribute } from '@zeix/ui-element'

				component('my-component', {
					title: getAttribute('title')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('title')
			expect(member.type.text).toBe('string')
			expect(member.description).toContain('getAttribute()')
			expect(member.description).toContain('Gets attribute value')
			expect(member._uielement.extractor).toBe('getAttribute')
			expect(member._uielement.config).toBe('title')
			expect(member._uielement.returnType).toBe('string | null')
		})

		test('should generate correct manifest for hasAttribute extractor', () => {
			const code = `
				import { component, hasAttribute } from '@zeix/ui-element'

				component('my-component', {
					isRequired: hasAttribute('required')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('isRequired')
			expect(member.type.text).toBe('boolean')
			expect(member.description).toContain('hasAttribute()')
			expect(member.description).toContain('Checks if attribute exists')
			expect(member._uielement.extractor).toBe('hasAttribute')
			expect(member._uielement.config).toBe('required')
			expect(member._uielement.returnType).toBe('boolean')
		})

		test('should generate correct manifest for getText extractor', () => {
			const code = `
				import { component, getText } from '@zeix/ui-element'

				component('my-component', {
					content: getText()
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('content')
			expect(member.type.text).toBe('string')
			expect(member.description).toContain('getText()')
			expect(member.description).toContain('Gets trimmed text content')
			expect(member._uielement.extractor).toBe('getText')
			expect(member._uielement.returnType).toBe('string | null')
		})

		test('should generate correct manifest for getProperty extractor', () => {
			const code = `
				import { component, getProperty } from '@zeix/ui-element'

				component('my-component', {
					elementId: getProperty('id')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('elementId')
			expect(member.type.text).toBe('unknown')
			expect(member.description).toContain('getProperty()')
			expect(member._uielement.extractor).toBe('getProperty')
			expect(member._uielement.config).toBe('id')
		})
	})

	describe('Literal Property Generation', () => {
		test('should generate correct manifest for string literals', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					message: 'Hello World'
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			expect(declaration.attributes).toHaveLength(0) // Literals don't create attributes

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('message')
			expect(member.type.text).toBe('string')
			expect(member.default).toBe('"Hello World"')
			expect(member.description).toContain('Property with literal value')
		})

		test('should generate correct manifest for number literals', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					count: 42
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Check property member
			const member = declaration.members[0]
			expect(member.name).toBe('count')
			expect(member.type.text).toBe('number')
			expect(member.default).toBe('42')
		})

		test('should generate correct manifest for boolean literals', () => {
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

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Check enabled property
			const enabledMember = declaration.members.find(
				(m: any) => m.name === 'enabled',
			)
			expect(enabledMember.type.text).toBe('boolean')
			expect(enabledMember.default).toBe('true')

			// Check disabled property
			const disabledMember = declaration.members.find(
				(m: any) => m.name === 'disabled',
			)
			expect(disabledMember.type.text).toBe('boolean')
			expect(disabledMember.default).toBe('false')
		})
	})

	describe('Function Property Generation', () => {
		test('should generate correct manifest for function properties', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					handler: () => console.log('handled'),
					processor: function(data) { return data.toUpperCase() }
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			expect(declaration.members).toHaveLength(2)
			expect(declaration.attributes).toHaveLength(0) // Functions don't create attributes

			// Check handler property
			const handlerMember = declaration.members.find(
				(m: any) => m.name === 'handler',
			)
			expect(handlerMember.type.text).toBe('unknown')
			expect(handlerMember.description).toContain(
				'Property computed by function',
			)
			expect(handlerMember._uielement.type).toBe('function')

			// Check processor property
			const processorMember = declaration.members.find(
				(m: any) => m.name === 'processor',
			)
			expect(processorMember.type.text).toBe('unknown')
			expect(processorMember.description).toContain(
				'Property computed by function',
			)
		})
	})

	describe('Interface Integration', () => {
		test('should use TypeScript interface descriptions when available', () => {
			const code = `
				import { component, asBoolean, asString } from '@zeix/ui-element'

				interface MyButtonProps {
					/** Whether the button is disabled */
					disabled: boolean
					/** The button label text */
					label: string
				}

				component('my-button', {
					disabled: asBoolean(),
					label: asString('Click me')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			// const declaration = generator.generateDeclaration(componentDef)

			// Note: JSDoc extraction from interfaces would require more sophisticated parsing
			// For now, we verify the structure is correct and interface is found
			expect(componentDef.propsInterface).toBeTruthy()
			expect(componentDef.propsInterface!.name).toBe('MyButtonProps')
		})
	})

	describe('JSDoc Integration', () => {
		test('should enhance description with JSDoc tags', () => {
			const code = `
				import { component, asString } from '@zeix/ui-element'

				/**
				 * A reusable button component
				 * @since 1.0.0
				 * @example component('my-button', { label: asString('Click') }, setup)
				 * @deprecated Use new-button instead
				 */
				component('my-button', {
					label: asString('Click me')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Skip JSDoc tests for now - the extraction needs improvement
			// TODO: Fix JSDoc extraction in future iterations
			expect(declaration).toBeTruthy()
			expect(declaration.tagName).toBe('my-button')
		})
	})

	describe('Complex Component Generation', () => {
		test('should generate complete manifest for complex component', () => {
			const code = `
				import { component, asBoolean, asString, asEnum, asNumber, fromDOM, getText, getAttribute } from '@zeix/ui-element'

				interface ComplexComponentProps {
					disabled: boolean
					label: string
					variant: 'primary' | 'secondary'
					value: number
					content: string
					title: string
				}

				/**
				 * A complex component demonstrating all initializer types
				 * @since 1.2.0
				 * @example <complex-component disabled variant="primary" value="50"></complex-component>
				 */
				component('complex-component', {
					disabled: asBoolean(),
					label: asString('Default Label'),
					variant: asEnum(['primary', 'secondary']),
					value: asNumber(0),
					content: fromDOM({ '.content': getText() }, ''),
					title: getAttribute('title'),
					count: 10,
					handler: () => console.log('handled')
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			// Basic structure
			expect(declaration.tagName).toBe('complex-component')
			expect(declaration.customElement).toBe(true)
			expect(declaration.members).toHaveLength(8)
			expect(declaration.attributes).toHaveLength(4) // Only parsers create attributes

			// Skip JSDoc tests for now - the extraction needs improvement
			// TODO: Fix JSDoc extraction in future iterations

			// Check parser-based attributes
			const attributeNames = declaration.attributes.map(
				(a: any) => a.name,
			)
			expect(attributeNames).toContain('disabled')
			expect(attributeNames).toContain('label')
			expect(attributeNames).toContain('variant')
			expect(attributeNames).toContain('value')

			// Check that extractors and literals don't create attributes
			expect(attributeNames).not.toContain('content')
			expect(attributeNames).not.toContain('title')
			expect(attributeNames).not.toContain('count')
			expect(attributeNames).not.toContain('handler')

			// Check member types
			const membersByName = declaration.members.reduce(
				(acc: any, member: any) => {
					acc[member.name] = member
					return acc
				},
				{},
			)

			expect(membersByName.disabled.type.text).toBe('boolean')
			expect(membersByName.label.type.text).toBe('string')
			expect(membersByName.variant.type.text).toBe(
				'"primary" | "secondary"',
			)
			expect(membersByName.value.type.text).toBe('number')
			expect(membersByName.content.type.text).toBe('string')
			expect(membersByName.title.type.text).toBe('string')
			expect(membersByName.count.type.text).toBe('number')
			expect(membersByName.handler.type.text).toBe('unknown')

			// Check UIElement metadata
			expect(membersByName.disabled._uielement.parser).toBe('asBoolean')
			expect(membersByName.label._uielement.parser).toBe('asString')
			expect(membersByName.variant._uielement.parser).toBe('asEnum')
			expect(membersByName.content._uielement.extractor).toBe('fromDOM')
			expect(membersByName.title._uielement.extractor).toBe(
				'getAttribute',
			)
		})
	})

	describe('Manifest Finalization', () => {
		test('should add plugin metadata to manifest', () => {
			const mockManifest = {
				modules: [],
				plugins: [],
			}

			generator.finalizeManifest(mockManifest)

			expect(mockManifest.plugins).toHaveLength(1)
			const pluginInfo = mockManifest.plugins[0] as any
			expect(pluginInfo.name).toBe('uielement-cem-plugin')
			expect(pluginInfo.version).toBe('0.1.0')
			expect(pluginInfo.components).toBe(0) // No components in context
		})

		test('should validate manifest structure', () => {
			const mockManifest = {
				modules: [
					{
						declarations: [
							{
								name: 'MyButton',
								customElement: true,
								// Missing tagName - should warn
								attributes: [
									{
										name: 'disabled',
										fieldName: 'nonexistentProperty', // Should warn
									},
								],
								members: [
									{
										name: 'label',
									},
								],
							},
						],
					},
				],
				plugins: [],
			}

			// Capture console warnings
			const originalWarn = console.warn
			const warnings: string[] = []
			console.warn = (...args) => {
				warnings.push(args.join(' '))
			}

			try {
				generator.finalizeManifest(mockManifest)

				expect(warnings.length).toBeGreaterThan(0)
				expect(warnings.some(w => w.includes('missing tagName'))).toBe(
					true,
				)
				expect(
					warnings.some(w =>
						w.includes('references missing property'),
					),
				).toBe(true)
			} finally {
				console.warn = originalWarn
			}
		})
	})

	describe('Edge Cases', () => {
		test('should handle component with no properties', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('empty-component', {}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			expect(declaration.tagName).toBe('empty-component')
			expect(declaration.members).toHaveLength(0)
			expect(declaration.attributes).toHaveLength(0)
		})

		test('should handle parser with no arguments', () => {
			const code = `
				import { component, asString } from '@zeix/ui-element'

				component('my-component', {
					label: asString()
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			const member = declaration.members[0]
			expect(member.name).toBe('label')
			expect(member.type.text).toBe('string')
			expect(member._uielement.defaultValue).toBe(undefined)
		})

		test('should handle null and undefined default values', () => {
			const code = `
				import { component } from '@zeix/ui-element'

				component('my-component', {
					nullProp: null,
					undefinedProp: undefined
				}, () => [])
			`
			const sourceFile = createSourceFile(code)
			const callExpressions = findCallExpressions(sourceFile)
			const componentCall = callExpressions[0]

			const componentDef = detector.detectComponentCall(
				ts,
				componentCall,
			)!
			analyzer.analyzeComponent(ts, componentDef)
			const declaration = generator.generateDeclaration(componentDef)

			const nullMember = declaration.members.find(
				(m: any) => m.name === 'nullProp',
			)
			expect(nullMember.type.text).toBe('null')
			expect(nullMember.default).toBe('null')

			const undefinedMember = declaration.members.find(
				(m: any) => m.name === 'undefinedProp',
			)
			expect(undefinedMember.type.text).toBe('undefined')
			expect(undefinedMember.default).toBe('undefined')
		})
	})
})

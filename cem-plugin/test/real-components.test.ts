import { describe, expect, test } from 'bun:test'
// import { ComponentAnalyzer } from '../src/analyzer.js'
// import { ComponentDetector } from '../src/detector.js'
import { ManifestGenerator } from '../src/generator.js'
import type { ComponentDefinition, PluginContext } from '../src/types.js'
import { DEFAULT_CONFIG } from '../src/types.js'

/**
 * Test the CEM plugin with real UIElement component patterns
 */
describe('Real Component Analysis', () => {
	const createMockContext = (): PluginContext => ({
		components: new Map(),
		config: DEFAULT_CONFIG,
	})

	/**
	 * Create a mock component definition for testing
	 */
	function createMockComponent(
		tagName: string,
		initializers: any,
	): ComponentDefinition {
		return {
			tagName,
			sourceFile: {} as any,
			callExpression: {} as any,
			setupFunction: undefined,
			initializers,
			propsInterface: undefined,
			jsDoc: undefined,
		}
	}

	describe('Hello World Component Pattern', () => {
		test('should generate manifest for hello-world pattern', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			// Simulate hello-world component structure
			const component = createMockComponent('hello-world', {
				properties: new Map([
					[
						'name',
						{
							type: 'parser',
							details: {
								parserName: 'asString',
								arguments: [
									'el => el.querySelector("span")?.textContent?.trim() ?? ""',
								],
								tsType: 'string',
								defaultValue: '',
							},
						},
					],
				]),
			})

			const declaration = generator.generateDeclaration(component)

			expect(declaration).toBeDefined()
			expect(declaration.tagName).toBe('hello-world')
			expect(declaration.name).toBe('HelloWorld')
			expect(declaration.customElement).toBe(true)

			// Check property generation
			expect(declaration.members).toHaveLength(1)
			const nameProp = declaration.members[0]
			expect(nameProp.name).toBe('name')
			expect(nameProp.type.text).toBe('string')
			expect(nameProp.description).toContain('asString')

			// Check attribute generation
			expect(declaration.attributes).toHaveLength(1)
			const nameAttr = declaration.attributes[0]
			expect(nameAttr.name).toBe('name')
			expect(nameAttr.type.text).toBe('string')
			expect(nameAttr.fieldName).toBe('name')
		})
	})

	describe('Basic Button Component Pattern', () => {
		test('should generate manifest for basic-button pattern', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			// Simulate basic-button component structure
			const component = createMockComponent('basic-button', {
				properties: new Map([
					[
						'disabled',
						{
							type: 'parser',
							details: {
								parserName: 'asBoolean',
								arguments: [],
								tsType: 'boolean',
								defaultValue: false,
							},
						},
					],
					[
						'label',
						{
							type: 'parser',
							details: {
								parserName: 'asString',
								arguments: ['getLabel("button")'],
								tsType: 'string',
								defaultValue: '',
							},
						},
					],
					[
						'badge',
						{
							type: 'parser',
							details: {
								parserName: 'asString',
								arguments: [
									'fromDOM({ ".badge": getText() }, "")',
								],
								tsType: 'string',
								defaultValue: '',
							},
						},
					],
				]),
			})

			const declaration = generator.generateDeclaration(component)

			expect(declaration).toBeDefined()
			expect(declaration.tagName).toBe('basic-button')
			expect(declaration.name).toBe('BasicButton')

			// Should have three properties
			expect(declaration.members).toHaveLength(3)

			const disabledProp = declaration.members.find(
				m => m.name === 'disabled',
			)
			expect(disabledProp).toBeDefined()
			expect(disabledProp.type.text).toBe('boolean')

			const labelProp = declaration.members.find(m => m.name === 'label')
			expect(labelProp).toBeDefined()
			expect(labelProp.type.text).toBe('string')

			const badgeProp = declaration.members.find(m => m.name === 'badge')
			expect(badgeProp).toBeDefined()
			expect(badgeProp.type.text).toBe('string')

			// All should have attributes since they use parsers
			expect(declaration.attributes).toHaveLength(3)

			const disabledAttr = declaration.attributes.find(
				a => a.name === 'disabled',
			)
			expect(disabledAttr).toBeDefined()
			expect(disabledAttr.type.text).toBe('boolean')
		})
	})

	describe('Basic Counter Component Pattern', () => {
		test('should generate manifest for basic-counter pattern', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			// Simulate basic-counter component structure
			const component = createMockComponent('basic-counter', {
				properties: new Map([
					[
						'count',
						{
							type: 'extractor',
							details: {
								extractorName: 'fromEvents',
								config: {
									selector: 'button',
									events: { click: '({ value }) => ++value' },
								},
								fallback:
									'fromDOM({ span: getText() }, asInteger())',
								tsType: 'number',
							},
						},
					],
				]),
			})

			const declaration = generator.generateDeclaration(component)

			expect(declaration).toBeDefined()
			expect(declaration.tagName).toBe('basic-counter')
			expect(declaration.name).toBe('BasicCounter')

			// Should have one property
			expect(declaration.members).toHaveLength(1)

			const countProp = declaration.members[0]
			expect(countProp.name).toBe('count')
			expect(countProp.type.text).toBe('number')
			expect(countProp.description).toContain('fromEvents')

			// Extractors don't create HTML attributes
			expect(declaration.attributes).toHaveLength(0)
		})
	})

	describe('Form Textbox Component Pattern', () => {
		test('should generate manifest for form-textbox pattern', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			// Simulate form-textbox component structure with mixed property types
			const component = createMockComponent('form-textbox', {
				properties: new Map([
					[
						'value',
						{
							type: 'literal',
							details: {
								value: '',
								tsType: 'string',
							},
						},
					],
					[
						'length',
						{
							type: 'literal',
							details: {
								value: 0,
								tsType: 'number',
							},
						},
					],
					[
						'error',
						{
							type: 'literal',
							details: {
								value: '',
								tsType: 'string',
							},
						},
					],
					[
						'clear',
						{
							type: 'function',
							details: {
								functionExpression:
									'clearMethod<HTMLInputElement | HTMLTextAreaElement>("input, textarea")',
								returnType: '() => void',
							},
						},
					],
				]),
			})

			const declaration = generator.generateDeclaration(component)

			expect(declaration).toBeDefined()
			expect(declaration.tagName).toBe('form-textbox')
			expect(declaration.name).toBe('FormTextbox')

			// Should have four properties
			expect(declaration.members).toHaveLength(4)

			const valueProp = declaration.members.find(m => m.name === 'value')
			expect(valueProp).toBeDefined()
			expect(valueProp.type.text).toBe('string')
			expect(valueProp.default).toBe('""')

			const lengthProp = declaration.members.find(
				m => m.name === 'length',
			)
			expect(lengthProp).toBeDefined()
			expect(lengthProp.type.text).toBe('number')
			expect(lengthProp.default).toBe('0')

			const clearProp = declaration.members.find(m => m.name === 'clear')
			expect(clearProp).toBeDefined()
			expect(clearProp.type.text).toBe('() => void')

			// Literals and functions don't create HTML attributes
			expect(declaration.attributes).toHaveLength(0)
		})
	})

	describe('Property Type Detection', () => {
		test('should correctly handle parser properties', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			const component = createMockComponent('test-component', {
				properties: new Map([
					[
						'stringProp',
						{
							type: 'parser',
							details: {
								parserName: 'asString',
								arguments: ['defaultValue'],
								tsType: 'string',
								defaultValue: 'test',
							},
						},
					],
					[
						'booleanProp',
						{
							type: 'parser',
							details: {
								parserName: 'asBoolean',
								arguments: [],
								tsType: 'boolean',
								defaultValue: false,
							},
						},
					],
					[
						'numberProp',
						{
							type: 'parser',
							details: {
								parserName: 'asNumber',
								arguments: ['42'],
								tsType: 'number',
								defaultValue: 42,
							},
						},
					],
				]),
			})

			const declaration = generator.generateDeclaration(component)

			// Check property types
			const stringProp = declaration.members.find(
				m => m.name === 'stringProp',
			)
			expect(stringProp.type.text).toBe('string')
			expect(stringProp.default).toBe('"test"')

			const booleanProp = declaration.members.find(
				m => m.name === 'booleanProp',
			)
			expect(booleanProp.type.text).toBe('boolean')
			expect(booleanProp.default).toBe('false')

			const numberProp = declaration.members.find(
				m => m.name === 'numberProp',
			)
			expect(numberProp.type.text).toBe('number')
			expect(numberProp.default).toBe('42')

			// Check attribute generation for parsers
			expect(declaration.attributes).toHaveLength(3)

			const stringAttr = declaration.attributes.find(
				a => a.name === 'stringProp',
			)
			expect(stringAttr.type.text).toBe('string')
			expect(stringAttr.default).toBe('test')

			const booleanAttr = declaration.attributes.find(
				a => a.name === 'booleanProp',
			)
			expect(booleanAttr.type.text).toBe('boolean')
			expect(booleanAttr.default).toBeUndefined() // Boolean attributes are present/absent

			const numberAttr = declaration.attributes.find(
				a => a.name === 'numberProp',
			)
			expect(numberAttr.type.text).toBe('number')
			expect(numberAttr.default).toBe('42')
		})

		test('should correctly handle extractor properties', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			const component = createMockComponent('test-component', {
				properties: new Map([
					[
						'domProp',
						{
							type: 'extractor',
							details: {
								extractorName: 'fromDOM',
								config: {
									selector: '.test',
									extractor: 'getText()',
								},
								fallback: 'default',
								tsType: 'string',
							},
						},
					],
					[
						'eventProp',
						{
							type: 'extractor',
							details: {
								extractorName: 'fromEvents',
								config: {
									selector: 'button',
									events: { click: 'handler' },
								},
								fallback: undefined,
								tsType: 'number',
							},
						},
					],
				]),
			})

			const declaration = generator.generateDeclaration(component)

			// Check property types
			const domProp = declaration.members.find(m => m.name === 'domProp')
			expect(domProp.type.text).toBe('string')
			expect(domProp.description).toContain('fromDOM')

			const eventProp = declaration.members.find(
				m => m.name === 'eventProp',
			)
			expect(eventProp.type.text).toBe('number')
			expect(eventProp.description).toContain('fromEvents')

			// Extractors don't create attributes
			expect(declaration.attributes).toHaveLength(0)
		})
	})

	describe('UIElement Metadata', () => {
		test('should include UIElement-specific metadata', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			const component = createMockComponent('test-component', {
				properties: new Map([
					[
						'parsedProp',
						{
							type: 'parser',
							details: {
								parserName: 'asString',
								arguments: ['default'],
								tsType: 'string',
								defaultValue: 'test',
							},
						},
					],
					[
						'extractedProp',
						{
							type: 'extractor',
							details: {
								extractorName: 'fromDOM',
								config: { selector: '.test' },
								fallback: 'fallback',
								tsType: 'string',
							},
						},
					],
				]),
			})

			const declaration = generator.generateDeclaration(component)

			// Check UIElement metadata
			const parsedProp = declaration.members.find(
				m => m.name === 'parsedProp',
			)
			expect(parsedProp._uielement).toBeDefined()
			expect(parsedProp._uielement.parser).toBe('asString')
			expect(parsedProp._uielement.arguments).toEqual(['default'])
			expect(parsedProp._uielement.defaultValue).toBe('test')

			const extractedProp = declaration.members.find(
				m => m.name === 'extractedProp',
			)
			expect(extractedProp._uielement).toBeDefined()
			expect(extractedProp._uielement.extractor).toBe('fromDOM')
			expect(extractedProp._uielement.config).toEqual({
				selector: '.test',
			})
			expect(extractedProp._uielement.fallback).toBe('fallback')
		})
	})

	describe('Manifest Finalization', () => {
		test('should add plugin metadata to manifest', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			const manifest: any = {
				modules: [],
			}

			generator.finalizeManifest(manifest)

			expect(manifest.plugins).toBeDefined()
			expect(manifest.plugins).toHaveLength(1)
			expect(manifest.plugins[0].name).toBe('uielement-cem-plugin')
			expect(manifest.plugins[0].version).toBe('0.1.0')
		})

		test('should validate manifest structure', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			// Create a manifest with potential issues
			const manifest: any = {
				modules: [
					{
						declarations: [
							{
								name: 'TestComponent',
								customElement: true,
								tagName: 'test-component',
								members: [
									{
										name: 'testProp',
										type: { text: 'string' },
									},
								],
								attributes: [
									{
										name: 'test-prop',
										fieldName: 'testProp',
										type: { text: 'string' },
									},
								],
							},
						],
					},
				],
			}

			// Should not throw
			expect(() => generator.finalizeManifest(manifest)).not.toThrow()
		})
	})

	describe('Edge Cases', () => {
		test('should handle component with no properties', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			const component = createMockComponent('empty-component', {
				properties: new Map(),
			})

			const declaration = generator.generateDeclaration(component)

			expect(declaration).toBeDefined()
			expect(declaration.members).toHaveLength(0)
			expect(declaration.attributes).toHaveLength(0)
		})

		test('should handle invalid property types gracefully', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			const component = createMockComponent('test-component', {
				properties: new Map([
					[
						'invalidProp',
						{
							type: 'unknown',
							details: {},
						},
					],
				]),
			})

			const declaration = generator.generateDeclaration(component)

			expect(declaration).toBeDefined()
			expect(declaration.members).toHaveLength(1)
			expect(declaration.members[0].type.text).toBe('unknown')
		})

		test('should handle null and undefined default values', () => {
			const context = createMockContext()
			const generator = new ManifestGenerator(context)

			const component = createMockComponent('test-component', {
				properties: new Map([
					[
						'nullProp',
						{
							type: 'literal',
							details: {
								value: null,
								tsType: 'null',
							},
						},
					],
					[
						'undefinedProp',
						{
							type: 'literal',
							details: {
								value: undefined,
								tsType: 'undefined',
							},
						},
					],
				]),
			})

			const declaration = generator.generateDeclaration(component)

			const nullProp = declaration.members.find(
				m => m.name === 'nullProp',
			)
			expect(nullProp.default).toBe('null')

			const undefinedProp = declaration.members.find(
				m => m.name === 'undefinedProp',
			)
			expect(undefinedProp.default).toBe('undefined')
		})
	})
})

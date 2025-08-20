import type { CallExpression, Node, PropertyAssignment } from 'typescript'
import type {
	ComponentDefinition,
	ComponentPropsInterface,
	ExtractorDetails,
	InitializerDetails,
	InitializerType,
	InterfaceProperty,
	JSDocInfo,
	ParserDetails,
	PluginContext,
	PropertyInitializer,
} from './types.js'
import { EXTRACTOR_FUNCTIONS, PARSER_TYPE_MAP } from './types.js'

/**
 * Analyzes UIElement component definitions for detailed information extraction
 */
export class ComponentAnalyzer {
	constructor(private context: PluginContext) {}

	/**
	 * Performs deep analysis of a component definition
	 *
	 * @param ts TypeScript compiler API
	 * @param component Component definition to analyze
	 */
	analyzeComponent(
		ts: typeof import('typescript'),
		component: ComponentDefinition,
	): void {
		try {
			// Analyze property initializers
			this.analyzeInitializers(ts, component)

			// Extract TypeScript interface information
			this.extractPropsInterface(ts, component)

			// Extract JSDoc comments
			this.extractJSDoc(ts, component)

			if (this.context.config.debug) {
				const propertyCount = component.initializers.properties.size
				console.log(
					`[ComponentAnalyzer] Analyzed ${component.tagName} with ${propertyCount} properties`,
				)
			}
		} catch (error) {
			if (this.context.config.debug) {
				console.error(
					`[ComponentAnalyzer] Error analyzing component ${component.tagName}:`,
					error,
				)
			}
		}
	}

	/**
	 * Analyzes the initializers object to extract property information
	 */
	private analyzeInitializers(
		ts: typeof import('typescript'),
		component: ComponentDefinition,
	): void {
		const { objectLiteral } = component.initializers

		for (const property of objectLiteral.properties) {
			if (!ts.isPropertyAssignment(property)) {
				continue // Skip methods, getters, setters, etc.
			}

			if (!ts.isIdentifier(property.name)) {
				continue // Skip computed property names
			}

			const propertyName = property.name.text
			const propertyInitializer = this.analyzePropertyInitializer(
				ts,
				propertyName,
				property,
			)

			if (propertyInitializer) {
				component.initializers.properties.set(
					propertyName,
					propertyInitializer,
				)
			}
		}
	}

	/**
	 * Analyzes a single property initializer
	 */
	private analyzePropertyInitializer(
		ts: typeof import('typescript'),
		propertyName: string,
		property: PropertyAssignment,
	): PropertyInitializer | null {
		const initializerType = this.determineInitializerType(
			ts,
			property.initializer,
		)
		const details = this.analyzeInitializerDetails(
			ts,
			property.initializer,
			initializerType,
		)

		if (!details) {
			return null
		}

		return {
			name: propertyName,
			node: property,
			type: initializerType,
			details,
		}
	}

	/**
	 * Determines the type of initializer (parser, extractor, function, literal)
	 */
	private determineInitializerType(
		ts: typeof import('typescript'),
		initializer: Node,
	): InitializerType {
		// Check if it's a function call
		if (ts.isCallExpression(initializer)) {
			const functionName = this.getFunctionName(ts, initializer)

			if (functionName && functionName in PARSER_TYPE_MAP) {
				return 'parser'
			}

			if (
				functionName &&
				EXTRACTOR_FUNCTIONS.includes(functionName as any)
			) {
				return 'extractor'
			}

			return 'function'
		}

		// Check if it's a function expression or arrow function
		if (
			ts.isFunctionExpression(initializer) ||
			ts.isArrowFunction(initializer)
		) {
			return 'function'
		}

		// Check if it's a literal value
		if (this.isLiteralValue(ts, initializer)) {
			return 'literal'
		}

		return 'unknown'
	}

	/**
	 * Analyzes the details of an initializer based on its type
	 */
	private analyzeInitializerDetails(
		ts: typeof import('typescript'),
		initializer: Node,
		type: InitializerType,
	): InitializerDetails | null {
		switch (type) {
			case 'parser':
				return this.analyzeParserDetails(
					ts,
					initializer as CallExpression,
				)
			case 'extractor':
				return this.analyzeExtractorDetails(
					ts,
					initializer as CallExpression,
				)
			case 'function':
				return this.analyzeFunctionDetails(ts, initializer)
			case 'literal':
				return this.analyzeLiteralDetails(ts, initializer)
			case 'unknown':
				return { type: 'unknown', node: initializer }
			default:
				return null
		}
	}

	/**
	 * Analyzes parser function details (asBoolean, asString, etc.)
	 */
	private analyzeParserDetails(
		ts: typeof import('typescript'),
		callExpr: CallExpression,
	): ParserDetails | null {
		const functionName = this.getFunctionName(ts, callExpr)
		if (!functionName || !(functionName in PARSER_TYPE_MAP)) {
			return null
		}

		const parserName = functionName as keyof typeof PARSER_TYPE_MAP
		let tsType = PARSER_TYPE_MAP[parserName]
		const args = this.extractCallArguments(ts, callExpr)

		// Special handling for asEnum to create union type
		if (parserName === 'asEnum' && args.length > 0) {
			const enumValues = this.extractEnumValues(ts, callExpr)
			if (enumValues.length > 0) {
				tsType = enumValues.map(v => `"${v}"`).join(' | ') as any
			}
		}

		// Determine default value based on parser type
		let defaultValue: unknown
		if (parserName === 'asBoolean') {
			defaultValue = false // asBoolean() defaults to false when no attribute
		} else if (parserName === 'asEnum' && args.length > 0) {
			// For asEnum, default is the first valid option
			const enumValues = this.extractEnumValues(ts, callExpr)
			defaultValue = enumValues[0] || args[0]
		} else {
			defaultValue = args[0] // First argument is usually default value
		}

		return {
			type: 'parser',
			parserName,
			arguments: args,
			defaultValue,
			tsType,
		}
	}

	/**
	 * Analyzes extractor function details (fromDOM, fromContext, etc.)
	 */
	private analyzeExtractorDetails(
		ts: typeof import('typescript'),
		callExpr: CallExpression,
	): ExtractorDetails | null {
		const functionName = this.getFunctionName(ts, callExpr)
		if (
			!functionName ||
			!EXTRACTOR_FUNCTIONS.includes(functionName as any)
		) {
			return null
		}

		const args = this.extractCallArguments(ts, callExpr)
		const tsType = this.inferExtractorType(functionName, args)

		// Extract configuration and fallback based on extractor type
		let config: unknown
		let fallback: unknown

		if (functionName === 'fromDOM') {
			config = args[0] // Selector/extractor map
			fallback = args[1] // Fallback value
		} else if (
			[
				'getAttribute',
				'getProperty',
				'getText',
				'hasAttribute',
				'hasClass',
				'getStyle',
			].includes(functionName)
		) {
			config = args[0] // Attribute name, property name, etc.
			fallback = args[1] // Optional fallback
		} else {
			config = args[0] // First argument is usually configuration
			fallback = args[1] // Second argument is usually fallback value
		}

		return {
			type: 'extractor',
			extractorName: functionName,
			config,
			fallback,
			tsType,
		}
	}

	/**
	 * Analyzes function initializer details
	 */
	private analyzeFunctionDetails(
		_ts: typeof import('typescript'),
		functionNode: Node,
	): InitializerDetails {
		return {
			type: 'function',
			functionNode,
			returnType: 'unknown', // Would need type checker for proper inference
		}
	}

	/**
	 * Analyzes literal value details
	 */
	private analyzeLiteralDetails(
		ts: typeof import('typescript'),
		literal: Node,
	): InitializerDetails {
		let value: unknown = undefined
		let tsType = 'unknown'

		if (ts.isStringLiteral(literal)) {
			value = literal.text
			tsType = 'string'
		} else if (ts.isNumericLiteral(literal)) {
			value = Number(literal.text)
			tsType = 'number'
		} else if (literal.kind === ts.SyntaxKind.TrueKeyword) {
			value = true
			tsType = 'boolean'
		} else if (literal.kind === ts.SyntaxKind.FalseKeyword) {
			value = false
			tsType = 'boolean'
		} else if (literal.kind === ts.SyntaxKind.NullKeyword) {
			value = null
			tsType = 'null'
		} else if (ts.isIdentifier(literal) && literal.text === 'undefined') {
			value = undefined
			tsType = 'undefined'
		}

		return {
			type: 'literal',
			value,
			tsType,
		}
	}

	/**
	 * Extracts TypeScript props interface information
	 */
	private extractPropsInterface(
		ts: typeof import('typescript'),
		component: ComponentDefinition,
	): void {
		// Look for type parameters or nearby interface declarations
		// This is a simplified implementation - a full implementation would
		// use the TypeScript type checker to resolve type information

		const sourceFile = component.sourceFile
		const propsInterface = this.findPropsInterface(
			ts,
			sourceFile,
			component.tagName,
		)

		if (propsInterface) {
			component.propsInterface = propsInterface
		}
	}

	/**
	 * Finds the props interface for a component
	 */
	private findPropsInterface(
		ts: typeof import('typescript'),
		sourceFile: Node,
		tagName: string,
	): ComponentPropsInterface | undefined {
		// Convert tag-name to PascalCase + Props pattern
		const expectedInterfaceName = this.tagNameToInterfaceName(tagName)

		let foundInterface: ComponentPropsInterface | undefined

		function visit(node: Node) {
			if (ts.isInterfaceDeclaration(node)) {
				const interfaceName = node.name.text
				if (interfaceName === expectedInterfaceName) {
					foundInterface = {
						name: interfaceName,
						node,
						properties: new Map(),
					}

					// Extract interface properties
					for (const member of node.members) {
						if (
							ts.isPropertySignature(member) &&
							ts.isIdentifier(member.name)
						) {
							const propertyName = member.name.text
							const property: InterfaceProperty = {
								name: propertyName,
								type: member.type ? 'unknown' : 'any', // Simplified type extraction
								optional: Boolean(member.questionToken),
							}
							foundInterface.properties.set(
								propertyName,
								property,
							)
						}
					}
					return
				}
			}
			ts.forEachChild(node, visit)
		}

		visit(sourceFile)
		return foundInterface
	}

	/**
	 * Converts tag name to expected interface name pattern
	 */
	private tagNameToInterfaceName(tagName: string): string {
		// Convert kebab-case to PascalCase and add Props suffix
		return (
			tagName
				.split('-')
				.map(part => part.charAt(0).toUpperCase() + part.slice(1))
				.join('') + 'Props'
		)
	}

	/**
	 * Extracts JSDoc comments from component
	 */
	private extractJSDoc(
		ts: typeof import('typescript'),
		component: ComponentDefinition,
	): void {
		// Extract JSDoc from the component call expression
		const jsDoc = this.extractJSDocFromNode(ts, component.callExpression)
		if (jsDoc) {
			component.jsDoc = jsDoc
		}
	}

	/**
	 * Extracts JSDoc information from a node
	 */
	private extractJSDocFromNode(
		ts: typeof import('typescript'),
		node: Node,
	): JSDocInfo | undefined {
		// Try to get JSDoc from the node itself first
		const jsDocNodes = ts.getJSDocCommentsAndTags(node)

		// If no JSDoc found, try to find it by looking at the full text around the node
		if (!jsDocNodes.length) {
			const sourceFile = node.getSourceFile()
			const fullText = sourceFile.getFullText()
			const nodeStart = node.getFullStart()

			// Get text from start of file to node position
			const precedingText = fullText.substring(0, nodeStart)

			// Look for JSDoc comments that end right before this node (allowing for whitespace)
			const jsDocRegex = /\/\*\*[\s\S]*?\*\/(?:\s*\n\s*)*$/
			const jsDocMatch = precedingText.match(jsDocRegex)

			if (jsDocMatch) {
				// Parse the JSDoc manually if TypeScript didn't pick it up
				const jsDocText = jsDocMatch[0].replace(/(?:\s*\n\s*)*$/, '')
				return this.parseJSDocText(jsDocText)
			}

			return undefined
		}

		const jsDoc: JSDocInfo = {
			tags: new Map(),
		}

		for (const jsDocNode of jsDocNodes) {
			if (ts.isJSDoc(jsDocNode)) {
				// Extract main comment text
				if (jsDocNode.comment) {
					jsDoc.description =
						typeof jsDocNode.comment === 'string'
							? jsDocNode.comment
							: jsDocNode.comment
									.map(part => part.text || part.kind)
									.join('')
				}

				// Extract JSDoc tags
				if (jsDocNode.tags) {
					for (const tag of jsDocNode.tags) {
						const tagName = tag.tagName.text
						const tagComment = tag.comment || ''
						const tagText =
							typeof tagComment === 'string'
								? tagComment
								: Array.isArray(tagComment)
									? tagComment
											.map(part => part.text || '')
											.join('')
									: ''

						if (!jsDoc.tags.has(tagName)) {
							jsDoc.tags.set(tagName, [])
						}
						jsDoc.tags.get(tagName)!.push(tagText)
					}
				}
			}
		}

		return jsDoc
	}

	/**
	 * Gets the function name from a call expression
	 */
	private getFunctionName(
		ts: typeof import('typescript'),
		callExpr: CallExpression,
	): string | null {
		if (ts.isIdentifier(callExpr.expression)) {
			return callExpr.expression.text
		}

		if (ts.isPropertyAccessExpression(callExpr.expression)) {
			return callExpr.expression.name.text
		}

		return null
	}

	/**
	 * Extracts arguments from a call expression as simple values
	 */
	private extractCallArguments(
		ts: typeof import('typescript'),
		callExpr: CallExpression,
	): unknown[] {
		const args: unknown[] = []

		for (const arg of callExpr.arguments) {
			if (ts.isStringLiteral(arg)) {
				args.push(arg.text)
			} else if (ts.isNumericLiteral(arg)) {
				args.push(Number(arg.text))
			} else if (arg.kind === ts.SyntaxKind.TrueKeyword) {
				args.push(true)
			} else if (arg.kind === ts.SyntaxKind.FalseKeyword) {
				args.push(false)
			} else if (arg.kind === ts.SyntaxKind.NullKeyword) {
				args.push(null)
			} else if (arg.kind === ts.SyntaxKind.UndefinedKeyword) {
				args.push(undefined)
			} else {
				// For complex expressions, store a placeholder
				args.push('<complex-expression>')
			}
		}

		return args
	}

	/**
	 * Checks if a node represents a literal value
	 */
	private isLiteralValue(
		ts: typeof import('typescript'),
		node: Node,
	): boolean {
		return (
			ts.isStringLiteral(node) ||
			ts.isNumericLiteral(node) ||
			node.kind === ts.SyntaxKind.TrueKeyword ||
			node.kind === ts.SyntaxKind.FalseKeyword ||
			node.kind === ts.SyntaxKind.NullKeyword ||
			(ts.isIdentifier(node) && node.text === 'undefined')
		)
	}

	/**
	 * Extracts enum values from asEnum() call arguments
	 */
	private extractEnumValues(
		ts: typeof import('typescript'),
		callExpr: CallExpression,
	): string[] {
		if (callExpr.arguments.length === 0) return []

		const firstArg = callExpr.arguments[0]
		if (!firstArg) return []

		// Handle array literal: asEnum(['value1', 'value2', 'value3'])
		if (ts.isArrayLiteralExpression(firstArg)) {
			const values: string[] = []
			for (const element of firstArg.elements) {
				if (ts.isStringLiteral(element)) {
					values.push(element.text)
				}
			}
			return values
		}

		return []
	}

	/**
	 * Infers TypeScript type for extractor functions
	 */
	private inferExtractorType(functionName: string, args: unknown[]): string {
		switch (functionName) {
			case 'hasAttribute':
			case 'hasClass':
				return 'boolean'

			case 'getText':
			case 'getAttribute':
			case 'getStyle':
			case 'getLabel':
			case 'getDescription':
				return 'string'

			case 'getProperty':
				// Would need type checker to properly infer property type
				return 'unknown'

			case 'fromDOM':
				// Complex type inference would require analyzing the extractor map
				// For now, try to infer from fallback value type
				if (args.length > 1) {
					const fallback = args[1]
					if (typeof fallback === 'string') return 'string'
					if (typeof fallback === 'number') return 'number'
					if (typeof fallback === 'boolean') return 'boolean'
				}
				return 'unknown'

			default:
				return 'unknown'
		}
	}

	/**
	 * Manually parse JSDoc text when TypeScript doesn't detect it
	 */
	private parseJSDocText(jsDocText: string): JSDocInfo {
		const jsDoc: JSDocInfo = {
			tags: new Map(),
		}

		// Remove /** and */ and split into lines
		const content = jsDocText
			.replace(/^\/\*\*/, '')
			.replace(/\*\/$/, '')
			.split('\n')
			.map(line => line.replace(/^\s*\*\s?/, ''))
			.filter(line => line.trim().length > 0)

		let currentDescription = ''
		let currentTag = ''
		let currentTagContent = ''

		for (const line of content) {
			const tagMatch = line.match(/^@(\w+)(?:\s+(.*))?$/)

			if (tagMatch) {
				// Save previous tag if any
				if (currentTag) {
					if (!jsDoc.tags.has(currentTag)) {
						jsDoc.tags.set(currentTag, [])
					}
					jsDoc.tags.get(currentTag)!.push(currentTagContent.trim())
				}

				// Start new tag
				currentTag = tagMatch[1]
				currentTagContent = tagMatch[2] || ''
			} else if (currentTag) {
				// Continue current tag
				currentTagContent += (currentTagContent ? ' ' : '') + line
			} else {
				// Part of main description
				currentDescription += (currentDescription ? ' ' : '') + line
			}
		}

		// Save last tag if any
		if (currentTag) {
			if (!jsDoc.tags.has(currentTag)) {
				jsDoc.tags.set(currentTag, [])
			}
			jsDoc.tags.get(currentTag)!.push(currentTagContent.trim())
		}

		if (currentDescription.trim()) {
			jsDoc.description = currentDescription.trim()
		}

		return jsDoc
	}
}

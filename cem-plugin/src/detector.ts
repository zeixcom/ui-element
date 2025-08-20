import type { CallExpression, Node } from 'typescript'
import type {
	ComponentDefinition,
	ComponentInitializers,
	PluginContext,
} from './types.js'

/**
 * Detects UIElement component() function calls in the AST
 */
export class ComponentDetector {
	constructor(private context: PluginContext) {}

	/**
	 * Detects if a call expression is a UIElement component() call
	 * and extracts basic information
	 *
	 * @param ts TypeScript compiler API
	 * @param node Call expression node to analyze
	 * @returns ComponentDefinition if detected, null otherwise
	 */
	detectComponentCall(
		ts: typeof import('typescript'),
		node: CallExpression,
	): ComponentDefinition | null {
		// Check if this is a component() function call
		if (!this.isComponentCall(ts, node)) {
			return null
		}

		// Extract the tag name (first argument)
		const tagName = this.extractTagName(ts, node)
		if (!tagName) {
			if (this.context.config.debug) {
				console.warn(
					'[ComponentDetector] Could not extract tag name from component call',
				)
			}
			return null
		}

		// Validate tag name format
		if (!this.isValidTagName(tagName)) {
			if (this.context.config.debug) {
				console.warn(
					`[ComponentDetector] Invalid tag name format: ${tagName}`,
				)
			}
			return null
		}

		// Extract initializers (second argument)
		const initializers = this.extractInitializers(ts, node)

		// Extract setup function (third argument)
		const setupFunction = this.extractSetupFunction(ts, node)

		const sourceFile = node.getSourceFile()

		return {
			tagName,
			sourceFile,
			callExpression: node,
			initializers,
			setupFunction: setupFunction || undefined,
		}
	}

	/**
	 * Checks if a call expression is a component() function call
	 */
	private isComponentCall(
		ts: typeof import('typescript'),
		node: CallExpression,
	): boolean {
		const { componentFunctionNames } = this.context.config

		// Direct function call: component(...)
		if (ts.isIdentifier(node.expression)) {
			const functionName = node.expression.text
			return componentFunctionNames.includes(functionName)
		}

		// Property access: UIElement.component(...) or similar
		if (ts.isPropertyAccessExpression(node.expression)) {
			const propertyName = node.expression.name.text
			return componentFunctionNames.includes(propertyName)
		}

		return false
	}

	/**
	 * Extracts the tag name from the first argument of component() call
	 */
	private extractTagName(
		ts: typeof import('typescript'),
		node: CallExpression,
	): string | null {
		if (node.arguments.length === 0) {
			return null
		}

		const firstArg = node.arguments[0]
		if (!firstArg) {
			return null
		}

		// Handle string literal
		if (ts.isStringLiteral(firstArg)) {
			return firstArg.text
		}

		// Handle template literal with no substitutions
		if (ts.isNoSubstitutionTemplateLiteral(firstArg)) {
			return firstArg.text
		}

		// Could also handle const variables that resolve to strings
		// but for now we'll stick to literals
		return null
	}

	/**
	 * Validates that a tag name follows custom element naming conventions
	 */
	private isValidTagName(tagName: string): boolean {
		// Custom elements must contain a hyphen and be lowercase
		// Must start with letter, contain at least one hyphen, cannot end with hyphen
		return /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(tagName)
	}

	/**
	 * Extracts the initializers object (second argument) from component() call
	 */
	private extractInitializers(
		ts: typeof import('typescript'),
		node: CallExpression,
	): ComponentInitializers {
		// Default empty initializers
		const emptyInitializers: ComponentInitializers = {
			objectLiteral: ts.factory.createObjectLiteralExpression([]),
			properties: new Map(),
		}

		// Check if we have enough arguments
		if (node.arguments.length < 2) {
			return emptyInitializers
		}

		const secondArg = node.arguments[1]
		if (!secondArg) {
			return emptyInitializers
		}

		// Must be an object literal expression
		if (!ts.isObjectLiteralExpression(secondArg)) {
			if (this.context.config.debug) {
				console.warn(
					'[ComponentDetector] Second argument is not an object literal',
				)
			}
			return emptyInitializers
		}

		return {
			objectLiteral: secondArg,
			properties: new Map(), // Will be populated during analysis phase
		}
	}

	/**
	 * Extracts the setup function (third argument) from component() call
	 */
	private extractSetupFunction(
		ts: typeof import('typescript'),
		node: CallExpression,
	): Node | undefined {
		// Check if we have a third argument
		if (node.arguments.length < 3) {
			return undefined
		}

		const thirdArg = node.arguments[2]
		if (!thirdArg) {
			return undefined
		}

		// Should be a function expression, arrow function, or function identifier
		if (
			ts.isFunctionExpression(thirdArg) ||
			ts.isArrowFunction(thirdArg) ||
			ts.isIdentifier(thirdArg)
		) {
			return thirdArg
		}

		if (this.context.config.debug) {
			console.warn(
				'[ComponentDetector] Third argument is not a recognized function type',
			)
		}

		return undefined
	}

	/**
	 * Utility method to check if an import statement imports the component function
	 */
	static hasComponentImport(
		ts: typeof import('typescript'),
		sourceFile: Node,
		componentFunctionNames: string[],
	): boolean {
		let hasImport = false

		function visit(node: Node) {
			// Check import declarations
			if (ts.isImportDeclaration(node)) {
				const importClause = node.importClause
				if (!importClause) return

				// Named imports: import { component } from '...'
				if (
					importClause.namedBindings &&
					ts.isNamedImports(importClause.namedBindings)
				) {
					for (const element of importClause.namedBindings.elements) {
						const importName = element.name.text
						if (componentFunctionNames.includes(importName)) {
							hasImport = true
							return
						}
					}
				}

				// Namespace imports: import * as UIElement from '...'
				if (
					importClause.namedBindings &&
					ts.isNamespaceImport(importClause.namedBindings)
				) {
					// We can't easily check if the namespace contains our function
					// without deeper analysis, so we'll be optimistic
					hasImport = true
					return
				}
			}

			ts.forEachChild(node, visit)
		}

		visit(sourceFile)
		return hasImport
	}
}

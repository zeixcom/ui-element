// import type { Node, SyntaxKind } from 'typescript'
import { ComponentAnalyzer } from './analyzer.js'
import { ComponentDetector } from './detector.js'
import { ManifestGenerator } from './generator.js'
import type {
	AnalyzePhaseParams,
	CollectPhaseParams,
	// ComponentDefinition,
	ModuleLinkPhaseParams,
	PackageLinkPhaseParams,
	PluginConfig,
	PluginContext,
	UIElementPlugin,
} from './types.js'
import { DEFAULT_CONFIG } from './types.js'

/**
 * Creates a UIElement Custom Elements Manifest plugin
 *
 * @param config Plugin configuration options
 * @returns CEM plugin object
 */
export function uiElementPlugin(config: PluginConfig = {}): UIElementPlugin {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config }

	// Initialize plugin context
	const context: PluginContext = {
		components: new Map(),
		config: mergedConfig,
	}

	const detector = new ComponentDetector(context)
	const analyzer = new ComponentAnalyzer(context)
	const generator = new ManifestGenerator(context)

	if (mergedConfig.debug) {
		console.log(
			'[UIElement CEM Plugin] Initialized with config:',
			mergedConfig,
		)
	}

	return {
		name: 'uielement-cem-plugin',

		/**
		 * Initialize plugin with TypeScript and CEM context
		 */
		initialize({
			ts: _ts,
			customElementsManifest: _customElementsManifest,
			context: cemContext,
		}) {
			if (mergedConfig.debug) {
				console.log('[UIElement CEM Plugin] Initializing...')
			}

			// Store TypeScript instance for later use
			if (cemContext.typeChecker) {
				context.typeChecker = cemContext.typeChecker
			}
		},

		/**
		 * Collect phase: Find all component() calls and gather basic information
		 */
		collectPhase({ ts, node, context: _cemContext }: CollectPhaseParams) {
			try {
				// Only process call expressions
				if (ts.isCallExpression(node)) {
					const componentDef = detector.detectComponentCall(ts, node)
					if (componentDef) {
						context.components.set(
							componentDef.tagName,
							componentDef,
						)

						if (mergedConfig.debug) {
							console.log(
								`[UIElement CEM Plugin] Found component: ${componentDef.tagName}`,
							)
						}
					}
				}
			} catch (error) {
				if (mergedConfig.debug) {
					console.error(
						'[UIElement CEM Plugin] Error in collectPhase:',
						error,
					)
				}
			}
		},

		/**
		 * Analyze phase: Deep analysis of component definitions
		 */
		analyzePhase({
			ts,
			node,
			moduleDoc: _moduleDoc,
			context: _cemContext,
		}: AnalyzePhaseParams) {
			try {
				// Only process call expressions to avoid repeated analysis
				if (!ts.isCallExpression(node)) {
					return
				}

				// Find the component definition that matches this call expression
				const sourceFile = node.getSourceFile?.()
				if (!sourceFile) {
					return
				}

				const componentDef = Array.from(
					context.components.values(),
				).find(
					comp =>
						comp.sourceFile === sourceFile &&
						comp.callExpression === node,
				)

				if (componentDef && !componentDef.analyzed) {
					analyzer.analyzeComponent(ts, componentDef)
					componentDef.analyzed = true

					if (mergedConfig.debug) {
						console.log(
							`[UIElement CEM Plugin] Analyzed component: ${componentDef.tagName}`,
						)
					}
				}
			} catch (error) {
				if (mergedConfig.debug) {
					console.error(
						'[UIElement CEM Plugin] Error in analyzePhase:',
						error,
					)
				}
			}
		},

		/**
		 * Module link phase: Connect component information within modules
		 */
		moduleLinkPhase({
			moduleDoc,
			context: _cemContext,
		}: ModuleLinkPhaseParams) {
			try {
				// Find components that belong to this module
				const moduleComponents = Array.from(
					context.components.values(),
				).filter(comp => {
					// Match by module path
					const modulePath = moduleDoc.path
					const componentPath = comp.sourceFile.fileName
					return (
						componentPath.endsWith(modulePath) ||
						modulePath.endsWith(componentPath)
					)
				})

				// Generate CEM declarations for each component
				for (const component of moduleComponents) {
					const declaration = generator.generateDeclaration(component)

					if (declaration) {
						// Add the declaration to the module
						if (!moduleDoc.declarations) {
							moduleDoc.declarations = []
						}
						moduleDoc.declarations.push(declaration)

						if (mergedConfig.debug) {
							console.log(
								`[UIElement CEM Plugin] Generated declaration for: ${component.tagName}`,
							)
						}
					}
				}
			} catch (error) {
				if (mergedConfig.debug) {
					console.error(
						'[UIElement CEM Plugin] Error in moduleLinkPhase:',
						error,
					)
				}
			}
		},

		/**
		 * Package link phase: Final processing and cleanup
		 */
		packageLinkPhase({
			customElementsManifest,
			context: _cemContext,
		}: PackageLinkPhaseParams) {
			try {
				// Perform final validation and cleanup
				generator.finalizeManifest(customElementsManifest)

				if (mergedConfig.debug) {
					const componentCount = context.components.size
					console.log(
						`[UIElement CEM Plugin] Completed processing ${componentCount} components`,
					)

					// Log summary of found components
					for (const [tagName, component] of context.components) {
						const propertyCount =
							component.initializers?.properties.size || 0
						console.log(
							`  - ${tagName}: ${propertyCount} properties`,
						)
					}
				}
			} catch (error) {
				if (mergedConfig.debug) {
					console.error(
						'[UIElement CEM Plugin] Error in packageLinkPhase:',
						error,
					)
				}
			}
		},
	}
}

// Default export for convenience
export default uiElementPlugin

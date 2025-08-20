/**
 * UIElement Custom Elements Manifest Plugin
 *
 * A plugin for @custom-elements-manifest/analyzer that provides support for
 * UIElement's unique component() function syntax.
 *
 * @version 0.1.0
 */

import { uiElementPlugin } from './plugin.js'

export { ComponentAnalyzer } from './analyzer.js'
export { ComponentDetector } from './detector.js'
export { ManifestGenerator } from './generator.js'
export { uiElementPlugin as default, uiElementPlugin } from './plugin.js'

export type {
	AnalyzePhaseParams,
	CollectPhaseParams,
	ComponentDefinition,
	ComponentInitializers,
	ComponentPropsInterface,
	ExtractorDetails,
	FunctionDetails,
	InitializerDetails,
	InitializerType,
	InterfaceProperty,
	JSDocInfo,
	LiteralDetails,
	ModuleLinkPhaseParams,
	PackageLinkPhaseParams,
	ParserDetails,
	PluginConfig,
	PluginContext,
	PropertyInitializer,
	UIElementPlugin,
	UnknownDetails,
} from './types.js'

export {
	DEFAULT_CONFIG,
	EXTRACTOR_FUNCTIONS,
	PARSER_TYPE_MAP,
} from './types.js'

/**
 * Quick start function for basic usage
 *
 * @example
 * ```javascript
 * import { createUIElementPlugin } from 'cem-plugin-uielement'
 *
 * export default {
 *   plugins: [
 *     createUIElementPlugin()
 *   ]
 * }
 * ```
 */
export function createUIElementPlugin(
	config?: import('./types.js').PluginConfig,
) {
	return uiElementPlugin(config)
}

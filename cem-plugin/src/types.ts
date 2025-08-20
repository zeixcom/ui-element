import type {
	CallExpression,
	Node,
	ObjectLiteralExpression,
	PropertyAssignment,
	SourceFile,
	TypeChecker,
} from 'typescript'

/**
 * Plugin configuration options
 */
export interface PluginConfig {
	/** Enable debug logging */
	debug?: boolean
	/** Custom component function names to detect (defaults to ['component']) */
	componentFunctionNames?: string[]
	/** Custom parser function names to recognize */
	customParsers?: Record<string, string>
	/** Custom extractor function names to recognize */
	customExtractors?: Record<string, string>
}

/**
 * Plugin context passed between phases
 */
export interface PluginContext {
	/** Collected component definitions */
	components: Map<string, ComponentDefinition>
	/** TypeScript type checker */
	typeChecker?: TypeChecker
	/** Plugin configuration */
	config: Required<PluginConfig>
}

/**
 * Represents a UIElement component definition found in the AST
 */
export interface ComponentDefinition {
	/** The component tag name */
	tagName: string
	/** Source file containing the component */
	sourceFile: SourceFile
	/** The component() call expression node */
	callExpression: CallExpression
	/** Component property initializers */
	initializers: ComponentInitializers
	/** Setup function node */
	setupFunction: Node | undefined
	/** TypeScript interface for component props */
	propsInterface?: ComponentPropsInterface
	/** JSDoc comments */
	jsDoc?: JSDocInfo
	/** Flag to track if component has been analyzed */
	analyzed?: boolean
}

/**
 * Component property initializers object
 */
export interface ComponentInitializers {
	/** Raw object literal expression from AST */
	objectLiteral: ObjectLiteralExpression
	/** Parsed property definitions */
	properties: Map<string, PropertyInitializer>
}

/**
 * Individual property initializer
 */
export interface PropertyInitializer {
	/** Property name */
	name: string
	/** Property assignment node */
	node: PropertyAssignment
	/** Type of initializer */
	type: InitializerType
	/** Parsed initializer details */
	details: InitializerDetails
}

/**
 * Type of property initializer
 */
export type InitializerType =
	| 'parser'
	| 'extractor'
	| 'function'
	| 'literal'
	| 'unknown'

/**
 * Details about the initializer based on its type
 */
export type InitializerDetails =
	| ParserDetails
	| ExtractorDetails
	| FunctionDetails
	| LiteralDetails
	| UnknownDetails

/**
 * Details for parser initializers (asBoolean, asString, etc.)
 */
export interface ParserDetails {
	type: 'parser'
	/** Parser function name */
	parserName: string
	/** Default value if provided */
	defaultValue?: unknown
	/** Arguments passed to parser */
	arguments: unknown[]
	/** Inferred TypeScript type */
	tsType: string
}

/**
 * Details for extractor initializers (fromDOM, fromContext, etc.)
 */
export interface ExtractorDetails {
	type: 'extractor'
	/** Extractor function name */
	extractorName: string
	/** Extractor configuration */
	config?: unknown
	/** Fallback value */
	fallback?: unknown
	/** Inferred TypeScript type */
	tsType: string
}

/**
 * Details for function initializers
 */
export interface FunctionDetails {
	type: 'function'
	/** Function node */
	functionNode: Node
	/** Inferred return type */
	returnType: string
}

/**
 * Details for literal value initializers
 */
export interface LiteralDetails {
	type: 'literal'
	/** Literal value */
	value: unknown
	/** Inferred type */
	tsType: string
}

/**
 * Details for unknown/unsupported initializers
 */
export interface UnknownDetails {
	type: 'unknown'
	/** Raw AST node for manual processing */
	node: Node
}

/**
 * TypeScript interface information for component props
 */
export interface ComponentPropsInterface {
	/** Interface name */
	name: string
	/** Interface declaration node */
	node: Node
	/** Properties defined in the interface */
	properties: Map<string, InterfaceProperty>
}

/**
 * Property defined in TypeScript interface
 */
export interface InterfaceProperty {
	/** Property name */
	name: string
	/** TypeScript type */
	type: string
	/** Whether property is optional */
	optional: boolean
	/** JSDoc comments */
	jsDoc?: JSDocInfo
}

/**
 * JSDoc comment information
 */
export interface JSDocInfo {
	/** Main description */
	description?: string
	/** JSDoc tags */
	tags: Map<string, string[]>
	/** Examples */
	examples?: string[]
}

/**
 * CEM plugin hook parameters
 */
export interface CollectPhaseParams {
	ts: typeof import('typescript')
	node: Node
	context: any // CEM analyzer context, not our plugin context
}

export interface AnalyzePhaseParams {
	ts: typeof import('typescript')
	node: Node
	moduleDoc: any
	context: any // CEM analyzer context, not our plugin context
}

export interface ModuleLinkPhaseParams {
	moduleDoc: any
	context: any // CEM analyzer context, not our plugin context
}

export interface PackageLinkPhaseParams {
	customElementsManifest: any
	context: any // CEM analyzer context, not our plugin context
}

/**
 * Plugin interface
 */
export interface UIElementPlugin {
	name: string
	initialize?(params: {
		ts: typeof import('typescript')
		customElementsManifest: any
		context: any // CEM analyzer context, not our plugin context
	}): void
	collectPhase?(params: CollectPhaseParams): void
	analyzePhase?(params: AnalyzePhaseParams): void
	moduleLinkPhase?(params: ModuleLinkPhaseParams): void
	packageLinkPhase?(params: PackageLinkPhaseParams): void
}

/**
 * Known UIElement parser functions and their corresponding types
 */
export const PARSER_TYPE_MAP = {
	asBoolean: 'boolean',
	asString: 'string',
	asNumber: 'number',
	asInteger: 'number',
	asJSON: 'object',
	asEnum: 'string', // Will be refined to union type when possible
} as const

/**
 * Known UIElement extractor functions
 */
export const EXTRACTOR_FUNCTIONS = [
	'fromDOM',
	'fromContext',
	'fromEvents',
	'fromSelector',
	'getAttribute',
	'getProperty',
	'getText',
	'getLabel',
	'getDescription',
	'getStyle',
	'hasAttribute',
	'hasClass',
	'getIdrefText',
] as const

/**
 * Parser function argument patterns for better type inference
 */
export const PARSER_ARGUMENT_PATTERNS = {
	asBoolean: {
		argCount: 0,
		defaultValue: false,
		description: 'Parses presence of attribute as boolean',
	},
	asString: {
		argCount: [0, 1],
		defaultValue: '',
		description: 'Parses attribute as string with optional fallback',
	},
	asNumber: {
		argCount: [0, 1],
		defaultValue: 0,
		description: 'Parses attribute as number with optional fallback',
	},
	asInteger: {
		argCount: [0, 1],
		defaultValue: 0,
		description: 'Parses attribute as integer with optional fallback',
	},
	asEnum: {
		argCount: 1,
		defaultValue: null, // First enum value
		description: 'Parses attribute as one of valid enum values',
	},
	asJSON: {
		argCount: 1,
		defaultValue: null, // Fallback object
		description: 'Parses attribute as JSON with required fallback',
	},
} as const

/**
 * Extractor function patterns for better type inference
 */
export const EXTRACTOR_PATTERNS = {
	fromDOM: {
		argCount: 2,
		returnType: 'inferred',
		description: 'Extracts value from DOM using selector map and fallback',
	},
	getAttribute: {
		argCount: 1,
		returnType: 'string | null',
		description: 'Gets attribute value',
	},
	getProperty: {
		argCount: 1,
		returnType: 'unknown',
		description: 'Gets element property value',
	},
	getText: {
		argCount: 0,
		returnType: 'string | null',
		description: 'Gets trimmed text content',
	},
	hasAttribute: {
		argCount: 1,
		returnType: 'boolean',
		description: 'Checks if attribute exists',
	},
	hasClass: {
		argCount: 1,
		returnType: 'boolean',
		description: 'Checks if CSS class exists',
	},
	getStyle: {
		argCount: 1,
		returnType: 'string',
		description: 'Gets computed style property',
	},
	getLabel: {
		argCount: 1,
		returnType: 'string',
		description: 'Gets accessible label from selector',
	},
	getDescription: {
		argCount: 1,
		returnType: 'string',
		description: 'Gets accessible description from selector',
	},
	getIdrefText: {
		argCount: 1,
		returnType: 'string | undefined',
		description: 'Gets text content of element referenced by ID attribute',
	},
} as const

/**
 * Default plugin configuration
 */
export const DEFAULT_CONFIG: Required<PluginConfig> = {
	debug: false,
	componentFunctionNames: ['component'],
	customParsers: {},
	customExtractors: {},
}

import type {
	ComponentDefinition,
	ExtractorDetails,
	FunctionDetails,
	LiteralDetails,
	ParserDetails,
	PluginContext,
	PropertyInitializer,
} from './types.js'
import { EXTRACTOR_PATTERNS, PARSER_ARGUMENT_PATTERNS } from './types.js'

/**
 * Generates Custom Elements Manifest declarations from UIElement components
 */
export class ManifestGenerator {
	constructor(private context: PluginContext) {}

	/**
	 * Generates a CEM declaration for a component
	 *
	 * @param component Component definition to convert
	 * @returns CEM CustomElementDeclaration
	 */
	generateDeclaration(component: ComponentDefinition): any {
		try {
			const className = this.tagNameToClassName(component.tagName)

			const declaration = {
				kind: 'class',
				description: component.jsDoc?.description || '',
				name: className,
				tagName: component.tagName,
				customElement: true,
				members: this.generateMembers(component),
				attributes: this.generateAttributes(component),
				events: [], // TODO: Extract from setup function
				slots: [], // TODO: Extract from setup function
				cssProperties: [], // TODO: Extract from setup function
				cssParts: [], // TODO: Extract from setup function
			}

			// Add JSDoc tags as additional metadata
			if (component.jsDoc?.tags.size) {
				declaration.description = this.enhanceDescription(
					declaration.description,
					component.jsDoc.tags,
				)
			}

			return declaration
		} catch (error) {
			if (this.context.config.debug) {
				console.error(
					`[ManifestGenerator] Error generating declaration for ${component.tagName}:`,
					error,
				)
			}
			return null
		}
	}

	/**
	 * Generates CEM members (properties) for a component
	 */
	private generateMembers(component: ComponentDefinition): any[] {
		const members: any[] = []

		for (const [propertyName, property] of component.initializers
			.properties) {
			const member = this.generateMember(
				component,
				propertyName,
				property,
			)
			if (member) {
				members.push(member)
			}
		}

		return members
	}

	/**
	 * Generates a single CEM member from a property initializer
	 */
	private generateMember(
		component: ComponentDefinition,
		propertyName: string,
		property: PropertyInitializer,
	): any | null {
		const baseType = this.inferPropertyType(property)
		const description = this.getPropertyDescription(
			component,
			propertyName,
			property,
		)

		// Base member structure
		const member = {
			kind: 'field',
			name: propertyName,
			type: { text: baseType },
			description,
			privacy: 'public',
		}

		// Add reactive property information
		if (this.isReactiveProperty(property)) {
			member.description = this.addReactiveNote(member.description)
		}

		// Add default value if available
		const defaultValue = this.extractDefaultValue(property)
		if (
			defaultValue !== undefined ||
			(property.type === 'literal' &&
				(property.details as any).value === undefined)
		) {
			;(member as any).default = this.formatDefaultValue(defaultValue)
		}

		// Add additional metadata based on initializer type
		const metadata = this.extractPropertyMetadata(property)
		if (Object.keys(metadata).length > 0) {
			Object.assign(member, metadata)
		}

		return member
	}

	/**
	 * Generates CEM attributes for a component
	 */
	private generateAttributes(component: ComponentDefinition): any[] {
		const attributes: any[] = []

		for (const [propertyName, property] of component.initializers
			.properties) {
			const attribute = this.generateAttribute(propertyName, property)
			if (attribute) {
				attributes.push(attribute)
			}
		}

		return attributes
	}

	/**
	 * Generates a single CEM attribute from a property initializer
	 */
	private generateAttribute(
		propertyName: string,
		property: PropertyInitializer,
	): any | null {
		// Only properties with parsers become HTML attributes
		if (property.type !== 'parser') {
			return null
		}

		const parserDetails = property.details as ParserDetails
		const attributeType = this.mapParserToAttributeType(parserDetails)
		const pattern =
			PARSER_ARGUMENT_PATTERNS[
				parserDetails.parserName as keyof typeof PARSER_ARGUMENT_PATTERNS
			]

		return {
			name: propertyName,
			type: { text: attributeType },
			description: `HTML attribute for the ${propertyName} property. ${pattern?.description || ''}`,
			fieldName: propertyName,
			default: this.getAttributeDefault(parserDetails),
		}
	}

	/**
	 * Infers the TypeScript type for a property
	 */
	private inferPropertyType(property: PropertyInitializer): string {
		switch (property.type) {
			case 'parser': {
				const parserDetails = property.details as ParserDetails
				return parserDetails.tsType
			}

			case 'extractor': {
				const extractorDetails = property.details as ExtractorDetails
				return extractorDetails.tsType
			}

			case 'literal': {
				const literalDetails = property.details as LiteralDetails
				return literalDetails.tsType
			}

			case 'function': {
				const functionDetails = property.details as FunctionDetails
				return functionDetails.returnType
			}

			default:
				return 'unknown'
		}
	}

	/**
	 * Gets description for a property from various sources
	 */
	private getPropertyDescription(
		component: ComponentDefinition,
		propertyName: string,
		property: PropertyInitializer,
	): string {
		// Check TypeScript interface for description
		const interfaceProperty =
			component.propsInterface?.properties.get(propertyName)
		if (interfaceProperty?.jsDoc?.description) {
			return interfaceProperty.jsDoc.description
		}

		// Generate description based on initializer type
		switch (property.type) {
			case 'parser': {
				const parserDetails = property.details as ParserDetails
				const pattern =
					PARSER_ARGUMENT_PATTERNS[
						parserDetails.parserName as keyof typeof PARSER_ARGUMENT_PATTERNS
					]
				return `Reactive property parsed with ${parserDetails.parserName}(). ${pattern?.description || ''}`
			}

			case 'extractor': {
				const extractorDetails = property.details as ExtractorDetails
				const pattern =
					EXTRACTOR_PATTERNS[
						extractorDetails.extractorName as keyof typeof EXTRACTOR_PATTERNS
					]
				return `Property extracted using ${extractorDetails.extractorName}(). ${pattern?.description || ''}`
			}

			case 'literal':
				return `Property with literal value`

			case 'function':
				return `Property computed by function`

			default:
				return `Property of type ${property.type}`
		}
	}

	/**
	 * Checks if a property is reactive (has state/signal behavior)
	 */
	private isReactiveProperty(property: PropertyInitializer): boolean {
		// In UIElement, properties with parsers or extractors are typically reactive
		return property.type === 'parser' || property.type === 'extractor'
	}

	/**
	 * Adds a note about reactive behavior to property description
	 */
	private addReactiveNote(description: string): string {
		if (!description.includes('reactive')) {
			return `${description}. This is a reactive property that triggers updates when changed.`
		}
		return description
	}

	/**
	 * Extracts default value from property initializer
	 */
	private extractDefaultValue(property: PropertyInitializer): unknown {
		switch (property.type) {
			case 'parser': {
				const parserDetails = property.details as ParserDetails
				return parserDetails.defaultValue
			}

			case 'extractor': {
				const extractorDetails = property.details as ExtractorDetails
				return extractorDetails.fallback
			}

			case 'literal': {
				const literalDetails = property.details as LiteralDetails
				return literalDetails.value
			}

			default:
				return undefined
		}
	}

	/**
	 * Extracts additional metadata for a property
	 */
	private extractPropertyMetadata(property: PropertyInitializer): any {
		const metadata: any = {}

		switch (property.type) {
			case 'parser': {
				const parserDetails = property.details as ParserDetails
				const pattern =
					PARSER_ARGUMENT_PATTERNS[
						parserDetails.parserName as keyof typeof PARSER_ARGUMENT_PATTERNS
					]
				metadata._uielement = {
					parser: parserDetails.parserName,
					arguments: parserDetails.arguments,
					pattern: pattern?.description,
					defaultValue: parserDetails.defaultValue,
				}
				break
			}

			case 'extractor': {
				const extractorDetails = property.details as ExtractorDetails
				const pattern =
					EXTRACTOR_PATTERNS[
						extractorDetails.extractorName as keyof typeof EXTRACTOR_PATTERNS
					]
				metadata._uielement = {
					extractor: extractorDetails.extractorName,
					config: extractorDetails.config,
					fallback: extractorDetails.fallback,
					pattern: pattern?.description,
					returnType: pattern?.returnType,
				}
				break
			}

			case 'function':
				metadata._uielement = {
					type: 'function',
				}
				break
		}

		return metadata
	}

	/**
	 * Maps UIElement parser to CEM attribute type
	 */
	private mapParserToAttributeType(parserDetails: ParserDetails): string {
		switch (parserDetails.parserName) {
			case 'asBoolean':
				return 'boolean'
			case 'asString':
				return 'string'
			case 'asNumber':
			case 'asInteger':
				return 'number'
			case 'asEnum':
				// Use the already parsed TypeScript type which includes union types
				return parserDetails.tsType
			case 'asJSON':
				return 'string' // JSON is passed as string attribute
			default:
				return 'string'
		}
	}

	/**
	 * Gets the default value for an attribute based on parser details
	 */
	private getAttributeDefault(
		parserDetails: ParserDetails,
	): string | undefined {
		const defaultValue = parserDetails.defaultValue

		if (defaultValue === undefined || defaultValue === null) {
			return undefined
		}

		// Convert default value to string representation for attribute
		if (typeof defaultValue === 'boolean') {
			return defaultValue ? 'true' : undefined // Boolean attributes are present/absent
		}

		if (typeof defaultValue === 'string') {
			return defaultValue
		}

		if (typeof defaultValue === 'number') {
			return defaultValue.toString()
		}

		// For complex types, stringify
		try {
			return JSON.stringify(defaultValue)
		} catch {
			return String(defaultValue)
		}
	}

	/**
	 * Formats default value for display in CEM
	 */
	private formatDefaultValue(value: unknown): string {
		if (value === null) {
			return 'null'
		}
		if (value === undefined) {
			return 'undefined'
		}
		if (typeof value === 'string') {
			return JSON.stringify(value)
		}
		if (typeof value === 'boolean' || typeof value === 'number') {
			return String(value)
		}
		try {
			return JSON.stringify(value)
		} catch {
			return String(value)
		}
	}

	/**
	 * Converts tag name to PascalCase class name
	 */
	private tagNameToClassName(tagName: string): string {
		return tagName
			.split('-')
			.map(part => part.charAt(0).toUpperCase() + part.slice(1))
			.join('')
	}

	/**
	 * Enhances description with JSDoc tags
	 */
	private enhanceDescription(
		description: string,
		tags: Map<string, string[]>,
	): string {
		let enhanced = description

		// Add @since information
		const since = tags.get('since')
		if (since && since.length > 0) {
			enhanced += `\n\n**Since:** ${since[0]}`
		}

		// Add @deprecated information
		const deprecated = tags.get('deprecated')
		if (deprecated && deprecated.length > 0) {
			enhanced += `\n\n**Deprecated:** ${deprecated[0]}`
		}

		// Add @example information
		const examples = tags.get('example')
		if (examples && examples.length > 0) {
			enhanced += '\n\n**Examples:**\n'
			for (const example of examples) {
				enhanced += `\n\`\`\`typescript\n${example}\n\`\`\`\n`
			}
		}

		return enhanced
	}

	/**
	 * Performs final processing on the complete manifest
	 */
	finalizeManifest(customElementsManifest: any): void {
		try {
			// Add UIElement-specific metadata to the manifest
			if (!customElementsManifest.plugins) {
				customElementsManifest.plugins = []
			}

			customElementsManifest.plugins.push({
				name: 'uielement-cem-plugin',
				version: '0.1.0',
				components: this.context.components.size,
			})

			// Validate that all components have proper tag names
			this.validateManifest(customElementsManifest)

			if (this.context.config.debug) {
				console.log(
					'[ManifestGenerator] Finalized manifest with UIElement metadata',
				)
			}
		} catch (error) {
			if (this.context.config.debug) {
				console.error(
					'[ManifestGenerator] Error finalizing manifest:',
					error,
				)
			}
		}
	}

	/**
	 * Validates the generated manifest for consistency
	 */
	private validateManifest(customElementsManifest: any): void {
		if (!customElementsManifest.modules) {
			return
		}

		for (const module of customElementsManifest.modules) {
			if (!module.declarations) {
				continue
			}

			for (const declaration of module.declarations) {
				if (declaration.customElement && !declaration.tagName) {
					console.warn(
						`[ManifestGenerator] Custom element ${declaration.name} missing tagName`,
					)
				}

				// Validate that attributes have corresponding properties
				if (declaration.attributes && declaration.members) {
					for (const attribute of declaration.attributes) {
						if (attribute.fieldName) {
							const hasProperty = declaration.members.some(
								(member: any) =>
									member.name === attribute.fieldName,
							)
							if (!hasProperty) {
								console.warn(
									`[ManifestGenerator] Attribute ${attribute.name} references missing property ${attribute.fieldName}`,
								)
							}
						}
					}
				}
			}
		}
	}
}

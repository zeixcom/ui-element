/**
 * @name UIElement
 * @version 0.14.0
 * @author Esther Brunner
 */

// From Cause & Effect
export {
	batch,
	type Cleanup,
	type Computed,
	type ComputedCallback,
	computed,
	type EffectMatcher,
	effect,
	enqueue,
	isComputed,
	isSignal,
	isState,
	type MaybeSignal,
	type Signal,
	type State,
	state,
	toSignal,
	UNSET,
} from '@zeix/cause-effect'

// Core
export {
	type Component,
	type ComponentProps,
	component,
	type Initializer,
	type ReservedWords,
	type Setup,
	type ValidateComponentProps,
	type ValidPropertyKey,
} from './src/component'
export {
	type Context,
	type ContextType,
	fromContext,
	provideContexts,
	type UnknownContext,
} from './src/core/context'
export {
	type ElementEffects,
	type ElementFromSelector,
	type ElementsUsage,
	type ElementUsage,
	type Extractor,
	type Fallback,
	fromDOM,
	fromSelector,
	getFallback,
	type Helpers,
	isParser,
	type LooseExtractor,
	type Parser,
	type ParserOrFallback,
} from './src/core/dom'
export {
	CircularMutationError,
	DependencyTimeoutError,
	InvalidComponentNameError,
	InvalidEffectsError,
	InvalidPropertyNameError,
	InvalidSignalError,
	MissingElementError,
} from './src/core/errors'
export {
	type EventHandler,
	type EventTransformer,
	type EventTransformers,
	type EventType,
	emitEvent,
	fromEvents,
	on,
} from './src/core/events'
export {
	type Effect,
	type Effects,
	RESET,
	type Reactive,
	resolveReactive,
} from './src/core/reactive'
export {
	LOG_DEBUG,
	LOG_ERROR,
	LOG_INFO,
	LOG_WARN,
	type LogLevel,
	log,
} from './src/core/util'
export {
	type DangerouslySetInnerHTMLOptions,
	dangerouslySetInnerHTML,
	type ElementInserter,
	type ElementUpdater,
	insertOrRemoveElement,
	pass,
	type Reactives,
	// callMethod,
	// focus,
	setAttribute,
	setProperty,
	setStyle,
	setText,
	show,
	toggleAttribute,
	toggleClass,
	type UpdateOperation,
	updateElement,
} from './src/lib/effects'
export {
	getAttribute,
	getDescription,
	getLabel,
	getProperty,
	getStyle,
	getText,
	hasAttribute,
	hasClass,
} from './src/lib/extractors'
// Lib
export {
	asBoolean,
	asEnum,
	asInteger,
	asJSON,
	asNumber,
	asString,
} from './src/lib/parsers'

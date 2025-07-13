/**
 * @name UIElement DEV_MODE
 * @version 0.13.3
 * @author Esther Brunner
 */

// From Cause & Effect
export {
	type Signal,
	type MaybeSignal,
	type State,
	type Computed,
	type ComputedCallback,
	type EffectMatcher,
	type Cleanup,
	UNSET,
	state,
	computed,
	effect,
	batch,
	enqueue,
	isState,
	isComputed,
	isSignal,
	toSignal,
} from '@zeix/cause-effect'

// Core
export {
	type Component,
	type ComponentProps,
	type ValidPropertyKey,
	type ReservedWords,
	type Initializer,
	type SignalProducer,
	type MethodProducer,
	type SelectorFunctions,
	component,
} from './src/component'
export {
	type LogLevel,
	LOG_DEBUG,
	LOG_INFO,
	LOG_WARN,
	LOG_ERROR,
	log,
} from './src/core/util'
export {
	type ElementFromSelector,
	type StringParser,
	type ValueOrExtractor,
	fromComponent,
	fromDOM,
	fromSelector,
	read,
	reduced,
	requireElement,
} from './src/core/dom'
export {
	type Effect,
	type Reactive,
	RESET,
	resolveReactive,
} from './src/core/reactive'
export {
	type EventType,
	type EventTransformer,
	type EventTransformers,
	type EventTransformerContext,
	emitEvent,
	fromEvents,
	on,
} from './src/core/events'
export {
	type Context,
	type UnknownContext,
	type ContextType,
	fromContext,
	provideContexts,
} from './src/core/context'

// Lib
export {
	asBoolean,
	asInteger,
	asNumber,
	asString,
	asEnum,
	asJSON,
} from './src/lib/parsers'
export {
	type Reactives,
	type UpdateOperation,
	type ElementUpdater,
	type ElementInserter,
	type DangerouslySetInnerHTMLOptions,
	updateElement,
	insertOrRemoveElement,
	setText,
	setProperty,
	show,
	callMethod,
	focus,
	setAttribute,
	toggleAttribute,
	toggleClass,
	setStyle,
	dangerouslySetInnerHTML,
	pass,
} from './src/lib/effects'
export {
	getText,
	getProperty,
	hasAttribute,
	getAttribute,
	hasClass,
	getStyle,
} from './src/lib/extractors'

/**
 * @name UIElement
 * @version 0.12.0
 * @author Esther Brunner
 */

// From Cause & Effect
export {
	type Signal, type MaybeSignal, type State, type Computed,
	type ComputedCallback, type EffectMatcher, type EnqueueDedupe,
	UNSET, state, computed, effect, batch, watch, enqueue,
	isState, isComputed, isSignal, toSignal
} from '@zeix/cause-effect'

// Core
export {
	type Component, type ComponentProps, type ValidPropertyKey, type ReservedWords,
	type Initializer, type AttributeParser, type SignalProducer, type MethodProducer,
	type Cleanup, type FxFunction,
	RESET, component
} from './src/component'
export {
	type LogLevel,
	LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR, log
} from './src/core/log'
export {
	type PassedSignals,
	first, all, on, emit, pass
} from './src/core/ui'
export {
	type Context, type UnknownContext, type ContextType,
	provide, consume
} from './src/core/context'

// Lib
export {
	asBoolean, asInteger, asNumber, asString, asEnum, asJSON
} from './src/lib/parsers'
export {
	type SignalLike, type UpdateOperation, type ElementUpdater, type ElementInserterOrRemover,
	updateElement, insertOrRemoveElement,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
	dangerouslySetInnerHTML
} from './src/lib/effects'
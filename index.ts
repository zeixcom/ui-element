/**
 * @name UIElement
 * @version 0.12.3
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
	type AttributeParser,
	type SignalProducer,
	type MethodProducer,
	type FxFunction,
	RESET,
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
	type PassedSignals,
	first,
	all,
	selection,
	on,
	emit,
	pass,
} from './src/core/ui'
export {
	type Context,
	type UnknownContext,
	type ContextType,
	provide,
	consume,
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
	type SignalLike,
	type UpdateOperation,
	type ElementUpdater,
	type ElementInserter,
	updateElement,
	insertOrRemoveElement,
	setText,
	setProperty,
	setAttribute,
	toggleAttribute,
	toggleClass,
	setStyle,
	dangerouslySetInnerHTML,
} from './src/lib/effects'

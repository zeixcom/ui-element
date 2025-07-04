/**
 * @name UIElement
 * @version 0.13.2
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
	type Effect,
	type ElementFromSelector,
	type SelectorFunctions,
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
	type HTMLElementEventType,
	type ValidEventName,
	type EventType,
	type TransformerContext,
	type EventTransformer,
	fromSelector,
	fromDescendants,
	fromEvent,
	fromDescendant,
} from './src/core/dom'
export {
	type Context,
	type UnknownContext,
	type ContextType,
	provide,
	fromContext,
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
	type Reactive,
	type PassedReactives,
	type UpdateOperation,
	type ElementUpdater,
	type ElementInserter,
	type DangerouslySetInnerHTMLOptions,
	updateElement,
	insertOrRemoveElement,
	setText,
	setProperty,
	show,
	setAttribute,
	toggleAttribute,
	toggleClass,
	setStyle,
	dangerouslySetInnerHTML,
	on,
	emit,
	pass,
} from './src/lib/effects'

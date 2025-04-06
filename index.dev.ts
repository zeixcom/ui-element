/**
 * @name UIElement DEV_MODE
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
	type AttributeParser, type ComponentProps, type SignalInitializer,
	RESET, component, first, all
} from './src/component'
export {
	type EventListenerProvider,
	on, emit, pass
} from './src/core/ui'
export {
	type LogLevel,
	LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR, log
} from './src/core/log'
export {
	type Context, type UnknownContext,
	useContext
} from './src/core/context'

// Lib
export {
	asBoolean, asInteger, asNumber, asString, asEnum, asJSON
} from './src/lib/parsers'
export {
	type SignalLike, type ElementUpdater, type NodeInserter,
	updateElement, insertNode,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
	dangerouslySetInnerHTML, insertTemplate, createElement, removeElement
} from './src/lib/effects'
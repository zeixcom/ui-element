/**
 * @name UIElement
 * @version 0.11.0
 * @author Esther Brunner
 */

// From Cause & Effect
export {
	type Signal, type MaybeSignal, type State, type Computed,
	type ComputedCallbacks, type EffectCallbacks, type EnqueueDedupe,
	UNSET, state, computed, effect, batch, watch, enqueue,
	isState, isComputed, isSignal, toSignal
} from '@zeix/cause-effect'

// Core
export {
	type AttributeParser, type ComponentSignals, type SignalInitializer, type Root, type StateUpdater,
	RESET, UIElement, parse
} from './src/ui-element'
export {
	type UI, type PassedSignals, type PassedSignalsProvider, type EventListenerProvider,
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
	type ValueProvider, type SignalLike, type ElementUpdater, type NodeInserter,
	updateElement, insertNode,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
	dangerouslySetInnerHTML, insertTemplate, createElement, removeElement
} from './src/lib/effects'
/* export {
	type ComponentSetup,
	component
} from './src/lib/component' */
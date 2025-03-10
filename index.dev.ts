/**
 * @name UIElement DEV_MODE
 * @version 0.10.2
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
	type AttributeParser, type ComponentSignals, type StateInitializer, type Root,
	RESET, UIElement, parse
} from './src/ui-element'
export {
	type PassedSignals, type PassedSignalsProvider, type EventListenerProvider,
	UI
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
	asBoolean,
	asIntegerWithDefault, asInteger, asNumberWithDefault, asNumber,
	asStringWithDefault, asString, asEnum,
	asJSONWithDefault, asJSON
} from './src/lib/parsers'
export {
	type SignalValueProvider, type SignalLike, type ElementUpdater,
	updateElement, createElement, removeElement,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
	dangerouslySetInnerHTML
} from './src/lib/effects'
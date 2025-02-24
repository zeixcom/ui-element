/**
 * @name UIElement
 * @version 0.10.1
 * @author Esther Brunner
 */
export {
	type Signal, type State, type Computed,
	UNSET, state, computed, effect, batch, isState, isComputed, isSignal, toSignal
} from '@zeix/cause-effect'
export {
	type EnqueueDedupe,
	enqueue, animationFrame
} from '@zeix/pulse'

export {
	type AttributeParser,
	RESET, UIElement, parse
} from './src/ui-element'
export {
	type SignalLike, type PassedSignals, type PassedSignalsProvider, type EventListenerProvider,
	UI
} from './src/core/ui'
export {
	LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR, log
} from './src/core/log'
export {
	type Context, type UnknownContext,
	useContext
} from './src/core/context'
export {
	asBoolean,
	asIntegerWithDefault, asInteger, asNumberWithDefault, asNumber,
	asStringWithDefault, asString, asEnum,
	asJSONWithDefault, asJSON
} from './src/lib/parsers'
export {
	type ElementUpdater,
	updateElement, createElement, removeElement,
	setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle,
} from './src/lib/effects'
/* export {
	type ComponentSetup,
	component
} from './src/lib/component' */
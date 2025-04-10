/**
 * @name UIElement
 * @version 0.12.0
 * @author Esther Brunner
 */
export { type Signal, type MaybeSignal, type State, type Computed, type ComputedCallback, type EffectMatcher, type EnqueueDedupe, UNSET, state, computed, effect, batch, watch, enqueue, isState, isComputed, isSignal, toSignal } from '@zeix/cause-effect';
export { type Component, type ComponentProps, type Initializer, type Parser, type SignalProducer, type Provider, RESET, component, pass, on, emit } from './src/component';
export { type LogLevel, LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR, log } from './src/core/log';
export { type Context, type UnknownContext, type ContextType, provide, consume } from './src/core/context';
export { asBoolean, asInteger, asNumber, asString, asEnum, asJSON } from './src/lib/parsers';
export { type SignalLike, type ElementUpdater, type NodeInserter, updateElement, insertNode, setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle, dangerouslySetInnerHTML, insertTemplate, createElement, removeElement } from './src/lib/effects';

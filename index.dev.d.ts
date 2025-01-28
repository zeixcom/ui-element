/**
 * @name UIElement DEV_MODE
 * @version 0.10.0
 * @author Esther Brunner
 */
export { type EnqueueDedupe, enqueue, animationFrame } from '@zeix/pulse';
export { type AttributeParser, type ValueOrAttributeParser, UIElement } from './src/ui-element';
export { type StateLike, type StateLikeOrStateLikeFactory, type EventListenerOrEventListenerFactory, UI } from './src/core/ui';
export { LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR, log } from './src/core/log';
export { type UnknownContext, useContext } from './src/core/context';
export { parse, asBoolean, asInteger, asNumber, asString, asEnum, asJSON } from './src/core/parse';
export { type ElementUpdater, emit, updateElement, createElement, removeElement, setText, setProperty, setAttribute, toggleAttribute, toggleClass, setStyle } from './src/lib/effects';

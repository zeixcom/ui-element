import { type Signal } from '@zeix/cause-effect';
import { UIElement } from '../ui-element';
type StateLike<T> = PropertyKey | Signal<T> | ((v?: T) => T);
type ValueOrFactory<T> = T | ((element: Element, index: number) => T);
type StateLikeOrStateLikeFactory<T> = ValueOrFactory<StateLike<T>>;
type EventListenerOrEventListenerFactory = ValueOrFactory<EventListenerOrEventListenerObject>;
declare class UI<T extends Element> {
    readonly host: UIElement;
    readonly targets: T[];
    constructor(host: UIElement, targets?: T[]);
    on(type: keyof ElementEventMap, listener: EventListenerOrEventListenerFactory): UI<T>;
    off(type: keyof ElementEventMap, listener: EventListenerOrEventListenerFactory): UI<T>;
    pass(states: Record<string, StateLikeOrStateLikeFactory<any>>): UI<T>;
    sync(...fns: ((host: UIElement, target: T, index: number) => void)[]): UI<T>;
}
export { type StateLike, type StateLikeOrStateLikeFactory, type EventListenerOrEventListenerFactory, UI };

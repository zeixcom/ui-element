type State<T> = {
    (): T;
    (value: T): void;
};
type Computed<T> = {
    (): T;
};
type Signal<T> = State<T> | Computed<T>;
declare const isFunction: (value: unknown) => value is (...args: any[]) => any;
declare const isDefinedObject: (value: unknown) => value is Record<string, unknown>;
declare const isNumber: (value: unknown) => value is number;
declare const isString: (value: unknown) => value is string;
declare const isSymbol: (value: unknown) => value is symbol;
declare const isPropertyKey: (value: unknown) => value is PropertyKey;
declare const isState: (value: any) => value is State<any>;
declare const isComputed: (value: any) => value is Computed<any>;
declare const isSignal: (value: any) => value is Signal<any>;
export { type State, type Computed, type Signal, isFunction, isDefinedObject, isNumber, isString, isSymbol, isPropertyKey, isState, isComputed, isSignal, };

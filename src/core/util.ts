/* === Types === */

type State<T> = {
	(): T;
	(value: T): void;
}

type Computed<T> = {
	(): T
}

type Signal<T> = State<T> | Computed<T>

/* === Type Assertion Functions === */

const isFunction = /*#__PURE__*/ (value: unknown): value is (...args: any[]) => any =>
    typeof value === 'function'

const isDefinedObject = /*#__PURE__*/ (value: unknown): value is Record<string, unknown> =>
	!!value && typeof value === 'object'

const isNumber = /*#__PURE__*/ (value: unknown): value is number =>
	typeof value === 'number'

const isString = /*#__PURE__*/ (value: unknown): value is string =>
	typeof value === 'string'

const isSymbol = /*#__PURE__*/ (value: unknown): value is symbol =>
	typeof value === 'symbol'

const isPropertyKey = /*#__PURE__*/ (value: unknown): value is PropertyKey =>
	isString(value) || isSymbol(value) || isNumber(value)

const isState = /*#__PURE__*/ (value: any): value is State<any> =>
	isFunction(value) && 'currentValue' in value.bind({})

const isComputed = /*#__PURE__*/ (value: any): value is Computed<any> =>
	isFunction(value) && 'getter' in value

const isSignal = /*#__PURE__*/ (value: any): value is Signal<any> =>
	isFunction(value) && ('currentValue' in value.bind({}) || 'getter' in value)

export {
	type State, type Computed, type Signal,
	isFunction, isDefinedObject, isNumber, isString, isSymbol, isPropertyKey,
	isState, isComputed, isSignal,
}
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

export { isFunction, isDefinedObject, isNumber, isString, isSymbol, isPropertyKey }
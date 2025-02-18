const isFunction = /*#__PURE__*/ <T>(value: unknown): value is (...args: unknown[]) => T =>
    typeof value === 'function'

const isDefinedObject = /*#__PURE__*/ (value: unknown): value is Record<string, unknown> =>
	!!value && typeof value === 'object'

const isString = /*#__PURE__*/ (value: unknown): value is string =>
	typeof value === 'string'

export { isFunction, isDefinedObject, isString }
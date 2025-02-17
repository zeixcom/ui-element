const isFunction = /*#__PURE__*/ <T>(value: unknown): value is (...args: unknown[]) => T =>
    typeof value === 'function'

const isDefinedObject = /*#__PURE__*/ (value: unknown): value is Record<string, unknown> =>
	!!value && typeof value === 'object'

const isString = /*#__PURE__*/ (value: unknown): value is string =>
	typeof value === 'string'

const camelToKebab = /*#__PURE__*/ (str: string): string =>
	str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

export { isFunction, isDefinedObject, isString, camelToKebab }
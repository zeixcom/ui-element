declare const isFunction: <T>(value: unknown) => value is (...args: unknown[]) => T;
declare const isDefinedObject: (value: unknown) => value is Record<string, unknown>;
declare const isString: (value: unknown) => value is string;
declare const camelToKebab: (str: string) => string;
export { isFunction, isDefinedObject, isString, camelToKebab };

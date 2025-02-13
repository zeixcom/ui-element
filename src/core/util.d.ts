declare const isFunction: <T>(value: unknown) => value is (...args: unknown[]) => T;
declare const isDefinedObject: (value: unknown) => value is Record<string, unknown>;
declare const isNumber: (value: unknown) => value is number;
declare const isString: (value: unknown) => value is string;
declare const isSymbol: (value: unknown) => value is symbol;
declare const isPropertyKey: (value: unknown) => value is PropertyKey;
export { isFunction, isDefinedObject, isNumber, isString, isSymbol, isPropertyKey };

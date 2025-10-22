[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / MissingElementError

# Class: MissingElementError

Defined in: [src/core/errors.ts:96](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/errors.ts#L96)

Error thrown when a required desacendent element does not exist in a component's DOM subtree

## Since

0.14.0

## Extends

- `Error`

## Constructors

### Constructor

> **new MissingElementError**(`host`, `selector`, `required`): `MissingElementError`

Defined in: [src/core/errors.ts:102](https://github.com/zeixcom/le-truc/blob/a2e3a5bb1b7ab9e964c80c41c9edbb895cf2ce79/src/core/errors.ts#L102)

#### Parameters

##### host

`HTMLElement`

Host component

##### selector

`string`

Selector used to find the elements

##### required

`string`

Explanation why the element is required

#### Returns

`MissingElementError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: node_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

#### Inherited from

`Error.cause`

---

### message

> **message**: `string`

Defined in: node_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`Error.message`

---

### name

> **name**: `string`

Defined in: node_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.name`

---

### stack?

> `optional` **stack**: `string`

Defined in: node_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`

---

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: node_modules/bun-types/globals.d.ts:990

The maximum number of stack frames to capture.

#### Inherited from

`Error.stackTraceLimit`

## Methods

### captureStackTrace()

#### Call Signature

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Defined in: node_modules/bun-types/globals.d.ts:985

Create .stack property on a target object

##### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

##### Returns

`void`

##### Inherited from

`Error.captureStackTrace`

#### Call Signature

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Defined in: node_modules/@types/node/globals.d.ts:145

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {}
Error.captureStackTrace(myObject)
myObject.stack // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b()
}

function b() {
  c()
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error
  Error.stackTraceLimit = 0
  const error = new Error()
  Error.stackTraceLimit = stackTraceLimit

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b) // Neither function c, nor b is included in the stack trace
  throw error
}

a()
```

##### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

##### Returns

`void`

##### Inherited from

`Error.captureStackTrace`

---

### isError()

> `static` **isError**(`value`): `value is Error`

Defined in: node_modules/bun-types/globals.d.ts:980

Check if a value is an instance of Error

#### Parameters

##### value

`unknown`

The value to check

#### Returns

`value is Error`

True if the value is an instance of Error, false otherwise

#### Inherited from

`Error.isError`

---

### prepareStackTrace()

> `static` **prepareStackTrace**(`err`, `stackTraces`): `any`

Defined in: node_modules/@types/node/globals.d.ts:149

#### Parameters

##### err

`Error`

##### stackTraces

`CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

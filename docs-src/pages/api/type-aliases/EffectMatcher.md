[**@zeix/le-truc**](../README.md)

---

[@zeix/le-truc](../globals.md) / EffectMatcher

# Type Alias: EffectMatcher\<S\>

> **EffectMatcher**\<`S`\> = `object`

Defined in: node_modules/@zeix/cause-effect/src/effect.ts:7

## Name

Le Truc

## Version

0.14.0

## Author

Esther Brunner

## Type Parameters

### S

`S` _extends_ [`Signal`](Signal.md)\<`unknown` & `object`\>[]

## Properties

### err()?

> `optional` **err**: (...`errors`) => [`Cleanup`](Cleanup.md) \| `undefined`

Defined in: node_modules/@zeix/cause-effect/src/effect.ts:10

#### Parameters

##### errors

...`Error`[]

#### Returns

[`Cleanup`](Cleanup.md) \| `undefined`

---

### nil()?

> `optional` **nil**: () => [`Cleanup`](Cleanup.md) \| `undefined`

Defined in: node_modules/@zeix/cause-effect/src/effect.ts:11

#### Returns

[`Cleanup`](Cleanup.md) \| `undefined`

---

### ok()

> **ok**: (...`values`) => [`Cleanup`](Cleanup.md) \| `undefined`

Defined in: node_modules/@zeix/cause-effect/src/effect.ts:9

#### Parameters

##### values

...`SignalValues`\<`S`\>

#### Returns

[`Cleanup`](Cleanup.md) \| `undefined`

---

### signals

> **signals**: `S`

Defined in: node_modules/@zeix/cause-effect/src/effect.ts:8

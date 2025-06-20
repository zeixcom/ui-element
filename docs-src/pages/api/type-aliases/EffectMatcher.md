[**@zeix/ui-element**](../README.md)

***

[@zeix/ui-element](../globals.md) / EffectMatcher

# Type Alias: EffectMatcher\<S\>

> **EffectMatcher**\<`S`\> = `object`

Defined in: node\_modules/@zeix/cause-effect/src/effect.ts:7

## Type Parameters

### S

`S` *extends* [`Signal`](Signal.md)\<\{ \}\>[]

## Properties

### err()?

> `optional` **err**: (...`errors`) => `void` \| [`Cleanup`](Cleanup.md)

Defined in: node\_modules/@zeix/cause-effect/src/effect.ts:10

#### Parameters

##### errors

...`Error`[]

#### Returns

`void` \| [`Cleanup`](Cleanup.md)

***

### nil()?

> `optional` **nil**: () => `void` \| [`Cleanup`](Cleanup.md)

Defined in: node\_modules/@zeix/cause-effect/src/effect.ts:11

#### Returns

`void` \| [`Cleanup`](Cleanup.md)

***

### ok()

> **ok**: (...`values`) => `void` \| [`Cleanup`](Cleanup.md)

Defined in: node\_modules/@zeix/cause-effect/src/effect.ts:9

#### Parameters

##### values

...`SignalValues`\<`S`\>

#### Returns

`void` \| [`Cleanup`](Cleanup.md)

***

### signals

> **signals**: `S`

Defined in: node\_modules/@zeix/cause-effect/src/effect.ts:8

import {
	colorsNamed,
	converter,
	differenceCiede2000,
	nearest,
	type Oklch,
} from 'culori/fn'
import { isNumber, isRecord } from '../../..'
import type { Parser } from '../../../types'

export const CONTRAST_THRESHOLD = 0.71

export const asOklch =
	(
		fallback: Oklch = { mode: 'oklch', l: 0.48, c: 0.23, h: 263 },
	): Parser<Oklch> =>
	(_, v) =>
		(v ? converter('oklch')(v) : fallback) ?? fallback

export const getStepColor = (base: Oklch, step: number): Oklch => {
	const calcLightness = () => {
		const exp = 2 * Math.log((1 - base.l) / base.l)
		return (Math.exp(exp * step) - 1) / (Math.exp(exp) - 1)
	}
	const calcSinChroma = () =>
		(base.c * (8 * Math.sin((Math.PI * (4 * step + 1)) / 6) ** 3 - 1)) / 7
	const stepL = base.l !== 0.5 ? calcLightness() : step
	const stepC = base.c > 0 ? calcSinChroma() : 0
	return { mode: 'oklch', l: stepL, c: stepC, h: base.h }
}

export const isOklch = (value: unknown): value is Oklch =>
	isRecord(value) &&
	'mode' in value &&
	value.mode === 'oklch' &&
	'l' in value &&
	isNumber(value.l) &&
	'c' in value &&
	isNumber(value.c) &&
	'h' in value &&
	isNumber(value.h)

export const nearestNamedColor = (color: Oklch) =>
	nearest(Object.keys(colorsNamed), differenceCiede2000())(color)[0]

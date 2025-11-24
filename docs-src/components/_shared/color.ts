import {
	colorsNamed,
	converter,
	differenceCiede2000,
	formatCss,
	formatHex,
	formatHsl,
	formatRgb,
	nearest,
	type Oklch,
} from 'culori/fn'
import { isNumber, isRecord } from '../../..'
import type { Parser } from '../../../types'

/* === Types === */

type ComponentWithOklchColor = HTMLElement & { color: Oklch }

/* === Constants === */

const CONTRAST_THRESHOLD = 0.71

/* === Functions === */

const asOklch =
	(
		fallback: Oklch = { mode: 'oklch', l: 0.48, c: 0.23, h: 263 },
	): Parser<Oklch> =>
	(_, v) =>
		(v ? converter('oklch')(v) : fallback) ?? fallback

const computedCSS = (el: ComponentWithOklchColor) => () => formatCss(el.color)
const computedHex = (el: ComponentWithOklchColor) => () => formatHex(el.color)
const computedRgb = (el: ComponentWithOklchColor) => () => formatRgb(el.color)
const computedHsl = (el: ComponentWithOklchColor) => () => formatHsl(el.color)
const computedLightness = (el: ComponentWithOklchColor) => () => el.color.l
const computedChroma = (el: ComponentWithOklchColor) => () => el.color.c
const computedHue = (el: ComponentWithOklchColor) => () => el.color.h ?? 0
const computedNearestNamedColor = (el: ComponentWithOklchColor) => () =>
	nearest(Object.keys(colorsNamed), differenceCiede2000())(el.color)[0]

const getStepColor = (base: Oklch, step: number): Oklch => {
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

const isOklch = (value: unknown): value is Oklch =>
	isRecord(value) &&
	'mode' in value &&
	value.mode === 'oklch' &&
	'l' in value &&
	isNumber(value.l) &&
	'c' in value &&
	isNumber(value.c) &&
	('h' in value ? isNumber(value.h) : true)

export {
	type ComponentWithOklchColor,
	CONTRAST_THRESHOLD,
	asOklch,
	computedCSS,
	computedHex,
	computedRgb,
	computedHsl,
	computedLightness,
	computedChroma,
	computedHue,
	computedNearestNamedColor,
	getStepColor,
	isOklch,
}

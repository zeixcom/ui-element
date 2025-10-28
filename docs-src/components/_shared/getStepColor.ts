import type { Oklch } from 'culori'

export const getStepColor = (base: Oklch, step: number): Oklch => {
	const calcLightness = () => {
		const l = base.l
		const exp = 2 * Math.log((1 - l) / l)
		return (Math.exp(exp * step) - 1) / (Math.exp(exp) - 1)
	}
	const calcSinChroma = () => {
		return (
			(base.c * (8 * Math.sin((Math.PI * (4 * step + 1)) / 6) ** 3 - 1)) /
			7
		)
	}
	const stepL = base.l !== 0.5 ? calcLightness() : step
	const stepC = base.c > 0 ? calcSinChroma() : 0
	return { mode: 'oklch', l: stepL, c: stepC, h: base.h }
}

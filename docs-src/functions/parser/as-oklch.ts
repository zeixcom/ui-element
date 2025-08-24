import { converter, type Oklch } from 'culori/fn'
import type { Parser } from '../../..'

export const asOklch =
	(
		fallback: Oklch = {
			mode: 'oklch',
			l: 0.46,
			c: 0.24,
			h: 265,
		},
	): Parser<Oklch> =>
	(_, v) =>
		(v ? converter('oklch')(v) : fallback) ?? fallback

import {
	asString,
	type Component,
	component,
	fromDOM,
	getText,
	pass,
	setStyle,
	setText,
} from '../../..'
import 'culori/css'
import type { Oklch } from 'culori/fn'
import {
	asOklch,
	computedChroma,
	computedCSS,
	computedHex,
	computedHsl,
	computedHue,
	computedLightness,
	computedRgb,
} from '../_shared/color'

export type ModuleColorinfoProps = {
	name: string
	color: Oklch
	readonly css: string
	readonly hex: string
	readonly rgb: string
	readonly hsl: string
	readonly lightness: number
	readonly chroma: number
	readonly hue: number
}

export default component<ModuleColorinfoProps>(
	'module-colorinfo',
	{
		name: asString(fromDOM({ '.label strong': getText() }, '')),
		color: asOklch(),
		css: computedCSS,
		hex: computedHex,
		rgb: computedRgb,
		hsl: computedHsl,
		lightness: computedLightness,
		chroma: computedChroma,
		hue: computedHue,
	},
	(_, { all, first }) => [
		setStyle('--color-swatch', 'css'),
		setStyle('--color-fallback', 'hex'),
		first('.label strong', setText('name')),
		first('.hex', setText('hex')),
		first('.rgb', setText('rgb')),
		first('.hsl', setText('hsl')),
		all('.lightness', pass({ value: 'lightness' })),
		all('.chroma', pass({ value: 'chroma' })),
		all('.hue', pass({ value: 'hue' })),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'module-colorinfo': Component<ModuleColorinfoProps>
	}
}

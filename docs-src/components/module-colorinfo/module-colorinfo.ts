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
import {
	formatCss,
	formatHex,
	formatHsl,
	formatRgb,
	type Oklch,
} from 'culori/fn'
import { asOklch } from '../../functions/parser/asOklch'

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

export default component(
	'module-colorinfo',
	{
		name: asString(fromDOM({ '.label strong': getText() }, '')),
		color: asOklch(),
		css: (el: HTMLElement & { color: Oklch }) => () => formatCss(el.color),
		hex: (el: HTMLElement & { color: Oklch }) => () => formatHex(el.color),
		rgb: (el: HTMLElement & { color: Oklch }) => () => formatRgb(el.color),
		hsl: (el: HTMLElement & { color: Oklch }) => () => formatHsl(el.color),
		lightness: (el: HTMLElement & { color: Oklch }) => () => el.color.l,
		chroma: (el: HTMLElement & { color: Oklch }) => () => el.color.c,
		hue: (el: HTMLElement & { color: Oklch }) => () => el.color.h ?? 0,
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

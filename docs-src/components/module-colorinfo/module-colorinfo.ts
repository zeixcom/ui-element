import {
	asString,
	type Component,
	component,
	fromDOM,
	getText,
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
}

const fn2Digits = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
	.format
const fn4Digits = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })
	.format

export default component(
	'module-colorinfo',
	{
		name: asString(fromDOM({ '.label strong': getText() }, '')),
		color: asOklch(),
	},
	(el, { first }) => {
		const fns = [
			setStyle('--color-swatch', () => formatCss(el.color)),
			first('.label strong', setText('name')),
		]
		for (const [name, fn] of Object.entries({
			value: () => formatHex(el.color),
			lightness: () => `${fn2Digits(el.color.l * 100)}%`,
			chroma: () => fn4Digits(el.color.c),
			hue: () => `${fn2Digits(el.color.h ?? 0)}°`,
			oklch: () =>
				`oklch(${fn4Digits(el.color.l)} ${fn4Digits(el.color.c)} ${fn2Digits(el.color.h ?? 0)})`,
			rgb: () => formatRgb(el.color),
			hsl: () => formatHsl(el.color),
		})) {
			fns.push(first(`.${name}`, setText(fn)))
		}
		return fns
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-colorinfo': Component<ModuleColorinfoProps>
	}
}

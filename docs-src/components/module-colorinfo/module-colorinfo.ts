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
import { asOklch } from '../../functions/parser/as-oklch'

export type ModuleColorinfoProps = {
	name: string
	color: Oklch
}

const formatNumber = (value: number, precision = 2) => value.toFixed(precision)

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
			lightness: () => `${formatNumber(el.color.l * 100)}%`,
			chroma: () => formatNumber(el.color.c, 4),
			hue: () => `${formatNumber(el.color.h ?? 0)}°`,
			oklch: () =>
				`oklch(${formatNumber(el.color.l, 4)} ${formatNumber(el.color.c, 4)} ${formatNumber(el.color.h ?? 0)})`,
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

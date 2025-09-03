import 'culori/css'
import { formatCss, formatHex, type Oklch } from 'culori/fn'
import {
	asString,
	type Component,
	component,
	effect,
	fromDOM,
	getText,
	setText,
} from '../../..'
import { asOklch } from '../../functions/parser/as-oklch'
import { getStepColor } from '../../functions/shared/get-step-color'

export type CardColorscaleProps = {
	name: string
	color: Oklch
}

const CONTRAST_THRESHOLD = 0.71 // lightness

export default component(
	'card-colorscale',
	{
		name: asString(fromDOM({ '.label strong': getText() }, '')),
		color: asOklch(),
	},
	(el, { first }) => [
		first('.label strong', setText('name')),
		first(
			'.label small',
			setText(() => formatHex(el.color)),
		),
		() =>
			effect((): undefined => {
				const props = new Map()
				const isLight = el.color.l > CONTRAST_THRESHOLD
				const softStep = isLight ? 0.1 : 0.9
				props.set('base', formatCss(el.color))
				props.set('text', isLight ? 'black' : 'white')
				props.set(
					'text-soft',
					formatCss(getStepColor(el.color, softStep)),
				)
				for (let i = 4; i > 0; i--)
					props.set(
						`lighten${i * 20}`,
						formatCss(getStepColor(el.color, (5 + i) / 10)),
					)
				for (let i = 1; i < 5; i++)
					props.set(
						`darken${i * 20}`,
						formatCss(getStepColor(el.color, (5 - i) / 10)),
					)
				for (const [key, value] of props)
					el.style.setProperty(`--color-${key}`, value)
			}),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'card-colorscale': Component<CardColorscaleProps>
	}
}

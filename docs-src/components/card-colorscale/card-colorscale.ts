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
import { asOklch, CONTRAST_THRESHOLD, getStepColor } from '../_shared/color'

export type CardColorscaleProps = {
	name: string
	color: Oklch
}

export default component<CardColorscaleProps>(
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
			effect(() => {
				const setStyleProp = (key: string, value: string) =>
					el.style.setProperty(`--color-${key}`, value)
				setStyleProp('base', formatCss(el.color))
				for (let i = 4; i > 0; i--)
					setStyleProp(
						`lighten${i * 20}`,
						formatCss(getStepColor(el.color, (5 + i) / 10)),
					)
				for (let i = 1; i < 5; i++)
					setStyleProp(
						`darken${i * 20}`,
						formatCss(getStepColor(el.color, (5 - i) / 10)),
					)
				if (el.color.l > CONTRAST_THRESHOLD) {
					setStyleProp('text', 'black')
					setStyleProp('text-soft', 'var(--color-darken80)')
				} else {
					setStyleProp('text', 'white')
					setStyleProp('text-soft', 'var(--color-lighten80)')
				}
			}),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'card-colorscale': Component<CardColorscaleProps>
	}
}

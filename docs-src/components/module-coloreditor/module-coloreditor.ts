import {
	colorsNamed,
	differenceCiede2000,
	nearest,
	type Oklch,
} from 'culori/fn'
import { asString, type Component, component, on, pass } from '../../..'
import { asOklch } from '../../functions/parser/asOklch'
import { getStepColor } from '../../functions/shared/getStepColor'

export type ModuleColoreditorProps = {
	color: Oklch
	name: string
	readonly nearest: string
	readonly lightness: number
	readonly chroma: number
	readonly hue: number
}

const nearestNamedColor = nearest(
	Object.keys(colorsNamed),
	differenceCiede2000(),
)

export default component(
	'module-coloreditor',
	{
		color: asOklch(),
		name: asString('Blue'),
		nearest: (el: HTMLElement & { color: Oklch }) => () =>
			nearestNamedColor(el.color)[0],
		lightness: (el: HTMLElement & { color: Oklch }) => () => el.color.l,
		chroma: (el: HTMLElement & { color: Oklch }) => () => el.color.c,
		hue: (el: HTMLElement & { color: Oklch }) => () => el.color.h,
	},
	(el, { all, first }) => {
		const effects = [
			on('change', ({ event }) => {
				const { target } = event
				if (
					target instanceof HTMLInputElement &&
					target.name === 'name'
				)
					el.name = target.value
			}),
			on('color-change', ({ event }) => ({
				color: (event as CustomEvent).detail,
			})),
			first('form-textbox', [
				pass({
					value: 'name',
					description: () => `Nearest named CSS color: ${el.nearest}`,
				}),
			]),
			first('form-colorgraph', [pass({ color: 'color' })]),
			all('form-colorslider', [pass({ color: 'color' })]),
			first('card-colorscale', [pass({ color: 'color', name: 'name' })]),
			first('module-colorinfo.base', [
				pass({
					color: 'color',
					name: () => el.name + ' 500',
				}),
			]),
		]
		for (let i = 1; i < 5; i++)
			effects.push(
				first(`module-colorinfo.lighten${(5 - i) * 20}`, [
					pass({
						color: () => getStepColor(el.color, 1 - i / 10),
						name: () => `${el.name} ${i * 100}`,
					}),
				]),
			)
		for (let i = 1; i < 5; i++)
			effects.push(
				first(`module-colorinfo.darken${i * 20}`, [
					pass({
						color: () => getStepColor(el.color, 1 - (i + 5) / 10),
						name: () => `${el.name} ${(i + 5) * 100}`,
					}),
				]),
			)
		return effects
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-coloreditor': Component<ModuleColoreditorProps>
	}
}

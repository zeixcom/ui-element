import type { Oklch } from 'culori/fn'
import { asString, type Component, component, isString, pass } from '../../..'
import {
	asOklch,
	getStepColor,
	isOklch,
	nearestNamedColor,
} from '../_shared/color'

export type ModuleColoreditorProps = {
	color: Oklch
	name: string
	readonly nearest: string
	readonly lightness: number
	readonly chroma: number
	readonly hue: number
}

export default component(
	'module-coloreditor',
	{
		color: asOklch(),
		name: asString('Blue'),
		nearest: (el: HTMLElement & { color: Oklch }) => () =>
			nearestNamedColor(el.color),
		lightness: (el: HTMLElement & { color: Oklch }) => () => el.color.l,
		chroma: (el: HTMLElement & { color: Oklch }) => () => el.color.c,
		hue: (el: HTMLElement & { color: Oklch }) => () => el.color.h,
	},
	(el, { all, first }) => [
		// Pass mutable name property and read-only description to form-textbox
		first(
			'form-textbox',
			pass({
				value: [
					'name',
					value => {
						if (isString(value)) el.name = value
					},
				],
				description: () => `Nearest named CSS color: ${el.nearest}`,
			}),
		),

		// Pass mutable color property to form-colorgraph and form-colorslider
		first(
			'form-colorgraph',
			pass({
				color: [
					'color',
					value => {
						if (isOklch(value)) el.color = value
					},
				],
			}),
		),
		all(
			'form-colorslider',
			pass({
				color: [
					'color',
					value => {
						if (isOklch(value)) el.color = value
					},
				],
			}),
		),

		// Pass read-only color and name properties to card-colorscale
		first(
			'card-colorscale',
			pass({
				color: 'color',
				name: 'name',
			}),
		),

		// Pass read-only color and name properties to module-colorinfo
		all(
			'module-colorinfo',
			pass(target => {
				const grade = target.dataset.grade
				const numGrade = parseInt(grade || '500')
				if (
					!Number.isInteger(numGrade) ||
					numGrade < 0 ||
					numGrade > 1000 ||
					numGrade === 500
				)
					return {
						color: 'color' as keyof ModuleColoreditorProps,
						name: () => `${el.name} 500`,
					}
				else
					return {
						color: () => getStepColor(el.color, numGrade / 1000),
						name: () => `${el.name} ${grade}`,
					}
			}),
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'module-coloreditor': Component<ModuleColoreditorProps>
	}
}

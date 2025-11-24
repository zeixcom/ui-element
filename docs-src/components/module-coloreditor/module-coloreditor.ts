import type { Oklch } from 'culori/fn'
import { asString, type Component, component, isString, pass } from '../../..'
import {
	asOklch,
	computedChroma,
	computedHue,
	computedLightness,
	computedNearestNamedColor,
	getStepColor,
	isOklch,
} from '../_shared/color'

export type ModuleColoreditorProps = {
	color: Oklch
	name: string
	readonly nearest: string
	readonly lightness: number
	readonly chroma: number
	readonly hue: number
}

export default component<ModuleColoreditorProps>(
	'module-coloreditor',
	{
		color: asOklch(),
		name: asString('Blue'),
		nearest: computedNearestNamedColor,
		lightness: computedLightness,
		chroma: computedChroma,
		hue: computedHue,
	},
	(el, { all, first }) => {
		const setName = (value: string) => {
			if (isString(value)) el.name = value
		}
		const setColor = (value: Oklch) => {
			if (isOklch(value)) el.color = value
		}

		const calcNameAndColor = (target: HTMLElement) => {
			const grade = target.dataset.grade
			const numGrade = parseInt(grade || '500')
			return !Number.isInteger(numGrade) ||
				numGrade < 0 ||
				numGrade > 1000 ||
				numGrade === 500
				? {
						color: 'color' as keyof ModuleColoreditorProps,
						name: () => `${el.name} 500`,
					}
				: {
						color: () => getStepColor(el.color, numGrade / 1000),
						name: () => `${el.name} ${grade}`,
					}
		}

		return [
			// Pass mutable name property and read-only description to form-textbox
			first(
				'form-textbox',
				pass({
					value: ['name', setName],
					description: () => `Nearest named CSS color: ${el.nearest}`,
				}),
			),

			// Pass mutable color property to form-colorgraph and form-colorslider
			first(
				'form-colorgraph',
				pass({
					color: ['color', setColor],
				}),
			),
			all(
				'form-colorslider',
				pass({
					color: ['color', setColor],
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
			all('module-colorinfo', pass(calcNameAndColor)),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-coloreditor': Component<ModuleColoreditorProps>
	}
}

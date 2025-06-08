import {
	type Component,
	asString,
	component,
	on,
	setAttribute,
	setProperty,
	state,
	toggleClass,
} from '../../..'
import { manageFocusOnKeydown } from '../../functions/event-listener/manage-focus-on-keydown'

export type InputRadiogroupProps = {
	value: string
}

export default component(
	'input-radiogroup',
	{
		value: asString(),
	},
	(el, { all }) => {
		const inputs = Array.from(el.querySelectorAll('input'))
		const focusIndex = state(inputs.findIndex(input => input.checked))
		return [
			setAttribute('value'),
			manageFocusOnKeydown(inputs, focusIndex),
			all(
				'input',
				on('change', e => {
					const input = e.target as HTMLInputElement
					el.value = input.value
					focusIndex.set(inputs.findIndex(input => input.checked))
				}),
				on('keyup', (e: KeyboardEvent) => {
					if (e.key === 'Enter' && e.target)
						(e.target as HTMLInputElement).click()
				}),
				setProperty('tabIndex', target =>
					target.value === el.value ? 0 : -1,
				),
			),
			all(
				'label',
				toggleClass(
					'selected',
					target => el.value === target.querySelector('input')?.value,
				),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'input-radiogroup': Component<InputRadiogroupProps>
	}
}

import {
	type Component,
	component,
	fromDOM,
	fromEvents,
	getProperty,
	setAttribute,
	setProperty,
	toggleClass,
} from '../../..'
import { manageFocusOnKeydown } from '../../functions/event-listener/manage-focus-on-keydown'

export type FormRadiogroupProps = {
	readonly value: string
}

export default component(
	'form-radiogroup',
	{
		value: fromEvents(
			fromDOM<string>('', {
				'input:checked': getProperty<HTMLInputElement, 'value'>(
					'value',
				),
			}),
			'input',
			{
				change: ({ target }) => target.value,
				keyup: ({ event, target }) => {
					if (event.key === 'Enter') target.click()
				},
			},
		),
	},
	(el, { all, useElements }) => {
		const radios = Array.from(useElements('input'))

		return [
			setAttribute('value'),
			all('input', [
				setProperty('tabIndex', target =>
					target.value === el.value ? 0 : -1,
				),
				...manageFocusOnKeydown(radios, inputs =>
					inputs.findIndex(input => input.checked),
				),
			]),
			all('label', [
				toggleClass(
					'selected',
					target => el.value === target.querySelector('input')?.value,
				),
			]),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-radiogroup': Component<FormRadiogroupProps>
	}
}

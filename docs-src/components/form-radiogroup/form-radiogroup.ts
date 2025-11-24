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
import { onKeydownManageFocus } from '../_shared/onKeydownManageFocus'

export type FormRadiogroupProps = {
	readonly value: string
}

export default component<FormRadiogroupProps>(
	'form-radiogroup',
	{
		value: fromEvents(
			'input',
			{
				change: ({ target }) => target.value,
				keyup: ({ event, target }) => {
					if (event.key === 'Enter') target.click()
				},
			},
			fromDOM({ 'input:checked': getProperty('value') }, ''),
		),
	},
	(el, { all, useElements }) => {
		const radios = useElements('input', 'Native radio buttons needed.')

		return [
			setAttribute('value'),
			all('input', [
				setProperty('tabIndex', target =>
					target.value === el.value ? 0 : -1,
				),
				...onKeydownManageFocus(radios, inputs =>
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

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
	value: string
}

const changeHandler = ({ target }) => target.value

const keyupHandler = ({ event, target }) => {
	if (event.key === 'Enter') target.click()
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
				change: changeHandler,
				keyup: keyupHandler,
			},
		),
	},
	(el, { all }) => [
		setAttribute('value'),
		all(
			'input',
			setProperty('tabIndex', target =>
				target.value === el.value ? 0 : -1,
			),
			...manageFocusOnKeydown(
				Array.from(el.querySelectorAll<HTMLInputElement>('input')),
				inputs => inputs.findIndex(input => input.checked),
			),
		),
		all(
			'label',
			toggleClass(
				'selected',
				target => el.value === target.querySelector('input')?.value,
			),
		),
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'form-radiogroup': Component<FormRadiogroupProps>
	}
}

import {
	type Component,
	asBoolean,
	asString,
	component,
	fromDOM,
	fromEvents,
	getLabel,
	getProperty,
	setText,
	toggleAttribute,
} from '../../..'

export type FormCheckboxProps = {
	readonly checked: boolean
	label: string
}

export default component(
	'form-checkbox',
	{
		checked: fromEvents(
			fromDOM(asBoolean(), { input: getProperty('checked') }),
			'input',
			{
				change: ({ target }) => target.checked,
			},
		),
		label: asString(getLabel('input')),
	},
	(_, { first, useElement }) => {
		useElement('input[type="checkbox"]', 'Native checkbox needed.')
		return [toggleAttribute('checked'), first('.label', setText('label'))]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-checkbox': Component<FormCheckboxProps>
	}
}

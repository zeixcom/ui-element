import {
	type Component,
	asBoolean,
	asString,
	component,
	fromDOM,
	fromEvents,
	getLabel,
	getProperty,
	requireElement,
	setText,
	toggleAttribute,
} from '../../..'

export type FormCheckboxProps = {
	checked: boolean
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
	(el, { first }) => {
		requireElement(el, 'input[type="checkbox"]')

		return [toggleAttribute('checked'), first('.label', setText('label'))]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-checkbox': Component<FormCheckboxProps>
	}
}

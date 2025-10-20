import {
	type Component,
	component,
	fromSelector,
	on,
	pass,
	setAttribute,
} from '../../..'

export type ModuleTodoProps = {
	readonly active: HTMLElement[]
	readonly completed: HTMLElement[]
}

import '../form-textbox/form-textbox'

export default component(
	'module-todo',
	{
		active: fromSelector('form-checkbox:not([checked])'),
		completed: fromSelector('form-checkbox[checked]'),
	},
	(el, { first, useElement }) => {
		const textbox = useElement(
			'form-textbox',
			'Add <form-textbox> component to enter a new todo item.',
		)
		const insert = useElement(
			'module-insert',
			'Add <module-insert> component to insert new todo items.',
		)
		const filter = useElement('form-radiogroup')

		return [
			// Control todo input form
			first('basic-button.submit', [
				pass({ disabled: () => !textbox.length }),
			]),
			first('form', [
				on('submit', ({ event }) => {
					event.preventDefault()
					const value = textbox.value.trim()
					if (!value) return
					insert.add(item => {
						item.querySelector('slot')?.replaceWith(value)
					})
					textbox.clear()
				}),
			]),

			// Control todo list
			first(
				'ol',
				setAttribute('filter', () => filter?.value || 'all'),
				'Needed to display the list of todos.',
			),

			// Update count elements
			first('basic-pluralize', [pass({ count: () => el.active.length })]),

			// Control clear-completed button
			first('basic-button.clear-completed', [
				pass({
					disabled: () => !el.completed.length,
					badge: () =>
						el.completed.length > 0
							? String(el.completed.length)
							: '',
				}),
				on('click', () => {
					const items = Array.from(el.querySelectorAll('ol li'))
					for (let i = items.length - 1; i >= 0; i--) {
						const task = items[i].querySelector('form-checkbox')
						if (task?.checked) items[i].remove()
					}
				}),
			]),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-todo': Component<ModuleTodoProps>
	}
}

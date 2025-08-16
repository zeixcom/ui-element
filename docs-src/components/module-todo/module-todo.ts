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

export default component(
	'module-todo',
	{
		active: fromSelector('form-checkbox:not([checked])'),
		completed: fromSelector('form-checkbox[checked]'),
	},
	(el, { first, useElement }) => {
		const textbox = useElement(
			'form-textbox',
			'Needed to enter a new todo item.',
		)
		const template = useElement(
			'template',
			'Needed to define the list item template.',
		)
		const list = useElement('ol', 'Needed to display the list of todos.')
		const filter = useElement('form-radiogroup')

		return [
			// Control todo input form
			first('basic-button.submit', [
				pass({ disabled: () => !textbox.length }),
			]),
			first('form', [
				on('submit', ({ event }) => {
					event.preventDefault()
					queueMicrotask(() => {
						const value = textbox.value.trim()
						if (!value) return
						const li = document.importNode(
							template.content,
							true,
						).firstElementChild
						if (!(li instanceof HTMLLIElement))
							throw new Error(
								'Invalid template for list item; expected <li>',
							)
						li.querySelector('slot')?.replaceWith(value)
						list.append(li)
						textbox.clear()
					})
				}),
			]),

			// Control todo list
			first('ol', [
				setAttribute('filter', () => filter?.value || 'all'),
				on('click', ({ event }) => {
					const target = event.target as HTMLElement
					if (target.closest('button')) target.closest('li')!.remove()
				}),
			]),

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

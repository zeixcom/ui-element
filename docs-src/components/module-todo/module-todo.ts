import {
	type Component,
	component,
	fromSelector,
	on,
	pass,
	read,
	setAttribute,
	useComponent,
	useElement,
} from '../../..'
// import '../basic-button/basic-button'
// import '../form-checkbox/form-checkbox'
// import '../form-textbox/form-textbox'
// import '../form-radiogroup/form-radiogroup'

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
	async (el, { first }) => {
		const textbox = await useComponent(
			el,
			'form-textbox',
			'Needed to enter a new todo item.',
		)
		const template = useElement(
			el,
			'template',
			'Needed to define the list item template.',
		)
		const list = useElement(
			el,
			'ol',
			'Needed to display the list of todos.',
		)

		return [
			// Control todo input form
			first(
				'.submit',
				pass({
					disabled: () => !textbox.length,
				}),
			),
			first(
				'form',
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
			),

			// Control todo list
			first('ol', [
				setAttribute(
					'filter',
					read(el.querySelector('form-radiogroup'), 'value', 'all'),
				),
				on('click', ({ event }) => {
					const target = event.target
					if (target && target instanceof HTMLButtonElement)
						target.closest('li')!.remove()
				}),
			]),

			// Update count elements
			first('basic-pluralize', pass({ count: () => el.active.length })),

			// Control clear-completed button
			first('.clear-completed', [
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

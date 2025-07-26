import {
	type Component,
	component,
	fromSelector,
	on,
	setAttribute,
	setProperty,
	useElement,
} from '../../..'
import { BasicButtonProps } from '../basic-button/basic-button'

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
	(el, { first }) => {
		const textbox = useElement(
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
		const filter = useElement(el, 'form-radiogroup')

		return [
			// Control todo input form
			first<Component<BasicButtonProps>>(
				'.submit',
				setProperty('disabled', () => !textbox.length),
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
				setAttribute('filter', () => filter?.value ?? 'all'),
				on('click', ({ event }) => {
					const target = event.target
					if (target && target instanceof HTMLButtonElement)
						target.closest('li')!.remove()
				}),
			]),

			// Update count elements
			first(
				'basic-pluralize',
				setProperty('count', () => el.active.length),
			),

			// Control clear-completed button
			first<Component<BasicButtonProps>>('.clear-completed', [
				setProperty('disabled', () => !el.completed.length),
				setProperty('badge', () =>
					el.completed.length > 0 ? String(el.completed.length) : '',
				),
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
	[
		'basic-button',
		'basic-pluralize',
		'form-checkbox',
		'form-radiogroup',
		'form-textbox',
	],
)

declare global {
	interface HTMLElementTagNameMap {
		'module-todo': Component<ModuleTodoProps>
	}
}

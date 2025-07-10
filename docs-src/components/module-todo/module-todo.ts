import {
	type Component,
	component,
	fromSelector,
	on,
	pass,
	read,
	requireDescendant,
	setAttribute,
	setText,
	show,
} from '../../..'
import type { BasicButtonProps } from '../basic-button/basic-button'
import type { FormCheckboxProps } from '../form-checkbox/form-checkbox'
import '../form-textbox/form-textbox'

export type ModuleTodoProps = {
	active: HTMLElement[]
	completed: HTMLElement[]
}

export default component(
	'module-todo',
	{
		active: fromSelector('form-checkbox:not([checked])'),
		completed: fromSelector('form-checkbox[checked]'),
	},
	(el, { first }) => {
		const textbox = requireDescendant(el, 'form-textbox')
		const template = requireDescendant(el, 'template')
		const list = requireDescendant(el, 'ol')

		return [
			// Control todo input form
			first<Component<BasicButtonProps>>(
				'.submit',
				pass({
					disabled: () => !textbox.length,
				}),
			),
			first(
				'form',
				on('submit', (e: Event) => {
					e.preventDefault()
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
			first(
				'ol',
				setAttribute('filter', () =>
					read(el, 'form-radiogroup', (radiogroup, upgraded) =>
						radiogroup && upgraded ? radiogroup.value : 'all',
					),
				),
				on('click', (e: Event) => {
					const target = e.target as HTMLElement
					if (target.localName === 'button')
						target.closest('li')!.remove()
				}),
			),

			// Update count elements
			first(
				'.count',
				setText(() => String(el.active.length)),
			),
			first(
				'.singular',
				show(() => el.active.length === 1),
			),
			first(
				'.plural',
				show(() => el.active.length > 1),
			),
			first(
				'.remaining',
				show(() => !!el.active.length),
			),
			first(
				'.all-done',
				show(() => !el.active.length),
			),

			// Control clear-completed button
			first<Component<BasicButtonProps>>(
				'.clear-completed',
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
						const task = items[i].querySelector<
							HTMLElement & FormCheckboxProps
						>('form-checkbox')
						if (task?.checked) items[i].remove()
					}
				}),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-todo': Component<ModuleTodoProps>
	}
}

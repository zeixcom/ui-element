import {
	type Component,
	component,
	fromDescendant,
	fromSelector,
	on,
	setAttribute,
	setProperty,
	setText,
	show,
} from '../../..'
import type { BasicButtonProps } from '../basic-button/basic-button'
import type { FormCheckboxProps } from '../form-checkbox/form-checkbox'
import '../form-radiogroup/form-radiogroup'
import type { FormTextboxProps } from '../form-textbox/form-textbox'

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
		const input =
			el.querySelector<Component<FormTextboxProps>>('form-textbox')
		if (!input) throw new Error('No input field found')
		const template = el.querySelector('template')
		if (!template) throw new Error('No template found')
		const list = el.querySelector('ol')
		if (!list) throw new Error('No list found')

		const inputLength = fromDescendant('form-textbox', 'length', 0)(el)
		const filterValue = fromDescendant(
			'form-radiogroup',
			'value',
			'all',
		)(el)

		return [
			// Control todo input form
			first<Component<BasicButtonProps>>(
				'.submit',
				setProperty('disabled', () => !inputLength()),
			),
			first(
				'form',
				on('submit', (e: Event) => {
					e.preventDefault()
					queueMicrotask(() => {
						const value = input.value.toString().trim()
						if (!value) return
						const li = document.importNode(
							template.content,
							true,
						).firstElementChild
						if (!(li instanceof HTMLLIElement))
							throw new Error(
								'Invalid template for list item; expected <li>',
							)
						li.querySelector('slot')?.replaceWith(
							String(input.value.trim()),
						)
						list.append(li)
						input.clear()
					})
				}),
			),

			// Control todo list
			first(
				'ol',
				setAttribute('filter', filterValue),
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
				setProperty('disabled', () => !el.completed.length),
				setProperty('badge', () =>
					el.completed.length > 0 ? String(el.completed.length) : '',
				),
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

import {
	type Component,
	component,
	on,
	setAttribute,
	setProperty,
	setText,
} from '../../../'
import { selectChecked } from '../../functions/signal-producer/select-checked'
import type { InputButtonProps } from '../input-button/input-button'
import type { InputFieldProps } from '../input-field/input-field'

export type TodoAppProps = {
	active: HTMLElement[]
	completed: HTMLElement[]
}

export default component(
	'todo-app',
	{
		active: selectChecked('input-checkbox', false),
		completed: selectChecked('input-checkbox', true),
	},
	(el, { first }) => {
		const input =
			el.querySelector<Component<InputFieldProps>>('input-field')
		if (!input) throw new Error('No input field found')
		const template = el.querySelector('template')
		if (!template) throw new Error('No template found')
		const list = el.querySelector('ol')
		if (!list) throw new Error('No list found')

		return [
			// Control todo input form
			first<Component<InputButtonProps>>(
				'.submit',
				setProperty('disabled', () => !input.length),
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
						li
							.querySelector('slot')
							?.replaceWith(String(input.value))
						list.append(li)
						input.clear()
					})
				}),
			),

			// Control todo list
			first(
				'ol',
				setAttribute(
					'filter',
					() => el.querySelector('input-radiogroup')?.value ?? 'all',
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
				setProperty('hidden', () => el.active.length > 1),
			),
			first(
				'.plural',
				setProperty('hidden', () => el.active.length === 1),
			),
			first(
				'.remaining',
				setProperty('hidden', () => !el.active.length),
			),
			first(
				'.all-done',
				setProperty('hidden', () => !!el.active.length),
			),

			// Control clear-completed button
			first<Component<InputButtonProps>>(
				'.clear-completed',
				setProperty('disabled', () => !el.completed.length),
				setProperty('badge', () =>
					el.completed.length > 0 ? String(el.completed.length) : '',
				),
				on('click', () => {
					const items = Array.from(el.querySelectorAll('ol li'))
					for (let i = items.length - 1; i >= 0; i--) {
						const task = items[i].querySelector('input-checkbox')
						if (task?.checked) items[i].remove()
					}
				}),
			),
		]
	},
)

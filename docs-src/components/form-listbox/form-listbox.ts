import {
	type Component,
	component,
	computed,
	effect,
	on,
	setAttribute,
	setProperty,
	show,
	state,
	UNSET,
} from '../../..'
import { asURL } from '../../functions/parser/asURL'
import { fetchWithCache } from '../../functions/shared/fetchWithCache'

type FormListboxOption = {
	value: string
	label: string
}

type FormListboxGroups = Record<
	string,
	{
		label: string
		items: FormListboxOption[]
	}
>

type FormListboxProps = {
	value: string
	src: { value: string; error: string }
}

const ENTER_KEY = 'Enter'
const DECREMENT_KEYS = ['ArrowLeft', 'ArrowUp']
const INCREMENT_KEYS = ['ArrowRight', 'ArrowDown']
const FIRST_KEY = 'Home'
const LAST_KEY = 'End'
const FOCUS_KEYS = [...DECREMENT_KEYS, ...INCREMENT_KEYS, FIRST_KEY, LAST_KEY]

component(
	'form-listbox',
	{
		value: '',
		src: asURL,
	},
	(el, { all, first }) => {
		const error = state('')
		const options = computed<FormListboxGroups | FormListboxOption[]>(
			async abort => {
				const url = el.src.value
				if (el.src.error || !url) {
					error.set(el.src.error ?? 'No URL provided')
					return []
				}

				try {
					error.set('')
					const { content } = await fetchWithCache(
						url,
						abort,
						response => response.json(),
					)
					return content
				} catch (err) {
					error.set(err instanceof Error ? err.message : String(err))
					return []
				}
			},
		)
		const loading = () => options.get() === UNSET

		const renderOptions = (items: FormListboxOption[]) =>
			items
				.map(
					item => `
					<div role="option" tabindex="-1" value="${item.value}">${item.label}</div>`,
				)
				.join('')

		const renderGroups = (items: FormListboxGroups) => {
			const id = el.id
			let html = ''
			for (const [key, value] of Object.entries(items)) {
				html += `
				<div role="group" aria-labelledby="${id}-${key}">
					<div role="presentation" id="${id}-${key}">${value.label}</div>
					${renderOptions(value.items)}
				</div>`
			}
			return html
		}

		let index = -1
		let elements: HTMLElement[] = []

		return [
			setAttribute('value'),
			on('click', ({ event }) => {
				const target = event.target as HTMLElement
				if (target.closest('[role="option"]')) {
					el.value = target.getAttribute('value') ?? ''
					index = elements.indexOf(target)
				}
			}),
			on('keydown', ({ event }) => {
				const { key } = event
				if (!FOCUS_KEYS.includes(key)) return
				event.preventDefault()
				event.stopPropagation()
				index =
					key === FIRST_KEY
						? 0
						: key === LAST_KEY
							? elements.length - 1
							: Math.min(
									Math.max(
										index +
											(INCREMENT_KEYS.includes(key)
												? 1
												: -1),
										0,
									),
									elements.length - 1,
								)
				if (elements[index]) elements[index].focus()
			}),
			on('keyup', ({ event }) => {
				const { key } = event
				if (key !== ENTER_KEY) return
				event.preventDefault()
				event.stopPropagation()
				if (elements[index])
					el.value = elements[index].getAttribute('value') ?? ''
			}),
			first('card-callout', [show(() => loading() || !!error.get())]),
			first('.loading', [show(() => loading())]),
			first('.error', [show(() => !!error.get())]),
			first(
				'[role="listbox"]',
				[
					show(() => !loading() && !error.get()),
					(_, target) =>
						effect((): undefined => {
							const items = options.get()
							if (!items === UNSET) return
							target.innerHTML = Array.isArray(items)
								? renderOptions(items)
								: renderGroups(items)
							elements = Array.from(
								target.querySelectorAll<HTMLElement>(
									'[role="option"]',
								),
							)
						}),
				],
				'Needed to display list of options.',
			),
			all('[role="option"]', [
				setProperty('tabIndex', target =>
					el.value === target.getAttribute('value') ? 0 : -1,
				),
				setProperty('ariaSelected', target =>
					String(el.value === target.getAttribute('value')),
				),
			]),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-listbox': Component<FormListboxProps>
	}
}

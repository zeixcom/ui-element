import {
	type Component,
	component,
	computed,
	dangerouslySetInnerHTML,
	effect,
	emitEvent,
	fromSelector,
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
	filter: string
	src: { value: string; error: string }
	options: HTMLElement[]
	index: number
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
		filter: '',
		src: asURL,
		options: fromSelector<HTMLElement>('[role="option"]:not([hidden])'),
		index: -1,
	},
	(el, { all, first }) => {
		const error = state('')

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

		const html = computed(async abort => {
			const url = el.src.value
			if (el.src.error || !url) {
				error.set(el.src.error ?? 'No URL provided')
				return ''
			}

			try {
				error.set('')
				const { content } = await fetchWithCache(url, abort, response =>
					response.json(),
				)
				return Array.isArray(content)
					? renderOptions(content)
					: renderGroups(content)
			} catch (err) {
				error.set(err instanceof Error ? err.message : String(err))
				return ''
			}
		})
		const loading = () => html.get() === UNSET
		const isSelected = (target: HTMLElement) =>
			el.value === target.getAttribute('value')

		return [
			setAttribute('value'),
			on('click', ({ event }) => {
				const option = (event.target as HTMLElement).closest(
					'[role="option"]',
				) as HTMLElement
				if (option) {
					el.value = option.getAttribute('value') ?? ''
					el.index = el.options.indexOf(option)
				}
			}),
			on('keydown', ({ event }) => {
				const { key } = event
				if (!FOCUS_KEYS.includes(key)) return
				event.preventDefault()
				event.stopPropagation()
				const max = el.options.length - 1
				el.index =
					key === FIRST_KEY
						? 0
						: key === LAST_KEY
							? max
							: Math.min(
									Math.max(
										el.index +
											(INCREMENT_KEYS.includes(key)
												? 1
												: -1),
										0,
									),
									max,
								)
				if (el.options[el.index]) el.options[el.index].focus()
			}),
			on('keyup', ({ event }) => {
				const { key } = event
				if (key !== ENTER_KEY) return
				event.preventDefault()
				event.stopPropagation()
				if (el.options[el.index])
					el.value = el.options[el.index].getAttribute('value') ?? ''
			}),
			emitEvent('form-listbox.change', 'value'),
			() =>
				effect((): undefined => {
					const current = document.activeElement
					if (current && el.contains(current))
						el.index = el.options.indexOf(current as HTMLElement)
				}),
			first('card-callout', [show(() => loading() || !!error.get())]),
			first('.loading', [show(() => loading())]),
			first('.error', [show(() => !!error.get())]),
			first(
				'[role="listbox"]',
				[
					show(() => !loading() && !error.get()),
					dangerouslySetInnerHTML(html),
				],
				'Needed to display list of options.',
			),
			all('[role="group"]', [
				(_, target) => {
					const visible = fromSelector(
						'[role="option"]:not([hidden])',
					)(target)
					return effect((): undefined => {
						target.hidden = !visible.get().length
					})
				},
			]),
			all('[role="option"]', [
				setProperty('tabIndex', target =>
					isSelected(target) ? 0 : -1,
				),
				show(target =>
					target.textContent
						?.trim()
						.toLowerCase()
						.includes(el.filter.toLowerCase()),
				),
				dangerouslySetInnerHTML(target => {
					const filter = el.filter
					const text = target.textContent
					if (!filter.length || !text) return text
					const regex = new RegExp(
						filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
						'gi',
					)
					return text.replace(regex, match => `<mark>${match}</mark>`)
				}),
				setProperty('ariaSelected', target =>
					String(isSelected(target)),
				),
			]),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'form-listbox': Component<FormListboxProps>
	}
	interface HTMLElementEventMap {
		'form-listbox.change': CustomEvent<string>
	}
}

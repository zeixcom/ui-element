import {
	asInteger,
	type Component,
	component,
	fromSelector,
	MissingElementError,
	on,
	pass,
} from '../../..'

type ModuleInsertProps = {
	items: HTMLElement[]
	add: (process?: (item: HTMLElement) => void) => void
	delete: (key: string) => void
}

const MAX_ITEMS = 1000

export default component<ModuleInsertProps>(
	'module-insert',
	{
		items: fromSelector('[data-container] > *'),
		add: (
			el: HTMLElement & {
				add: (process?: (item: HTMLElement) => void) => void
			},
		) => {
			const templateId = el.getAttribute('template')
			const template = templateId
				? document.getElementById(templateId)
				: el.querySelector('template')
			if (!template || !(template instanceof HTMLTemplateElement))
				throw new MissingElementError(
					el,
					'template',
					'Needed to generate items.',
				)
			const container = el.querySelector('[data-container]')
			if (!container)
				throw new MissingElementError(
					el,
					'[data-container]',
					'Needed as container for items.',
				)

			let key = 0
			el.add = (process?: (item: HTMLElement) => void) => {
				const item = (
					template.content.cloneNode(true) as DocumentFragment
				).firstElementChild
				if (item && item instanceof HTMLElement) {
					item.dataset.key = String(key++)
					if (process) process(item)
					container.append(item)
				} else {
					throw new MissingElementError(
						el,
						'*',
						'Template does not contain an item element.',
					)
				}
			}
		},
		delete: (
			el: HTMLElement & {
				delete: (key: string) => void
			},
		) => {
			el.delete = (key: string) => {
				const item = el.querySelector(`[data-key="${key}"]`)
				if (item) item.remove()
			}
		},
	},
	(el, { first }) => {
		const max = asInteger(MAX_ITEMS)(el, el.getAttribute('max'))

		return [
			first('basic-button.add', [
				on('click', () => {
					el.add()
				}),
				pass({
					disabled: () => el.items.length >= max,
				}),
			]),
			on('click', ({ event }) => {
				const target = event.target
				if (
					target instanceof HTMLElement &&
					target?.closest('basic-button.delete')
				) {
					event.stopPropagation()
					target.closest('[data-key]')?.remove()
				}
			}),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-insert': Component<ModuleInsertProps>
	}
}

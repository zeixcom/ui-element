import { type Component, component, on, setProperty } from '../../..'
import { manageArrowKeyFocus } from '../../functions/event-listener/manage-arrow-key-focus'

export type TabGroupProps = {
	selected: string
}

export default component(
	'tab-group',
	{
		selected: '',
	},
	(el, { all, first }) => {
		el.selected =
			el
				.querySelector('[role="tab"][aria-selected="true"]')
				?.getAttribute('aria-controls') ?? ''
		const isSelected = (target: Element) =>
			el.selected === target.getAttribute('aria-controls')
		const tabs = Array.from(
			el.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
		)
		let focusIndex = 0

		return [
			first(
				'[role="tablist"]',
				on('keydown', manageArrowKeyFocus(tabs, focusIndex)),
			),
			all<HTMLButtonElement>(
				'[role="tab"]',
				on('click', (e: Event) => {
					el.selected =
						(e.currentTarget as HTMLElement).getAttribute(
							'aria-controls',
						) ?? ''
					focusIndex = tabs.findIndex(tab => isSelected(tab))
				}),
				setProperty('ariaSelected', target =>
					String(isSelected(target)),
				),
				setProperty('tabIndex', target =>
					isSelected(target) ? 0 : -1,
				),
			),
			all(
				'[role="tabpanel"]',
				setProperty('hidden', target => el.selected !== target.id),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'tab-list': Component<TabGroupProps>
	}
}

import {
	type Component,
	component,
	on,
	setProperty,
	show,
	state,
} from '../../..'
import { manageFocusOnKeydown } from '../../functions/event-listener/manage-focus-on-keydown'

export type TabGroupProps = {
	selected: string
}

export default component(
	'tab-group',
	{
		selected: '',
	},
	(el, { all, first }) => {
		const getAriaControls = (target: Element) =>
			target?.getAttribute('aria-controls') ?? ''
		const tabs = Array.from(
			el.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
		)
		const focusIndex = state(
			tabs.findIndex(tab => tab.ariaSelected === 'true'),
		)
		el.selected = getAriaControls(tabs[focusIndex.get()])

		return [
			first('[role="tablist"]', manageFocusOnKeydown(tabs, focusIndex)),
			all<HTMLButtonElement>(
				'[role="tab"]',
				on('click', (e: Event) => {
					el.selected = getAriaControls(
						e.currentTarget as HTMLElement,
					)
					focusIndex.set(
						tabs.findIndex(tab => tab === e.currentTarget),
					)
				}),
				setProperty('ariaSelected', target =>
					String(el.selected === getAriaControls(target)),
				),
				setProperty('tabIndex', target =>
					el.selected === getAriaControls(target) ? 0 : -1,
				),
			),
			all(
				'[role="tabpanel"]',
				show(target => el.selected === target.id),
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'tab-list': Component<TabGroupProps>
	}
}

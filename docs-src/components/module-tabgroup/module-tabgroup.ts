import {
	type Component,
	asString,
	component,
	focus,
	fromEvents,
	fromSelector,
	getAttribute,
	setProperty,
	show,
} from '../../..'
import { requireElement } from '../../../src/core/dom'

export type ModuleTabgroupProps = {
	tabs: HTMLButtonElement[]
	selected: string
}

const getAriaControls = getAttribute('aria-controls', asString())

const getSelected = (
	elements: HTMLElement[],
	isCurrent: (element: HTMLElement) => boolean,
	offset = 0,
) =>
	getAriaControls(
		elements[
			Math.min(
				Math.max(elements.findIndex(isCurrent) + offset, 0),
				elements.length - 1,
			)
		],
	)

const handleClick = ({ target }) => getAriaControls(target)

const handleKeyup = ({ event, host, target }) => {
	const key = event.key
	if (
		[
			'ArrowLeft',
			'ArrowRight',
			'ArrowUp',
			'ArrowDown',
			'Home',
			'End',
		].includes(key)
	) {
		event.preventDefault()
		event.stopPropagation()
		return getSelected(
			host.tabs,
			tab => tab === target,
			key === 'Home'
				? -host.tabs.length
				: key === 'End'
					? host.tabs.length
					: key === 'ArrowLeft' || key === 'ArrowUp'
						? -1
						: 1,
		)
	}
}

export default component(
	'module-tabgroup',
	{
		tabs: fromSelector<HTMLButtonElement>('[role="tab"]'),
		selected: fromEvents<
			string,
			HTMLButtonElement,
			HTMLElement & { tabs: HTMLButtonElement[] }
		>(
			(el: HTMLElement & { tabs: HTMLButtonElement[] }) =>
				getSelected(el.tabs, tab => tab.ariaSelected === 'true'),
			'[role="tab"]',
			{
				click: handleClick,
				keyup: handleKeyup,
			},
		),
	},
	(el, { all }) => {
		requireElement(el, '[role="tablist"]')
		requireElement(el, '[role="tab"]')
		requireElement(el, '[role="tabpanel"]')
		const isCurrentTab = (tab: HTMLButtonElement) =>
			el.selected === getAriaControls(tab)

		return [
			all<HTMLButtonElement>(
				'[role="tab"]',
				setProperty('ariaSelected', target =>
					String(isCurrentTab(target)),
				),
				setProperty('tabIndex', target =>
					isCurrentTab(target) ? 0 : -1,
				),
				focus(isCurrentTab),
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
		'module-tabgroup': Component<ModuleTabgroupProps>
	}
}

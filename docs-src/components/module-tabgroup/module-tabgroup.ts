import {
	type Component,
	component,
	fromEvents,
	fromSelector,
	setProperty,
	show,
} from '../../..'
import { requireDescendant } from '../../../src/core/dom'

export type ModuleTabgroupProps = {
	readonly tabs: HTMLButtonElement[]
	readonly selected: string
}

const getAriaControls = (target: HTMLElement) =>
	target?.getAttribute('aria-controls') ?? ''

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
		const current = getSelected(
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
		host.tabs
			.filter(
				(tab: HTMLButtonElement) => getAriaControls(tab) === current,
			)[0]
			.focus()
		return current
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
		requireDescendant(el, '[role="tablist"]')
		requireDescendant(el, '[role="tab"]')
		requireDescendant(el, '[role="tabpanel"]')
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

import {
	type Component,
	component,
	fromEvents,
	fromSelector,
	setProperty,
	show,
} from '../../..'

export type ModuleTabgroupProps = {
	readonly tabs: HTMLButtonElement[]
	readonly selected: string
}

const getAriaControls = (element: HTMLElement) =>
	element.getAttribute('aria-controls') ?? ''

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

export default component(
	'module-tabgroup',
	{
		tabs: fromSelector('button[role="tab"]'),
		selected: fromEvents(
			'button[role="tab"]',
			{
				click: ({ target }) => getAriaControls(target),
				keyup: ({ event, host, target }) => {
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
							.filter(tab => getAriaControls(tab) === current)[0]
							.focus()
						return current
					}
				},
			},
			(el: HTMLElement & { tabs: HTMLButtonElement[] }) =>
				getSelected(el.tabs, tab => tab.ariaSelected === 'true'),
		),
	},
	(el, { all }) => {
		const isCurrentTab = (tab: HTMLButtonElement) =>
			el.selected === getAriaControls(tab)

		return [
			all(
				'button[role="tab"]',
				[
					setProperty('ariaSelected', target =>
						String(isCurrentTab(target)),
					),
					setProperty('tabIndex', target =>
						isCurrentTab(target) ? 0 : -1,
					),
				],
				'At least 2 tabs as children of a <[role="tablist"]> element are needed. Each tab must reference a unique id of a <[role="tabpanel"]> element.',
			),
			all(
				'[role="tabpanel"]',
				show(target => el.selected === target.id),
				'At least 2 tabpanels are needed. Each tabpanel must have a unique id.',
			),
		]
	},
)

declare global {
	interface HTMLElementTagNameMap {
		'module-tabgroup': Component<ModuleTabgroupProps>
	}
}

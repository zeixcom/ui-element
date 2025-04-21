import { all, asBoolean, component, on, setAttribute, setProperty, toggleAttribute, toggleClass } from '../../../'

export type TabListProps = {
	accordion: boolean
	active: number
}

const TabList = component('tab-list', {
	accordion: asBoolean,
	active: 0,
}, el => {
	const panels = Array.from(el.querySelectorAll('details'))
	el.active = panels.findIndex(panel => panel.hasAttribute('open'))
	return [
		toggleAttribute('accordion'),
		all('menu button',
			on('click', (_, index) => () => {
				el.active = index
			}),
			setProperty('ariaPressed',
				(_, index) => String(el.active === index)
			)
		),
		all<HTMLDetailsElement, TabListProps>('details',
			setProperty('open', (_, index) => el.active === index),
			setAttribute('aria-disabled', () => String(el.accordion)),
		),
		all('summary',
			toggleClass('visually-hidden', () => !el.accordion)
		)
	]
})

declare global {
	interface HTMLElementTagNameMap {
		'tab-list': typeof TabList
	}
}

export default TabList
import { asBoolean, component, on, setAttribute, setProperty, toggleAttribute, toggleClass } from '../../../'

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
	el.self(toggleAttribute('accordion'))
	el.all('menu button',
		on('click', (_, index) => () => {
			el.active = index
		}),
		setProperty('ariaPressed', (_, index) => String(el.active === index))
	)
	el.all<HTMLDetailsElement>('details',
		setProperty('open', (_, index) => !!(el.active === index)),
		setAttribute('aria-disabled', () => String(!el.accordion))
	)
	el.all('summary', toggleClass('visually-hidden', () => !el.accordion))
})

declare global {
	interface HTMLElementTagNameMap {
		'tab-list': typeof TabList
	}
}

export default TabList
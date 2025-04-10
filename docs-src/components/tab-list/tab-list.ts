import { asBoolean, component, on, setAttribute, setProperty, toggleAttribute, toggleClass } from '../../../'

export default component('tab-list', {
	accordion: asBoolean,
	active: (host: HTMLElement) => { 
		const panels: HTMLDetailsElement[] = Array.from(host.querySelectorAll('details'))
		for (let i = 0; i < panels.length; i++) {
			if (panels[i].hasAttribute('open')) return i
		}
		return 0
	},
}, el => {
	el.self(toggleAttribute('accordion'))
	el.all('menu button',
		on('click', (_, index) => () => { el.active = index }),
		setProperty('ariaPressed', (_, index) => String(el.active === index))
	)
	el.all<HTMLDetailsElement>('details',
		setProperty('open', (_, index) => !!(el.active === index)),
		setAttribute('aria-disabled', () => String(!el.accordion))
	)
	el.all('summary',
		toggleClass('visually-hidden', () => !el.accordion)
	)
})
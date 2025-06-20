import { component, on, setProperty, state } from '../../..'

export default component('my-carousel', {}, (el, { all, first }) => {
	const currentIndex = state(0)
	const slides = Array.from(el.querySelectorAll('[role="tabpanel"]'))
	const total = slides.length
	const updateIndex = (direction: number) => {
		currentIndex.update(v => (v + direction + total) % total)
	}

	return [
		first(
			'nav',
			on('keyup', (e: KeyboardEvent) => {
				if (
					['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
				) {
					e.preventDefault()
					e.stopPropagation()
					if (e.key === 'Home') currentIndex.set(0)
					else if (e.key === 'End') currentIndex.set(total - 1)
					else updateIndex(e.key === 'ArrowLeft' ? -1 : 1)
					el.querySelectorAll<HTMLButtonElement>('[role="tab"]')[
						currentIndex.get()
					].focus()
				}
			}),
			first(
				'.prev',
				on('click', () => {
					updateIndex(-1)
				}),
			),
			first(
				'.next',
				on('click', () => {
					updateIndex(1)
				}),
			),
			all(
				'[role="tab"]',
				setProperty('ariaSelected', target =>
					String(
						target.dataset['index'] === String(currentIndex.get()),
					),
				),
				setProperty('tabIndex', target =>
					target.dataset['index'] === String(currentIndex.get())
						? 0
						: -1,
				),
				on('click', e => {
					const rawIndex = (e.target as HTMLElement)?.dataset['index']
					const nextIndex = rawIndex ? parseInt(rawIndex) : 0
					currentIndex.set(
						Number.isInteger(nextIndex) ? nextIndex : 0,
					)
				}),
			),
		),
		all(
			'[role="tabpanel"]',
			setProperty('ariaCurrent', target =>
				String(target.id === slides[currentIndex.get()].id),
			),
		),
	]
})

export const manageArrowKeyFocus =
	(elements: HTMLElement[], index: number) => (e: Event) => {
		if (!(e instanceof KeyboardEvent))
			throw new TypeError('Event is not a KeyboardEvent')
		const handledKeys = [
			'ArrowLeft',
			'ArrowRight',
			'ArrowUp',
			'ArrowDown',
			'Home',
			'End',
		]
		if (handledKeys.includes(e.key)) {
			e.preventDefault()
			switch (e.key) {
				case 'ArrowLeft':
				case 'ArrowUp':
					index = index < 1 ? elements.length - 1 : index - 1
					break
				case 'ArrowRight':
				case 'ArrowDown':
					index = index >= elements.length - 1 ? 0 : index + 1
					break
				case 'Home':
					index = 0
					break
				case 'End':
					index = elements.length - 1
					break
			}
			if (elements[index]) elements[index].focus()
		}
	}

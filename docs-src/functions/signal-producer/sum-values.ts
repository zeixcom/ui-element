import { type Component, type SignalProducer, selection } from '../../..'

export const sumValues = (selector: string): SignalProducer<HTMLElement, number> => el => () =>
	selection<Component<{ value: number }>>(el, selector)
		.get()
		.reduce((sum, item) => sum + item.value, 0)

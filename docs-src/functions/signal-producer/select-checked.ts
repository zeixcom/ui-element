import { type SignalProducer, selection } from '../../..'

export const selectChecked =
	(
		selector: string,
		checked: boolean,
	): SignalProducer<HTMLElement, (HTMLElement & { checked: boolean })[]> =>
	el =>
		selection(el, `${selector}${checked ? '[checked]' : ':not([checked])'}`)

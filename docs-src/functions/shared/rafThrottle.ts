export const rafThrottle = (fn: (...args: any[]) => void) => {
	let rafId = 0,
		scheduled = false,
		lastArgs: any[] = []
	const wrapped = (...args: any[]) => {
		lastArgs = args
		if (scheduled) return
		scheduled = true
		rafId = requestAnimationFrame(() => {
			scheduled = false
			fn(...lastArgs)
		})
	}
	wrapped.cancel = () => {
		if (scheduled) {
			cancelAnimationFrame(rafId)
			scheduled = false
		}
	}
	return wrapped
}

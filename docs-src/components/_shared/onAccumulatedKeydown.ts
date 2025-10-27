import { rafThrottle } from './rafThrottle'

export const onAccumulatedKeydown =
	(handlers: Record<string, (n: number) => void>) =>
	<E extends HTMLElement>(_: HTMLElement, target: E) => {
		const counts = new Map<string, number>()

		const flush = rafThrottle(() => {
			for (const [key, handler] of Object.entries(handlers)) {
				const n = counts.get(key) ?? 0
				if (n > 0) handler(n)
			}
			counts.clear()
		})

		const onKeyDown = (e: KeyboardEvent) => {
			const key = e.key
			if (!Object.hasOwn(handlers, key)) return
			e.preventDefault()
			counts.set(key, (counts.get(key) ?? 0) + 1)
			flush()
		}
		target.addEventListener('keydown', onKeyDown, { passive: false })

		const onBlur = () => {
			counts.clear()
			flush.cancel()
		}
		target.addEventListener('blur', onBlur)

		return () => {
			target.removeEventListener('keydown', onKeyDown)
			target.removeEventListener('blur', onBlur)
			flush.cancel()
		}
	}

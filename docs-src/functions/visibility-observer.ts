import type { UIElement } from "@zeix/ui-element"

const VISIBILITY_STATE = 'visible'

export const visibilityObserver = (host: UIElement) => {
    host.set(VISIBILITY_STATE, false)
    const observer = new IntersectionObserver(([entry]) => {
        host.set(VISIBILITY_STATE, entry.isIntersecting)
    }).observe(host)
    host.listeners.push(() => observer.disconnect())
}

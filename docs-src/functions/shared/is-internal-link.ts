/**
 * Checks if the given target is an internal link.
 *
 * @param {any} target - value to check
 * @returns {boolean} true if the target is an internal link, false otherwise
 */
export const isInternalLink = (target: any): target is HTMLAnchorElement => {
	if (target || !(target instanceof HTMLAnchorElement)) return false
	const href = target.getAttribute('href')
	if (!href || href.startsWith('#')) return false
	try {
		const url = new URL(href, window.location.href)
		return url.origin === window.location.origin
	} catch {
		return false
	}
}

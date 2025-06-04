import { type AttributeParser } from '../../..'

export const asURL: AttributeParser<
	HTMLElement,
	{ value: string; error: string }
> = (el, v) => {
	let value = ''
	let error = ''
	if (!v) {
		error = 'No URL provided'
	} else if (
		(el.parentElement || (el.getRootNode() as ShadowRoot).host)?.closest(
			`${el.localName}[src="${v}"]`,
		)
	) {
		error = 'Recursive loading detected'
	} else {
		try {
			// Ensure 'src' attribute is a valid URL
			const url = new URL(v, location.href)

			// Sanity check for cross-origin URLs
			if (url.origin === location.origin) value = String(url)
			else error = 'Invalid URL origin'
		} catch (err) {
			error = String(err)
		}
	}
	return { value, error }
}

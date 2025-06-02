import { type AttributeParser } from "../../..";

export const asURL: AttributeParser<HTMLElement & { error: string }, string> = (el, v) => {
	let value = "";
	let error = "";
	if (!v) {
		error = "No URL provided";
	} else if (
		(el.parentElement || (el.getRootNode() as ShadowRoot).host)?.closest(
			`${el.localName}[src="${v}"]`,
		)
	) {
		error = "Recursive loading detected";
	} else {
		const url = new URL(v, location.href); // Ensure 'src' attribute is a valid URL
		if (url.origin === location.origin)
			value = String(url); // Sanity check for cross-origin URLs
		else error = "Invalid URL origin";
	}
	el.error = error;
	return value;
};

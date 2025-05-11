import {
	type AttributeParser,
	type Component,
	type SignalProducer,
	setProperty,
	setText,
	dangerouslySetInnerHTML,
	component,
	first,
} from "../../../";

export type LazyLoadProps = {
	error: string;
	src: string;
	content: string;
};

/* === Attribute Parser === */

const asURL: AttributeParser<HTMLElement & { error: string }, string> = (
	el,
	v,
) => {
	let value = "";
	let error = "";
	if (!v) {
		error = "No URL provided in src attribute";
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

/* === Signal Producer === */

const fetchText: SignalProducer<
	HTMLElement & { error: string; src: string },
	string
> = (el) => async (abort) => {
	// Async Computed callback
	const url = el.src;
	if (!url) return "";
	try {
		const response = await fetch(url, { signal: abort });
		el.querySelector(".loading")?.remove();
		if (response.ok) return response.text();
		else el.error = response.statusText;
	} catch (error) {
		el.error = error.message;
	}
	return "";
};

/* === Component === */

export default component(
	"lazy-load",
	{
		error: "",
		src: asURL,
		content: fetchText,
	},
	(el) => [
		dangerouslySetInnerHTML("content"),
		first<LazyLoadProps, HTMLElement>(
			".error",
			setText("error"),
			setProperty("hidden", () => !el.error),
		),
	],
);

declare global {
	interface HTMLElementTagNameMap {
		"lazy-load": Component<LazyLoadProps>;
	}
}

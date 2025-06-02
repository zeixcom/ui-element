import type { SignalProducer } from '../../..'

export const fetchText: SignalProducer<
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

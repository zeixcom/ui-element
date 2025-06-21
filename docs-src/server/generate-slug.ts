export const generateSlug = (text: string): string => {
	return text
		.toLowerCase()
		.replace(/[^\w\- ]+/g, '')
		.trim()
		.replace(/\s+/g, '-')
}

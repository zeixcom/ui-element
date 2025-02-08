/**
 * Asynchronous replacement helper (handles async `.replace()` cases).
 */
export const replaceAsync = async (str: string, regex: RegExp, asyncFn: (match: string, ...args: any[]) => Promise<string>): Promise<string> => {
    const matches = Array.from(str.matchAll(regex)); // Collect matches properly
    if (matches.length === 0) return str; // No matches, return as is

    // Process matches asynchronously
    const replacements = await Promise.all(matches.map(match => asyncFn(match[0], ...match.slice(1))));

    // Replace in string
    let i = 0;
    return str.replace(regex, () => replacements[i++]!);
};

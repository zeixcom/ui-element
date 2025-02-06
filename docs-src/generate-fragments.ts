import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

const EXAMPLES_DIR = './docs-src/components';
const OUTPUT_DIR = './docs/examples';

// Function to check if a file exists
const fileExists = async (path: string) => {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
};

// Function to escape special HTML characters
const escapeHtml = (str: string) => str.replace(
	/[&<>"']/g,
	match => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	}[match])
);

// Function to generate accordion panels dynamically
const generatePanel = async (name: string, type: string, label: string) => {
	const filePath = join(EXAMPLES_DIR, name, `${name}.${type}`);
	if (!(await fileExists(filePath))) return '';

	const open = type === 'html'? ' open' : '';
	const content = escapeHtml(await readFile(filePath, 'utf8'));
	return `
	<accordion-panel${open}>
		<details${open} aria-disabled="true">
			<summary class="visually-hidden">
				<div class="summary">${label}</div>
			</summary>
			<code-block language="${type}" copy-success="Copied!" copy-error="Error trying to copy to clipboard!">
				<p class="meta">
					<span class="file">${name}.${type}</span>
					<span class="language">${type}</span>
				</p>
				<pre class="language-${type}"><code>${content}</code></pre>
				<input-button class="copy">
					<button type="button" class="secondary small">Copy</button>
				</input-button>
			</code-block>
		</details>
	</accordion-panel>`;
};

// Function to process each component
const processComponent = async (name: string) => {
	const panelTypes = [
		{ type: 'html', label: 'HTML' },
		{ type: 'css', label: 'CSS' },
		{ type: 'ts', label: 'TypeScript' }
	];

	// Generate only existing panels
	const panels = await Promise.all(panelTypes.map(({ type }) => generatePanel(name, type, type.toUpperCase())));
	const validPanels = panels.filter(Boolean);
	const validLabels = panelTypes
		.map(({ label }, i) => panels[i] ? label : null)
		.filter(Boolean); // Keep labels in sync with validPanels

	if (validPanels.length === 0) return; // Skip if no valid content

	const fragment = `
<tab-list>
	<menu>
		${validLabels.map((label, i) => `<li><button type="button" aria-pressed="${i === 0}">${label}</button></li>`).join('\n\t\t')}
	</menu>
	${validPanels.join('\n')}
</tab-list>
`;

	await writeFile(join(OUTPUT_DIR, `${name}.html`), fragment, 'utf8');
	console.log(`✅ Generated: ${name}.html`);
};

// Main function to run the script
const run = async () => {
	console.log('🔄 Generating fragments...');
	const components = await readdir(EXAMPLES_DIR);
	await Promise.all(components.map(processComponent));
	console.log('✨ All fragments generated!');
};

run();
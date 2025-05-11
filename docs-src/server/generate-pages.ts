import { readFile, writeFile, readdir } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { marked } from "marked";

import {
	PAGES_DIR,
	INCLUDES_DIR,
	LAYOUT_FILE,
	MENU_FILE,
	OUTPUT_DIR,
} from "./config";
import { transformCodeBlocks } from "./transform-code-blocks";
import { replaceAsync } from "./replace-async";
import { generateMenu } from "./generate-menu";
import { generateSitemap } from "./generate-sitemap";

marked.setOptions({
	gfm: true, // Enables tables, task lists, and strikethroughs
	breaks: true, // Allows line breaks without needing double spaces
});

/* const PAGE_LIST_FILE = './docs-src/.file-pages.json';

let lastPageList: string[] = [];

// Load last known page list
const loadPageList = async () => {
    try {
        lastPageList = JSON.parse(await readFile(PAGE_LIST_FILE, 'utf8'));
    } catch {
        lastPageList = [];
    }
};

// Save the new page list
const savePageList = async (pageList: string[]) => {
    await writeFile(PAGE_LIST_FILE, JSON.stringify(pageList, null, 2), 'utf8');
}; */

// Function to load HTML includes
const loadIncludes = async (html: string): Promise<string> => {
	return await replaceAsync(
		html,
		/{{ include '(.+?)' }}/g,
		async (_, filename) => {
			const includePath = join(INCLUDES_DIR, filename);
			try {
				// console.log(`📄 Loading include: ${filename}`);
				return await readFile(includePath, "utf8");
			} catch {
				console.warn(`⚠️ Warning: Missing include file: ${filename}`);
				return "";
			}
		},
	);
};

const processMarkdownFile = async (filename: string) => {
	const filePath = join(PAGES_DIR, filename);
	const mdContent = await readFile(filePath, "utf8");

	console.log(`📂 Processing: ${filename}`);

	// Parse frontmatter and Markdown content
	const { data: frontmatter, content } = matter(mdContent);
	// console.log(`📝 Frontmatter:`, frontmatter);

	// Convert Markdown content to HTML and process code blocks
	const { processedMarkdown, codeBlockMap } =
		await transformCodeBlocks(content);

	// Override headings to add permalinks
	const renderer = {
		heading({ tokens, depth }) {
			const text = this.parser.parseInline(tokens);
			const slug = text
				.toLowerCase()
				.replace(/[^\w\- ]+/g, "")
				.trim()
				.replace(/\s+/g, "-");

			return `
	            <h${depth} id="${slug}">
	                <a name="${slug}" class="anchor" href="#${slug}">
		                <span class="permalink">🔗</span>
	                </a>
	                ${text}
	            </h${depth}>`;
		},
	};

	marked.use({ renderer });
	let htmlContent = await marked.parse(processedMarkdown);
	// console.log(`📜 Converted Markdown to HTML:`, htmlContent);

	// Replace placeholders with actual Shiki code blocks
	codeBlockMap.forEach((code, key) => {
		htmlContent = htmlContent.replace(
			new RegExp(`(<p>\\s*${key}\\s*</p>)`, "g"),
			code,
		);
	});

	// Load layout template
	let layout = await readFile(LAYOUT_FILE, "utf8");
	// console.log(`📄 Layout before processing:`, layout);

	// Use regex to match the correct <li> by href and add class="active"
	let menuHtml = await readFile(MENU_FILE, "utf8");
	const url = filename.replace(".md", ".html");
	menuHtml = menuHtml.replace(
		new RegExp(`(<a href="${url}")`, "g"),
		'$1 class="active"',
	);
	layout = layout.replace("{{ include 'menu.html' }}", menuHtml);

	// 1️⃣ Process includes FIRST
	layout = await loadIncludes(layout);
	// console.log(`📎 After Includes Processing:`, layout);

	// 2️⃣ Replace {{ content }} SECOND
	layout = layout.replace("{{ content }}", htmlContent);
	// console.log(`✅ After Content Injection:`, layout);

	// 3️⃣ Replace frontmatter placeholders LAST
	layout = layout.replace(/{{ (.*?) }}/g, (_, key) => {
		// console.log(`🔍 Replacing: {{ ${key} }} →`, frontmatter[key] || '');
		if (key === "url") return url;
		return frontmatter[key] || "";
	});

	// Save output file
	await writeFile(join(OUTPUT_DIR, url), layout, "utf8");

	console.log(`✅ Generated: ${url}`);

	return {
		filename: url,
		title: frontmatter.title || "Untitled",
		emoji: frontmatter.emoji || "📄",
		description: frontmatter.description || "",
		url,
	};
};

// Main function
const run = async () => {
	// console.log('🔄 Checking for page list changes...');

	const files = await readdir(PAGES_DIR);
	const mdFiles = files.filter((file) => file.endsWith(".md"));

	/* // Check if page list has changed
    if (JSON.stringify(mdFiles) !== JSON.stringify(lastPageList)) {
        console.log(`📄 Page list changed! Rebuilding menu and sitemap.`);
        await savePageList(mdFiles);
    } else {
        console.log(`⚡ No page list changes detected.`);
    } */

	// Process all Markdown files
	const pages = await Promise.all(mdFiles.map(processMarkdownFile));

	// Only regenerate menu and sitemap if the page list changed
	// if (JSON.stringify(mdFiles) !== JSON.stringify(lastPageList)) {
	await generateMenu(pages);
	await generateSitemap(pages);
	// }

	console.log("✨ All pages generated!");
};

// await loadPageList();
run();

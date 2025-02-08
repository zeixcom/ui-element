import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = './docs-src/pages';
const LAYOUT_FILE = './docs-src/layout.html';
const INCLUDES_DIR = './docs-src/includes';
const MENU_FILE = join(INCLUDES_DIR, 'menu.html');
const OUTPUT_DIR = './docs';
const SITEMAP_FILE = join(OUTPUT_DIR, 'sitemap.xml');

// Define a manual order for the menu
const PAGE_ORDER = [
	'index',
	'installation-setup',
	'core-concepts',
	'detailed-walkthrough',
    'best-practices-patterns',
	'advanced-topics',
	'examples-recipes',
    'troubleshooting-faqs',
    'api-reference',
	'contributing-development',
    'changelog-versioning',
	'licensing-credits',
];

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

// Custom function to replace includes asynchronously
const replaceAsync = async (str: string, regex: RegExp, asyncFn: (match: string, ...args: any[]) => Promise<string>): Promise<string> => {
    const matches = Array.from(str.matchAll(regex)); // Collect matches properly

    if (matches.length === 0) return str; // No matches, return as is

    // console.log(`🔍 Found matches:`, matches.map(m => m[0]));

    // Process matches asynchronously
    const replacements = await Promise.all(
        matches.map(match => asyncFn(match[0], ...match.slice(1)))
    );

    // console.log(`🛠 Async Replace Results:`, replacements);

    // Replace in string
    let i = 0;
    return str.replace(regex, () => replacements[i++]!);
};

// Function to load HTML includes
const loadIncludes = async (html: string): Promise<string> => {
    return await replaceAsync(html, /{{ include '(.+?)' }}/g, async (_, filename) => {
        const includePath = join(INCLUDES_DIR, filename);
        try {
            // console.log(`📄 Loading include: ${filename}`);
            return await readFile(includePath, 'utf8');
        } catch {
            console.warn(`⚠️ Warning: Missing include file: ${filename}`);
            return '';
        }
    });
};

const processMarkdownFile = async (filename: string) => {
    const filePath = join(CONTENT_DIR, filename);
    const mdContent = await readFile(filePath, 'utf8');

    console.log(`📂 Processing: ${filename}`);

    // Parse frontmatter and Markdown content
    const { data: frontmatter, content } = matter(mdContent);
    // console.log(`📝 Frontmatter:`, frontmatter);

    // Convert Markdown to HTML
    let htmlContent = await marked.parse(content);
    // console.log(`📜 Converted Markdown to HTML:`, htmlContent);

    // Load layout template
    let layout = await readFile(LAYOUT_FILE, 'utf8');
    // console.log(`📄 Layout before processing:`, layout);

    // 1️⃣ Process includes FIRST
    layout = await loadIncludes(layout);
    // console.log(`📎 After Includes Processing:`, layout);

	// Use regex to match the correct <li> by href and add class="active"
    let menuHtml = await readFile(MENU_FILE, 'utf8');
    const pageUrl = `/${filename.replace('.md', '.html')}`;
    menuHtml = menuHtml.replace(
        new RegExp(`(<li>\\s*<a href="${pageUrl}")`, 'g'),
        '$1 class="active"'
    );
    layout = layout.replace('{{ include \'menu.html\' }}', menuHtml);

	// 2️⃣ Replace {{ content }} SECOND
	layout = layout.replace('{{ content }}', htmlContent);
	// console.log(`✅ After Content Injection:`, layout);

	// 3️⃣ Replace frontmatter placeholders LAST
	layout = layout.replace(/{{ (.*?) }}/g, (_, key) => {
		// console.log(`🔍 Replacing: {{ ${key} }} →`, frontmatter[key] || '');
		return frontmatter[key] || '';
	});

    // Save output file
    const outputFilename = filename.replace('.md', '.html');
    await writeFile(join(OUTPUT_DIR, outputFilename), layout, 'utf8');

    console.log(`✅ Generated: ${outputFilename}`);

    return { 
        filename: outputFilename, 
        title: frontmatter.title || 'Untitled', 
        emoji: frontmatter.emoji || '📄', 
        description: frontmatter.description || '',
        url: `/${outputFilename}`
    };
};

// Function to generate a menu
const generateMenu = async (pages) => {
    // Sort pages according to the PAGE_ORDER array
    pages.sort((a, b) => PAGE_ORDER.indexOf(a.filename.replace('.html', '')) - PAGE_ORDER.indexOf(b.filename.replace('.html', '')));

    const menuHtml = `
    <nav class="breakout">
        <ol>
            ${pages.map(page => `
                <li>
                    <a href="${page.url}">
						<span class="icon">${page.emoji}</span>
						<strong>${page.title}</strong>
						<small>${page.description}</small>
                    </a>
                </li>`).join('\n')}
        </ol>
    </nav>`;

    await writeFile(MENU_FILE, menuHtml, 'utf8');
    console.log('✅ Generated: menu.html');
};

// Function to generate a sitemap.xml
const generateSitemap = async (pages) => {
    const now = new Date().toISOString();
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${pages.map(page => `
        <url>
            <loc>${page.url}</loc>
            <lastmod>${now}</lastmod>
            <priority>${page.filename === 'index.html' ? '1.0' : '0.8'}</priority>
        </url>`).join('\n')}
    </urlset>`;

    await writeFile(SITEMAP_FILE, sitemapXml, 'utf8');
    console.log('✅ Generated: sitemap.xml');
};

// Main function
const run = async () => {
    // console.log('🔄 Checking for page list changes...');

    const files = await readdir(CONTENT_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));

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

    console.log('✨ All pages generated!');
};

// await loadPageList();
run();
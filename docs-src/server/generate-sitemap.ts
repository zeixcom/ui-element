import { writeFile } from 'fs/promises';
import { join } from 'path';

import { OUTPUT_DIR } from './config';

const SITEMAP_FILE = join(OUTPUT_DIR, 'sitemap.xml');

// Function to generate a sitemap.xml
export const generateSitemap = async (pages) => {
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
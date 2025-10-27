- Use Bun 1.3
- Use the Cause & Effect signals library
- Use paths and constants from `config.ts` rather than hardcoding them

- Build Script: `docs-src/server/build.ts`
- Serve Script: `docs-src/server/serve.ts`

=== 1. Generate Menu ===

Source: files in `docs-src/pages`
Order: according to `PAGE_ORDER` in `config.ts`
Destination: `docs-src/includes/menu.html`

=== 2. Build Static Assets ===

JS Source: `docs-src/main.ts`
JS Build: using `bun build docs-src/main.ts --outdir ./docs/assets/ --minify --define process.env.DEV_MODE=false --sourcemap=external`
JS Destination: `docs/assets/main.js`
JS Watch for HMR (besides `docs-src/main.ts`): `src/**/*.ts`, `docs-src/components/**/*.ts`, `docs-src/functions/**/*.ts`

CSS Source: `docs-src/main.css`
CSS Build: using `bunx lightningcss --minify --bundle --targets ">= 0.25%" docs-src/main.css -o ./docs/assets/main.css`
CSS Destination: `docs/assets/main.css`
CSS Watch for HMR (besides `docs-src/main.css`): `docs-src/global.css`, `docs-src/components/**/*.css`

=== 3. Generate HTML Fragments ===

Sources: files in `docs-src/components/**/*.html`, but not ending with `*.test.html`, `docs-src/components/**/*.css`, `docs-src/components/**/*.ts`
Transform: using `docs-src/templates/fragments.ts`
Destination: `docs-src/examples/*.html`
Watch for HMR: `docs-src/components/**/*.html`, `docs-src/components/**/*.css`, `docs-src/components/**/*.ts`

=== 4. Transform Markdown to HTML ===

Sources: files in `docs-src/pages/**/*.md`
Layout: `docs-src/layout.html`
Preprocess: using `docs-src/templates/toc.ts` to generate table of contents from H2
Include: `docs-src/includes/menu.html` (from Step 1) and `docs-src/includes/footer.html`
Destination: `docs-src/*.html`

=== 5. Generate XML Sitemap ===

Sources: `docs/**/*.html`
Process: using `docs-src/templates/sitemap.ts`
Destination: `docs/sitemap.xml`

=== 6. Generate Service Worker ===

Sources: `docs/assets/main.js`, `docs/assets/main.css`, rebuilt files from HMR
Process: using `docs-src/templates/service-worker.ts`
Destination: `docs/sw.js`

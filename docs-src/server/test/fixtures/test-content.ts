/**
 * Test fixtures for common test scenarios
 */

export const TEST_MARKDOWN_CONTENT = {
	simple: `---
title: Simple Test Page
emoji: 📝
description: A simple test page
---

# Simple Test Page

This is a simple test page with basic content.

## Section 1

Some content here.

## Section 2

More content here.
`,

	withCodeBlocks: `---
title: Code Examples
emoji: 💻
description: Page with code examples
---

# Code Examples

Here's some JavaScript:

\`\`\`javascript
function hello() {
	console.log('Hello, world!');
}
\`\`\`

And some CSS:

\`\`\`css
.button {
	background: blue;
	color: white;
	padding: 10px;
}
\`\`\`
`,

	withInternalLinks: `---
title: Internal Links
emoji: 🔗
description: Page with internal links
---

# Internal Links

Link to [another page](./about.md).

Link to [section](#section-1).

## Section 1

Content here.
`,

	malformed: `---
title: Malformed
description: Missing closing frontmatter
---

# This is malformed

Because the frontmatter is not properly closed.
`,
}

export const TEST_HTML_TEMPLATES = {
	basic: `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>{{ title }}</title>
	<meta name="description" content="{{ description }}">
</head>
<body>
	<header>
		<h1>{{ emoji }} {{ title }}</h1>
	</header>
	<main>
		{{ content }}
	</main>
	<footer>
		<p>Test Footer</p>
	</footer>
</body>
</html>`,

	withIncludes: `<!DOCTYPE html>
<html lang="en">
<head>
	{{ include 'head.html' }}
	<title>{{ title }}</title>
</head>
<body>
	{{ include 'header.html' }}
	<main>
		{{ content }}
	</main>
	{{ include 'footer.html' }}
</body>
</html>`,

	withAssets: `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>{{ title }}</title>
	<link rel="stylesheet" href="/assets/main.{{ css-hash }}.css">
</head>
<body>
	{{ content }}
	<script src="/assets/main.{{ js-hash }}.js"></script>
</body>
</html>`,
}

export const TEST_COMPONENT_FILES = {
	typescript: `export class TestComponent {
	private value = 'test';

	constructor() {
		console.log('TestComponent created');
	}

	render(): string {
		return \`<div class="test">\${this.value}</div>\`;
	}

	setValue(newValue: string): void {
		this.value = newValue;
	}
}`,

	css: `.test-component {
	display: flex;
	align-items: center;
	padding: 1rem;
	background: #f0f0f0;
	border-radius: 4px;
}

.test-component__title {
	font-size: 1.2rem;
	font-weight: bold;
	margin-bottom: 0.5rem;
}

.test-component__content {
	color: #666;
}`,

	html: `<div class="test-component">
	<div class="test-component__title">Test Component</div>
	<div class="test-component__content">
		This is test content for the component.
	</div>
</div>`,

	malformedJs: `export class BadComponent {
	constructor() {
		console.log('Missing closing bracket'
	}
`,
}

export const TEST_INCLUDES = {
	head: `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{{ description }}">`,

	header: `<header class="site-header">
	<nav>
		<a href="/">Home</a>
		<a href="/about">About</a>
	</nav>
</header>`,

	footer: `<footer class="site-footer">
	<p>&copy; 2024 Test Site. All rights reserved.</p>
</footer>`,
}

export const TEST_CONFIG_VARIATIONS = {
	minimal: {
		server: { port: 3000, host: 'localhost', development: true },
		paths: {
			pages: './pages',
			components: './components',
			src: './src',
			output: './output',
			assets: './output/assets',
			includes: './includes',
			layout: './layout.html',
		},
	},

	production: {
		server: { port: 8080, host: '0.0.0.0', development: false },
		build: {
			optimizeLayout: true,
			generateSourceMaps: false,
			minify: true,
			cacheMaxAge: 31536000,
		},
		assets: {
			compression: { enabled: true, brotli: true, gzip: true },
			versioning: { enabled: true, hashLength: 8 },
		},
	},

	customPaths: {
		paths: {
			pages: './custom-pages',
			components: './custom-components',
			src: './custom-src',
			output: './custom-output',
			assets: './custom-output/static',
			includes: './custom-includes',
			layout: './custom-layout.html',
		},
	},
}

export const TEST_ENVIRONMENT_VARIABLES = {
	development: {
		DEV_SERVER_PORT: '3001',
		DEV_SERVER_HOST: 'localhost',
		OPTIMIZE_LAYOUT: 'false',
		DEV_MODE: 'true',
	},

	production: {
		DEV_SERVER_PORT: '8080',
		DEV_SERVER_HOST: '0.0.0.0',
		OPTIMIZE_LAYOUT: 'true',
		DEV_MODE: 'false',
	},
}

export const TEST_HTTP_RESPONSES = {
	notFound: {
		status: 404,
		body: 'Not Found',
		headers: { 'Content-Type': 'text/plain' },
	},

	internalError: {
		status: 500,
		body: 'Internal Server Error',
		headers: { 'Content-Type': 'text/plain' },
	},

	htmlPage: {
		status: 200,
		body: '<!DOCTYPE html><html><head><title>Test</title></head><body>Test Content</body></html>',
		headers: { 'Content-Type': 'text/html; charset=UTF-8' },
	},

	cssFile: {
		status: 200,
		body: 'body { margin: 0; }',
		headers: { 'Content-Type': 'text/css; charset=UTF-8' },
	},

	jsFile: {
		status: 200,
		body: 'console.log("test");',
		headers: { 'Content-Type': 'application/javascript; charset=UTF-8' },
	},
}

export const TEST_WEBSOCKET_MESSAGES = {
	ping: JSON.stringify({ type: 'ping', timestamp: Date.now() }),
	pong: JSON.stringify({ type: 'pong', timestamp: Date.now() }),
	reload: 'reload',
	buildError: JSON.stringify({
		type: 'build-error',
		message: 'Build failed',
		files: ['test.ts'],
	}),
	buildRequest: JSON.stringify({
		type: 'build-request',
		files: ['index.md'],
	}),
}

export const TEST_FILE_CHANGES = {
	markdown: {
		path: 'pages/test.md',
		content: TEST_MARKDOWN_CONTENT.simple,
		expectedCommands: ['build:docs-html'],
	},

	typescript: {
		path: 'components/test.ts',
		content: TEST_COMPONENT_FILES.typescript,
		expectedCommands: ['build:docs-js'],
	},

	css: {
		path: 'components/test.css',
		content: TEST_COMPONENT_FILES.css,
		expectedCommands: ['build:docs-css'],
	},

	html: {
		path: 'components/test.html',
		content: TEST_COMPONENT_FILES.html,
		expectedCommands: ['build:docs-html'],
	},

	src: {
		path: 'src/main.ts',
		content: 'export const main = () => console.log("updated");',
		expectedCommands: ['build', 'build:docs-js', 'build:docs-api'],
	},
}

export const TEST_BUILD_OUTPUTS = {
	success: {
		success: true,
		filePath: '/test/output.html',
		content: '<html>Generated content</html>',
		metadata: { title: 'Test Page' },
		dependencies: ['/test/input.md'],
		stats: {
			startTime: Date.now() - 100,
			endTime: Date.now(),
			duration: 100,
			inputSize: 500,
			outputSize: 1000,
		},
	},

	failure: {
		success: false,
		filePath: '/test/input.md',
		errors: [
			{
				message: 'Failed to parse markdown',
				file: '/test/input.md',
				line: 5,
				column: 10,
			},
		],
		warnings: [
			{
				message: 'Missing title in frontmatter',
				file: '/test/input.md',
				line: 1,
			},
		],
	},
}

export const TEST_SERVER_STATS = {
	basic: {
		server: {
			isRunning: true,
			port: 3000,
			connectedClients: 1,
		},
		watcher: {
			watchedPaths: 3,
			activeTimers: 0,
			lastChange: Date.now(),
			isActive: true,
			trackedFiles: 10,
		},
		buildSystem: {
			pluginCount: 2,
			dependencyCount: 5,
			buildsInProgress: 0,
		},
	},

	busy: {
		server: {
			isRunning: true,
			port: 3000,
			connectedClients: 5,
		},
		watcher: {
			watchedPaths: 3,
			activeTimers: 2,
			lastChange: Date.now() - 1000,
			isActive: true,
			trackedFiles: 25,
		},
		buildSystem: {
			pluginCount: 4,
			dependencyCount: 20,
			buildsInProgress: 1,
		},
	},
}

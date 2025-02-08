import { spawn } from 'child_process';
import { watch, readdir, readFile, writeFile } from 'fs/promises';
import { createHash } from 'crypto';
import { extname, join } from 'path';

const WATCH_DIRS = [
    './docs-src',
	'./docs-src/components',
    './docs-src/pages',
    './docs-src/includes',
];

const HASH_FILE = './docs-src/.file-hashes.json';
const PAGE_LIST_FILE = './docs-src/.file-pages.json';

let fileHashes: Record<string, string> = {};
let lastPageList: string[] = [];

// Load existing hashes (if any)
const loadHashes = async () => {
    try {
        const data = await readFile(HASH_FILE, 'utf8');
        fileHashes = JSON.parse(data);
    } catch {
        fileHashes = {};
    }
};

// Load last known page list
const loadPageList = async () => {
    try {
        lastPageList = JSON.parse(await readFile(PAGE_LIST_FILE, 'utf8'));
    } catch {
        lastPageList = [];
    }
};

// Save hashes after a build
const saveHashes = async () => {
    await writeFile(HASH_FILE, JSON.stringify(fileHashes, null, 2), 'utf8');
};

// Generate file hash based on content
const getFileHash = async (filePath: string): Promise<string> => {
    try {
        const content = await readFile(filePath, 'utf8');
        return createHash('sha256').update(content).digest('hex');
    } catch {
        return ''; // If file doesn't exist
    }
};

// Debounce function to avoid unnecessary rebuilds
const debounce = (fn: Function, delay = 300) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

// Check if page list changed
const checkPageListChanged = async () => {
    const currentPageList = (await readdir('./docs-src/pages/')).filter(file => file.endsWith('.md'));
    const changed = JSON.stringify(currentPageList) !== JSON.stringify(lastPageList);

    if (changed) {
        console.log(`📄 Page list changed! Rebuilding menu and sitemap.`);
        lastPageList = currentPageList;
        await writeFile(PAGE_LIST_FILE, JSON.stringify(lastPageList, null, 2), 'utf8');

        // Since menu changes, we must rebuild all pages
        runCommand('bun run ./docs-src/generate-pages.ts');
    }
};

const runCommand = (command: string) => {
    console.log(`🔄 Running: ${command}`);
    const [cmd, ...args] = command.split(' ');
    spawn(cmd, args, { stdio: 'inherit', shell: true });
};

const runCommandIfChanged = async (command: string, filePath: string) => {
    const newHash = await getFileHash(filePath);
    if (fileHashes[filePath] === newHash) {
        console.log(`⚡ Skipping unchanged file: ${filePath}`);
        return;
    }

    console.log(`🔄 Running: ${command} (file changed: ${filePath})`);
    fileHashes[filePath] = newHash;

    runCommand(command);
};

const handleFileChange = debounce(async (filename: string) => {
    const ext = extname(filename);
    const filePath = join('./', filename);

    if (filename.includes('/pages/')) {
        await checkPageListChanged(); // Detect new/deleted pages
    }

    if (ext === '.md' || ext === '.html') {
        await runCommandIfChanged('bun run ./docs-src/generate-pages.ts', filePath);
        await runCommandIfChanged('bun run ./docs-src/generate-fragments.ts', filePath);
    } else if (ext === '.ts') {
        await runCommandIfChanged('bun build docs-src/main.ts --outdir ./docs/assets/ --minify', filePath);
    } else if (ext === '.css') {
        await runCommandIfChanged('lightningcss --minify --bundle --targets ">= 0.25%" docs-src/main.css -o ./docs/assets/main.css', filePath);
    }

    await saveHashes();
}, 300);

console.log('👀 Watching for changes in docs-src/');
await loadHashes();
await loadPageList();

WATCH_DIRS.forEach(dir => {
    watch(dir, { recursive: true }, (_, filename) => {
        if (filename) handleFileChange(filename);
    });
});

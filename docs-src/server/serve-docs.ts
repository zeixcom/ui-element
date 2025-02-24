import { watch } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { ServerWebSocket } from "bun";

const execAsync = promisify(exec);
const sockets = new Set<ServerWebSocket>();

// Function to rebuild docs and notify clients
async function rebuildDocs() {
	console.log("\n🔄 Rebuilding docs...");
	const startTime = performance.now();
	try {
		await execAsync("bun run build:docs-html");
		const duration = (performance.now() - startTime).toFixed(2);
		console.log(`✨ Docs rebuilt successfully in ${duration}ms!`);
		
		// Notify all connected clients to reload
		sockets.forEach(socket => {
			socket.send('reload');
		});
	} catch (error) {
		console.error("❌ Error rebuilding docs:", error);
	}
}

// Watch for changes in markdown files
async function watchDocs() {
	console.log("👀 Watching for changes in docs-src/pages...");
	const watcher = watch("docs-src/pages", { recursive: true });
	for await (const event of watcher) {
		if (event.filename?.endsWith(".md")) {
			console.log(`\n📝 Detected change in: ${event.filename}`);
			await rebuildDocs();
		}
	}
}

// Start the watcher
watchDocs().catch(console.error);

const server = Bun.serve({
	port: 3000,
	websocket: {
		open(ws: ServerWebSocket) {
			console.log("🔌 Client connected");
			sockets.add(ws);
		},
		close(ws: ServerWebSocket) {
			console.log("🔌 Client disconnected");
			sockets.delete(ws);
		},
		message(ws: ServerWebSocket, message: string) {
			console.log("📨 Received message:", message);
		},
	},
	async fetch(req) {
		const url = new URL(req.url);
		const path = url.pathname;

		// Handle WebSocket upgrade
		if (path === '/ws') {
			const upgraded = server.upgrade(req);
			if (!upgraded) {
				return new Response('Upgrade failed', { status: 400 });
			}
			return new Response();
		}

		// Inject the reload script into HTML responses
		if (path.endsWith('.html') || path === '/') {
			try {
				let content = await Bun.file(`./docs${path === '/' ? '/index.html' : path}`).text();
				const reloadScript = `
					<script>
						const ws = new WebSocket('ws://' + window.location.host + '/ws');
						ws.onmessage = (event) => {
							if (event.data === 'reload') {
								console.log('🔄 Reloading page...');
								window.location.reload();
							}
						};
					</script>
				`;
				content = content.replace('</body>', `${reloadScript}</body>`);
				return new Response(content, {
					headers: { "Content-Type": "text/html; charset=UTF-8" },
				});
			} catch (error) {
				console.warn(`⚠️ Not found: ${path}`);
				return new Response("Fallback response");
			}
		}

		// Handle other static files
		const type = (path: string) => {
			const ext = path.split(".").pop();
			switch (ext) {
				case "js": return "application/javascript; charset=UTF-8";
				case "css": return "text/css; charset=UTF-8";
				case "png": return "image/png";
				default: return "text/html; charset=UTF-8";
			}
		}

		try {
			if (!path.match(/\.(js|css|png|ico)$/)) {
				console.log(`🌐 Serving: ${path}`);
			}
			return new Response(await Bun.file(`./docs${path}`).bytes(), {
				headers: { "Content-Type": type(path) },
			});
		} catch (error) {
			console.warn(`⚠️ Not found: ${path}`);
			return new Response("Fallback response");
		}
	},
});

console.log(`\n🚀 Server started at http://localhost:${server.port}`);
console.log("♨️  Hot Module Reloading is enabled\n");

export {};
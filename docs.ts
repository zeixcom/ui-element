Bun.serve({
	static: {
		"/": new Response(await Bun.file("./docs/index.html").bytes(), {
			headers: {
				"Content-Type": "text/html; charset=UTF-8",
			},
		})
	},
	async fetch(req: Request) {
		const path = new URL(req.url).pathname;
		const type = (path: string) => {
			// console.log(`Serving ${path}`);
			const ext = path.split(".").pop();
			switch (ext) {
				case "js":
                    return "application/javascript; charset=UTF-8";
                case "css":
                    return "text/css; charset=UTF-8";
                case "png":
                    return "image/png";
                default:
                    return "text/html; charset=UTF-8";
			}
		}
		try {
            return new Response(await Bun.file(`./docs${path}`).bytes(), {
                headers: {
                    "Content-Type": type(path),
                },
            });
		} catch (error) {
			return new Response("Fallback response");
		}
	},
});

export {};
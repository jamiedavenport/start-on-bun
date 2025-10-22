import { Glob } from "bun";

const CONSTANTS = {
	SERVER_PATH: "./dist/server/server.js",
	CLIENT_PATH: "./dist/client",
};

type ServerModule = {
	default: {
		fetch: (req: Request) => Promise<Response>;
	};
};

const serverModule = (await import(CONSTANTS.SERVER_PATH)) as ServerModule;

async function getStaticRoutes(): Promise<Record<string, () => Response>> {
    try {
    console.info("🪴 Scanning for static assets...")
	const paths = await Array.fromAsync(
		new Glob(`${CONSTANTS.CLIENT_PATH}/**/*`).scan("."),
	);
	const routes = Object.fromEntries(
		paths.map((path) => {
			const file = Bun.file(path);

            const isBundledAsset = path.includes("assets");
            // Cache bundled assets for a year, cache other assets for an hour
            const cacheControl = isBundledAsset ? "max-age=31536000" : "max-age=3600";

			return [
				path.replace(CONSTANTS.CLIENT_PATH, ""),
				() => new Response(file, { headers: { "Content-Type": file.type, "Cache-Control": cacheControl } }),
			];
		}),
	) as Record<string, () => Response>;

    console.info(`🪴 Found ${Object.keys(routes).length} static assets`);

    return routes;
} catch(error) {
        console.error("🔥 Error scanning for static assets:", error);
        return {};
    }
}


const server = Bun.serve({
	port: process.env.PORT ?? 3000,
	routes: {
		...(await getStaticRoutes()),
		"/*": async (req) => {
			return serverModule.default.fetch(req);
		},
	},
});

console.info(`🪴 Server running at ${server.hostname}:${server.port}`);
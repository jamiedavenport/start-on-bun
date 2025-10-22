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

async function getStaticRoutes(): Promise<Record<string, () => Response>> {
	const paths = await Array.fromAsync(
		new Glob(`${CONSTANTS.CLIENT_PATH}/**/*`).scan("."),
	);
	return Object.fromEntries(
		paths.map((path) => {
			const file = Bun.file(path);
			return [
				path.replace(CONSTANTS.CLIENT_PATH, ""),
				() => new Response(file, { headers: { "Content-Type": file.type } }),
			];
		}),
	) as Record<string, () => Response>;
}

Bun.serve({
	port: process.env.PORT ?? 3000,
	routes: {
		...(await getStaticRoutes()),
		"/*": async (req) => {
            const serverModule = (await import(CONSTANTS.SERVER_PATH)) as ServerModule;
            
			return serverModule.default.fetch(req);
		},
	},
});

import { Glob } from 'bun';
import {default as handler} from './dist/server/server.js';

const CLIENT_PATH = "./dist/client";

function getStaticAssetPaths() {
    const glob = new Glob(`${CLIENT_PATH}/**/*`);

    return Array.fromAsync(glob.scan("."));
}

async function getStaticRoutes() {
    const paths = await getStaticAssetPaths();

    const routes: Record<string, () => Response> = {};

    for (const path of paths) {
        const file = Bun.file(path);
        const routePath = path.replace(CLIENT_PATH, "");
        routes[routePath] = () => new Response(file, {
            headers: {
                "Content-Type": file.type,
            }
        });
    }

    return routes;
}

Bun.serve({
    port: 3000,
    routes:{
        ...(await getStaticRoutes()),
    "/*": async (req) => {
        return handler.fetch(req);
    }}
})
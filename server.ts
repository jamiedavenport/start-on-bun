Bun.serve({
    port: 3000,
    routes:{
    "/*": async (req) => {
        const url = new URL(req.url);
        const path = url.pathname;
        if (path === "/") {
            return new Response("Hello Bun!");
        }
        return new Response("Not found", { status: 404 });
    }}
})
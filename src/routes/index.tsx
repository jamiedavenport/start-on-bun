import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getMessage = createServerFn({
	method: "GET",
}).handler(() => {
	return Bun.file("./data/msg.txt").text();
});

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => ({
		message: await getMessage(),
	}),
});

function App() {
	const { message } = Route.useLoaderData();

	return <div>{message}</div>;
}

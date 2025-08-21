import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("dnd", "routes/dnd2/Editor.tsx"),
    route('edit', 'routes/editor/Editor.tsx'),
] satisfies RouteConfig;

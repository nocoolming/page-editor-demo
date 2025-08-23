import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("edit", "routes/dnd2/edit.tsx"),
    route('sort', 'routes/sortable/app.tsx'),
] satisfies RouteConfig;

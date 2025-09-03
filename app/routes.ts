import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("edit", "routes/dnd2/edit.tsx"),
    route('sort', 'routes/sortable/app.tsx'),
    route('demo', 'routes/dnd3/Demo.tsx'),
    route('ming', 'routes/dnd4/BlockRoute.tsx'),
    route('dnd5', 'routes/dnd5/View.tsx'),
] satisfies RouteConfig;

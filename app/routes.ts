import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('sort', 'routes/sortable/app.tsx'),
    route('dnd6', 'routes/dnd6/Demo.tsx'),
    route('dnd7', 'routes/demo7/Demo.tsx'),
    route("editor", "routes/mbox/Demo.tsx"),
    // route('dnd7', 'routes/dnd7/Demo.tsx'),
] satisfies RouteConfig;

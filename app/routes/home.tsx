import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { NavLink } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <ol>
        <li>
          <NavLink to='/editor'>Ming editor</NavLink>
        </li>       
      </ol>
    </div>
  );
}

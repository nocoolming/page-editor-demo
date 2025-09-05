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
          <NavLink to='/edit'>edit</NavLink>
        </li>
        <li>
          <NavLink to='/sort'>Sortable</NavLink>
        </li>
        <li>
          <NavLink to='/demo'>Demo</NavLink>
        </li>
        <li>
          <NavLink to='/ming'>Ming</NavLink>
        </li>
        <li>
          <NavLink to='/dnd5'>dnd demo5</NavLink>
        </li>
        <li>
          <NavLink to='/dnd6'>dnd demo6</NavLink>
        </li>
      </ol>
    </div>
  );
}

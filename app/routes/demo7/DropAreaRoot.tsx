import { useDroppable } from "@dnd-kit/core";
import React from "react";

export function DropAreaRoot(
    { children }:
        { children?: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id: "root" });



    return (
        <div
            ref={setNodeRef}
            className={`flex-1 border-2 ${isOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}`}
        >
            {children}
        </div>
    )
}

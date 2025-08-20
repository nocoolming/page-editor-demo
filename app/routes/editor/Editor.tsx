// app/routes/editor/Editor.tsx
import React from "react";
import MvpPageEditor from "~/component/MvpPageEditor";

export default function EditorRoute() {
  return (
    <div className="h-screen">
      <MvpPageEditor
        onChange={(page) => {
          // 这里就是前端 onChange 行为：随编辑推送最新 Schema
          console.log("page changed:", page);
        }}
      />
    </div>
  );
}

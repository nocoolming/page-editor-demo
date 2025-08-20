import type { BlockSchema } from './types';
import { PaletteItem } from './PaletteItem';

// 组件库（左栏）
const PALETTE: Array<{ type: BlockSchema["type"]; label: string }> = [
  { type: "Text", label: "Text" },
  { type: "Image", label: "Image" },
  { type: "Container", label: "Container" },
];

export function ComponentLibrary() {
  return (
    <div className="p-3 border-r h-full overflow-auto">
      <div className="font-semibold mb-2">组件库</div>
      {PALETTE.map((c) => (
        <PaletteItem key={c.type} id={`palette:${c.type}`} label={c.label} />
      ))}
      <div className="text-xs text-gray-500 mt-3">
        拖到 Header / Template / Footer 或任意 Container 中
      </div>
    </div>
  );
}
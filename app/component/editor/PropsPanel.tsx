import type { BlockSchema } from './types';

export function PropsPanel({
  selected,
  onChange,
  onDelete,
}: {
  selected?: BlockSchema;
  onChange: (p: Record<string, any>) => void;
  onDelete: () => void;
}) {
  if (!selected) return <div className="text-sm text-gray-500">选择一个区块以编辑属性</div>;
  const update = (k: string, v: any) => onChange({ ...selected.props, [k]: v });

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">{selected.type} 属性</div>

      {selected.type === "Text" && (
        <label className="block text-sm">
          <span className="text-xs text-gray-500">content</span>
          <textarea
            className="w-full border rounded p-1"
            rows={4}
            value={selected.props.content || ""}
            onChange={(e) => update("content", e.target.value)}
          />
        </label>
      )}

      {selected.type === "Image" && (
        <>
          <label className="block text-sm">
            <span className="text-xs text-gray-500">src</span>
            <input
              className="w-full border rounded p-1"
              value={selected.props.src || ""}
              onChange={(e) => update("src", e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs text-gray-500">alt</span>
            <input
              className="w-full border rounded p-1"
              value={selected.props.alt || ""}
              onChange={(e) => update("alt", e.target.value)}
            />
          </label>
        </>
      )}

      {selected.type === "Container" && (
        <>
          <label className="block text-sm">
            <span className="text-xs text-gray-500">direction</span>
            <select
              className="w-full border rounded p-1"
              value={selected.props.direction || "column"}
              onChange={(e) => update("direction", e.target.value)}
            >
              <option value="column">column</option>
              <option value="row">row</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs text-gray-500">gap</span>
            <input
              type="number"
              className="w-full border rounded p-1"
              value={selected.props.gap ?? 8}
              onChange={(e) => update("gap", Number(e.target.value))}
            />
          </label>
        </>
      )}

      {selected.type === "Header" && (
        <label className="block text-sm">
          <span className="text-xs text-gray-500">logo</span>
          <input
            className="w-full border rounded p-1"
            value={selected.props.logo || ""}
            onChange={(e) => update("logo", e.target.value)}
          />
        </label>
      )}

      {selected.type === "Footer" && (
        <label className="block text-sm">
          <span className="text-xs text-gray-500">copyright</span>
          <input
            className="w-full border rounded p-1"
            value={selected.props.copyright || ""}
            onChange={(e) => update("copyright", e.target.value)}
          />
        </label>
      )}

      <div className="pt-2">
        <button className="text-red-600 text-sm" onClick={onDelete}>
          删除区块
        </button>
      </div>
    </div>
  );
}
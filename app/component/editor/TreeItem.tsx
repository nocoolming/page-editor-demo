import type { BlockSchema } from './types';

export function TreeItem({
  node,
  depth,
  onSelect,
  selectedId,
}: {
  node: BlockSchema;
  depth: number;
  onSelect: (id: string) => void;
  selectedId?: string;
}) {
  const isSel = selectedId === node.id;
  return (
    <div className={"text-sm pl-" + depth * 3}>
      <button
        className={
          (isSel ? "bg-blue-50 text-blue-700 " : "") +
          " w-full text-left px-2 py-1 rounded hover:bg-gray-50"
        }
        onClick={() => onSelect(node.id)}
      >
        {node.type} <span className="text-gray-400">#{node.id.slice(0, 6)}</span>
      </button>
      {(node.children || []).map((c) => (
        <TreeItem
          key={c.id}
          node={c}
          depth={depth + 1}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}
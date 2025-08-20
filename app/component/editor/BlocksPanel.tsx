import { useMemo } from 'react';
import type { BlockSchema, PageSchema } from './types';
import { TreeItem } from './TreeItem';

export function BlocksPanel({
  page,
  onSelect,
  selectedId,
}: {
  page: PageSchema;
  onSelect: (id: string) => void;
  selectedId?: string;
}) {
  const templateRoot: BlockSchema = useMemo(
    () => ({ id: "template-root", type: "Container", props: {}, children: page.template }),
    [page.template]
  );
  return (
    <div className="space-y-2">
      <div>
        <div className="text-xs font-semibold mb-1">Header</div>
        <TreeItem node={page.header} depth={0} onSelect={onSelect} selectedId={selectedId} />
      </div>
      <div>
        <div className="text-xs font-semibold mb-1">Template</div>
        <TreeItem node={templateRoot} depth={0} onSelect={onSelect} selectedId={selectedId} />
      </div>
      <div>
        <div className="text-xs font-semibold mb-1">Footer</div>
        <TreeItem node={page.footer} depth={0} onSelect={onSelect} selectedId={selectedId} />
      </div>
    </div>
  );
}
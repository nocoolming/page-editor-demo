import React, { useMemo, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { v4 as uuid } from "uuid";

// 导入类型和工具函数
import type { BlockSchema, PageSchema } from './types';
import { clone, findBlockById, pushIntoContainer } from './utils';

// 导入组件
import { ComponentLibrary } from './ComponentLibrary';
import { BlockView } from './BlockView';
import { BlocksPanel } from './BlocksPanel';
import { PropsPanel } from './PropsPanel';
import { SectionFrame } from './SectionFrame';

// 主编辑器（React 19 + RRv7 兼容）
export default function MvpPageEditor({
  onChange,
}: {
  onChange?: (page: PageSchema) => void;
}) {
  const [page, setPage] = useState<PageSchema>({
    header: { id: "h1", type: "Header", props: { logo: "MySite" }, children: [] },
    template: [{ id: uuid(), type: "Text", props: { content: "Hello World" } }],
    footer: { id: "f1", type: "Footer", props: { copyright: "©2025" }, children: [] },
  });
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const selected: BlockSchema | undefined = useMemo(() => {
    if (!selectedId) return undefined;
    if (page.header.id === selectedId) return page.header;
    if (page.footer.id === selectedId) return page.footer;
    const t = findBlockById(page.template, selectedId).block;
    if (t) return t;
    const h = findBlockById(page.header.children || [], selectedId).block;
    if (h) return h;
    const f = findBlockById(page.footer.children || [], selectedId).block;
    return f;
  }, [selectedId, page]);

  function emit(next: PageSchema) {
    setPage(next);
    onChange?.(next);
  }

  function createBlock(type: BlockSchema["type"]): BlockSchema {
    const base: BlockSchema = { id: uuid(), type, props: {} };
    if (type === "Container" || type === "Header" || type === "Footer") base.children = [];
    return base;
  }

  function handleDropTo(
    target: "area:header" | "area:template" | "area:footer" | `container:${string}`,
    type: BlockSchema["type"]
  ) {
    const next = clone(page);
    const newBlock = createBlock(type);

    if (target === "area:template") {
      next.template.push(newBlock);
    } else if (target === "area:header") {
      pushIntoContainer(next.header, newBlock);
    } else if (target === "area:footer") {
      pushIntoContainer(next.footer, newBlock);
    } else if (target.startsWith("container:")) {
      const id = target.split(":")[1];
      const inTemplate = findBlockById(next.template, id).block;
      if (inTemplate) {
        pushIntoContainer(inTemplate, newBlock);
        emit(next);
        return;
      }
      const inHeader = findBlockById(next.header.children || [], id).block;
      if (inHeader) {
        pushIntoContainer(inHeader, newBlock);
        emit(next);
        return;
      }
      const inFooter = findBlockById(next.footer.children || [], id).block;
      if (inFooter) {
        pushIntoContainer(inFooter, newBlock);
        emit(next);
        return;
      }
    }
    emit(next);
  }

  function onDragEnd(e: DragEndEvent) {
    if (!e.over) return;
    const active = String(e.active.id);
    if (!active.startsWith("palette:")) return;
    const type = active.split(":")[1] as BlockSchema["type"];
    handleDropTo(String(e.over.id) as any, type);
  }

  function updateSelectedProps(props: Record<string, any>) {
    if (!selected) return;
    const next = clone(page);
    if (selected.id === next.header.id) next.header.props = props;
    else if (selected.id === next.footer.id) next.footer.props = props;
    else {
      const t = findBlockById(next.template, selected.id);
      if (t.block) t.block.props = props;
      else {
        const h = findBlockById(next.header.children || [], selected.id);
        if (h.block) h.block.props = props;
        else {
          const f = findBlockById(next.footer.children || [], selected.id);
          if (f.block) f.block.props = props;
        }
      }
    }
    emit(next);
  }

  function deleteSelected() {
    if (!selected) return;
    if (selected.type === "Header" || selected.type === "Footer") return; // 根 Header/Footer 不允许删
    const next = clone(page);
    const removeFrom = (arr: BlockSchema[]) => {
      const idx = arr.findIndex((b) => b.id === selected.id);
      if (idx >= 0) {
        arr.splice(idx, 1);
        return true;
      }
      for (const b of arr) if (b.children && removeFrom(b.children)) return true;
      return false;
    };
    if (!removeFrom(next.template)) {
      if (!(removeFrom(next.header.children || []))) removeFrom(next.footer.children || []);
    }
    setSelectedId(undefined);
    emit(next);
  }

  const addTo =
    (area: "header" | "template" | "footer") => (type: BlockSchema["type"]) => {
      const dropId =
        area === "template" ? "area:template" : area === "header" ? "area:header" : "area:footer";
      handleDropTo(dropId as any, type);
    };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-12 h-screen">
        {/* 左侧：组件库 */}
        <div className="col-span-2">
          <ComponentLibrary />
        </div>

        {/* 中间：所见即所得画布（Header/Template/Footer 仅 hover 显示名称与工具） */}
        <div className="col-span-7 p-4 overflow-auto bg-white">
          <div className="text-xs text-gray-500 mb-2">将左侧组件拖入下方区域</div>

          {/* Header */}
          <SectionFrame
            name="Header"
            droppableId="area:header"
            isGlobal
            onAdd={() => addTo("header")("Text")}
            onEdit={() => setSelectedId(page.header.id)}
          >
            <div className="flex flex-col gap-2" onClick={() => setSelectedId(undefined)}>
              {(page.header.children || []).map((b) => (
                <BlockView key={b.id} block={b} selectedId={selectedId} onSelect={setSelectedId} />
              ))}
            </div>
          </SectionFrame>

          {/* Template */}
          <SectionFrame
            name="Template"
            droppableId="area:template"
            onAdd={() => addTo("template")("Text")}
            onEdit={() => setSelectedId(undefined)}
          >
            <div className="flex flex-col gap-2" onClick={() => setSelectedId(undefined)}>
              {page.template.map((b) => (
                <BlockView key={b.id} block={b} selectedId={selectedId} onSelect={setSelectedId} />
              ))}
            </div>
          </SectionFrame>

          {/* Footer */}
          <SectionFrame
            name="Footer"
            droppableId="area:footer"
            isGlobal
            onAdd={() => addTo("footer")("Text")}
            onEdit={() => setSelectedId(page.footer.id)}
          >
            <div className="flex flex-col gap-2" onClick={() => setSelectedId(undefined)}>
              {(page.footer.children || []).map((b) => (
                <BlockView key={b.id} block={b} selectedId={selectedId} onSelect={setSelectedId} />
              ))}
            </div>
          </SectionFrame>
        </div>

        {/* 右侧：Blocks & Props & JSON */}
        <div className="col-span-3 border-l h-full flex flex-col">
          <div className="p-3 border-b">
            <div className="font-semibold mb-2">Blocks</div>
            <BlocksPanel page={page} onSelect={setSelectedId} selectedId={selectedId} />
          </div>
          <div className="p-3 flex-1 overflow-auto">
            <PropsPanel selected={selected} onChange={updateSelectedProps} onDelete={deleteSelected} />
          </div>
          <div className="p-3 border-t h-56 overflow-auto bg-gray-50">
            <div className="font-semibold mb-2">Schema JSON</div>
            <pre className="text-[10px] whitespace-pre-wrap">
              {JSON.stringify(page, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
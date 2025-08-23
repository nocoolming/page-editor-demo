import React, { useMemo, useState } from "react"
import * as DndCore from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import * as DndSortable from "@dnd-kit/sortable"
import * as DndUtils from "@dnd-kit/utilities"
import { v4 as uuid } from "uuid"

// =============== 数据结构 ===============
type BlockSchema = {
  id: string
  type: "Header" | "Footer" | "Text" | "Image" | "Container"
  props: Record<string, any>
  children?: BlockSchema[]
}

type PageSchema = {
  header: BlockSchema
  template: BlockSchema[]
  footer: BlockSchema
}

// =============== 工具函数 ===============
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }

function findBlockById(list: BlockSchema[], id: string): { parent?: BlockSchema; index: number; block?: BlockSchema } {
  for (let i = 0; i < list.length; i++) {
    const b = list[i]
    if (b.id === id) return { index: i, block: b }
    if (b.children?.length) {
      const r = findBlockById(b.children, id)
      if (r.block) return { parent: b, index: r.index, block: r.block }
    }
  }
  return { index: -1 }
}

function pushIntoContainer(target: BlockSchema, child: BlockSchema) {
  if (!target.children) target.children = []
  target.children.push(child)
}

// 递归：在任意 siblings 中重排 active -> over
function reorderSiblingsDeep(arr: BlockSchema[], activeId: string, overId: string): boolean {
  const ai = arr.findIndex(b => b.id === activeId)
  const oi = arr.findIndex(b => b.id === overId)
  if (ai >= 0 && oi >= 0) {
    const [m] = arr.splice(ai, 1)
    arr.splice(oi, 0, m)
    return true
  }
  for (const b of arr) if (b.children && reorderSiblingsDeep(b.children, activeId, overId)) return true
  return false
}

// 递归：删除指定 id
function deleteByIdDeep(arr: BlockSchema[], id: string): boolean {
  const idx = arr.findIndex(b => b.id === id)
  if (idx >= 0) { arr.splice(idx, 1); return true }
  for (const b of arr) if (b.children && deleteByIdDeep(b.children, id)) return true
  return false
}

// =============== 组件库（左栏） ===============
const PALETTE: Array<{ type: BlockSchema["type"]; label: string }> = [
  { type: "Text", label: "Text" },
  { type: "Image", label: "Image" },
  { type: "Container", label: "Container" },
]

function ComponentLibrary() {
  return (
    <div className="p-3 border-r h-full overflow-auto">
      <div className="font-semibold mb-2">组件库</div>
      {PALETTE.map((c) => (
        <PaletteItem key={c.type} id={`palette:${c.type}`} label={c.label} />
      ))}
      <div className="text-xs text-gray-500 mt-3">拖到 Header / Template / Footer 或任意 Container 中；在编辑区内可拖动排序</div>
    </div>
  )
}

function PaletteItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef } = DndCore.useDraggable({ id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="px-2 py-1 border rounded mb-1 cursor-grab select-none bg-white">
      {label}
    </div>
  )
}

// =============== 通用可投放区域 ===============
function DroppableArea({ id, className, children }: { id: string; className?: string; children?: React.ReactNode }) {
  const { isOver, setNodeRef } = DndCore.useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={"min-h-[40px] rounded transition " + (isOver ? "bg-blue-50 ring-1 ring-blue-300 " : "") + (className || "")}
    >
      {children}
    </div>
  )
}

// =============== Block 可排序外壳 ===============
function SortableItem({ block, children }: { block: BlockSchema; children: React.ReactNode }) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = DndSortable.useSortable({ id: block.id })
  const style: React.CSSProperties = {
    transform: DndUtils.CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

// =============== 所见即所得渲染（带删除按钮 & 容器可投放） ===============
function BlockCard({ block, selectedId, onSelect, onDelete }: {
  block: BlockSchema
  selectedId?: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}) {
  const selected = selectedId === block.id
  const baseCls = "relative group rounded p-2 transition ring-offset-2 bg-white " + (selected ? " ring-2 ring-blue-500" : " border")
  const handleClick: React.MouseEventHandler = (e) => { e.stopPropagation(); onSelect(block.id) }

  // 删除按钮（编辑区内）
  const DeleteBtn = (
    <button
      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-[10px] px-1 py-[1px] border rounded bg-white hover:bg-gray-100"
      onClick={(e) => { e.stopPropagation(); onDelete(block.id) }}
      title="删除此区块"
    >🗑</button>
  )

  if (block.type === "Text") {
    return (
      <div className={baseCls} onClick={handleClick}>
        {DeleteBtn}
        <p className="whitespace-pre-wrap">{block.props.content || "双击右侧编辑内容"}</p>
      </div>
    )
  }
  if (block.type === "Image") {
    return (
      <div className={baseCls} onClick={handleClick}>
        {DeleteBtn}
        <img className="inline-block max-w-full" src={block.props.src || "https://via.placeholder.com/600x200"} alt={block.props.alt || ""} />
      </div>
    )
  }
  if (block.type === "Container") {
    const dir = block.props.direction === "row" ? "flex-row" : "flex-col"
    const gap = Number(block.props.gap ?? 8)
    return (
      <div className={baseCls} onClick={handleClick}>
        {DeleteBtn}
        {/* 仅 Container 接受投放（palette 新增） */}
        <DroppableArea id={`container:${block.id}`} className={`flex ${dir}`}>
          {/* 子元素可排序 */}
          <DndSortable.SortableContext items={(block.children||[]).map(b=>b.id)} strategy={DndSortable.verticalListSortingStrategy}>
            <div className="flex w-full" style={{ gap }}>
              {(block.children || []).map((child) => (
                <SortableItem key={child.id} block={child}>
                  <BlockCard block={child} selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} />
                </SortableItem>
              ))}
            </div>
          </DndSortable.SortableContext>
        </DroppableArea>
      </div>
    )
  }
  return null
}

// =============== 右侧：Blocks 树 & 属性编辑 ===============
function TreeItem({ node, depth, onSelect, selectedId }: { node: BlockSchema; depth: number; onSelect: (id: string) => void; selectedId?: string }) {
  const isSel = selectedId === node.id
  return (
    <div className={"text-sm pl-" + depth * 3}>
      <button className={(isSel ? "bg-blue-50 text-blue-700 " : "") + " w-full text-left px-2 py-1 rounded hover:bg-gray-50"} onClick={() => onSelect(node.id)}>
        {node.type} <span className="text-gray-400">#{node.id.slice(0, 6)}</span>
      </button>
      {(node.children || []).map((c) => <TreeItem key={c.id} node={c} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />)}
    </div>
  )
}

function BlocksPanel({ page, onSelect, selectedId }: { page: PageSchema; onSelect: (id: string) => void; selectedId?: string }) {
  const templateRoot: BlockSchema = useMemo(() => ({ id: "template-root", type: "Container", props: {}, children: page.template }), [page.template])
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
  )
}

function PropsPanel({ selected, onChange, onDelete }: { selected?: BlockSchema; onChange: (p: Record<string, any>) => void; onDelete: () => void }) {
  if (!selected) return <div className="text-sm text-gray-500">选择一个区块以编辑属性</div>
  const update = (k: string, v: any) => onChange({ ...selected.props, [k]: v })
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold">{selected.type} 属性</div>
      {selected.type === "Text" && (
        <label className="block text-sm">
          <span className="text-xs text-gray-500">content</span>
          <textarea className="w-full border rounded p-1" rows={4} value={selected.props.content || ""} onChange={(e) => update("content", e.target.value)} />
        </label>
      )}
      {selected.type === "Image" && (
        <>
          <label className="block text-sm">
            <span className="text-xs text-gray-500">src</span>
            <input className="w-full border rounded p-1" value={selected.props.src || ""} onChange={(e) => update("src", e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-xs text-gray-500">alt</span>
            <input className="w-full border rounded p-1" value={selected.props.alt || ""} onChange={(e) => update("alt", e.target.value)} />
          </label>
        </>
      )}
      {selected.type === "Container" && (
        <>
          <label className="block text-sm">
            <span className="text-xs text-gray-500">direction</span>
            <select className="w-full border rounded p-1" value={selected.props.direction || "column"} onChange={(e) => update("direction", e.target.value)}>
              <option value="column">column</option>
              <option value="row">row</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs text-gray-500">gap</span>
            <input type="number" className="w-full border rounded p-1" value={selected.props.gap ?? 8} onChange={(e) => update("gap", Number(e.target.value))} />
          </label>
        </>
      )}
      {selected.type === "Header" && (
        <label className="block text-sm">
          <span className="text-xs text-gray-500">logo</span>
          <input className="w-full border rounded p-1" value={selected.props.logo || ""} onChange={(e) => update("logo", e.target.value)} />
        </label>
      )}
      {selected.type === "Footer" && (
        <label className="block text-sm">
          <span className="text-xs text-gray-500">copyright</span>
          <input className="w-full border rounded p-1" value={selected.props.copyright || ""} onChange={(e) => update("copyright", e.target.value)} />
        </label>
      )}
      <div className="pt-2">
        <button className="text-red-600 text-sm" onClick={onDelete}>删除区块</button>
      </div>
    </div>
  )
}

// =============== 区段框架（只在 hover 显示名称 + 工具条） ===============
function SectionFrame({ name, droppableId, children, onAdd, onEdit, onDelete, isGlobal }: {
  name: string
  droppableId: string
  children?: React.ReactNode
  onAdd: () => void
  onEdit: () => void
  onDelete?: () => void
  isGlobal?: boolean
}) {
  const { isOver, setNodeRef } = DndCore.useDroppable({ id: droppableId })
  return (
    <div ref={setNodeRef} className={"relative group rounded p-2 min-h-[56px] " + (isOver ? "bg-blue-50 ring-1 ring-blue-300" : "") }>
      {/* 名称条（仅 hover 显示） */}
      <div className="pointer-events-none absolute -top-3 left-2 opacity-0 group-hover:opacity-100 text-[11px] px-1 bg-gray-800 text-white rounded">
        {name}
      </div>
      {/* 工具条（仅 hover 显示） */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
        {isGlobal && <span className="text-[10px] text-blue-500 px-1 py-[1px] border border-blue-200 rounded">🔗 全站共享</span>}
        <button className="text-[10px] px-1 py-[1px] border rounded bg-white hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onAdd() }}>➕</button>
        <button className="text-[10px] px-1 py-[1px] border rounded bg-white hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onEdit() }}>✏️</button>
        {onDelete && <button className="text-[10px] px-1 py-[1px] border rounded bg-white hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onDelete() }}>🗑</button>}
      </div>
      <div>{children}</div>
    </div>
  )
}

// =============== 主编辑器 ===============
export default function EditorApp({ onChange }: { onChange?: (page: PageSchema) => void }) {
  const [page, setPage] = useState<PageSchema>({
    header: { id: "h1", type: "Header", props: { logo: "MySite" }, children: [] },
    template: [ { id: uuid(), type: "Text", props: { content: "Hello World" } } ],
    footer: { id: "f1", type: "Footer", props: { copyright: "©2025" }, children: [] },
  })
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null)

  const sensors = DndCore.useSensors(
    DndCore.useSensor(DndCore.PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const selected: BlockSchema | undefined = useMemo(() => {
    if (!selectedId) return undefined
    if (page.header.id === selectedId) return page.header
    if (page.footer.id === selectedId) return page.footer
    const t = findBlockById(page.template, selectedId).block
    if (t) return t
    const h = findBlockById(page.header.children || [], selectedId).block
    if (h) return h
    const f = findBlockById(page.footer.children || [], selectedId).block
    return f
  }, [selectedId, page])

  function emit(next: PageSchema) {
    setPage(next)
    onChange?.(next)
  }

  function createBlock(type: BlockSchema["type"]): BlockSchema {
    const base: BlockSchema = { id: uuid(), type, props: {} }
    if (type === "Container" || type === "Header" || type === "Footer") base.children = []
    if (type === "Text") base.props = { content: "新文本" }
    if (type === "Image") base.props = { src: "https://via.placeholder.com/600x200", alt: "" }
    return base
  }

  function handleDropTo(target: "area:header" | "area:template" | "area:footer" | `container:${string}`, type: BlockSchema["type"]) {
    const next = clone(page)
    const newBlock = createBlock(type)

    if (target === "area:template") {
      next.template.push(newBlock)
    } else if (target === "area:header") {
      pushIntoContainer(next.header, newBlock)
    } else if (target === "area:footer") {
      pushIntoContainer(next.footer, newBlock)
    } else if (target.startsWith("container:")) {
      const id = target.split(":")[1]
      const inTemplate = findBlockById(next.template, id).block
      if (inTemplate) { pushIntoContainer(inTemplate, newBlock); emit(next); return }
      const inHeader = findBlockById(next.header.children || [], id).block
      if (inHeader) { pushIntoContainer(inHeader, newBlock); emit(next); return }
      const inFooter = findBlockById(next.footer.children || [], id).block
      if (inFooter) { pushIntoContainer(inFooter, newBlock); emit(next); return }
    }
    emit(next)
  }

  // ==== DnD 事件 ====
  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    if (id.startsWith("palette:")) setDraggingLabel(id.split(":")[1])
    else setDraggingLabel("Block")
  }

  function onDragEnd(e: DragEndEvent) {
    setDraggingLabel(null)
    if (!e.over) return
    const overId = String(e.over.id)
    const activeId = String(e.active.id)

    // 从左侧组件库拖拽新增
    if (activeId.startsWith("palette:")) {
      const type = activeId.split(":")[1] as BlockSchema["type"]
      handleDropTo(overId as any, type)
      return
    }

    // 编辑区内部排序（仅在同级内）
    const next = clone(page)
    const did =
      reorderSiblingsDeep(next.template, activeId, overId) ||
      reorderSiblingsDeep(next.header.children || [], activeId, overId) ||
      reorderSiblingsDeep(next.footer.children || [], activeId, overId)
    if (did) emit(next)
  }

  function updateSelectedProps(props: Record<string, any>) {
    if (!selected) return
    const next = clone(page)
    if (selected.id === next.header.id) next.header.props = props
    else if (selected.id === next.footer.id) next.footer.props = props
    else {
      const t = findBlockById(next.template, selected.id)
      if (t.block) t.block.props = props
      else {
        const h = findBlockById(next.header.children || [], selected.id)
        if (h.block) h.block.props = props
        else {
          const f = findBlockById(next.footer.children || [], selected.id)
          if (f.block) f.block.props = props
        }
      }
    }
    emit(next)
  }

  function deleteById(id?: string) {
    if (!id) return
    if (id === page.header.id || id === page.footer.id) return // 根 Header/Footer 不允许删
    const next = clone(page)
    const ok = deleteByIdDeep(next.template, id) || deleteByIdDeep(next.header.children || [], id) || deleteByIdDeep(next.footer.children || [], id)
    if (ok) {
      if (selectedId === id) setSelectedId(undefined)
      emit(next)
    }
  }

  const addTo = (area: "header" | "template" | "footer") => (type: BlockSchema["type"]) => {
    const dropId = area === "template" ? "area:template" : (area === "header" ? "area:header" : "area:footer")
    handleDropTo(dropId as any, type)
  }

  return (
    <DndCore.DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-12 h-screen">
        {/* 左侧：组件库 */}
        <div className="col-span-2">
          <ComponentLibrary />
        </div>

        {/* 中间：所见即所得画布（Header/Template/Footer 仅 hover 显示名称与工具） */}
        <div className="col-span-7 p-4 overflow-auto bg-white">
          <div className="text-xs text-gray-500 mb-2">将左侧组件拖入下方区域；在编辑区内拖动即可调整顺序</div>

          {/* Header */}
          <SectionFrame
            name="Header"
            droppableId="area:header"
            isGlobal
            onAdd={() => addTo("header")("Text")}
            onEdit={() => setSelectedId(page.header.id)}
          >
            <DndSortable.SortableContext items={(page.header.children||[]).map(b=>b.id)} strategy={DndSortable.verticalListSortingStrategy}>
              <div className="flex flex-col gap-2" onClick={() => setSelectedId(undefined)}>
                {(page.header.children || []).map((b) => (
                  <SortableItem key={b.id} block={b}>
                    <BlockCard block={b} selectedId={selectedId} onSelect={setSelectedId} onDelete={(id)=>deleteById(id)} />
                  </SortableItem>
                ))}
              </div>
            </DndSortable.SortableContext>
          </SectionFrame>

          {/* Template */}
          <SectionFrame
            name="Template"
            droppableId="area:template"
            onAdd={() => addTo("template")("Text")}
            onEdit={() => setSelectedId(undefined)}
          >
            <DndSortable.SortableContext items={page.template.map(b=>b.id)} strategy={DndSortable.verticalListSortingStrategy}>
              <div className="flex flex-col gap-2" onClick={() => setSelectedId(undefined)}>
                {page.template.map((b) => (
                  <SortableItem key={b.id} block={b}>
                    <BlockCard block={b} selectedId={selectedId} onSelect={setSelectedId} onDelete={(id)=>deleteById(id)} />
                  </SortableItem>
                ))}
              </div>
            </DndSortable.SortableContext>
          </SectionFrame>

          {/* Footer */}
          <SectionFrame
            name="Footer"
            droppableId="area:footer"
            isGlobal
            onAdd={() => addTo("footer")("Text")}
            onEdit={() => setSelectedId(page.footer.id)}
          >
            <DndSortable.SortableContext items={(page.footer.children||[]).map(b=>b.id)} strategy={DndSortable.verticalListSortingStrategy}>
              <div className="flex flex-col gap-2" onClick={() => setSelectedId(undefined)}>
                {(page.footer.children || []).map((b) => (
                  <SortableItem key={b.id} block={b}>
                    <BlockCard block={b} selectedId={selectedId} onSelect={setSelectedId} onDelete={(id)=>deleteById(id)} />
                  </SortableItem>
                ))}
              </div>
            </DndSortable.SortableContext>
          </SectionFrame>
        </div>

        {/* 右侧：Blocks & Props & JSON */}
        <div className="col-span-3 border-l h-full flex flex-col">
          <div className="p-3 border-b">
            <div className="font-semibold mb-2">Blocks</div>
            <BlocksPanel page={page} onSelect={setSelectedId} selectedId={selectedId} />
          </div>
          <div className="p-3 flex-1 overflow-auto">
            <PropsPanel selected={selected} onChange={updateSelectedProps} onDelete={() => deleteById(selectedId)} />
          </div>
          <div className="p-3 border-t h-56 overflow-auto bg-gray-50">
            <div className="font-semibold mb-2">Schema JSON</div>
            <pre className="text-[10px] whitespace-pre-wrap">{JSON.stringify(page, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* 拖拽影子（DragOverlay） */}
      <DndCore.DragOverlay dropAnimation={null}>
        {draggingLabel ? (
          <div className="px-2 py-1 border rounded bg-white shadow">{draggingLabel}</div>
        ) : null}
      </DndCore.DragOverlay>
    </DndCore.DndContext>
  )
}

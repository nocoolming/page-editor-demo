import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className='px-3 py-2 border-2 border-amber-300 bg-emerald-300'
      ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* ... */}
      <span>hello {props.id}</span>
    </div>
  );
}

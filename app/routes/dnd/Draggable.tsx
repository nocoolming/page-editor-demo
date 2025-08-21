import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export function Draggable(props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;


  return (
    <button
      className='px-3 py-2 border-amber-300 border-2'
      ref={setNodeRef} style={style}
      onDragEnd={e => {
        console.log(e);
      }}
      {...listeners} {...attributes}

    >
      {props.children}
    </button>
  );
}
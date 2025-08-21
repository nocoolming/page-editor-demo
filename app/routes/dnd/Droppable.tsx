import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export function Droppable(props) {
  const {isOver, setNodeRef} = useDroppable({
    id: props.id,
  });
  const style = {
    color: isOver ? 'green' : undefined,
  };
  
  
  return (
    <div 
    ref={setNodeRef} 
    style={style}
    onDragEnd={e => {
      console.log(e);
    }}
    >
      {props.children}
    </div>
  );
}
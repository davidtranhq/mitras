import React from 'react';

/**
 * Get a position and callback functions for moving the position on click+drag.
 * @param initialPos the initial position of the element
 */
export default function useDraggablePosition(
  initialPos = { x: 0, y: 0 },
  minimum = { x: -Infinity, y: -Infinity },
  maximum = { x: Infinity, y: Infinity },
) {
  const [position, setPosition] = React.useState({ x: initialPos.x, y: initialPos.y });
  const isDragging = React.useRef(false);
  const startPos = React.useRef({ x: 0, y: 0 });

  function onDragMove(e: MouseEvent) {
    if (!isDragging) {
      return;
    }
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    startPos.current.x = e.clientX;
    startPos.current.y = e.clientY;
    setPosition((oldPos) => {
      const newX = Math.min(Math.max(oldPos.x + dx, minimum.x), maximum.x);
      const newY = Math.min(Math.max(oldPos.y + dy, minimum.y), maximum.y);
      return {
        x: newX,
        y: newY,
      };
    });
  }
  function onDragEnd() {
    isDragging.current = false;
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('mousemove', onDragMove);
  }
  function onDragStart(e: React.MouseEvent) {
    isDragging.current = true;
    startPos.current.x = e.clientX;
    startPos.current.y = e.clientY;
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('mousemove', onDragMove);
  }

  return {
    position,
    setPosition,
    onDragStart,
  };
}

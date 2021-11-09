import React from 'react';

function useMousePan(initialPosition: { x: number, y: number } = { x: 0, y: 0 }) {
  const [position, setPosition] = React.useState({
    x: initialPosition.x,
    y: initialPosition.y,
  });
}

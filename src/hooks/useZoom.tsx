import React from 'react';

/**
 * Get a zoom factor and a WheelEvent callback to zoom in and out
 * (<0 = zoom out, >0 = zoom in)
 */
export default function useZoom() {
  const [zoom, setZoom] = React.useState(0);
  function onZoom(e: WheelEvent) {
    setZoom((oldZoom) => oldZoom + e.deltaY);
  }
  return {
    zoom,
    onZoom,
  };
}

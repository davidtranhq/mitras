import React from 'react';

import 'styles/GraphExample.css';

export interface GraphExampleProps {
  code: string; // graph serialized and encoded in base64
  thumbnail: string; // path to a thumbnail for the graph
  tooltip: string;
  onClick: () => void;
}

/**
 * An example graph that can be imported through the graph menu.
 */
export default function GraphExample({
  code,
  thumbnail,
  tooltip,
  onClick,
}: GraphExampleProps) {
  function handleKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === 'Enter') {
      onClick();
    }
  }

  return (
    <div
      className="graph-example"
      onClick={onClick}
      role="button"
      aria-label={`Graph Example:${tooltip}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <img className="graph-example-thumbnail" src={thumbnail} alt={tooltip} />
      <span className="graph-example-tooltip">{tooltip}</span>
    </div>
  );
}

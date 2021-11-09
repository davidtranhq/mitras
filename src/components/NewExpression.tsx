import React from 'react';

import { IconButton } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

export default function NewExpression({ onClick }: { onClick: () => void }) {
  function handleKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === 'Enter') {
      onClick();
    }
  }
  return (
    <IconButton
      className="expression-new"
      role="button"
      aria-label="New Expression"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <AddOutlined />
    </IconButton>
  );
}

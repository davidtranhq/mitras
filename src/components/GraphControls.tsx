import React from 'react';

import { Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

interface GraphControlProps {
  centerGraph: () => void;
}

export default function GraphControls({ centerGraph }: GraphControlProps) {
  return (
    <div className="graph-controls">
      <Button
        className="center-graph"
        onClick={centerGraph}
        variant="contained"
        style={{ backgroundColor: '#ededed', color: 'gray' }}
      >
        <HomeIcon fontSize="small" />
      </Button>
    </div>
  );
}

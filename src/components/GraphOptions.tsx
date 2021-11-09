import React from 'react';
import { IconButton } from '@mui/material';
import { Home as HomeIcon, Build as BuildIcon } from '@mui/icons-material';

import ExprMenu from 'components/ExprMenu';
import { DrawOptions } from 'utils/draw';

interface GraphOptionsProps {
  currentOptions: DrawOptions,
  setGraphOptions: (options: Partial<DrawOptions>) => void;
  centerGraph: () => void;
}

export default function GraphOptions({
  currentOptions,
  setGraphOptions,
  centerGraph,
}: GraphOptionsProps) {
  // We use the expression options here because they are identical to graph options
  const exprMenuOptions = {
    color: {
      value: currentOptions.color,
      onChange: (color: string) => setGraphOptions({ color }),
    },
    showCoords: {
      value: currentOptions.showCoords,
      onChange: (showCoords: boolean) => setGraphOptions({ showCoords }),
    },
    showMinor: {
      value: currentOptions.showMinor,
      onChange: (showMinor: boolean) => setGraphOptions({ showMinor }),
    },
    visible: {
      value: currentOptions.visible,
      onChange: (visible: boolean) => setGraphOptions({ visible }),
    },
  };
  return (
    <div className="graph-options">
      <IconButton onClick={centerGraph}>
        <HomeIcon />
      </IconButton>
      <ExprMenu
        icon={<BuildIcon />}
        {...exprMenuOptions}
      />
    </div>
  );
}

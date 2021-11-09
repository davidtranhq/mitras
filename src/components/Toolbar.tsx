import React from 'react';

import {
  Add as AddIcon,
  Calculate as CalculateIcon,
  FormatQuote as FormatQuoteIcon,
  DoubleArrow as DoubleArrowIcon,
} from '@mui/icons-material';
import {
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import PopoverIconMenu from 'components/generic/PopoverIconMenu';
import type { ExprType } from 'hooks/useExprs';

export interface ToolbarProps {
  newExpr: (type: ExprType) => void,
  hideSidebar: () => void,
}

export default function Toolbar({ newExpr, hideSidebar }: ToolbarProps) {
  // options for different items that can be added to the expression list
  const newItemButtons = [
    {
      // add new expression
      icon: <CalculateIcon />,
      text: 'Add Expression',
      action: () => newExpr('math'),
    },
    {
      // add new comment
      icon: <FormatQuoteIcon />,
      text: 'Add Comment',
      action: () => newExpr('comment'),
    },
  ].map(({ icon, text, action }) => (
    <MenuItem
      onClick={action}
    >
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText>{text}</ListItemText>
    </MenuItem>
  ));

  return (
    <div className="toolbar">
      <PopoverIconMenu
        icon={<AddIcon />}
        closeOnClick
      >
        {newItemButtons}
      </PopoverIconMenu>
      <IconButton
        className="hide-sidebar"
        onClick={hideSidebar}
      >
        <DoubleArrowIcon />
      </IconButton>
    </div>
  );
}

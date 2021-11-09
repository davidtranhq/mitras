import React from 'react';

import {
  DoubleArrow as DoubleArrowIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';

import 'styles/Sidebar.css';

type Element = React.ReactElement[] | React.ReactElement | null;

export interface SidebarProps {
  children: Element;
  header: Element;
  width: number;
  height: number;
  setWidth: (width: number) => void,
  onResizerClick: (this: HTMLElement, e: React.MouseEvent) => void;
}

export default function Sidebar({
  children,
  header,
  width,
  height,
  setWidth,
  onResizerClick, // called when the resizer is clicked to start resizing
}: SidebarProps) {
  const sidebarHidden = width <= 0;
  const showSidebarButton = sidebarHidden && (
    <IconButton
      className="show-sidebar"
      onClick={() => setWidth(300)}
    >
      <DoubleArrowIcon />
    </IconButton>
  );
  return (
    <>
      <div className="sidebar" style={{ width, height }}>
        <div className="sidebar-header">
          {header}
        </div>
        <div className="sidebar-contents">
          {children}
        </div>
      </div>
      <div
        style={{ height }}
        className="resizer"
        role="presentation"
        onMouseDown={onResizerClick}
      />
      {showSidebarButton}
    </>
  );
}

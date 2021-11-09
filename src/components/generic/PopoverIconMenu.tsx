import React from 'react';

import { IconButton, Popover } from '@mui/material';

export interface PopoverIconMenuProps {
  children?: React.ReactNode;
  closeOnClick?: boolean;
  icon: React.ReactElement;
}

/**
 * Component for a popover menu that is opened by an icon button.
 */
export default function PopoverIconMenu({
  children,
  icon,
  closeOnClick = false,
}: PopoverIconMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  function onMenuOpen(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }

  function onMenuClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton onClick={onMenuOpen}>
        {icon}
      </IconButton>
      <Popover
        marginThreshold={32} // minimum distance to edge of the window
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        keepMounted
        open={Boolean(anchorEl)}
        onClick={closeOnClick ? onMenuClose : undefined}
        onClose={onMenuClose}
      >
        {children}
      </Popover>
    </>
  );
}

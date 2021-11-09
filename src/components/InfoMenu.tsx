import React from 'react';
import { Stack, Link } from '@mui/material';
import {
  Info as InfoIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';

import { ReactComponent as Logo } from 'img/logo.svg';
import PopoverIconMenu from 'components/generic/PopoverIconMenu';

/**
 * Button that opens the info menu
 */
export default function InfoMenu() {
  return (
    <PopoverIconMenu
      icon={<InfoIcon htmlColor="#ffffff" />}
    >
      <div className="info-menu">
        <Logo className="info-menu-logo" />
        <p>A graphing calculator for linear algebra.</p>
        <p>Try some of the examples from the menu in the top-left corner!</p>
        <Stack direction="row" alignItems="center" gap={1}>
          <GitHubIcon />
          <Link href="https://github.com/davidtranhq/mitras">
            github.com/davidtranhq/mitras
          </Link>
        </Stack>
      </div>
    </PopoverIconMenu>
  );
}

import React from 'react';

import GraphMenu from 'components/GraphMenu';
import ImportExportMenu from 'components/ImportExportMenu';
import InfoMenu from 'components/InfoMenu';

import { ReactComponent as Logo } from 'img/logo.svg';

export interface HeaderProps {
  exportExprs: () => string;
  exportGraphPNG: () => void;
  importExprs: (exprsBase64: string) => void;
}

export default function Header({ exportExprs, exportGraphPNG, importExprs }: HeaderProps) {
  return (
    <div id="header">
      <div className="header-left">
        <GraphMenu importGraph={importExprs} />
      </div>
      <div className="header-center">
        <Logo className="logo" />
      </div>
      <div className="header-right">
        <ImportExportMenu
          exportExprs={exportExprs}
          exportGraphPNG={exportGraphPNG}
          importExprs={importExprs}
        />
        <InfoMenu />
      </div>
    </div>
  );
}

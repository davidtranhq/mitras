import React from 'react';

import {
  ImportExport,
  ContentCopy,
  SaveAlt,
  PhotoLibrary,
} from '@mui/icons-material';
import {
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import PopoverIconMenu from 'components/generic/PopoverIconMenu';

export interface ImportExportMenuProps {
  exportExprs: () => string; // function to get the exprs in serialized base64f ormat
  exportGraphPNG: () => void; // download the graph as a PNG
  importExprs: (exprsBase64: string) => void;
}

/**
 * Button that opens the menu to choose between importing/exporting graph expressions
 */
export default function ImportExportMenu({
  exportExprs,
  exportGraphPNG,
  importExprs,
} : ImportExportMenuProps) {
  const [isExport, setIsExport] = React.useState(true);
  const [importCode, setImportCode] = React.useState('');
  const [importSuccess, setImportSuccess] = React.useState(true);
  const [importAttempted, setImportAttempted] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);

  function onSelect(event: React.MouseEvent<HTMLElement>, value: any) {
    setIsExport(value === 'export');
    setImportAttempted(false);
    setCopySuccess(false); // reset so the "copy success" alert doesn't show all the time
  }

  function onImport() {
    setImportAttempted(true);
    try {
      importExprs(importCode);
      setImportSuccess(true);
    } catch (err) {
      setImportSuccess(false);
    }
  }

  function onImportChange(event: React.ChangeEvent<HTMLInputElement>) {
    setImportCode(event.currentTarget.value);
  }

  const icon = <ImportExport htmlColor="#ffffff" />;
  const exprsBase64 = exportExprs();
  const copyToClipboard = (str: string) => () => {
    navigator.clipboard.writeText(str);
    setCopySuccess(true);
  };

  const copyAlert = copySuccess && (
    <Alert severity="success">
      Copied to clipboard!
    </Alert>
  );
  const exportMenu = (
    <>
      <p>Send the following code to another device:</p>
      <div className="import-export-input-group">
        <TextField
          value={exprsBase64}
          size="small"
          inputProps={{
            readOnly: true,
          }}
        />
        <Button
          onClick={copyToClipboard(exprsBase64)}
          variant="outlined"
          startIcon={<ContentCopy />}
        >
          Copy
        </Button>
      </div>
      {copyAlert}
      <p>Or export the graph as a PNG:</p>
      <Button
        onClick={exportGraphPNG}
        variant="contained"
        startIcon={<PhotoLibrary />}
      >
        Export as PNG
      </Button>
    </>
  );

  const importAlert = importSuccess
    ? (
      <Alert severity="success">
        Import succeeded!
      </Alert>
    ) : (
      <Alert severity="error">
        The given import code is invalid.
      </Alert>
    );

  const importMenu = (
    <>
      <p>Paste the code from a previous export here:</p>
      <div className="import-export-input-group">
        <TextField
          size="small"
          onChange={onImportChange}
          value={importCode}
        />
        <Button
          variant="contained"
          startIcon={<SaveAlt />}
          onClick={onImport}
        >
          Import
        </Button>
      </div>
      {importAttempted && importAlert}
    </>
  );

  return (
    <PopoverIconMenu
      icon={icon}
    >
      <div className="import-export-menu">
        <ToggleButtonGroup
          exclusive
          onChange={onSelect}
          value={isExport ? 'export' : 'import'}
        >
          <ToggleButton value="export">Export</ToggleButton>
          <ToggleButton value="import">Import</ToggleButton>
        </ToggleButtonGroup>
        {isExport ? exportMenu : importMenu}
      </div>
    </PopoverIconMenu>
  );
}

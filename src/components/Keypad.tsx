import React from 'react';

import {
  Keyboard as KeyboardIcon,
  KeyboardHide as KeyboardHideIcon,
} from '@mui/icons-material';
import { Button, Drawer } from '@mui/material';

import 'styles/Keypad.css';

import TexButton from 'components/TexButton';

// generate LaTeX for a matrix with specified rows and columns
function matrixTex(rows: number, cols: number) {
  const row = '&'.repeat(cols - 1);
  let mat = '';
  if (row === '') {
    mat = '\\\\'.repeat(rows - 1);
  } else {
    mat = Array(rows).fill(row).join('\\\\');
  }
  return `\\begin{bmatrix}${mat}\\end{bmatrix}`;
}

export interface KeypadProps {
  // controlled props
  keypadVisible: boolean;
  setKeypadVisible: React.Dispatch<React.SetStateAction<boolean>>;
  // callback to insert specified tex into the focused expression
  insertTex: (tex: string) => void;
}

export default function Keypad({ keypadVisible, setKeypadVisible, insertTex }: KeypadProps) {
  function toggleKeypad() {
    setKeypadVisible((current) => !current);
  }

  const toggleKeypadButton = (
    <Button
      className={keypadVisible ? 'keypad-hide' : 'keypad-show'}
      onClick={toggleKeypad}
      variant="contained"
      color="primary"
      style={keypadVisible ? { backgroundColor: '#ededed', color: 'gray' } : {}}
    >
      {
        keypadVisible
          ? <KeyboardHideIcon fontSize="large" />
          : <KeyboardIcon fontSize="large" />
      }
    </Button>
  );

  const matrixButtons = [
    matrixTex(2, 1),
    matrixTex(3, 1),
    matrixTex(2, 2),
    matrixTex(3, 3),
  ].map((tex) => (
    <TexButton
      className="tex-button matrix-button"
      tex={tex}
      onClick={() => insertTex(tex)}
    />
  ));

  const matrixFunctionButtons = [
    '\\operatorname{norm}',
    '\\operatorname{inv}',
    '\\operatorname{proj}',
    '\\operatorname{comp}',
    '\\det',
    '\\operatorname{cross}',
    '\\operatorname{eigenvectors}',
    '\\operatorname{eigenvalues}',
  ].map((tex) => (
    <TexButton
      className="tex-button matrix-function-button"
      tex={tex}
      onClick={() => insertTex(tex)}
    />
  ));

  const functionButtons = [
    '\\sin',
    '\\csc',
    '\\cos',
    '\\sec',
    '\\tan',
    '\\cot',
    '\\log',
    '\\ln',
  ].map((tex) => (
    <TexButton
      className="tex-button function-button"
      tex={tex}
      onClick={() => insertTex(tex)}
    />
  ));

  return (
    <div className="keypad">
      {toggleKeypadButton}
      <Drawer
        classes={{ paper: 'keypad-drawer' }}
        anchor="bottom"
        open={keypadVisible}
        onClose={toggleKeypad}
        variant="persistent"
      >
        <div className="keypad-group matrix-buttons">
          {matrixButtons}
        </div>
        <div className="keypad-group matrix-function-buttons">
          {matrixFunctionButtons}
        </div>
        <div className="keypad-group function-buttons">
          {functionButtons}
        </div>
      </Drawer>
    </div>
  );
}

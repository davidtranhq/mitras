import React from 'react';

import {
  Checkbox,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import { Color, ColorPicker } from 'material-ui-color';

import PopoverIconMenu from 'components/generic/PopoverIconMenu';

interface ExprMenuProps {
  icon: React.ReactElement;
  color: { value: string, onChange: (color: string) => void };
  visible: { value: boolean, onChange: (visible: boolean) => void };
  showMinor?: { value: boolean, onChange: (showMinor: boolean) => void };
  showCoords?: { value: boolean, onChange: (showCoords: boolean) => void };
}

export default function ExprMenu({
  icon,
  color,
  visible,
  showMinor,
  showCoords,
}: ExprMenuProps) {
  // material-ui-color ColorPicker returns a custom Color object, so we
  // extract the desired 7-digit hex string before calling the passed callback
  function onMaterialColorChange(materialColor: Color) {
    color.onChange(`#${materialColor.hex}`);
  }

  function onToggleVisibility(ev: React.ChangeEvent<HTMLInputElement>) {
    visible.onChange(ev.target.checked);
  }

  function onShowMinorChange(ev: React.ChangeEvent<HTMLInputElement>) {
    showMinor?.onChange(ev.target.checked);
  }

  function onShowCoordsChange(ev: React.ChangeEvent<HTMLInputElement>) {
    showCoords?.onChange(ev.target.checked);
  }

  const colorOption = (
    <MenuItem>
      <ColorPicker
        value={color.value}
        onChange={onMaterialColorChange}
      />
    </MenuItem>
  );

  const visibleOption = (
    <MenuItem>
      <FormControlLabel
        control={(
          <Checkbox
            checked={visible.value}
            onChange={onToggleVisibility}
            name="toggle-visibility"
          />
            )}
        label="Visible"
      />
    </MenuItem>
  );

  const showMinorOption = showMinor !== undefined && (
    <MenuItem>
      <FormControlLabel
        control={(
          <Checkbox
            checked={showMinor.value}
            onChange={onShowMinorChange}
            name="toggle-show-minor"
          />
          )}
        label="Show Minor Gridlines"
      />
    </MenuItem>
  );

  const showCoordsOption = showCoords !== undefined && (
    <MenuItem>
      <FormControlLabel
        control={(
          <Checkbox
            checked={showCoords.value}
            onChange={onShowCoordsChange}
            name="toggle-show-coords"
          />
          )}
        label="Show Coordinates"
      />
    </MenuItem>
  );

  return (
    <PopoverIconMenu icon={icon}>
      {colorOption}
      {visibleOption}
      {showCoordsOption}
      {showMinorOption}
    </PopoverIconMenu>
  );
}

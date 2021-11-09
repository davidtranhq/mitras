import React from 'react';
import { TextField, Slider as MuiSlider } from '@mui/material';

import 'styles/Slider.css';

import { ExprSliderOptionChangeFunc, ExprSliderOption } from 'hooks/useExprs';

const { MQ } = window; // MathQuill

interface SliderProps {
  min: number;
  max: number;
  step: number;
  focused: boolean;
  variable: string; // variable whose value is being controlled by this slider
  onChange: (newValue: number) => void;
  onOptionChange: ExprSliderOptionChangeFunc;
}

export default function Slider({
  min,
  max,
  step,
  focused,
  variable,
  onChange,
  onOptionChange,
} : SliderProps) {
  const staticMath = React.useRef<HTMLSpanElement>(null);
  // Mui slider calls onChange everytime the mouse moves instead of
  // when the value actually changes, so we keep track of the last value
  // to call onChange only when the value actually changes
  const oldValue = React.useRef<number>(0);

  React.useEffect(() => {
    MQ.StaticMath(staticMath.current);
  });

  /**
   * Returns a callback function that can be passed to an input that will update
   * the appropriate slider option using `onOptionChange`
   */
  function onOptionInputChange(option: ExprSliderOption) {
    return (ev: React.ChangeEvent<HTMLInputElement>) => onOptionChange(
      option,
      Number(ev.currentTarget.value),
    );
  }

  function onMuiSliderChange(event: Event, newValue: number | number[]) {
    if (newValue === oldValue.current) return;
    onChange(newValue as number);
    oldValue.current = newValue as number;
  }

  const numberInputProps = {
    variant: 'standard' as 'standard',
    type: 'number',
    className: 'slider-control',
  };
  const sliderJSX = focused
    ? (
      <div className="slider-controls">
        <TextField
          {...numberInputProps}
          defaultValue={min}
          onChange={onOptionInputChange('sliderMin')}
        />
        <span ref={staticMath}>{`\\leq ${variable} \\leq`}</span>
        <TextField
          {...numberInputProps}
          defaultValue={max}
          onChange={onOptionInputChange('sliderMax')}
        />
        Step:
        <TextField
          {...numberInputProps}
          defaultValue={step}
          onChange={onOptionInputChange('sliderStep')}
        />
      </div>
    )
    : (
      <>
        <span>{min}</span>
        <MuiSlider
          className="slider"
          onChange={onMuiSliderChange}
          valueLabelDisplay="auto"
          step={step}
          min={min}
          max={max}
        />
        <span>{max}</span>
      </>
    );
  return <div className="slider-container">{sliderJSX}</div>;
}

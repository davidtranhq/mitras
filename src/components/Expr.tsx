import React from 'react';

import { IconButton, InputBase } from '@mui/material';
import {
  Clear as ClearIcon,
  FormatQuote as FormatQuoteIcon,
  SlowMotionVideo as SlowMotionVideoIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

import MathInput from 'components/MathInput';
import ExprMenu from 'components/ExprMenu';
import Slider from 'components/Slider';
import {
  ExprData,
  ExprOptionChangeFunc,
  ExprSliderOptionChangeFunc,
} from 'hooks/useExprs';

import 'styles/Expr.css';

export interface ExprProps {
  focused: boolean,
  exprData: ExprData,
  // callbacks unique to every expression
  callbacks: {
    input: (tex: string) => void,
    focus: () => void,
    delete: () => void,
    animate: () => void,
    optionChange: ExprOptionChangeFunc,
    sliderOptionChange: ExprSliderOptionChangeFunc,
  }
  // props to be passed to the drag handle (to make Expr drag-and-droppable)
  dragHandleProps?: DraggableProvidedDragHandleProps
}

const { MQ } = window; // MathQuill

/**
 * Component for an expression in the expression list
 */
export default function Expr({
  focused,
  exprData,
  dragHandleProps,
  callbacks,
}: ExprProps) {
  const evaluated = React.useRef<HTMLDivElement>(null);
  // the `focused` prop indicates that this expression was the last to have focus,
  // meanwhile `hasCursor` indicates that the expression actually has focus
  const [hasCursor, setHasCursor] = React.useState(false);

  // render the evaluated expression
  React.useEffect(() => {
    if (!evaluated.current) {
      return;
    }
    MQ.StaticMath(evaluated.current);
  }, [exprData.evaluatedTex]);

  // Flag indicating if this expression should have a slider
  // (assignment expressions that assign to a number)
  const isSlider = exprData.isAssignment && exprData.type === 'number';

  // Get the variable that this expression is assigning to (if it is an assignment expression)
  function getAssignmentVar() {
    if (!exprData.isAssignment) {
      return '';
    }
    const [variable] = exprData.tex.split('=', 1);
    return variable;
  }

  // Callback to update the TeX of the expression if changed by a slider
  function onSliderChange(newValue: number) {
    const variable = getAssignmentVar();
    callbacks.input(`${variable}=${newValue}`);
  }

  // Slider component for the expression
  const exprSlider = isSlider && (
    <Slider
      min={exprData.sliderMin}
      max={exprData.sliderMax}
      step={exprData.sliderStep}
      focused={hasCursor}
      variable={getAssignmentVar()}
      onChange={onSliderChange}
      onOptionChange={callbacks.sliderOptionChange}
    />
  );

  // Flag indicating if the evaluated expression should be shown
  const exprHasEvaluation = exprData.evaluatedTex !== '' && !isSlider;

  // Component displaying the evaluated expression
  const exprEvaluated = exprHasEvaluation && (
    <div
      ref={evaluated}
      className="expression-evaluated"
      style={{ color: exprData.color }}
    >
      {exprData.evaluatedTex}
    </div>
  );

  const isComment = exprData.type === 'string';
  const isMatrix = exprData.type === 'Matrix' && exprData.lastFn !== 'eigenvectors';
  const isVector = exprData.type === 'Vector' && exprData.lastFn !== 'eigenvalues';
  const isEigenvectors = exprData.lastFn === 'eigenvectors';
  const isDeterminant = exprData.lastFn === 'det';

  // Flag indicating whether or not the evaluated expression is animatable
  const isAnimatable = isMatrix || isDeterminant;

  // Flag indicating whether or not the evaluated expression is drawable
  // (not numbers, strings, etc.)
  const isDrawable = isMatrix || isDeterminant || isEigenvectors || isVector;

  // Options to show for any expression whose evaluation is drawable
  // (vectors, matrices, determinants, etc.)
  const baseMenuOptions = {
    color: {
      value: exprData.color,
      onChange: (color: string) => callbacks.optionChange('color', color),
    },
    visible: {
      value: exprData.visible,
      onChange: (visible: boolean) => callbacks.optionChange('visible', visible),
    },
  };

  // Options to show if the expression is a matrix
  const matrixMenuOptions = {
    showCoords: {
      value: exprData.showCoords,
      onChange: (showCoords: boolean) => callbacks.optionChange('showCoords', showCoords),
    },
    showMinor: {
      value: exprData.showMinor,
      onChange: (showMinor: boolean) => callbacks.optionChange('showMinor', showMinor),
    },
  };

  // Eigenvectors aren't matrices but MathJS interprets them as such:
  // we don't show matrix options for eigenvectors (they are drawn differently)
  const showMatrixOptions = (exprData.type === 'Matrix' && exprData.lastFn !== 'eigenvectors');

  const settingsIconColor = {
    color: exprData.visible ? 'inherit' as const : 'disabled' as const,
    htmlColor: exprData.visible ? exprData.color : undefined,
  };

  // Component for the tab on the left of the expression
  const exprTab = (
    <div
      className="expression-tab"
      {...dragHandleProps}
    >
      {isDrawable && (
        <ExprMenu
          icon={<SettingsIcon {...settingsIconColor} />}
          {...baseMenuOptions}
          {...(showMatrixOptions && matrixMenuOptions)}
        />
      )}
      {isAnimatable && (
        <IconButton
          className="expression-animate"
          onClick={callbacks.animate}
        >
          <SlowMotionVideoIcon />
        </IconButton>
      )}
      {isComment && (
        <FormatQuoteIcon />
      )}
    </div>
  );

  const onInputBaseChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    callbacks.input(ev.target.value);
  };

  const onFocus = () => {
    setHasCursor(true);
    callbacks.focus();
  };

  const onBlur = (ev: React.FocusEvent<HTMLDivElement>) => {
    // only consider the expression blurred if the newly focused element is
    // not a child of the expression
    if (!ev.currentTarget.contains(ev.relatedTarget as Node)) {
      setHasCursor(false);
    }
  };

  const exprInput = isComment
    ? (
      <InputBase
        className="expression-input expression-text-input"
        multiline
        value={exprData.tex}
        onChange={onInputBaseChange}
        onFocus={onFocus}
      />
    ) : (
      <MathInput
        latex={exprData.tex}
        latexToInsert={exprData.texToInsert}
        onChange={callbacks.input}
        onFocus={onFocus}
      />
    );

  return (
    <div
      className={`expression${focused ? ' focused' : ''}`}
      onBlur={onBlur}
    >
      {exprTab}
      <div className={`expression-main${isSlider ? ' slider' : ''}`}>
        {exprInput}
        {exprEvaluated}
        {exprSlider}
      </div>
      <IconButton
        className="expression-delete"
        onClick={callbacks.delete}
      >
        <ClearIcon />
      </IconButton>
    </div>
  );
}

import React from 'react';
import analyzeExpr, { ExprAnalysis, MathScope } from 'utils/evaluateExpr';
import { randomColor } from 'utils/color';

export const enum AnimationState {
  Paused = 1,
  Requesting,
  Running,
}
// Everything is readonly because it is used in React state: this type should be
// modified by creating a new object instead of modifying the existing one
export interface ExprData extends ExprAnalysis {
  // unique identifier for the expression
  readonly id: number;

  // The expression formatted as a TeX string
  readonly tex: string;
  // TeX to insert into the expression on the next render
  // (used to insert templates e.g. matrices, vectors, functions, etc.)
  readonly texToInsert: string;
  // The current animation state on the graph.
  readonly animationState: AnimationState

  /* Values obtained when evaluating the expression */
  // The evaluated expression as a TeX string
  readonly evaluatedTex: string;
  // The evaluated expression as a JavaScript value
  readonly evaluatedValue: any;
  // The type of the evaluated expression as denoted by math.typeOf
  readonly type: string;
  // The last function in the expression to be evaluated
  readonly lastFn: string;
  // The arguments to lastFn (as an array of JavaScript values)
  readonly lastArgs: any[];
  // Flag indicating if the expression is an assignment (e.g. x = 1)
  readonly isAssignment: boolean;
  // Minimum value on a variable slider
  readonly sliderMin: number;
  // Maximum value on a variable slider
  readonly sliderMax: number;
  // Step value on a variable slider
  readonly sliderStep: number;

  /* Options for drawing the expression on the graph */
  // Color of the drawn expression as a 7-digit hex string (#abcdef)
  readonly color: string;
  // Toggle visibility on the graph
  readonly visible: boolean;
  // Duration of the animation in ms
  readonly animationDuration: number;
  /* Matrix specific options */
  // Show minor grid lines
  readonly showMinor: boolean;
  // Show coordinate numbers
  readonly showCoords: boolean;
}

const defaultExprData: ExprData = {
  id: -1,
  tex: '',
  texToInsert: '',
  animationState: AnimationState.Paused,
  evaluatedTex: '',
  evaluatedValue: null,
  type: '',
  lastFn: '',
  lastArgs: [],
  isAssignment: false,
  sliderMin: -10,
  sliderMax: 10,
  sliderStep: 1,
  color: '#000000',
  visible: true,
  animationDuration: 2000,
  showMinor: true,
  showCoords: true,
};

export type ExprType = 'math' | 'comment';

/**
 * generateCallbacks() generates a function `optionChange` which returns a function
 * used to modify the option properties of an ID-specific ExprData.
 *
 * The following are overloads for the function returned by `optionChange`.
 */
export type ExprOptionChangeFunc = {
  (option: 'color', value: string): void,
  (option: 'visible', value: boolean): void,
  (option: 'showMinor', value: boolean): void,
  (option: 'showCoords', value: boolean): void,
};
export type ExprSliderOptionChangeFunc = (option: ExprSliderOption, value: number) => void;

export type ExprOption = 'color' | 'visible' | 'showMinor' | 'showCoords';
export type ExprOptionValue = string | boolean;

export type ExprSliderOption = 'sliderMax' | 'sliderMin' | 'sliderStep';

export default function useExprs() {
  const exprID = React.useRef(0);
  const [exprs, setExprs] = React.useState<ExprData[]>([{
    ...defaultExprData,
    id: exprID.current,
    color: randomColor(),
  }]);
  const [focusedID, setFocusedID] = React.useState(0);

  /**
   * Re-order two expressions in the list
   */
  function reorderExprs(idx1: number, idx2: number) {
    setExprs((prevList) => {
      const newList = [...exprs];
      const [swapped] = newList.splice(idx1, 1);
      newList.splice(idx2, 0, swapped);
      return newList;
    });
  }

  /**
   * Get the expression associated with the given ID
   */
  function getExpr(id: number) {
    return exprs.find((expr) => expr.id === id);
  }

  /**
   * Create a new default ExprData and add it to the exprs object.
   */
  function newExpr(type: ExprType) {
    exprID.current += 1;
    const newItem = {
      ...defaultExprData,
      id: exprID.current,
      color: randomColor(),
    };
    if (type === 'comment') {
      newItem.type = 'string';
    }
    setExprs((prevList) => [...prevList, newItem]);
    return exprID.current;
  }

  /**
   * Immutably update the ID-specified ExprData in exprs by creating a new ExprData
   * with the desired modfications
   */
  function updateExpr(
    id: number,
    modifications: Partial<ExprData>,
  ) {
    setExprs((prevList: ExprData[]) => {
      const originalIdx = prevList.findIndex((exprData) => exprData.id === id);
      if (originalIdx === -1) {
        // attempted to update an expression that doesn't exist: do nothing
        return prevList;
      }
      const original = prevList[originalIdx];
      // write modifications to the expression to update
      const modifiedExpr = {
        ...original,
        ...modifications,
      };
      // insert modified expression into the array
      const newList = [...prevList];
      newList[originalIdx] = modifiedExpr;
      return newList;
    });
  }

  /**
   * Evaluate the expressions currently in `exprs` and update the corresponding properties
   */
  function evaluateExprs() {
    let scope: MathScope = {};
    setExprs((prevExprs) => {
      const evaluatedExprs = [...prevExprs];
      prevExprs.forEach((exprData, idx) => {
        // do not evaluate the expression if it is a comment
        if (exprData.type === 'string') {
          return;
        }
        // analyze the expression and update the results into the list
        let analysis;
        ({ scope, analysis } = analyzeExpr(exprData.tex, scope));
        evaluatedExprs[idx] = { ...exprData, ...analysis };
      });
      return evaluatedExprs;
    });
  }

  /**
   * Load an existing ExprData list
   */
  function loadExprs(exprImport: ExprData[]) {
    // update the current exprID to the greatest of the import
    exprImport.forEach((exprData) => {
      exprID.current = Math.max(exprID.current, exprData.id);
    });
    setExprs(exprImport);
  }

  /**
   * Update `texToInsert` (TeX to be inserted on the next render)
   */
  function insertTex(id: number, texToInsert: string) {
    updateExpr(id, { texToInsert });
  }

  function onExprInput(id: number) {
    const mathExprInput = (tex: string) => {
      updateExpr(id, { tex, texToInsert: '' });
      evaluateExprs();
    };
    // don't re-evaluate all expression if the expression is a comment
    const commentExprInput = (tex: string) => {
      updateExpr(id, { tex, texToInsert: '' });
    };
    const thisExpr = getExpr(id);
    if (thisExpr === undefined) {
      return (tex: string) => { };
    }
    const isComment = thisExpr.type === 'string';
    return isComment ? commentExprInput : mathExprInput;
  }

  function onExprFocus(id: number) {
    return () => {
      setFocusedID(id);
    };
  }

  function onExprOptionChange(id: number): ExprOptionChangeFunc {
    return (option: ExprOption, value: ExprOptionValue) => {
      updateExpr(id, { [option]: value });
    };
  }

  function onExprSliderOptionChange(id: number) {
    return (option: ExprSliderOption, value: number) => {
      updateExpr(id, { [option]: value });
    };
  }

  function onExprDelete(id: number) {
    return () => {
      setExprs((prev) => prev.filter((exprData) => exprData.id !== id));
    };
  }

  /**
   * Flag the specified expression as requesting an animation start
   * (a call to `animateExpr`). This is not required before calling `animateExpr`,
   * but is instead used to indicate that `animateExpr` should be called.
   */
  function onExprAnimate(id: number) {
    return () => {
      updateExpr(id, { animationState: AnimationState.Requesting });
    };
  }

  /**
   * Start the animation of the specified expression.
   * @param id ID of the expression to animate
   * @param drawFrame function called on every frame
   */
  function animateExpr(id: number, drawFrame: (elapsed: number) => void) {
    let start: number;
    const thisExpr = getExpr(id);
    if (thisExpr === undefined) {
      // console.log('Error: attempted to animate non-existent expression');
      return;
    }
    updateExpr(id, { animationState: AnimationState.Running });
    const stepFrame = (time: number) => {
      if (start === undefined) {
        start = time;
      }
      const elapsed = time - start;
      drawFrame(elapsed);
      if (elapsed < thisExpr.animationDuration) {
        window.requestAnimationFrame(stepFrame);
      } else {
        // animation finished
        updateExpr(id, { animationState: AnimationState.Paused });
      }
    };
    window.requestAnimationFrame(stepFrame);
  }

  /**
   * Generate callbacks unique to an ID-specific expression.
   */
  function generateCallbacks(id: number) {
    return {
      input: onExprInput(id),
      focus: onExprFocus(id),
      delete: onExprDelete(id),
      animate: onExprAnimate(id),
      optionChange: onExprOptionChange(id),
      sliderOptionChange: onExprSliderOptionChange(id),
    };
  }

  return {
    exprs,
    loadExprs,
    reorderExprs,
    focusedID,
    newExpr,
    insertTex,
    animateExpr,
    generateCallbacks,
  };
}

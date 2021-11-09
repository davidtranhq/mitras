import React from 'react';
import * as math from 'mathjs';

import {
  drawGraph,
  drawExpressions,
  setOrigin as setCanvasOrigin,
  setBackground,
  clear,
} from 'utils/draw';
import useDraggablePosition from 'hooks/useDraggablePosition';

import { ExprData } from 'hooks/useExprs';

/**
 * Returns true if x can be represented as y * 10^n where n is an integer.
 */
function isMagnitude(x: number | math.BigNumber, y: number | math.BigNumber) {
  const n = math.log10(math.divide(x, y) as math.BigNumber);
  return math.isInteger(n);
}

function wrapNum(x: number, min: number, max: number) {
  const d = max - min;
  return ((x - min) % d + d) % d + min;
}

function canvasMousePos(canvas: HTMLCanvasElement, ev: React.MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  return { x, y };
}

interface GraphProps {
  width: number,
  height: number,
  exprs: ExprData[],
  animateExpr: (id: number, drawFrame: (elapsed: number) => void) => void,
}

export interface ImperativeCanvasRef {
  // Prompt a download of the currently visible graph as a PNG
  exportGraphPNG: () => void;
  // Center the graph at the origin
  centerGraph: () => void;
  /* DEPRECATED: Graph options
  // Current graph options
  currentOptions: DrawOptions,
  // Modify visual graph options
  setOptions: (options: Partial<DrawOptions>) => void;
  */
}

const Graph = React.forwardRef<ImperativeCanvasRef, GraphProps>((
  {
    width,
    height,
    exprs,
    animateExpr,
  }: GraphProps,
  forwardedRef,
) => {
  // canvas reference
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);

  // We can't access DOM elements (including the canvas) after the first render using
  // a reference because when our effect hooks are defined, the reference is initialized to null.
  // To re-run effect hooks when the canvas ref is finally set for the first time,
  // we use a state flag that will be passed to the effect hooks dependency array.
  const [canvasInitialized, setCanvasInitialized] = React.useState(false);

  /* DEPRECATED: Graph options
  // visual options
  const [options, setOptions] = React.useState<DrawOptions>({
    showMinor: true,
    showCoords: true,
    color: '#000000',
    visible: true,
  });
  */

  // axis scales state variables
  const minStepPx = 100; // minimum px per step (smaller than this and new substeps are drawn)
  const [step, setStep] = React.useState(math.bignumber(1));
  const [stepPx, setStepPx] = React.useState(minStepPx);

  // panning state variables
  const {
    position: origin,
    setPosition: setOrigin,
    onDragStart,
  } = useDraggablePosition({ x: width / 2, y: height / 2 });

  // zoom factor reference
  const zoomFactor = React.useRef(1);

  // Assign the forwarded ref with the associated functions
  React.useImperativeHandle(forwardedRef, () => ({
    // Download the graph as a PNG file
    exportGraphPNG: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = ctxRef.current;
      if (!ctx) return;
      // need to set background color to white, otherwise the image is transparent
      setBackground(canvas, ctx, 'white');
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'mitras-graph.png';
      link.href = url;
      link.click();
    },

    centerGraph: () => setOrigin({ x: width / 2, y: height / 2 }),

    /* DEPRECATED: Graph options

    currentOptions: options,

    // update state object containing graph options
    setOptions: (newOptions: Partial<DrawOptions>) => setOptions(
      (oldOptions) => ({ ...oldOptions, ...newOptions }),
    ),
    */
  }));

  /**
   * Called when we can access the canvas for the first time
   * (ref object has been assigned to the canvas)
   */
  // we use a callback here because the function is passed to a ref
  // https://github.com/facebook/react/issues/9328#issuecomment-291654761
  const onCanvasInitialized = React.useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext('2d');
    setCanvasInitialized(true);
  }, [canvasRef]);

  /**
   * Adjust the step and stepPx according to the scroll to create a zooming effect.
   * (this works but please clean it up later)
   */
  function onZoom(e: React.WheelEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scroll = -e.deltaY * 0.1;
    const zoomingIn = scroll > 0;
    let nextStepPx = stepPx + scroll;
    let nextStep = step;
    // choose a factor by which to increase/decrease the step that keeps "nice" looking numbers
    // e.g. 1 -> 0.5 -> 0.2 -> 0.1 instead of 1 -> 0.5 -> 0.25 -> 0.125
    const factor = zoomingIn
      ? isMagnitude(step, 5) ? 5 / 2 : 2
      : isMagnitude(step, 2) ? 5 / 2 : 2;
    const maxStepPx = minStepPx * factor;
    if (zoomingIn && nextStepPx >= maxStepPx) {
      nextStepPx = wrapNum(nextStepPx, minStepPx, maxStepPx);
      nextStep = math.divide(step, factor) as math.BigNumber;
      zoomFactor.current *= factor;
    } else if (!zoomingIn && nextStepPx < minStepPx) {
      nextStepPx = wrapNum(nextStepPx, minStepPx, maxStepPx);
      nextStep = math.multiply(step, factor) as math.BigNumber;
      zoomFactor.current /= factor;
    }
    // adjust the origin so the graph zooms in/out centered at the mouse position
    const { x: mouseX, y: mouseY } = canvasMousePos(canvas, e);
    const unitPx = math.divide(stepPx, step) as number;
    const nextUnitPx = math.divide(nextStepPx, nextStep) as number;
    const deltaUnitPx = nextUnitPx - unitPx;
    const dx = (mouseX - origin.x) / unitPx * deltaUnitPx;
    const dy = (mouseY - origin.y) / unitPx * deltaUnitPx;
    setOrigin((old) => ({
      x: old.x - dx,
      y: old.y - dy,
    }));
    setStep(nextStep);
    setStepPx(nextStepPx);
  }

  /**
   * Update the canvas pan/zoom/dimensions/expressions
   */
  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    const ctx = ctxRef.current;
    if (!ctx) return;

    // update canvas dimensions to controlled dimension
    canvas.width = width;
    canvas.height = height;

    // redraw graph with new pan/zoom/expressions
    clear(canvas, ctx);
    setCanvasOrigin(ctx, origin.x, origin.y);
    drawGraph(canvas, ctx, step, stepPx);
    drawExpressions(canvas, ctx, exprs, step, stepPx, zoomFactor.current, animateExpr);
  }, [canvasInitialized, canvasRef, width, height, exprs, origin, step, stepPx, animateExpr]);

  return (
    <canvas
      id="graph"
      ref={onCanvasInitialized}
      onMouseDown={onDragStart} // panning
      onWheel={onZoom}
    />
  );
});

export default Graph;

import * as math from 'mathjs';
import { shadeColor } from 'utils/color';
import { isVector, isMatrix, normalizeMatrix } from 'utils/matrix';
import { ExprData, AnimationState } from 'hooks/useExprs';

/**
 * Options passed to `drawGraphs`
 */
export interface DrawOptions {
  color: string; // color of the graph
  showCoords: boolean; // flag to show coordinate numbers along the axis
  showMinor: boolean; // flag to show minor grid lines
  visible: boolean;
}

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Get the number of pixels for one unit square.
 */
function pxPerUnit(step: math.BigNumber, stepPx: number) {
  return math.number(math.divide(math.bignumber(stepPx), step) as math.BigNumber) as number;
}

function setOrigin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.setTransform(1, 0, 0, 1, x, y);
}

/**
 * Get the coordinates of the top, bottom, left, and rightmost visible points of a canvas.
 */
function boundingBox(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const { e: xOrigin, f: yOrigin } = ctx.getTransform();
  const bb = {
    top: -yOrigin,
    bottom: canvas.height - yOrigin,
    left: -xOrigin,
    right: canvas.width - xOrigin,
  };
  return {
    ...bb,
    max: () => Math.max(...(Object.values(bb).map((x) => Math.abs(x)))),
  };
}

/**
 * Clear a canvas context.
 */
function clear(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const {
    top,
    bottom,
    left,
    right,
  } = boundingBox(canvas, ctx);
  ctx.clearRect(left, top, right - left, bottom - top);
}

/**
 * Add a background to the canvas.
 */
function setBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, color: string) {
  const {
    top,
    bottom,
    left,
    right,
  } = boundingBox(canvas, ctx);
  const width = right - left;
  const height = bottom - top;
  // Save the current compositing operation (to restore later)
  const compositeOperation = ctx.globalCompositeOperation;
  // Draw behind current content
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = 'white';
  ctx.fillRect(left, top, width, height);
  // restore composite operation
  ctx.globalCompositeOperation = compositeOperation;
}

/**
   * Draw a line from p0 to p1 with the specified color.
   */
function drawLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color:
  string = '#000000',
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

/**
   * Draw text at p(x, y) with a background.
   */
function drawTextWithBG(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  txt: string,
  x: number,
  y: number,
  options = { color: 'black', bgcolor: 'white' },
) {
  const bb = boundingBox(canvas, ctx);
  if (x < bb.left || x > bb.right || y < bb.top || y > bb.bottom) {
    return;
  }
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.fillStyle = options.bgcolor;
  const metric = ctx.measureText(txt);
  const padding = 2;
  const w = metric.actualBoundingBoxLeft + metric.actualBoundingBoxRight;
  const h = metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;
  const left = x - metric.actualBoundingBoxLeft;
  const top = y - metric.actualBoundingBoxAscent;
  ctx.fillRect(left - padding,
    top - padding,
    w + padding * 2,
    h + padding * 2);
  ctx.fillStyle = options.color;
  ctx.fillText(txt, x, y);
  ctx.restore();
}

/**
   * Draws a graph on a canvas with a specified matrix transformation.
   * @param canvas drawing canvas
   * @param stepValue value by which to increment on each marker
   * @param stepPx px between each marker
   * @param transform matrix transformation to be applied before drawing
   * @param options optional drawing parameters
   */
function drawGraph(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  stepValue: math.BigNumber,
  stepPx: number,
  transform: math.Matrix = math.identity(2) as math.Matrix,
  options: DrawOptions = {
    color: '#000000',
    showCoords: true,
    showMinor: true,
    visible: true,
  },
): void {
  if (!options.visible) return;
  ctx.save();
  // px per step before zooming in/out
  const pxPerUnscaledStep = 100;
  // px offset from the main axis for coordinates
  const coordOffset = Math.floor(pxPerUnscaledStep / 6);
  // number of subdivisions for each step (4 or 5 depending on parity)
  const subSteps = math.chain(stepValue).mod(2).equal(0).done() ? 4 : 5;
  const pxPerSubStep = Math.floor(stepPx / subSteps);
  // maximum steps that will be rendered in either direction
  const maxSteps = Math.floor(boundingBox(canvas, ctx).max() / stepPx) + 1;
  // coordinate of the last step to be rendered
  const maxCoord = maxSteps * stepPx;
  const axisColor = options.color;
  const mainColor = shadeColor(options.color, 0.5);
  const minorColor = shadeColor(options.color, 0.9);

  // Draw a transformed horizontal line (according to the matrix transform) at x
  const drawHorizontal = (y: number, color: string = 'black') => {
    const v0 = math.multiply(transform, [-maxCoord, y]).valueOf() as [number, number];
    const v1 = math.multiply(transform, [maxCoord, y]).valueOf() as [number, number];
    // y-coordinate is negated because down is positive on HTMLCanvas
    drawLine(ctx, v0[0], -v0[1], v1[0], -v1[1], color);
  };
  // Draw a transformed vertical line (according to the matrix transform) at y
  const drawVertical = (x: number, color: string = 'black') => {
    const v0 = math.multiply(transform, [x, -maxCoord]).valueOf() as [number, number];
    const v1 = math.multiply(transform, [x, maxCoord]).valueOf() as [number, number];
    // y-coordinate is negated because down is positive on HTMLCanvas
    drawLine(ctx, v0[0], -v0[1], v1[0], -v1[1], color);
  };
  // Draw text at the transformed position of (x,y)
  const drawText = (txt: string, x: number, y: number, color: string = 'black') => {
    const v = math.multiply(transform, [x, y]).valueOf() as [number, number];
    // y-coordinate is negated because down is positive on HTMLCanvas
    drawTextWithBG(canvas, ctx, txt, v[0], -v[1], { color, bgcolor: 'white' });
  };
  // actual drawing
  for (let i = 0; i <= maxSteps; ++i) {
    const x = i * stepPx;
    const y = i * stepPx;
    // draw minor lines (subdivisions)
    if (options.showMinor && i < maxSteps) {
      for (let j = 1; j < subSteps; ++j) {
        const px = j * pxPerSubStep;
        drawHorizontal(y + px, minorColor);
        drawHorizontal(-y - px, minorColor);
        drawVertical(x + px, minorColor);
        drawVertical(-x - px, minorColor);
      }
    }
    // draw major lines
    drawHorizontal(y, mainColor);
    drawHorizontal(-y, mainColor);
    drawVertical(x, mainColor);
    drawVertical(-x, mainColor);
    // draw coordinates
    if (options.showCoords && i !== 0) {
      // use scientific notation for x < 1e-05 and x > 1e+05
      const coord = math.format(math.multiply(stepValue, i), {
        lowerExp: -5,
        upperExp: 5,
      });
      // y-coordinates
      ctx.font = '16px calibri';
      ctx.textAlign = 'right';
      drawText(`-${coord}`, -coordOffset, -y, options.color);
      drawText(coord, -coordOffset, y, options.color);
      // x-coordinates
      ctx.textAlign = 'center';
      drawText(coord, x, -coordOffset, options.color);
      drawText(`-${coord}`, -x, -coordOffset, options.color);
    }
  }
  // draw (0,0) and main axis last (so they appear above everything else)
  if (options.showCoords) {
    drawText('0', -coordOffset, -coordOffset, options.color);
  }
  drawHorizontal(0, axisColor);
  drawVertical(0, axisColor);
  ctx.restore();
}

function drawExpressions(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  exprs: ExprData[],
  step: math.BigNumber,
  stepPx: number,
  zoomFactor: number,
  animateExpr?: (id: number, drawFrame: (elapsed: number) => void) => void,
) {
  /**
   * Draw an arrow from (0,0) to (vector.x, vector.y).
   */
  function drawVector(vx0: number, vy0: number, vx1: number, vy1: number, options: DrawOptions) {
    const unitPx = pxPerUnit(step, stepPx);
    const [x0, y0, x1, y1] = [vx0, -vy0, vx1, -vy1].map((x) => x * unitPx);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const length = Math.sqrt(dx * dx + dy * dy);
    const headlen = length < 20 ? length * 0.75 : 15; // length of head in pixels
    const angle = Math.atan2(dy, dx);
    const squish = 0.9; // angle of arrow head
    const rightCorner = [ // left corner of the arrow head
      x1 - headlen * Math.cos(angle + squish - Math.PI / 6),
      y1 - headlen * Math.sin(angle + squish - Math.PI / 6),
    ];
    const leftCorner = [ // right corner of the arrow head
      x1 - headlen * Math.cos(angle - squish + Math.PI / 6),
      y1 - headlen * Math.sin(angle - squish + Math.PI / 6),
    ];
    ctx.save();
    ctx.strokeStyle = options.color;
    ctx.fillStyle = options.color;
    ctx.beginPath();
    // line
    ctx.lineWidth = 3;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    // arrow head
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftCorner[0], leftCorner[1]);
    ctx.lineTo(x1, y1);
    ctx.lineTo(rightCorner[0], rightCorner[1]);
    ctx.lineTo(leftCorner[0], leftCorner[1]);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw a matrix as a linear transformation of a graph.
   */
  function drawMatrix(value: math.Matrix, options: DrawOptions) {
    drawGraph(canvas, ctx, step, stepPx, value, options);
  }

  /**
   * Returns an animation function that draws a frame of a matrix-like expression
   * (matrices and determinants) according to a callback function `draw`
   * (passed to `animateExpr`)
   */
  function matrixFrame(
    initial: math.Matrix, // initial matrix where the animation starts
    final: math.Matrix, // final matrix where the animation ends
    duration: number, // duration of the animation in ms
    options: DrawOptions,
    draw: (matrix: math.Matrix, options: DrawOptions) => void, // callback to draw each frame
  ) {
    return (elapsed: number) => {
      // difference between final and initial state
      const diff = math.subtract(final, initial);
      // fraction of the difference proportional to the time elapsed
      const dt = math.multiply(diff, easeInOutCubic(elapsed / duration));
      // animate by incrementing the current state by a fraction of the difference
      const mat = math.add(initial, dt) as math.Matrix;
      clear(canvas, ctx);
      drawGraph(canvas, ctx, step, stepPx);
      drawExpressions(canvas, ctx, exprs, step, stepPx, zoomFactor);
      draw(mat, options);
    };
  }

  function drawEigenvectors(eigenvectors: math.Matrix, options: DrawOptions) {
    const v1 = [eigenvectors.get([0, 0]), eigenvectors.get([1, 0])];
    const v2 = [eigenvectors.get([0, 1]), eigenvectors.get([1, 1])];
    const maxCoord = math.multiply(
      Math.floor(boundingBox(canvas, ctx).max() / stepPx) + 1,
      step,
    ) as number;
    [v1, v2].forEach((vector) => {
      const numVectors = maxCoord / Math.max(...vector.map(Math.abs)) * zoomFactor + 1;
      const [x, y] = vector.map((component) => component / zoomFactor);
      for (let i = 1; i < numVectors; ++i) {
        drawVector(0, 0, x * i, y * i, options);
        drawVector(0, 0, -x * i, -y * i, options);
      }
    });
  }

  function drawDeterminant(matrix: math.Matrix, options: DrawOptions) {
    const unitPx = pxPerUnit(step, stepPx);
    // corners of a unit square at (0,0)
    const squareCorners = [[1, 0], [1, 1], [0, 1]];
    // corners of the transformed unit square (whose area represents the determinant)
    const detCorners = squareCorners.map((p) => math.multiply(matrix, p));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    detCorners.forEach((p) => ctx.lineTo(p.get([0]) * unitPx, -p.get([1]) * unitPx));
    ctx.closePath();
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = options.color;
    ctx.stroke();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = options.color;
    ctx.fill();
    ctx.restore();
  }

  exprs.forEach((exprData) => {
    const {
      id,
      color,
      evaluatedValue,
      type,
      lastFn,
      lastArgs,
      showCoords,
      showMinor,
      animationState,
      animationDuration,
      visible,
    } = exprData;
    const drawOptions = {
      color,
      showCoords,
      showMinor,
      visible,
    };
    const drawAnimation = animationState === AnimationState.Requesting && animateExpr !== undefined;
    const drawStatic = animationState === AnimationState.Paused;
    if (!evaluatedValue) {
      return;
    }
    // convert MathJS value to ordinary JS object
    const jsValue = evaluatedValue.valueOf();
    if (type === 'Matrix') {
      // evaluatedValue is a math.Matrix
      if (lastFn === 'eigenvectors') {
        // the matrix represents eigenvectors
        if (drawAnimation) {
          animateExpr!(
            id,
            matrixFrame(
              normalizeMatrix(evaluatedValue),
              evaluatedValue,
              animationDuration,
              drawOptions,
              drawEigenvectors,
            ),
          );
        } else if (drawStatic) {
          drawEigenvectors(evaluatedValue, drawOptions);
        }
      } else if (isMatrix(evaluatedValue, 2)) {
        // the matrix represents a general transformation matrix
        if (drawAnimation) {
          // start the animation of the transformation matrix
          // animateExpr is non-null since animate === true
          animateExpr!(
            id,
            matrixFrame(
              math.identity(2) as math.Matrix,
              evaluatedValue,
              animationDuration,
              drawOptions,
              drawMatrix,
            ),
          );
        } else if (drawStatic) {
          // draw a static transformation matrix on the graph
          drawMatrix(jsValue, drawOptions);
        }
      }
    } else if (type === 'Vector') {
      // evaluatedValue is a n x 1 math.Matrix
      if (isVector(evaluatedValue, 2) && lastFn !== 'eigenvalues') {
        // the vector represents a 2D space vector
        drawVector(0, 0, jsValue[0], jsValue[1], drawOptions);
      }
    } else if (type === 'number' || type === 'BigNumber') {
      // evaluatedValue is a number
      if (lastFn === 'det') {
        // the number represents the determinant of a matrix
        const matrix = lastArgs[0]; // argument to `det` (matrix with determinant = evaluatedValue)
        if (drawAnimation) {
        // start the animation of the determinant
          // animateExpr is non-null since animate === true
          animateExpr!(
            id,
            matrixFrame(
              math.identity(2) as math.Matrix,
              matrix,
              animationDuration,
              drawOptions,
              drawDeterminant,
            ),
          );
        } else if (drawStatic) {
          // draw static determinant
          drawDeterminant(matrix, drawOptions);
        }
      }
    }
  });
}

export {
  drawGraph,
  drawExpressions,
  setOrigin,
  clear,
  setBackground,
};

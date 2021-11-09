// Everything is readonly because it is used in React state: this type should be
// modified by creating a new object instead of modifying the existing one
export interface ExprData extends ExprAnalysis {
  // The expression formatted as a TeX string
  readonly tex: string;
  // TeX to insert into the expression on the next render
  readonly texToInsert: string;

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

  /* Options for drawing the expression on the graph */
  // Color of the drawn expression as a 7-digit hex string (#abcdef)
  readonly color: string;
  // Toggle visibility on the graph
  readonly visible: boolean;
  /* Matrix specific options */
  // Show minor grid lines
  readonly showMinor: boolean;
  // Show coordinate numbers
  readonly showCoords: boolean;
}

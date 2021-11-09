import * as math from 'mathjs';
import { parseTex } from 'tex-math-parser';

import { isVector } from 'utils/matrix';

// result from a call to math.evaluate() or evaluateTex() (tex-math-parser)
export type MathJSEvaluation = any;

/**
 * Fix floating-point rounding errors in a MathJS evaluation
 */
function fixRoundingError(val: MathJSEvaluation) {
  const type = math.typeOf(val);
  if (type === 'Matrix' || type === 'Array') {
    return val.map(fixRoundingError);
  }
  if (type === 'number' || type === 'Complex' || type === 'BigNumber' || type === 'Fraction') {
    return math.abs(val) < Number.EPSILON ? 0 : val;
  }
  return val;
}

/**
 * Format a MathJSEvaluation as a JSON string.
 */
function evaluationToJson(evaluation: MathJSEvaluation) {
  // lower precision for matrices (because we need to fit more numbers)
  return math.format(evaluation, { precision: 6 });
}

/**
 * Format a list of MathJSEvaluations as a TeX string (non-recursively).
 */
function evaluationListToTex(evaluations: MathJSEvaluation[]): string {
  return evaluations.map((evaluation) => evaluationToTex(evaluation, '')).join(',\\space');
}

/**
 * Format a MathJSEvaluation as a TeX string. lastFn is passed because the output of certain
 * functions should be formatted differently (e.g. eigenvalues as a list rather than a vector)
 */
function evaluationToTex(evaluation: MathJSEvaluation, lastFn: string): string {
  let tex;
  if (lastFn === 'eigenvalues') {
    // display eigens as a list of comma-seperated values/vectors (instead of a vector/matrix)
    tex = evaluationListToTex(evaluation.toArray());
  } else if (lastFn === 'eigenvectors') {
    // display eigenvectors as a list of comma-seperated vectors (instead of a matrix)
    tex = evaluationListToTex(evaluation.columns());
  } else {
    tex = math.parse(evaluationToJson(evaluation)).toTex();
  }
  return tex;
}

/**
 * Find the last function node to be evaluated in a MathJS expression tree.
 * @param root The root node of a MathJS expression tree
 * @returns The last function node to be evaluated, or null if there are none
 */
function lastFunctionNode(root: any): any {
  // reverse postfix
  if (root.type === 'FunctionNode') {
    return root;
  }
  if (!root.items || root.items.length < 1) {
    return null;
  }
  for (let i = root.items.length - 1; i >= 0; --i) {
    const result = lastFunctionNode(root.items[i]);
    if (!result) {
      return result;
    }
  }
  // no function node found
  return null;
}

/**
 * Evaluate a TeX math expression.
 * @returns An object containing the output of math.evaluate() and the root of the expression tree.
 */
function evaluateExpr(texStr: string, scope: {}) {
  let root: math.MathNode | null = null;
  let evaluated: any = null;
  try {
    root = parseTex(texStr);
  } catch (e) {
    return { root: null, evaluated: null };
  }
  try {
    evaluated = root.evaluate(scope);
  } catch (e) {
    return { root, evaluated: null };
  }
  return { root, evaluated };
}

export type MathScope = {
  [key: string]: any,
};

export interface ExprAnalysis {
  // The evaluated expression as a TeX string
  evaluatedTex: string;
  // The evaluated expression as a JavaScript value
  evaluatedValue: any;
  // The type of the evaluated expression as denoted by math.typeOf
  type: string;
  // The last function in the expression to be evaluated
  lastFn: string;
  // The arguments to lastFn (as an array of JavaScript values)
  lastArgs: any[];
  // Flag indicating if the expression is an assignment (e.g. x = 1)
  isAssignment: boolean;
}

const defaultAnalysis: ExprAnalysis = {
  evaluatedTex: '',
  evaluatedValue: null,
  type: '',
  lastFn: '',
  lastArgs: [],
  isAssignment: false,
};

/**
 * Analyze a TeX math expression.
 * @returns An object containing an analysis of the expression along with the modified scope
 *          (e.g. if the expression analyzed is x=1, then `x: 1` is added to the scope)
 */
export default function analyzeExpr(texStr: string, scope: MathScope): {
  analysis: ExprAnalysis,
  scope: MathScope,
} {
  const originalScope = { ...scope };
  const { root, evaluated } = evaluateExpr(texStr, scope);
  if (root === null) {
    // parsing failed
    return {
      analysis: defaultAnalysis,
      scope,
    };
  }
  const isAssignment = !!root.isAssignmentNode;
  const lastFnNode = lastFunctionNode(root);
  const lastFn = lastFnNode ? lastFnNode.fn.name : '';
  if (evaluated === null) {
    // evaluation failed
    return {
      analysis: { ...defaultAnalysis, isAssignment, lastFn },
      scope,
    };
  }
  // evaluate the arguments to the last function
  const lastArgs = lastFnNode
    ? lastFnNode.args.map((arg: any) => arg.evaluate(originalScope))
    : [];
  const roundedEval = fixRoundingError(evaluated);
  const evaluatedTex = evaluationToTex(roundedEval, lastFn);
  let type = math.typeOf(evaluated);
  if (type === 'Matrix') {
    type = isVector(roundedEval) ? 'Vector' : type;
  } else if (type === 'string') {
    // don't return analysis for string
    return {
      analysis: defaultAnalysis,
      scope,
    };
  }
  return {
    analysis: {
      evaluatedTex,
      evaluatedValue: roundedEval,
      type,
      isAssignment,
      lastFn,
      lastArgs,
    },
    scope,
  };
}

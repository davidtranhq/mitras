import * as math from 'mathjs';

/**
 * Check if `arr` is an n-dimensional vector.
 */
export function isVector(mat: math.Matrix, n?: number) {
  const dimensions = mat.size();
  return (dimensions.length === 1 && (n === undefined || dimensions[0] === n));
}

/**
 * Check if `arr` is an n-dimensional matrix.
 */
export function isMatrix(mat: math.Matrix, n: number) {
  const dimensions = mat.size();
  return (dimensions.length === n && dimensions.every((dim) => dim === n));
}

export function normalizeMatrix(mat: math.Matrix) {
  const dimensions = mat.size();
  // if the matrix is a vector, there is only one column
  // otherwise, for dimensions [a, b], there are b columns
  const nCols = dimensions.length === 1 ? 1 : dimensions[1];
  // extract vectors
  const vectors = [];
  for (let i = 0; i < nCols; ++i) {
    // `math.column` returns a column still as a matrix (e.g. [[a], [b]]),
    // so we flatten it to turn it into a vector
    vectors.push(math.flatten(math.column(mat, i)));
  }
  const normalized = vectors.map((v) => math.divide(v, math.norm(v)));
  // create matrix from normalized columns
  // (for some reason MathJsStatic does not expose `matrixFromColumns`, so we cast to `any`)
  return (math as any).matrixFromColumns(...normalized);
}

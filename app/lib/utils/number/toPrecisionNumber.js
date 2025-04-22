/**
 * Takes a number n and converts it to a number with given precision,
 * which in turn automatically rounds far decimals, such as in 0.5000000000000002
 *
 * @param n
 * @param precision
 * @return {number}
 */
export const toPrecisionNumber = (n, precision) => Number(n.toPrecision(precision))

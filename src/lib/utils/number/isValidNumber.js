/**
 * Checks if n is a valid number.
 * This is true, if it
 * - is of type 'number'
 * - is not NaN
 * - is finite
 * - within MAX_VALUE
 * @param n {*}
 * @return {boolean}
 */
export const isValidNumber = n => {
  if (typeof n !== 'number') return false
  if (Number.isNaN(n)) return false
  if (!Number.isFinite(n)) return false

  return n > 0
    ? +n < Number.MAX_VALUE
    : -n < Number.MAX_VALUE
}

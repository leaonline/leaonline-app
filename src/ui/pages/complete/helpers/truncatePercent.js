/**
 * Truncates the decimal part from a float and returns the
 * integer base.
 * @param percent {number}
 * @returns {number}
 * @throws if input is not a number or truncated result is not a valid integer
 */
export const truncatePercent = (percent) => {
  if (!isValidNumber(percent)) {
    throw new Error(`Expected a valid number, got ${percent} (${typeof percent}), in ${truncatePercent.name}.`)
  }

  const integer = Math.trunc(percent)

  if (!isValidNumber(integer) || !Number.isSafeInteger(integer)) {
    throw new Error(`Expected truncated safe integer, got ${integer} (${typeof integer}), in ${truncatePercent.name}.`)
  }

  return integer
}

/**
 * Checks whether we deal with a computable number
 * @private
 * @param n
 * @return {boolean}
 */
const isValidNumber = n => typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n)

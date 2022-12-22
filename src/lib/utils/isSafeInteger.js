/**
 * Detects, whether a given value is a safe integer.
 * @param x {any} a given input value
 * @return {boolean} true / false
 */
export const isSafeInteger = x => {
  if (typeof x === 'number') {
    return Number.isSafeInteger(x)
  }

  if (typeof x === 'string') {
    const strVal = Number(x)
    return !Number.isNaN(strVal) && Number.isSafeInteger(strVal)
  }

  return false
}

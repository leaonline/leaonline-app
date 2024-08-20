/**
 * runs a while loop until finished or until a count has been exceeded
 * 
 * @param fn
 * @param maxCount
 * @return {*}
 */
export const safeWhile = (fn, maxCount = 50) => {
  let count = 0
  let value
  while (((value = fn(count)) || true) && count++ < maxCount) {
    if (value !== undefined) {
      return value
    }
  }
}

export const safeWhileAsync = async (fn, maxCount = 50) => {
  let count = 0
  let value
  while (((value = await fn(count)) || true) && count++ < maxCount) {
    if (value !== undefined) {
      return value
    }
  }
}
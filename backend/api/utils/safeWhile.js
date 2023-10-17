export const safeWhile = (fn, maxCount = 50) => {
  let count = 0
  let value
  while (((value = fn(count)) || true) && count++ < maxCount) {
    if (value !== undefined) {
      return value
    }
  }
}

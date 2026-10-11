export const debounce = function debounce(func, wait, immediate) {
  let timeout
  return function () {
    const args = arguments
    clearTimeout(timeout)
    if (immediate && !timeout) func.apply(this, args)
    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }, wait)
  }
}

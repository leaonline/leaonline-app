export const debounce = (func, wait, immediate) => {
  let timeout
  return function (...args) {
    let context = this

    clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }, wait)

    if (immediate && !timeout) {
      func.apply(context, args)
    }
  }
}

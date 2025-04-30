export const memoize = (fn, keySeparator = '$') => {
  const map = new Map()
  const destroy = () => map.clear()
  const run = (...args) => {
    const key = args.join(keySeparator)
    if (!map.has(key)) {
      map.set(key, fn(...args))
    }
    return map.get(key)
  }
  return [run, destroy]
}

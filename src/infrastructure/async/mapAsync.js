export const mapAsync = async (list, fn) => {
  const copy = []
  copy.length = list.length
  for (let i = 0; i < list.length; i++) {
    copy[i] = await fn(list[i], i, list)
  }
  return copy
}

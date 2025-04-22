export const forEachAsync = async (list, fn) => {
  let index = 0
  for (const element of list) {
    await fn(element, index++, list)
  }
}

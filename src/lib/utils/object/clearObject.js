/**
 * Removes all own properties from an object
 * @param obj {object}
 * @throws Error if obj if not an object
 * @return {object}
 */
export const clearObject = obj => {
  const type = typeof obj

  if (type !== 'object') {
    throw new Error(`Expected objected, got ${type}`)
  }

  Object.keys(obj).forEach(key => {
    delete obj[key]
  })

  return obj
}

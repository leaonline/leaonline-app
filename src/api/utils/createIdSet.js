/**
 * Creates a set of all values for a list of documents and respective fieldnames to look for.
 * @param docs {object[]}
 * @param fieldNames {string|string[]}
 * @param includeNull {boolean} flag to include null values in map
 * @return {Set<any>}
 */
export const createIdSet = (docs, fieldNames, includeNull = false) => {
  const ids = new Set()
  const fields = Array.isArray(fieldNames)
    ? fieldNames
    : [fieldNames]
  docs.forEach(doc => {
    fields.forEach(fieldName => {
      const value = doc[fieldName]
      const isDefined = value !== undefined
      const include = value !== null || includeNull
      if (isDefined && include) {
        ids.add(value)
      }
    })
  })
  return ids
}

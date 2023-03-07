/**
 * Returns a sort comparator for documents by ordered ids.
 * The sorter requires the documents a and b to have an _id
 * property.
 * @param ids {string[]}
 * @return {function(a, b):number}
 */
export const byOrderedIds = (ids) => (a, b) => {
  const indexA = ids.indexOf(a._id)
  const indexB = ids.indexOf(b._id)

  if (indexA === -1 || indexB === -1) {
    throw new Error(`Expected ${a._id} and ${b._id} to not result in ${indexA} and ${indexB}`)
  }

  return indexA - indexB
}

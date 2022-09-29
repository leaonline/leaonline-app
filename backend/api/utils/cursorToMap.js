/**
 * Transforms a Mongo.Cursor into a Map (data structure), to make
 * documents fast and reliably accessible via _id
 * @param cursor {Mongo.Cursor}
 * @returns {Map<string, object>}
 */
export const cursorToMap = cursor => {
  const map = new Map()
  cursor.forEach(doc => {
    map.set(doc._id, doc)
  })
  return map
}

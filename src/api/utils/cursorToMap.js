/**
 * Transforms a Mongo.Cursor into a Map (data structure), to make
 * documents fast and reliably accessible via _id
 * @async
 * @param cursor {Mongo.Cursor}
 * @returns {Map<string, object>}
 */
export const cursorToMap = async cursor => {
  const map = new Map()
  await cursor.forEachAsync(doc => {
    map.set(doc._id, doc)
  })
  return map
}

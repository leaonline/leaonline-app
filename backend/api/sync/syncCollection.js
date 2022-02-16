import { getCollection } from '../utils/getCollection'

/**
 * This function synchronizes an collection with all given documents
 * @param name {string} name of the collection
 * @param docs {Array<Object>} list of all documents for this collection
 */
export const syncCollection = (name, docs = []) => {
  const collection = getCollection(name)
  if (!collection) { throw new Error(`${name} has no collection`) }

  const ids = docs.map(d => d._id)

  // first remove all docs, that are not in the list
  const removed = collection.remove({ _id: { $nin: ids } })

  // then update all docs
  let inserted = 0
  let updated = 0

  docs.forEach((doc) => {
    const upsert = collection.upsert({ _id: doc._id }, { $set: doc })

    if (typeof upsert === 'number') {
      updated++
    }
    else {
      inserted++
    }
  })

  return { inserted, updated, removed }
}

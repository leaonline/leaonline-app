import { Sync } from '../infrastructure/sync/Sync'

/**
 * Developers-only! Resets the current sync data
 * @return {Promise<*>}
 */
export const resetSyncData = async () => {
  const collection = Sync.collection()
  const { _id, _version, ...syncDoc } = collection.findOne()
  const data = {}

  Object.keys(syncDoc).forEach(key => {
    data[key] = null
  })

  await collection.update(_id, { $set: data })
  return Sync.storage.saveFromCollection()
}

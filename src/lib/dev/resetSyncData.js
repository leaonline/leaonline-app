import { Sync } from '../infrastructure/sync/Sync'

export const resetSyncData = async () => {
  const { _id, _version, ...syncDoc } = Sync.collection().findOne()
  const data = {}

  Object.keys(syncDoc).forEach(key => {
    data[key] = null
  })
  Sync.collection().update(_id, { $set: data })
  return Sync.storage.saveFromCollection()
}

import { Sync } from '../infrastructure/sync/Sync'

export const resetSyncData = async () => {
  const { _id, _version, ...syncDoc } = Sync.collection().findOne()
  const data = {}

  Object.keys(syncDoc).forEach(key => {
    data[key] = null
  })
console.debug(data)
  Sync.collection().update(_id, { $set: data })
  console.debug(Sync.collection().findOne())
  return Sync.storage.saveFromCollection()
}

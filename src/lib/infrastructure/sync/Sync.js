import { callMeteor } from '../../meteor/call'
import { Config } from '../../env/Config'
import { createContextStorage } from '../../contexts/createContextStorage'
import { ContextRepository } from '../ContextRepository'
import { Log } from '../Log'
import { collectionNotInitialized } from '../../contexts/collectionNotInitialized'

/**
 * Helps in keeping collections synced.
 */
export const Sync = {
  name: 'sync',
  isLocal: true
}

const debug = Log.create(Sync.name, 'debug')

Sync.collection = collectionNotInitialized(Sync)

Sync.storage = createContextStorage(Sync)

/**
 * This should be called at startup.
 * Fetches to locally stored sync doc
 * that can be used to compare the local
 * sync state with the server state.
 */
Sync.init = async () => {
  await Sync.storage.loadIntoCollection()

  if (Sync.collection().find().count() === 0) {
    await Sync.collection().insert({})
  }

  internal.initialized = true
}

/**
 * @private
 */
const internal = {
  initialized: false,
  syncRequired: null,
  queue: []
}

/**
 * @private
 */
const checkInit = () => {
  if (!internal.initialized) {
    throw new Error('Sync.init must be called first')
  }
}

/**
 * @private
 */
const checkRequired = () => {
  if (internal.syncRequired !== true) {
    throw new Error('Sync should not run if not required')
  }
}

Sync.getQueue = () => [].concat(internal.queue)

Sync.reset = () => {
  internal.syncRequired = null
  internal.queue = []
}

/**
 * Determines, whether a sync is necessary.
 * @async
 * @returns {Promise<boolean>}
 */
Sync.isRequired = async () => {
  debug('[Sync]: run isRequired check')
  checkInit()

  if (internal.syncRequired !== null) {
    return internal.syncRequired
  }

  const localSyncDoc = Sync.collection().findOne()
  const serverSyncDoc = await callMeteor({
    name: Config.methods.getSyncDoc,
    args: {}
  })

  Object.entries(serverSyncDoc).forEach(([key, value]) => {
    const { hash, updatedAt } = value
    const local = localSyncDoc[key] ?? {}

    if (local.hash !== hash) {
      internal.queue.push({ key, hash, updatedAt })
    }
  })

  const syncRequired = internal.queue.length > 0
  internal.syncRequired = syncRequired
  return syncRequired
}

/**
 * Executes a sync for all queued contexts.
 * Updates the locally stored sync doc.
 * @throws {Error} if invoked, although no sync is required
 */
Sync.run = async ({ onProgress }) => {
  debug('run')
  checkInit()
  checkRequired()

  const localSyncDoc = Sync.collection().findOne()
  const updateSyncDoc = {}

  let current = 0
  const max = internal.queue.length

  debug('run with queue', internal.queue)

  for (const entry of internal.queue) {
    const { key, hash, updatedAt } = entry
    debug('sync', key)

    const ctx = ContextRepository.get(key)

    if (!ctx) {
      throw new Error(`Expected ctx for key ${key}`)
    }

    await Sync.syncContext({
      name: key,
      collection: ctx.collection(),
      storage: ctx.storage
    })

    updateSyncDoc[key] = { updatedAt, hash }
    current++

    onProgress({ progress: current / max })
  }

  Sync.collection().update(localSyncDoc._id, {
    $set: { ...updateSyncDoc }
  })

  await Sync.storage.saveFromCollection()
  internal.syncRequired = false
  internal.queue = []

  return updateSyncDoc
}

/**
 * Syncs a context by given name, collection and storage.
 * Wipes and replaces the collection, updates the storage.
 * @param name
 * @param collection
 * @param storage
 * @returns {Promise<boolean>}
 */
Sync.syncContext = async ({ name, collection, storage }) => {
  checkInit()

  const docs = await callMeteor({
    name: Config.methods.getSyncDocsForContext,
    args: { name }
  })

  debug('syncContext received', docs?.length, 'docs')
  if (Array.isArray(docs) && docs.length > 0) {
    const ids = new Set()

    for (const doc of docs) {
      const { _id, ...updateDoc } = doc
      const found = collection.find({ _id }).count() > 0

      if (!found) {
        await collection.insert(doc)
      }
      else {
        await collection.update(_id, { $set: updateDoc })
      }

      ids.add(_id)
    }

    const toRemove = collection.find({ _id: { $nin: [...ids] } }).fetch()

    for (const removeDoc of toRemove) {
      await collection.remove({ _id: removeDoc._id })
    }

    debug('removed', toRemove.length, 'outdated docs')
    const count = collection.find().count()

    if (count !== docs.length) {
      throw new Error(`Expected ${name} collection to be in sync by ${docs.length} docs, got ${count}!`)
    }

    await storage.saveFromCollection()
    return true
  }

  return false
}

import { getCollection } from '../collections/collections'
import { callMeteor } from '../../meteor/call'
import { Log } from '../Log'
import { Config } from '../../env/Config'

/**
 * Helps with keeping collections synced
 */
export const Sync = {
  name: 'sync'
}

Sync.collection = () => {
  throw new Error(`${Sync.name} is not initialized`)
}

const log = Log.create(Sync.name)
const debug = Config.debug.sync
  ? Log.create(Sync.name, 'debug')
  : () => {}

/**
 * Receives a list of `{name, hash}` objects and determines,
 * which of these has to be synced by comparing the hashes with those
 * from the server.
 * @param contexts {Array<Object>}
 */
Sync.compare = async (contexts) => {
  const names = contexts.map(ctx => ctx.name)
  log('compare', names.toString())

  const toSync = []

  // first we need to get all the hashes
  const result = await Sync.getHashes(names)
  const hashes = new Map()
  result.forEach(({ name, hash }) => hashes.set(name, hash))

  contexts.forEach(({ name, hash }) => {
    const newHash = hashes.get(name)

    if (!newHash) {
      throw new Error(`Expected hash for ${name} got undefined`)
    }

    const value = { newHash, name }

    if (!hash || hash !== newHash) {
      return toSync.push(value)
    }

    // edge case - we have a hash but surprisingly we have
    // no more documents in our storage, which in turns requires sync

    if (getCollection(name).find().count() === 0) {
      toSync.push(value)
    }
  })

  return toSync
}

/**
 * Asks the server for the current hashes for a list of given names
 * @param names
 * @return {Promise<any>}
 */
Sync.getHashes = async (names) => {
  log('get hashes', names.toString())
  const result = await callMeteor({
    name: 'syncState.methods.getHashes', // TODO from env
    args: { names }
  })
  log(result.length, 'hashes received')
  return result
}

/**
 * Updates a whole collection. Inserts new docs, updates existing ones and
 * removes docs, which are not used on the server anymore.
 * @param name
 * @param newHash
 * @param docs
 * @param remove
 * @return {Promise<{inserted: number, updated: number, removed: *}>}
 */
Sync.updateCollection = async ({ name, docs, newHash, remove = false }) => {
  log('update collection', name, 'with', docs.length, 'docs')
  const collection = getCollection(name)

  if (!collection) {
    throw new Error(`Expected collection for ${name}, got undefined`)
  }

  if (!docs.length) {
    throw new Error(`Expected to receive docs for ${name}, got 0 docs`)
  }

  const updated = update(collection, docs)

  if (remove) {
    const docsIds = docs.map(d => d._id)
    updated.removed = collection.remove({ _id: { $nin: docsIds } })
  }

  // if everything went okay, we can update the hash and tag the
  // collection as up to date with the server
  await updateHash(name, newHash)

  log(name, 'update results', JSON.stringify(updated))
  log(name, 'new size', collection.find().count())
  return updated
}

/**
 * Updates a collection by given documents but does not remove any docs.
 * @private
 * @param collection
 * @param docs
 * @return {{inserted: number, updated: number, removed: number}}
 */
const update = (collection, docs) => {
  if (!docs.length) {
    throw new Error(`Expected to receive docs for ${collection._name}, got 0 docs`)
  }

  let inserted = 0
  let updated = 0
  docs.forEach(doc => {
    let result
    if (collection.find({ _id: doc._id }).count() > 0) {
      result = collection.update({ _id: doc._id }, { $set: doc })
      updated++
      debug('updated doc', result)
    }
    else {
      result = collection.insert(doc)
      inserted++
      debug('inserted doc', result)
    }
  })

  return { inserted, updated, removed: 0 }
}

const updateHash = (name, hash) => {
  log('update hash', name, hash)

  const collection = Sync.collection()
  const updatedAt = new Date()

  const result = collection.find({ name }).count() > 0
    ? collection.update({ name }, { $set: { hash, updatedAt } })
    : collection.insert({ name, hash, updatedAt })

  debug('update hash', name, result)

  return result
}

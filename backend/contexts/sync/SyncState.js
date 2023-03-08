import { Random } from 'meteor/random'
import { getCollection } from '../../api/utils/getCollection'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { ContextRegistry } from '../ContextRegistry'
import { createLog } from '../../infrastructure/log/createLog'

/**
 * This context represents the current state of sync. If should be updated
 * after every sync for each synced context in order to provide the app with
 * information, whether to fetch new data or used the locally cached data.
 *
 * @category contexts
 * @namespace
 */
export const SyncState = {
  name: 'syncState'
}

const log = createLog({ name: SyncState.name })
const appContexts = new Set()
const getAppContexts = () => [...appContexts]
const checkIfSync = (ctx = {}, name) => {
  if (!ctx.sync) {
    const errorName = ctx.name ?? name
    throw new Error(`Attempt to sync "${errorName}" but it's not defined for sync!`)
  }
}

SyncState.register = (ctx) => {
  checkIfSync(ctx)
  appContexts.add(ctx.name)
}

/**
 * DB Schema
 * @type {{name: (function(String, String)), version: NumberConstructor, hash: (function(String, String)), updatedAt:
 *   DateConstructor}}
 */
SyncState.schema = {
  updatedAt: Date,
  name: String,
  hash: String,
  version: Number
}

/**
 * Updates the current hash, version and updatedAt field for a given
 * ctx and saves it to the collection. Creates a new entry if none is
 * defined by {name}
 *
 * @param name {string}
 * @return {*} upsert result, depending on insert or update
 */
SyncState.update = name => {
  log('update', name)
  const ctx = ContextRegistry.get(name)
  checkIfSync(ctx)

  const hash = Random.id(8)
  const updatedAt = new Date()

  return getCollection(SyncState.name).upsert({ name }, {
    $set: { name, updatedAt, hash },
    $inc: { version: 1 }
  })
}

/**
 * Gets all sync states by given names
 * @param names {Array<string>}
 * @return {Array<object>} a list of documents
 */
SyncState.get = ({ names }) => getCollection(SyncState.name)
  .find({ name: { $in: names } })
  .fetch()

/**
 * Throws an error if any of the given names is not registered for sync.
 * To register for a sync a ctx must be registered to the {ContextRegistry}
 * and have the {sync} flag being set to a truthy value.
 * @param names {Array<string>}
 */
SyncState.validate = names => {
  names.forEach(name => {
    const ctx = ContextRegistry.get(name)
    checkIfSync(ctx, name)
  })
}

/**
 * Meteor Methods endpoint definitions.
 */
SyncState.methods = {}

/**
 * Returns hashes for a given context by name.
 * The hash allows the client to decide,
 * whether to update the respective contexts or
 * continue to use the exiting data.
 *
 * @type {{schema: {names: ArrayConstructor, 'names.$': (function(String, String))}, name: string, run: *}}
 */
SyncState.methods.getHashes = {
  name: 'syncState.methods.getHashes',
  schema: {},
  run: onServerExec(function () {
    return function ({ names }) {
      const syncDoc = {}
      const docs = SyncState.get({ names: getAppContexts() })
      docs.forEach(doc => {
        syncDoc[doc.name] = doc
      })
      return syncDoc
    }
  })
}

SyncState.methods.getDocs = {
  name: 'syncState.methods.getDocs',
  schema: {
    name: String
  },
  run: onServerExec(function () {
    return function ({ name }) {
      SyncState.validate([name])
      const collection = getCollection(name)
      if (!collection) {
        throw new Error(`No collection found for ${name}`)
      }
      return collection.find().fetch()
    }
  })
}

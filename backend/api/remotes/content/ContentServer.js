import { Meteor } from 'meteor/meteor'
import { DDP } from 'meteor/ddp'

// all contexts that are part of the content server are imported here,
// because the "outside world" should not know much about these internals
import { Unit } from '../../../contexts/content/Unit'
import { UnitSet } from 'meteor/leaonline:corelib/contexts/UnitSet'
import { Field } from '../../../contexts/content/Field'
import { Dimension } from '../../../contexts/content/Dimension'
import { Level } from '../../../contexts/content/Level'
import { TestCycle } from 'meteor/leaonline:corelib/contexts/TestCycle'

// required to get units running, since they have a complex schema
// this is to be validated but the lib requires a schema from the host app
import { SchemaValidator } from 'meteor/leaonline:corelib/validation/SchemaValidator'
import { createSchema } from '../../../infrastructure/factories/createSchema'
import { getCollection } from '../../utils/getCollection'
import { createLog } from '../../../infrastructure/log/createLog'

// for better reasoning between connection and logic we have
// all connection functionality in a separate file
import { ContentConnection } from './ContentConnection'

// set the lib's validator to allow validation of received unit docs
SchemaValidator.set(function (schema) {
  const instance = createSchema(schema)
  return doc => instance.validate(doc)
})

const contexts = [Unit, UnitSet, Field, Dimension, Level, TestCycle]
const contextNames = contexts.map(ctx => ctx.name)
const log = createLog({ name: 'ContentServer' })

/**
 * API to communicate with the content server that stores all the
 * relevant data for running the app.
 * @category api
 * @namespace
 */
export const ContentServer = {}

/// /////////////////////////////////////////////////////////////////////////////
//
//  PUBLIC
//
/// /////////////////////////////////////////////////////////////////////////////

/**
 * Returns a schema definition for a call to the content server.
 *
 * @return {{
 *   name: {type: String, allowedValues: string[]},
 *   ids: {type: Array, optional: boolean},
 *   'ids.$': String
 * }}
 */
ContentServer.schema = () => ({
  name: {
    type: String,
    allowedValues: contextNames
  },
  query: {
    type: Object,
    optional: true,
    blackbox: true,
    custom: function () {
      const value = this.value
      console.debug('custom query validation: ', value)
    }
  }
})

/**
 * Get all available contexts as Array
 * @return {Array<Object>}
 */
ContentServer.contexts = () => [].concat(contexts)

/**
 * Initialized the Contentserver API
 * @return {Promise<ContentServer>}
 */
ContentServer.init = async () => {
  await ContentConnection.connect({ log })
  return ContentServer
}

/**
 * Synchronizes a collection with the one from the content server:
 *
 * - fetches all docs from content server
 * - inserts docs, that are not in collection
 * - updates docs, that are in collection
 * - removes docs, that are in collection but not in fetched docs
 *
 * Returns an object of stats (counts) of created, updated and removed docs.
 * This function should never be called from a Method or Publication, which
 * is why it will throw an Error if such circumstance is present.
 *
 * @param name {string} the name of the context
 * @throws {ContentServerError} when not connected or context or collection do
 *   not exist or if this function is invoked within a method or pub
 * @return {Promise<{name: *, created: number, updated: number, removed: number}>}
 */
ContentServer.sync = async ({ name, debug }) => {
  log('sync', name)
  ensureNotInMethodOrPub()
  ensureConnected()
  ensureContextExists({ name })

  const collection = ensureCollectionExists({ name })

  const stats = {
    name: name,
    created: 0,
    updated: 0,
    removed: 0,
    skipped: 0
  }

  const result = await ContentConnection.get({ name, log })
  const allDocs = result && result[name]

  // if there is nothing to get, skip here
  if (!allDocs?.length) { return stats }

  const onBeforeUpsert = getHooks(ContentServer.hooks.beforeSyncUpsert, name)
  const onSyncEnd = getHooks(ContentServer.hooks.syncEnd, name)

  const allIds = []
  allIds.length = allDocs.length
  allDocs.forEach((doc, index) => {
    if (doc.isLegacy) {
      stats.skipped++
      return
    }

    const { _id: docId } = doc
    allIds[index] = docId

    if (collection.find(docId).count() === 0) {
      onBeforeUpsert({ type: 'insert', doc })
      const insertId = collection.insert(doc)
      if (debug) log(name, 'inserted', insertId)
      stats.created++
    }

    else {
      onBeforeUpsert({ type: 'update', doc })
      delete doc._id
      const updated = collection.update(docId, { $set: doc })
      if (debug) log(name, 'updated', docId, '=', updated)
      stats.updated++
    }
  })

  // remove all docs, that are not in ids anymore
  stats.removed = collection.remove({ _id: { $nin: allIds } })
  log(JSON.stringify(stats))

  onSyncEnd(stats)

  return stats
}


ContentServer.hooks = {
  beforeSyncUpsert: 'beforeSyncUpsert',
  syncEnd: 'syncEnd'
}

const hooks = new Map()
hooks.set('beforeSyncUpsert', new Map())
hooks.set('syncEnd', new Map())

const getHooks = (hooksName, ctxName) => {
  const map = hooks.get(hooksName)
  if (!map || !map.has(ctxName)) {
    return () => {}
  }

  const fnSet = map.get(ctxName)

  return fnSet && fnSet.size > 0
    ? (data) => fnSet.forEach(fn => fn(data))
    : () => {}
}

ContentServer.on = (hookName, ctxName, fn) => {
  if (!hooks.has(hookName)) {
    hooks.set(hookName, new Map())
  }

  const map = hooks.get(hookName)

  if (!map.has(ctxName)) {
    map.set(ctxName, new Set())
  }

  const fns = map.get(ctxName)
  fns.add(fn)
}


/// /////////////////////////////////////////////////////////////////////////////
//
//  INTERNAL
//
/// /////////////////////////////////////////////////////////////////////////////

/**
 * Throws if not connected to content server
 * @throws {ContentServerError} if collection does not exist
 */
const ensureConnected = () => {
  if (!ContentConnection.isConnected()) {
    throw new ContentServerError('notConnected')
  }
}

/**
 * Throws if context name is not supported
 * @param name {string} name of the collection
 * @throws {ContentServerError} if collection does not exist
 */
const ensureContextExists = ({ name }) => {
  if (!contextNames.includes(name)) {
    throw new ContentServerError('contextNotDefined', { name })
  }
}

/**
 * Throws if collection does not exist, otherwise returns collection
 * @param name {string} name of the collection
 * @throws {ContentServerError} if collection does not exist
 * @return {Mongo.Collection}
 */
const ensureCollectionExists = ({ name }) => {
  const collection = getCollection(name)

  if (!collection) {
    throw new ContentServerError('collectionNotFound', { name })
  }

  return collection
}

const ensureNotInMethodOrPub = () => {
  const methodInvocation = (
    DDP._CurrentMethodInvocation.get() ||
    DDP._CurrentPublicationInvocation.get()
  )
  if (methodInvocation) {
    throw new ContentServerError('methodOrPubInvocation')
  }
}

/**
 * Extends Meteor.Error, always has error-field as 'contentServer.error'
 * @private
 */
class ContentServerError extends Meteor.Error {
  constructor (reason, details) {
    super('contentServer.error', reason, details)
  }
}

import { Meteor } from 'meteor/meteor'
import { DDP } from 'meteor/ddp'

// all contexts that are part of the content server are imported here,
// because the "outside world" should not know much about these internals
import { Unit } from '../../../contexts/content/Unit'
import { UnitSet } from 'meteor/leaonline:corelib/contexts/UnitSet'
import { Field } from 'meteor/leaonline:corelib/contexts/Field'
import { Dimension } from 'meteor/leaonline:corelib/contexts/Dimension'
import { Level } from 'meteor/leaonline:corelib/contexts/Level'
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
    allowedValues: ['field']
  },
  ids: {
    type: Array,
    optional: true
  },
  'ids.$': String
})

/**
 * Get all available contexts as Array
 * @return {*[]}
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
ContentServer.sync = async ({ name }) => {
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

  const allIds = []
  allIds.length = allDocs.length

  allDocs.forEach((doc, index) => {
    if (doc.isLegacy) {
      stats.skipped++
      return
    }

    const { _id: docId } = doc
    allIds[index] = docId

    const upserted = collection.upsert({ _id: docId }, { $set: doc })

    if (upserted?.insertedId) {
      stats.created++
    }

    else if (upserted?.numberAffected) {
      stats.updated += upserted.numberAffected
    }

    else {
      log('could not update or insert', docId, upserted)
    }
  })

  // remove all docs, that are not in ids anymore
  stats.removed = collection.remove({ _id: { $nin: allIds } })
  log(JSON.stringify(stats))

  return stats
}

/**
 * Gets a document from a synced collection. This should be used by the methods
 * to obtain documents.
 *
 * @param name
 * @param ids
 * @return {any}
 */
ContentServer.get = ({ name, ids }) => {
  // ensureConnected()
  ensureContextExists({ name })

  const collection = ensureCollectionExists({ name })
  const query = {}

  if (ids?.length) {
    query._id = { _id: { $in: ids } }
  }

  return collection.find(query).fetch()
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

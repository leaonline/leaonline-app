import { callMethod } from '../../infrastructure/methods/callMethod'
import { getLocalCollection } from '../../api/utils/getLocalCollection'

/**
 * Loads all docs from the content-server by given params.
 * @client
 * @param context {Object} The context the objects belong to
 * @param collection {Mongo.Collection=} optional explicit collection to use
 * @param name {string=} optional explicit method name
 * @param params {Object?} optional additional parameters
 * @param unlessExists {boolean=} optional skip, if docs already exist, useful for static collections, such as Field, Dimensions etc.
 * @param debug {Function?} optional debug logger
 * @return {Promise}
 */
export const loadAllContentDocs = async ({ context, collection, ids,  name, params = {}, unlessExists, debug = () => {} }) => {
  debugger
  debug('loadAllContentDocs (call)')
  if (!context) {
    throw new Error('Context is expected')
  }

  const localCollection = collection ?? getLocalCollection(context.name)
  if (!localCollection) {
    throw new Error(`Expected collection for ctx ${context.name}`)
  }

  // Simple caching strategy
  // For skipping existing documents we have two scenarios:
  // A - fetching all docs - skip when local docs are != 0
  // B - fetching by ids - skip if all local docs by ids exist
  if (unlessExists) {
    const existingQuery = {}
    const idsLength = ids?.length
    if (idsLength) existingQuery._id = { $in: ids }
    const localDocs = localCollection.find(existingQuery).fetch()

    // A
    if (idsLength && localDocs.length === idsLength) {
      return { [context.name]: localDocs }
    }

    // B
    if (!idsLength && localDocs.length !== 0) {
      return { [context.name]: localDocs }
    }
  }

  const methodName = name ?? context.methods.getAll
  if (!methodName) {
    throw new Error(`Expected method name for ctx ${context.name}`)
  }

  const allDocuments = await callMethod({
    name: context.methods.getAll,
    args: params
  })

  for (const [name, documents = []] of Object.entries(allDocuments)) {
    // skip further processing if no documents have been received
    debug(methodName, `received ${documents.length} doc(s) for ${name}`)
    for (const doc of documents) {
      if (!doc?._id) {
        throw new Error('Expected doc with _id to upsert')
      }
      const docId = doc._id
      localCollection.upsert(doc._id, { $set: doc })
      doc._id = docId
    }
  }



  return allDocuments
}

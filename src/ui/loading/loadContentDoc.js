import { getLocalCollection } from '../../api/utils/getLocalCollection'
import { callMethod } from '../../infrastructure/methods/callMethod'

/**
 * Loads a single document from the content-server
 * @param context {object} The context related to the document.
 * @param query {string|object} The _id or query object for the document
 * @param debug {function?} optional debug logger
 * @return {Promise<Object>} A promise resoling to an object or void
 */

export const loadContentDoc = async ({ context, collection, name, unlessExists, query, debug = () => {}, isShortCode = false, clean = x => x }) => {
  debug(`[${context?.name}]: loadContentDoc (single)`)
  if (!context) {
    throw new Error('Context is expected')
  }

  const localCollection = collection ?? getLocalCollection(context.name)
  if (!localCollection) {
    throw new Error(`Expected collection for ctx ${context.name}`)
  }

  const existingDoc = localCollection.findOne(query)
  if (unlessExists && existingDoc) {
    return existingDoc
  }

  const methodName = name ?? context.methods.get
  if (!methodName) {
    throw new Error(`Expected method name for ctx ${context.name}`)
  }

  const document = await callMethod({
    name: name ?? context.methods.get,
    args: query
  })

  if (document) {
    try {
      const upsertDoc = clean({ ...document })
      const { _id } = document
      debug(`[${context?.name}]: upsert doc ${_id}`)
      const upserted = await localCollection.upsertAsync({ _id }, { $set: upsertDoc })
      debug(`[${context?.name}]: upserted ${upserted && JSON.stringify(upserted)}`)
    } catch (e) {
      debug(`[${context?.name}]: error while upserting document - ${e.message}`)
      throw e
    }
  }

  return document
}

import { Errors } from '../Errors'
import { notifyUsersAboutError } from '../../../api/notify/notifyUsersAboutError'

/**
 * Saves a normalized error to collection but increments the counter, in case
 * the error already exists and varies only by user and timestamp.
 *
 * Requires the errorDoc to be normalized!
 *
 * @param normalizedErrorDoc
 * @return {Promise<void>}
 */
export const persistError = async (normalizedErrorDoc) => {
  // let's see, if the same user created the same error already
  const { hash } = normalizedErrorDoc
  const collection = Errors.collection()
  const existingError = await collection.findOneAsync({ hash })

  if (existingError) {
    await collection.updateAsync(existingError._id, {
      $inc: { count: 1 }
    })
  }
  else {
    normalizedErrorDoc.count = 1
    await collection.insertAsync(normalizedErrorDoc)

    // inform only about new errors
    await notifyUsersAboutError(normalizedErrorDoc)
  }
}

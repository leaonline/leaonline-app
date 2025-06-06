import { normalizeError } from '../../api/errors/normalizeError'
import { notifyUsersAboutError } from '../../api/errors/notifyUsersAboutError'
import { getCollection } from '../../api/utils/getCollection'
import { ErrorBaseSchema } from './ErrorBaseSchema'

export const ServerErrors = {
  name: 'serverErrors'
}

ServerErrors.schema = {
  ...ErrorBaseSchema,
  method: {
    type: String,
    optional: true
  },
  publication: {
    type: String,
    optional: true
  },
  isSystem: {
    type: Boolean,
    optional: true
  },
  tag: {
    type: String,
    optional: true
  }
}

/**
 * @async
 * @param error {Error|Meteor.Error} the error instance
 * @param name {string} name of the method or publication
 * @param userId {string=} the user who created this error
 * @param isMethod {boolean=}
 * @param isPublication {boolean=}
 * @param isSystem {boolean=}
 * @param tag {string=}
 */
ServerErrors.handle = async ({ error, name, userId, isMethod, isPublication, isSystem, tag }) => {
  const errorDoc = normalizeError({ error, userId })

  errorDoc.method = isMethod ? name : undefined
  errorDoc.publication = isPublication ? name : undefined
  errorDoc.isSystem = isSystem
  errorDoc.tag = error.tag || tag

  const errorDocId = await getCollection(ServerErrors.name).insertAsync(errorDoc)
  await notifyUsersAboutError(errorDoc, 'server')

  return errorDocId
}

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
  }
}

/**
 *
 * @param error {Error|Meteor.Error} the error instance
 * @param name {string} name of the method or publication
 * @param userId {string=} the user who created this error
 * @param isMethod {boolean=}
 * @param isPublication {boolean=}
 * @param isSystem {boolean=}
 */
ServerErrors.handle = ({ error, name, userId, isMethod, isPublication, isSystem }) => {
  const errorDoc = normalizeError({ error, userId })

  errorDoc.method = isMethod ? name : undefined
  errorDoc.publication = isPublication ? name : undefined
  errorDoc.isSystem = isSystem

  const errorDocId = getCollection(ServerErrors.name).insert(errorDoc)
  notifyUsersAboutError(errorDoc, { type: 'server' })

  return errorDocId
}

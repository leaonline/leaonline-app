import { Meteor } from 'meteor/meteor'
import { ErrorBaseSchema } from './ErrorBaseSchema'
import { normalizeError } from '../../api/errors/normalizeError'
import { getCollection } from '../../api/utils/getCollection'
import { notifyUsersAboutError } from '../../api/errors/notifyUsersAboutError'

export const ClientErrors = {
  name: 'clientErrors',
  label: 'clientErrors.title',
  icon: 'exclamation-triangle'
}

ClientErrors.schema = {
  ...ErrorBaseSchema
}

ClientErrors.methods = {}

ClientErrors.methods.send = {
  name: 'clientErrors.methods.send',
  schema: ClientErrors.schema,
  isPublic: true,
  run: function (options) {
    const userId = this.userId
    const errorDoc = normalizeError({ error: options, userId, stackLength: 1 })
    const errorDocId = getCollection(ClientErrors.name).insert(errorDoc)
    Meteor.defer(() => notifyUsersAboutError(errorDoc, { type: 'client' }))

    return errorDocId
  }
}
